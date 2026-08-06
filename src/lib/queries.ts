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
  category: string;
  short_description: string | null;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  whatsapp: string | null;
};

export type SurveyQuestion = {
  id: string;
  type: "choice" | "text";
  label: string;
  options?: string[];
};

export type VillageGroup = {
  id: string;
  name: string;
  region: string;
  group_category: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  meeting_info: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  sort_order: number;
};

export type Survey = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  questions: SurveyQuestion[];
  is_active: boolean;
  closes_at: string | null;
  opens_at?: string | null;
};

/** A survey is live only when it is switched on and today falls inside its date window. */
export function surveyStatus(survey: Survey): "active" | "closed" {
  if (!survey.is_active) return "closed";
  const today = new Date().toISOString().slice(0, 10);
  if (survey.opens_at && survey.opens_at > today) return "closed";
  if (survey.closes_at && survey.closes_at < today) return "closed";
  return "active";
}

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
    unwrap<EventRow[]>(
      await supabase
        .from("events")
        .select(
          "id, title, description, start_at, end_at, location, image_url, event_type, organiser, ticket_url",
        )
        .order("start_at"),
    ),
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

export const villageGroupsQuery = queryOptions({
  queryKey: ["village_groups"],
  queryFn: async () =>
    unwrap<VillageGroup[]>(
      await supabase
        .from("village_groups")
        .select(
          "id, name, region, group_category, short_description, description, image_url, meeting_info, contact_name, contact_phone, contact_email, sort_order",
        )
        .eq("is_published", true)
        .order("sort_order"),
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

export type Job = {
  id: string;
  title: string;
  company: string;
  category: string;
  job_type: string;
  location: string | null;
  salary_range: string | null;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  apply_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  closes_at: string | null;
  created_at: string;
};

const JOB_PUBLIC_COLUMNS =
  "id, title, company, category, job_type, location, salary_range, short_description, description, image_url, apply_url, contact_email, contact_phone, closes_at, created_at";

export const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: async () =>
    unwrap<Job[]>(
      await supabase
        .from("jobs")
        .select(JOB_PUBLIC_COLUMNS)
        .eq("is_published", true)
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false }),
    ),
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

export type FooterPhoto = {
  id: string;
  photo_url: string;
  caption: string | null;
  sort_order: number;
};

/** Up to 10 admin-curated pictures; the footer shows 6 of them at random. */
export const footerPhotosQuery = queryOptions({
  queryKey: ["footer_photos"],
  queryFn: async () =>
    unwrap<FooterPhoto[]>(
      await supabase
        .from("footer_photos")
        .select("id, photo_url, caption, sort_order")
        .order("sort_order"),
    ),
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

export type Announcement = {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  image_url: string | null;
  published_at: string;
  is_featured: boolean;
  is_pinned: boolean;
};

export const announcementsQuery = queryOptions({
  queryKey: ["announcements"],
  queryFn: async () =>
    unwrap<Announcement[]>(
      await supabase
        .from("announcements")
        .select("id, title, summary, body, image_url, published_at, is_featured, is_pinned")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false }),
    ),
});

export const announcementQuery = (id: string) =>
  queryOptions({
    queryKey: ["announcement", id],
    queryFn: async () =>
      unwrap<Announcement>(
        await supabase
          .from("announcements")
          .select("id, title, summary, body, image_url, published_at, is_featured, is_pinned")
          .eq("is_published", true)
          .eq("id", id)
          .maybeSingle(),
      ),
  });

export type HomeStats = {
  members: number;
  businesses: number;
  upcoming_events: number;
  board_members: number;
  active_campaigns: number;
};

export const homeStatsQuery = queryOptions({
  queryKey: ["home_stats"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("get_home_stats");
    if (error) throw new Error(error.message);
    return data as unknown as HomeStats;
  },
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

/** 8-digit numeric date, e.g. 08/08/2026 */
export function formatDateShort(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}