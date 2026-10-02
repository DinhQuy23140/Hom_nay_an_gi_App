import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { env } from '@/lib/env';
import { getPublicStorageUrl, getSupabase } from '@/lib/supabase';

import {
  MAX_FILE_BYTES,
  MAX_IMAGES,
  MAX_VIDEO_SECONDS,
  type LocalMedia,
  type PostMedia,
} from './types';

/** Lỗi chọn/tải media có thông điệp hiển thị được cho người dùng. */
export class MediaError extends Error {}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

function toLocalMedia(asset: ImagePicker.ImagePickerAsset): LocalMedia {
  const isVideo = asset.type === 'video';
  if (asset.fileSize && asset.fileSize > MAX_FILE_BYTES) {
    throw new MediaError('Mỗi file tối đa 50 MB. Bạn chọn file nhỏ hơn nhé.');
  }
  if (isVideo && asset.duration && asset.duration / 1000 > MAX_VIDEO_SECONDS + 0.5) {
    throw new MediaError(`Video tối đa ${MAX_VIDEO_SECONDS} giây.`);
  }
  return {
    uri: asset.uri,
    type: isVideo ? 'video' : 'image',
    mimeType: asset.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg'),
    width: asset.width || null,
    height: asset.height || null,
  };
}

/**
 * Chọn tối đa 5 ảnh, hoặc 1 video (không trộn), theo giới hạn trong thiết kế.
 * @returns danh sách media mới, hoặc null nếu người dùng hủy.
 */
export async function pickFromLibrary(current: readonly LocalMedia[]): Promise<LocalMedia[] | null> {
  const hasVideo = current.some((m) => m.type === 'video');
  if (hasVideo) throw new MediaError('Mỗi bài chỉ đăng được 1 video.');
  const remaining = MAX_IMAGES - current.length;
  if (remaining <= 0) throw new MediaError(`Tối đa ${MAX_IMAGES} ảnh mỗi bài.`);

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: current.length ? ['images'] : ['images', 'videos'],
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 0.8,
    videoMaxDuration: MAX_VIDEO_SECONDS,
  });
  if (result.canceled) return null;

  const picked = result.assets.map(toLocalMedia);
  const videos = picked.filter((m) => m.type === 'video');
  if (videos.length && (picked.length > 1 || current.length)) {
    throw new MediaError('Video cần đăng riêng, không kèm ảnh khác.');
  }
  return picked;
}

export async function takePhoto(current: readonly LocalMedia[]): Promise<LocalMedia | null> {
  if (current.some((m) => m.type === 'video')) throw new MediaError('Mỗi bài chỉ đăng được 1 video.');
  if (current.length >= MAX_IMAGES) throw new MediaError(`Tối đa ${MAX_IMAGES} ảnh mỗi bài.`);

  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new MediaError('Cần quyền camera để chụp ảnh món ăn.');

  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled) return null;
  return toLocalMedia(result.assets[0]);
}

export async function uploadPostMedia(
  uid: string,
  postId: string,
  media: readonly LocalMedia[],
  onProgress?: (done: number, total: number) => void,
): Promise<PostMedia[]> {
  const storage = getSupabase().storage.from(env.supabase.bucket);
  const uploaded: PostMedia[] = [];

  try {
    for (const [index, item] of media.entries()) {
      const ext = EXTENSIONS[item.mimeType] ?? (item.type === 'video' ? 'mp4' : 'jpg');
      const path = `posts/${uid}/${postId}/${index}.${ext}`;
      const body = await new File(item.uri).arrayBuffer();

      const { error } = await storage.upload(path, body, { contentType: item.mimeType, upsert: false });
      if (error) throw new MediaError('Tải ảnh/video lên thất bại. Kiểm tra mạng rồi thử lại nhé.');

      uploaded.push({
        type: item.type,
        path,
        url: getPublicStorageUrl(path) ?? '',
        width: item.width,
        height: item.height,
      });
      onProgress?.(index + 1, media.length);
    }
    return uploaded;
  } catch (error) {
    await removeMedia(uploaded.map((m) => m.path));
    throw error;
  }
}

export async function removeMedia(paths: string[]) {
  if (!paths.length) return;
  await getSupabase().storage.from(env.supabase.bucket).remove(paths).catch(() => undefined);
}
