import type { MediaRecord } from "./media";

export type { MediaRecord };

export type ArticleStatus = "draft" | "published";
export type ToastType = "error" | "success";

export interface ArticleTagObject {
  name: string;
}

export type ArticleTag = string | ArticleTagObject;

export interface ArticleData {
  id: number;
  title: string;
  slug: string;
  body: string;
  description: string | null;
  status: ArticleStatus;
  tags?: ArticleTag[];
  category_id?: number | null;
  media?: MediaRecord[];
  images?: MediaRecord[];
}

export interface ArticleUpdatePayload {
  title: string;
  body: string;
  status: ArticleStatus;
  slug?: string;
  description?: string;
  tags?: string[];
  category_id?: number;
}

export interface ApiErrorResponse {
  error?: string;
}

export interface CategoriesResponse {
  categories?: Array<{
    id: number;
    name: string;
  }>;
}

export interface UploadResponse extends ApiErrorResponse {
  media?: MediaRecord;
}

export interface MediaSyncEventDetail {
  galleryId: string;
  media: MediaRecord[];
}

export interface MediaDeletedEventDetail {
  galleryId: string;
  mediaId: number;
}

export interface MediaToastEventDetail {
  galleryId: string;
  message?: string;
  type?: ToastType;
}
