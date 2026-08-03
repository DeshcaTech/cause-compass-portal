import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export type BoardMember = {
  id: string;
  full_name: string;
  role_title: string;
  bio: string | null;
  photo_url: string | null;
  term_label: string;
  is_current: boolean;
  sort_order: number;
};

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
  image_url: string | null;
  event_type: "ccgms" | "other";
  organiser: string | null;
  ticket_url: string | null;
};

export type Campaign = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  image_url: string | null;
  goal_amount: number;
  raised_amount: number;
  status: "active" | "past";
  ends_at: string | null;
};

export type Partner = {
  id: string;
  business_name: string;
  owner_name: string | null;
  category: string;
  short_description: string | null;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
};

export type SurveyQuestion = {
  id: string;
  type: "choice" | "text";
  label: string;
  options?: string[];
};

export type Survey = {
  id: string;
  title: string;
  description: string | null;
  questions: SurveyQuestion[];
  is_active: boolean;
  closes_at: string | null;
};

export type Gallery = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  cover_url: string | null;
  is_default: boolean;
};

export type GalleryPhoto = {
  id: string;
  gallery_id: string;
  photo_url: string;
  caption: string | null;
  sort_order: number;
};

export type CommunityAsset = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  quantity: number;
  member_price: number | null;
  non_member_price: number | null;
  is_available: boolean;
};

export type DocumentRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_type: string | null;
};

export type PresidentMessage = {
  id: string;
  president_name: string;
  title: string;
  photo_url: string | null;
  message: string;
};

export const boardQuery = queryOptions({
  queryKey: ["board_members"],
  queryFn: async () =>
    unwrap<BoardMember[]>(
      await supabase.from("board_members").select("*").order("sort_order"),
    ),
});

export const presidentQuery = queryOptions({
  queryKey: ["president_message"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("president_message")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as PresidentMessage | null;
  },
});

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () =>
    unwrap<EventRow[]>(await supabase.from("events").select("*").order("start_at")),
});

export const campaignsQuery = queryOptions({
  queryKey: ["campaigns"],
  queryFn: async () =>
    unwrap<Campaign[]>(
      await supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
    ),
});

const PARTNER_PUBLIC_COLUMNS =
  "id, business_name, category, short_description, description, logo_url, phone, email, website, address, is_published, created_at";

export const partnersQuery = queryOptions({
  queryKey: ["partners"],
  queryFn: async () =>
    unwrap<Partner[]>(
      await supabase.from("partners").select(PARTNER_PUBLIC_COLUMNS).order("business_name"),
    ),
});

export const surveysQuery = queryOptions({
  queryKey: ["surveys"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      ...row,
      questions: (row.questions ?? []) as unknown as SurveyQuestion[],
    })) as Survey[];
  },
});

export const galleriesQuery = queryOptions({
  queryKey: ["galleries"],
  queryFn: async () =>
    unwrap<Gallery[]>(
      await supabase.from("galleries").select("*").order("event_date", { ascending: false }),
    ),
});

export const galleryPhotosQuery = queryOptions({
  queryKey: ["gallery_photos"],
  queryFn: async () =>
    unwrap<GalleryPhoto[]>(await supabase.from("gallery_photos").select("*").order("sort_order")),
});

export const assetsQuery = queryOptions({
  queryKey: ["community_assets"],
  queryFn: async () =>
    unwrap<CommunityAsset[]>(await supabase.from("community_assets").select("*").order("name")),
});

export const documentsQuery = queryOptions({
  queryKey: ["documents"],
  queryFn: async () =>
    unwrap<DocumentRow[]>(await supabase.from("documents").select("*").order("category")),
});

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string, withTime = false) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}