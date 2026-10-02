export type MediaType = 'image' | 'video';
export type PostVisibility = 'PUBLIC' | 'PRIVATE';

export interface PostMedia {
  type: MediaType;
  /** Đường dẫn trong Supabase Storage, dùng để xóa file. */
  path: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  foodSlug: string | null;
  foodName: string;
  rating: number;
  content: string;
  media: PostMedia[];
  visibility: PostVisibility;
  likeCount: number;
  createdAt: Date;
  likedByMe: boolean;
}

/** Ảnh/video người dùng chọn, chưa upload. */
export interface LocalMedia {
  uri: string;
  type: MediaType;
  mimeType: string;
  width: number | null;
  height: number | null;
}

export interface NewPostInput {
  foodSlug: string | null;
  foodName: string;
  rating: number;
  content: string;
  visibility: PostVisibility;
  media: LocalMedia[];
}

export const MAX_IMAGES = 5;
export const MAX_VIDEO_SECONDS = 60;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_CONTENT_LENGTH = 1000;
