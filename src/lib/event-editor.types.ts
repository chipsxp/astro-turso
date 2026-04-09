import type { MediaRecord } from "./media";

export type EventStatus = "draft" | "published" | "cancelled";
export type ToastType = "error" | "success";

export interface EventData {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  body: string;
  status: EventStatus;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  is_all_day: boolean;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  event_url: string | null;
  featured_media_id: number | null;
  featured_media_url: string | null;
  featured_media_alt_text: string | null;
}

export interface EventPayload {
  title: string;
  slug?: string;
  description?: string;
  body: string;
  status: EventStatus;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  is_all_day?: 0 | 1;
  venue_name?: string;
  venue_address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  event_url?: string;
  featured_media_id?: number | "";
}

export interface ApiErrorResponse {
  error?: string;
}

export interface MediaListResponse {
  media: MediaRecord[];
}
