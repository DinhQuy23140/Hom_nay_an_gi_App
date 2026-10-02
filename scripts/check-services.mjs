// Kiểm tra kết nối Firebase (Auth, Firestore) và Supabase (Storage) bằng cấu hình trong .env.
// Tạo một tài khoản test tạm thời, dùng nó để thử từng dịch vụ, rồi xóa đi.
// Chạy: npm run check:services

import { readFileSync } from 'node:fs';

function loadEnv(path = '.env') {
  const env = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '').trim();
  }
  return env;
}

const env = loadEnv();
const firebase = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};
const supabase = {
  url: env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, ''),
  key: env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  bucket: env.EXPO_PUBLIC_SUPABASE_BUCKET || 'media',
};

const PIXEL_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

let failures = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg, hint) => {
  failures++;
  console.log(`  ✗ ${msg}`);
  if (hint) console.log(`    → ${hint}`);
};

async function call(url, init = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, text };
}

const identity = (path) => `https://identitytoolkit.googleapis.com/v1/${path}?key=${firebase.apiKey}`;

async function checkFirebaseProject() {
  console.log('\nFirebase');
  const res = await call(identity('projects'));
  if (res.status !== 200) {
    fail(`API key không hợp lệ (${res.status}: ${res.body?.error?.message ?? res.text})`,
      'Kiểm tra EXPO_PUBLIC_FIREBASE_API_KEY trong Project settings → Your apps → Web app.');
    return false;
  }
  // Endpoint này trả về project number (trùng messagingSenderId), không phải project ID.
  const projectNumber = env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  if (res.body.projectId && projectNumber && res.body.projectId !== projectNumber) {
    fail(`API key thuộc project số ${res.body.projectId}, nhưng Sender ID trong .env là ${projectNumber}`,
      'Các giá trị Firebase trong .env có vẻ được chép từ hai project khác nhau.');
    return false;
  }
  ok(`API key hợp lệ, project "${firebase.projectId}"`);
  return true;
}

async function createTestUser() {
  const email = `connection-check-${Date.now()}@homnayangi.test`;
  const res = await call(identity('accounts:signUp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: `Check-${crypto.randomUUID()}`, returnSecureToken: true }),
  });
  if (res.status !== 200) {
    const message = res.body?.error?.message ?? res.text;
    fail(`Không tạo được tài khoản email (${message})`,
      message.includes('OPERATION_NOT_ALLOWED') || message.includes('CONFIGURATION_NOT_FOUND')
        ? 'Bật Authentication → Sign-in method → Email/Password.'
        : undefined);
    return null;
  }
  ok('Đăng ký Email/Password hoạt động');
  return { uid: res.body.localId, idToken: res.body.idToken };
}

async function deleteTestUser(user) {
  await call(identity('accounts:delete'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: user.idToken }),
  });
}

async function checkFirestore(user) {
  const url = `https://firestore.googleapis.com/v1/projects/${firebase.projectId}/databases/(default)/documents/users/${user.uid}`;
  const res = await call(url, { headers: { Authorization: `Bearer ${user.idToken}` } });
  const message = res.body?.error?.message ?? '';

  if (res.status === 404 && /does not exist for project|database.*not exist/i.test(message)) {
    fail('Chưa tạo Firestore Database', 'Firebase Console → Build → Firestore Database → Create database.');
  } else if (res.status === 404) {
    ok('Firestore đã tạo, rules cho phép người dùng đọc hồ sơ của mình');
  } else if (res.status === 403 && /has not been used|is disabled/i.test(message)) {
    fail('Cloud Firestore API chưa bật', message);
  } else if (res.status === 403) {
    fail('Firestore đã tạo nhưng rules đang chặn người dùng đọc hồ sơ của mình',
      'Deploy rules: npx firebase-tools deploy --only firestore:rules,firestore:indexes');
  } else if (res.status === 200) {
    ok('Firestore đọc được');
  } else {
    fail(`Firestore trả lỗi ${res.status}: ${message || res.text}`);
  }
}

async function checkSupabase(user) {
  console.log('\nSupabase');
  const headers = { apikey: supabase.key };

  const settings = await call(`${supabase.url}/auth/v1/settings`, { headers });
  if (settings.status !== 200) {
    fail(`URL hoặc anon key không hợp lệ (${settings.status})`,
      'Kiểm tra EXPO_PUBLIC_SUPABASE_URL và EXPO_PUBLIC_SUPABASE_ANON_KEY trong Project Settings → API.');
    return;
  }
  ok('URL và anon key hợp lệ');

  const probe = await call(`${supabase.url}/storage/v1/object/public/${supabase.bucket}/__connection-check__`, { headers });
  if (/bucket not found/i.test(probe.text)) {
    fail(`Chưa có bucket "${supabase.bucket}"`, 'Chạy supabase/storage.sql trong SQL Editor.');
    return;
  }
  ok(`Bucket "${supabase.bucket}" tồn tại và đọc công khai được`);

  if (!user) return;
  const path = `posts/${user.uid}/connection-check/ping.png`;
  const upload = await call(`${supabase.url}/storage/v1/object/${supabase.bucket}/${path}`, {
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${user.idToken}`, 'Content-Type': 'image/png' },
    body: Buffer.from(PIXEL_PNG, 'base64'),
  });

  if (upload.status === 200) {
    ok('Upload bằng Firebase ID token hoạt động (Third-party Auth + policy đúng)');
    await call(`${supabase.url}/storage/v1/object/${supabase.bucket}/${path}`, {
      method: 'DELETE',
      headers: { ...headers, Authorization: `Bearer ${user.idToken}` },
    });
    return;
  }

  const message = upload.body?.message ?? upload.body?.error ?? upload.text;
  if (/row-level security|unauthorized/i.test(message) && upload.status !== 401) {
    fail(`Supabase nhận token nhưng policy chặn upload (${message})`,
      'Kiểm tra <FIREBASE_PROJECT_ID> trong supabase/storage.sql đã thay đúng chưa, rồi chạy lại.');
  } else {
    fail(`Supabase chưa chấp nhận Firebase ID token (${upload.status}: ${message})`,
      `Bật Authentication → Sign In / Providers → Third-party Auth → Firebase, project ID "${firebase.projectId}".`);
  }
}

async function main() {
  const missing = Object.entries({
    EXPO_PUBLIC_FIREBASE_API_KEY: firebase.apiKey,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: firebase.projectId,
    EXPO_PUBLIC_SUPABASE_URL: supabase.url,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: supabase.key,
  }).filter(([, value]) => !value);
  if (missing.length) {
    console.log(`Thiếu biến trong .env: ${missing.map(([k]) => k).join(', ')}`);
    process.exit(1);
  }

  let user = null;
  if (await checkFirebaseProject()) {
    user = await createTestUser();
    if (user) await checkFirestore(user);
  }
  try {
    await checkSupabase(user);
  } finally {
    if (user) await deleteTestUser(user);
  }

  console.log(failures ? `\n${failures} mục cần xử lý.` : '\nTất cả kết nối đều ổn.');
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
