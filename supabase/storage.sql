-- Chạy trong Supabase → SQL Editor, sau khi bật Authentication → Third-party Auth → Firebase.
-- Script chạy lại nhiều lần được. Nếu đổi Firebase project, thay project ID trong các policy bên dưới.

-- Bucket public-read cho ảnh/video. Giới hạn 50 MB và chỉ nhận ảnh/video.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Firebase ID token không có claim `role`, nên request được chạy với role `anon`.
-- Vì vậy policy kiểm tra trực tiếp issuer và `sub` (Firebase UID) trong JWT đã được Supabase xác minh.
-- Cấu trúc đường dẫn: posts/<firebase-uid>/<post-id>/<file>

drop policy if exists "Users upload media into their own folder" on storage.objects;
create policy "Users upload media into their own folder"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'media'
  and (auth.jwt() ->> 'iss') = 'https://securetoken.google.com/hom-nay-an-gi-app-b51b3'
  and (storage.foldername(name))[1] = 'posts'
  and (storage.foldername(name))[2] = (auth.jwt() ->> 'sub')
);

-- Supabase cần quyền SELECT trên chính object để trả kết quả sau khi xóa.
drop policy if exists "Users read their own media" on storage.objects;
create policy "Users read their own media"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'media'
  and (auth.jwt() ->> 'iss') = 'https://securetoken.google.com/hom-nay-an-gi-app-b51b3'
  and (storage.foldername(name))[1] = 'posts'
  and (storage.foldername(name))[2] = (auth.jwt() ->> 'sub')
);

drop policy if exists "Users delete their own media" on storage.objects;
create policy "Users delete their own media"
on storage.objects for delete
to anon, authenticated
using (
  bucket_id = 'media'
  and (auth.jwt() ->> 'iss') = 'https://securetoken.google.com/hom-nay-an-gi-app-b51b3'
  and (storage.foldername(name))[1] = 'posts'
  and (storage.foldername(name))[2] = (auth.jwt() ->> 'sub')
);

-- Ảnh món trong catalog (foods/<slug>-640.webp) do đội ngũ upload qua Dashboard,
-- không cần policy ghi cho client.
