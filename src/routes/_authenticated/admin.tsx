import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { RecordManager } from "@/components/admin/RecordManager";
import { SurveysManager } from "@/components/admin/SurveysManager";
import { FundraisingReport } from "@/components/admin/FundraisingReport";
import { CampaignStatusNotifier } from "@/components/admin/CampaignStatusNotifier";
import { NewsNotifier } from "@/components/admin/NewsNotifier";
import { RsvpManager } from "@/components/admin/RsvpManager";
import { JobApplicationsManager } from "@/components/admin/JobApplicationsManager";
import { ReferralsManager } from "@/components/admin/ReferralsManager";
import { VolunteersManager } from "@/components/admin/VolunteersManager";
import { EngagementManager } from "@/components/admin/EngagementManager";
import { FooterPhotoPicker } from "@/components/admin/FooterPhotoPicker";
import { SubscriberList } from "@/components/admin/SubscriberList";
import { BrandSettings } from "@/components/admin/BrandSettings";
import { SiteContentSettings } from "@/components/admin/SiteContentSettings";
import { AdminAccounts } from "@/components/admin/AdminAccounts";
import { AuditLog } from "@/components/admin/AuditLog";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { galleriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin")({
  // Drilldown dialog state lives in the URL so back/forward reopen it.
  validateSearch: (search: Record<string, unknown>): { campaign?: string; tab?: string } => ({
    ...(typeof search['campaign'] === "string" ? { campaign: search['campaign'] } : {}),
    ...(typeof search['tab'] === "string" ? { tab: search['tab'] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Admin panel — Manage CCGMs Content" },
      {
        name: "description",
        content:
          "Manage CCGMs events, gallery albums and photos, member businesses and fundraising campaigns.",
      },
      { property: "og:title", content: "Admin panel — Manage CCGMs Content" },
      {
        property: "og:description",
        content: "Create, edit and remove events, galleries, partners and campaigns.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { tab: requestedTab } = Route.useSearch();
  const queryClient = useQueryClient();
  const { data: galleries = [] } = useQuery(galleriesQuery);
  const [albumId, setAlbumId] = useState<string>("");

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [] as string[];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => String(row.role));
    },
  });

  const level = roles.includes("admin")
    ? 1
    : roles.includes("admin_l2")
      ? 2
      : roles.includes("admin_l3")
        ? 3
        : 99;
  const isSuperAdmin = level === 1;
  const isAdmin = level <= 2; // full admin (levels 1 and 2)
  const isContentAdmin = level <= 3; // content admin (levels 1, 2 and 3)
  const can = (area: "board" | "president" | "fundraising" | "event") =>
    isAdmin ||
    (isContentAdmin && (area === "board" || area === "event")) ||
    roles.includes(`${area}_manager`);
  const hasAnyAccess =
    isContentAdmin || can("board") || can("president") || can("fundraising") || can("event");
  const levelLabel =
    level === 1
      ? "administrator (level 1)"
      : level === 2
        ? "administrator (level 2)"
        : level === 3
          ? "content administrator (level 3)"
          : roles.map((role) => role.replace(/_/g, " ")).join(", ");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <section className="container-page py-20 text-sm text-muted-foreground">Loading…</section>;
  }

  if (!hasAnyAccess) {
    return (
      <AccessDenied
        requirement="Any admin level (1–3) or an area manager role"
        currentLevel="No admin role"
        onSignOut={signOut}
      />
    );
  }

  const activeAlbum = albumId || galleries[0]?.id || "";
  const access: Record<string, { label: string; allowed: boolean; requirement: string }> = {
    events: { label: "Events", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    news: { label: "News", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    rsvps: { label: "RSVPs", allowed: can("event"), requirement: "Admin level 1–3 or event manager" },
    gallery: { label: "Gallery", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    partners: { label: "Partners", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    jobs: { label: "Jobs", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    "job-applications": { label: "Applications", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    referrals: { label: "Get Support", allowed: isAdmin, requirement: "Admin level 1 or 2" },
    volunteers: { label: "Volunteers", allowed: isAdmin, requirement: "Admin level 1 or 2" },
    engagement: { label: "Engagement", allowed: isAdmin, requirement: "Admin level 1 or 2" },
    brand: { label: "Brand", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    "site-content": { label: "Site content", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    documents: { label: "Documents", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    campaigns: { label: "Campaigns", allowed: can("fundraising"), requirement: "Admin level 1–2 or fundraising manager" },
    reports: { label: "Reports", allowed: can("fundraising"), requirement: "Admin level 1–2 or fundraising manager" },
    board: { label: "Board", allowed: can("board"), requirement: "Admin level 1–3 or board manager" },
    president: { label: "President's message", allowed: can("president"), requirement: "Admin level 1–2 or president manager" },
    assets: { label: "Assets", allowed: isAdmin, requirement: "Admin level 1 or 2" },
    "village-groups": { label: "Groups", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    surveys: { label: "Surveys", allowed: isAdmin, requirement: "Admin level 1 or 2" },
    roles: { label: "Roles", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
    admins: { label: "Admin accounts", allowed: isAdmin, requirement: "Admin level 1 or 2" },
    activity: { label: "Activity log", allowed: isContentAdmin, requirement: "Admin level 1, 2 or 3" },
  };
  const blocked = requestedTab ? access[requestedTab] : undefined;
  if (requestedTab && (!blocked || !blocked.allowed)) {
    return (
      <AccessDenied
        section={blocked?.label ?? requestedTab}
        requirement={blocked?.requirement ?? "A higher admin level"}
        currentLevel={levelLabel}
        onBack={() => navigate({ to: "/admin", search: {}, replace: true })}
        onSignOut={signOut}
      />
    );
  }
  const defaultTab = isContentAdmin
    ? "events"
    : can("board")
      ? "board"
      : can("president")
        ? "president"
        : can("fundraising")
          ? "campaigns"
          : "rsvps";

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Manage site content"
        description="Your dashboard shows only the areas your role gives you access to."
      />
      <section className="container-page py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
            {levelLabel}
            </span>
          </p>
          <Button variant="soft" size="sm" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>

        <Tabs value={requestedTab ?? defaultTab} onValueChange={(value) => navigate({ to: "/admin", search: (prev: Record<string, unknown>) => ({ ...prev, tab: value }), replace: true })}>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                {
                  group: "About CCGMs",
                  items: [
                    { value: "president", label: "President's message", show: can("president") },
                    { value: "board", label: "Board Members", show: can("board") },
                    { value: "news", label: "News", show: isContentAdmin },
                    { value: "village-groups", label: "Our Groups", show: isContentAdmin },
                    { value: "documents", label: "Documents", show: isContentAdmin },
                    { value: "assets", label: "Assets rent", show: isAdmin },
                  ],
                },
                {
                  group: "Events",
                  items: [
                    { value: "events", label: "Events", show: isContentAdmin },
                    { value: "rsvps", label: "RSVPs", show: can("event") },
                  ],
                },
                {
                  group: "Partners",
                  items: [
                    { value: "partners", label: "Our Businesses", show: isContentAdmin },
                    { value: "jobs", label: "Jobs", show: isContentAdmin },
                    { value: "job-applications", label: "Applications", show: isContentAdmin },
                  ],
                },
                {
                  group: "Gallery",
                  items: [{ value: "gallery", label: "Gallery", show: isContentAdmin }],
                },
                {
                  group: "Get Involve",
                  items: [
                    { value: "campaigns", label: "Fundraising", show: can("fundraising") },
                    { value: "reports", label: "Fundraising reports", show: can("fundraising") },
                    { value: "surveys", label: "Surveys", show: isAdmin },
                    { value: "volunteers", label: "Volunteers", show: isAdmin },
                    { value: "referrals", label: "Get Support", show: isAdmin },
                  ],
                },
                {
                  group: "Contact Us",
                  items: [{ value: "engagement", label: "Engagement", show: isAdmin }],
                },
                {
                  group: "Site & administration",
                  items: [
                    { value: "brand", label: "Brand", show: isContentAdmin },
                    { value: "site-content", label: "Site content", show: isContentAdmin },
                    { value: "admins", label: "Admin accounts", show: isAdmin },
                    { value: "roles", label: "Roles", show: isContentAdmin },
                    { value: "activity", label: "Activity log", show: isContentAdmin },
                  ],
                },
              ] as const
            )
              .map((section) => ({
                ...section,
                items: section.items.filter((i) => i.show) as { value: string; label: string }[],
              }))
              .filter((section) => section.items.length > 0)
              .map((section) => {
                const activeTab = requestedTab ?? defaultTab;
                const current = section.items.find((item) => item.value === activeTab);
                return (
                  <DropdownMenu key={section.group}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={current ? "default" : "soft"}
                        size="sm"
                        className="font-bold"
                      >
                        {section.group}
                        {current ? (
                          <span className="font-normal opacity-80">· {current.label}</span>
                        ) : null}
                        <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-52">
                      {section.items.map((item) => (
                        <DropdownMenuItem
                          key={item.value}
                          onSelect={() =>
                            navigate({
                              to: "/admin",
                              search: (prev: Record<string, unknown>) => ({ ...prev, tab: item.value }),
                              replace: true,
                            })
                          }
                          className={item.value === activeTab ? "font-semibold" : undefined}
                        >
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
          </div>

          {isContentAdmin && <TabsContent value="news" className="mt-8">
            <NewsNotifier />
            <SubscriberList />
            <RecordManager
              table="announcements"
              title="News & announcements"
              description="Shown in the Latest news section on the home page."
              orderBy={{ column: "published_at", ascending: false }}
              primaryLabel={(row) => String(row['title'])}
              secondaryLabel={(row) =>
                `${new Date(String(row['published_at'])).toLocaleDateString("en-GB")}${row['is_published'] ? "" : " · draft"}`
              }
              defaults={{ is_published: true }}
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "summary", label: "Short summary", type: "textarea" },
                { name: "body", label: "Full text", type: "textarea" },
                { name: "published_at", label: "Published", type: "datetime" },
                { name: "image_url", label: "Picture", type: "image", crop: { aspect: 16 / 9, outputWidth: 1600 } },
                { name: "is_published", label: "Published", type: "switch" },
                { name: "is_featured", label: "Featured", type: "switch" },
                { name: "is_pinned", label: "Pinned to top (max 3)", type: "switch" },
              ]}
            />
          </TabsContent>}

          {can("event") && <TabsContent value="rsvps" className="mt-8">
            <RsvpManager />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="job-applications" className="mt-8">
            <JobApplicationsManager />
          </TabsContent>}

          {isAdmin && <TabsContent value="referrals" className="mt-8">
            <ReferralsManager />
          </TabsContent>}

          {isAdmin && <TabsContent value="volunteers" className="mt-8">
            <VolunteersManager />
          </TabsContent>}

          {isAdmin && <TabsContent value="engagement" className="mt-8">
            <EngagementManager />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="brand" className="mt-8">
            <BrandSettings />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="site-content" className="mt-8">
            <SiteContentSettings isSuperAdmin={isSuperAdmin} canManageWhatsapp={isAdmin} />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="documents" className="mt-8">
            <RecordManager
              table="documents"
              title="Documents"
              description="Files listed on the documents page."
              orderBy={{ column: "category" }}
              primaryLabel={(row) => String(row['title'])}
              secondaryLabel={(row) => String(row['category'])}
              defaults={{ category: "General" }}
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "description", label: "Description", type: "textarea" },
                { name: "category", label: "Category", required: true },
                { name: "file_url", label: "File link (URL)", required: true },
                { name: "file_type", label: "File type", placeholder: "PDF, DOCX…" },
              ]}
            />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="events" className="mt-8">
            <RecordManager
              table="events"
              title="Events"
              description="Coming and past events shown on the events page and calendar."
              orderBy={{ column: "start_at", ascending: false }}
              canEdit={(row) => isAdmin || row['event_type'] !== "ccgms"}
              lockedNote="CCGMs event — level 1 or 2 admins only"
              primaryLabel={(row) => String(row['title'])}
              secondaryLabel={(row) =>
                `${new Date(String(row['start_at'])).toLocaleString("en-GB")} · ${row['location'] ?? "No location"}`
              }
              defaults={{ event_type: isAdmin ? "ccgms" : "other" }}
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "description", label: "Description", type: "textarea" },
                { name: "start_at", label: "Starts", type: "datetime", required: true },
                { name: "end_at", label: "Ends", type: "datetime" },
                { name: "location", label: "Location" },
                {
                  name: "event_type",
                  label: "Event type",
                  type: "select",
                  required: true,
                  options: isAdmin
                    ? [
                        { value: "ccgms", label: "CCGMs event" },
                        { value: "other", label: "Other event" },
                      ]
                    : [{ value: "other", label: "Other event" }],
                  ...(isAdmin
                    ? {}
                    : { help: "Only level 1 and level 2 admins can manage CCGMs events." }),
                },
                { name: "organiser", label: "Organiser" },
                {
                  name: "fee",
                  label: "Entry fee (£)",
                  type: "number",
                  help: "Use 0 for a free event. CCGMs events can be paid online once payments are switched on.",
                },
                {
                  name: "notify_email",
                  label: "Event contact email",
                  help: "Receives the daily RSVP status report for this event.",
                },
                {
                  name: "notify_whatsapp",
                  label: "Event contact WhatsApp",
                  help: "Include the country code, e.g. +447700900123.",
                },
                { name: "image_url", label: "Event picture", type: "image", crop: { aspect: 16 / 9, outputWidth: 1600 } },
                { name: "ticket_url", label: "Ticket link" },
              ]}
            />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="gallery" className="mt-8 space-y-12">
            <RecordManager
              table="galleries"
              title="Gallery albums"
              description="One album per event. Set a main photo for each album — it leads the gallery page. The default album opens first."
              orderBy={{ column: "event_date", ascending: false }}
              primaryLabel={(row) => String(row['title'])}
              secondaryLabel={(row) => `${row['event_date'] ?? "Undated"}`}
              badge={(row) => (row['is_default'] ? "Open by default" : null)}
              rowActions={(row, { update, isSaving }) =>
                row['is_default'] ? null : (
                  <Button
                    variant="soft"
                    size="sm"
                    disabled={isSaving}
                    onClick={async () => {
                      await update({ is_default: true });
                      toast.success(`“${row['title']}” will now open by default.`);
                    }}
                  >
                    {isSaving ? "Setting…" : "Set as default"}
                  </Button>
                )
              }
              defaults={{ is_default: false }}
              fields={[
                { name: "title", label: "Album title", required: true },
                { name: "description", label: "Description", type: "textarea" },
                { name: "event_date", label: "Event date", type: "date" },
                { name: "cover_url", label: "Main photo (album cover)", type: "image", crop: { aspect: 16 / 9, outputWidth: 1600 } },
                {
                  name: "is_default",
                  label: "Open by default",
                  type: "switch",
                  help: "Only one album should be marked as default.",
                },
              ]}
            />

            <div>
              <h2 className="text-xl">Photos in an album</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose an album, then add photo links to it.
              </p>
              <select
                className="mt-3 h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm"
                value={activeAlbum}
                onChange={(event) => setAlbumId(event.target.value)}
              >
                {galleries.map((gallery) => (
                  <option key={gallery.id} value={gallery.id}>
                    {gallery.title}
                  </option>
                ))}
              </select>

              {activeAlbum ? (
                <div className="mt-6">
                  <RecordManager
                    key={activeAlbum}
                    table="gallery_photos"
                    title="Photos"
                    orderBy={{ column: "sort_order" }}
                    filter={{ column: "gallery_id", value: activeAlbum }}
                    primaryLabel={(row) => String(row['caption'] ?? row['photo_url'])}
                    secondaryLabel={(row) => String(row['photo_url'])}
                    defaults={{ sort_order: 0 }}
                    fields={[
                      { name: "photo_url", label: "Photo", type: "image", required: true, crop: { aspect: 4 / 3, outputWidth: 1600 } },
                      { name: "caption", label: "Caption" },
                      { name: "sort_order", label: "Sort order", type: "number" },
                    ]}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Create an album first.</p>
              )}
            </div>

            <FooterPhotoPicker />

            <RecordManager
              table="footer_photos"
              title="Footer photos"
              description="The footer pool (max 10). Photos picked above appear here — you can also upload extra ones, edit captions or reorder."
              orderBy={{ column: "sort_order" }}
              primaryLabel={(row) => String(row['caption'] ?? "Footer photo")}
              secondaryLabel={(row) => String(row['photo_url'])}
              defaults={{ sort_order: 0 }}
              fields={[
                { name: "photo_url", label: "Photo", type: "image", required: true, crop: { aspect: 1, outputWidth: 800 } },
                { name: "caption", label: "Caption (used as image description)" },
                { name: "sort_order", label: "Sort order", type: "number" },
              ]}
            />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="partners" className="mt-8">
            <RecordManager
              table="partners"
              title="Partners"
              description="Member-owned businesses listed in the partners directory."
              orderBy={{ column: "business_name" }}
              primaryLabel={(row) => String(row['business_name'])}
              secondaryLabel={(row) =>
                `${row['category']}${row['is_published'] ? "" : " · hidden"}`
              }
              defaults={{ is_published: true, category: "General" }}
              fields={[
                { name: "business_name", label: "Business name", required: true },
                { name: "owner_name", label: "Owner name" },
                { name: "category", label: "Category", required: true },
                { name: "short_description", label: "Short description" },
                { name: "description", label: "Full description", type: "textarea" },
                { name: "logo_url", label: "Logo / advert picture", type: "image", crop: { aspect: 16 / 9, outputWidth: 1400 } },
                { name: "phone", label: "Phone" },
                { name: "email", label: "Email" },
                { name: "website", label: "Website" },
                { name: "whatsapp", label: "WhatsApp number", placeholder: "+44 7700 900000" },
                { name: "address", label: "Address" },
                { name: "is_published", label: "Published", type: "switch" },
              ]}
            />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="jobs" className="mt-8">
            <RecordManager
              table="jobs"
              title="Jobs"
              description="Job adverts and opportunities listed under Partners → Jobs."
              orderBy={{ column: "created_at", ascending: false }}
              primaryLabel={(row) => String(row['title'])}
              secondaryLabel={(row) =>
                `${row['company']} · ${row['job_type']} · ${String(row['approval_status'] ?? 'pending')}${row['is_published'] ? "" : " · hidden"}`
              }
              defaults={{
                is_published: true,
                category: "General",
                job_type: "Full-time",
                approval_status: "pending",
              }}
              fields={[
                { name: "title", label: "Job title", required: true },
                { name: "company", label: "Company / employer", required: true },
                { name: "category", label: "Category", required: true },
                { name: "job_type", label: "Job type (Full-time, Part-time, Contract…)", required: true },
                { name: "location", label: "Location" },
                { name: "salary_range", label: "Salary range" },
                { name: "short_description", label: "Short description" },
                { name: "description", label: "Full description", type: "textarea" },
                { name: "image_url", label: "Advert picture", type: "image", crop: { aspect: 16 / 9, outputWidth: 1400 } },
                { name: "apply_url", label: "Apply link" },
                { name: "contact_email", label: "Contact email" },
                { name: "contact_phone", label: "Contact phone" },
                {
                  name: "notify_email",
                  label: "Application email",
                  help: "Receives the full application details when someone applies. Falls back to the contact email.",
                },
                {
                  name: "notify_whatsapp",
                  label: "Application WhatsApp number",
                  help: "Include the country code, e.g. +447700900123. Applicants get a one-tap WhatsApp message with their details.",
                },
                {
                  name: "closes_at",
                  label: "Expiry date (advert hides from the Jobs board after this date, kept here in history)",
                  type: "date",
                },
                {
                  name: "approval_status",
                  label: "Approval status (only approved adverts appear on the Jobs board)",
                  type: "select",
                  options: [
                    { value: "pending", label: "Pending review" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                  ],
                },
                { name: "is_published", label: "Published", type: "switch" },
              ]}
            />
          </TabsContent>}

          {can("fundraising") && <TabsContent value="campaigns" className="mt-8">
            <RecordManager
              table="campaigns"
              title="Fundraising campaigns"
              description="Active and past campaigns shown on the fundraising and donate pages."
              orderBy={{ column: "created_at", ascending: false }}
              primaryLabel={(row) => String(row['title'])}
              secondaryLabel={(row) => `${row['status']} · raised ${row['raised_amount']} of ${row['goal_amount']}`}
              defaults={{ status: "active", goal_amount: 0, raised_amount: 0 }}
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "summary", label: "Summary" },
                { name: "description", label: "Description", type: "textarea" },
                { name: "image_url", label: "Campaign picture", type: "image", crop: { aspect: 16 / 9, outputWidth: 1600 } },
                { name: "goal_amount", label: "Goal amount", type: "number", required: true },
                { name: "raised_amount", label: "Raised amount", type: "number", required: true },
                {
                  name: "status",
                  label: "Status",
                  type: "select",
                  required: true,
                  options: [
                    { value: "active", label: "Active" },
                    { value: "past", label: "Past" },
                  ],
                },
                { name: "ends_at", label: "Closing date", type: "date" },
              ]}
            />
            <CampaignStatusNotifier />
          </TabsContent>}

          {can("fundraising") && <TabsContent value="reports" className="mt-8">
            <div className="mb-6">
              <h2 className="text-xl">Fundraising reports</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Totals by campaign and by month, with donation and supporter trends.
              </p>
            </div>
            <FundraisingReport />
          </TabsContent>}

          {can("board") && <TabsContent value="board" className="mt-8">
            <RecordManager
              table="board_members"
              title="Board & team members"
              description="Current and past team members shown on the board page."
              orderBy={{ column: "sort_order" }}
              primaryLabel={(row) => String(row['full_name'])}
              secondaryLabel={(row) =>
                `${row['role_title']} · ${row['term_label']}${row['is_current'] ? " · current" : ""}`
              }
              defaults={{ is_current: true, sort_order: 0 }}
              fields={[
                { name: "full_name", label: "Full name", required: true },
                { name: "role_title", label: "Role", required: true },
                { name: "term_label", label: "Term (e.g. 2024–2026)", required: true },
                { name: "bio", label: "Bio", type: "textarea" },
                { name: "photo_url", label: "Photo", type: "image", crop: { aspect: 1, outputWidth: 800 } },
                { name: "is_current", label: "Current team", type: "switch" },
                { name: "sort_order", label: "Sort order", type: "number" },
              ]}
            />
          </TabsContent>}

          {can("president") && <TabsContent value="president" className="mt-8">
            <RecordManager
              table="president_message"
              title="President's message"
              description="The president's welcome message shown on the About page."
              orderBy={{ column: "updated_at", ascending: false }}
              primaryLabel={(row) => String(row['president_name'])}
              secondaryLabel={(row) =>
                `${row['title']}${row['is_published'] ? "" : " · unpublished"}`
              }
              defaults={{ is_published: true, title: "President" }}
              fields={[
                { name: "president_name", label: "President name", required: true },
                { name: "title", label: "Title", required: true },
                { name: "message", label: "Message", type: "textarea", required: true },
                { name: "photo_url", label: "Photo", type: "image", crop: { aspect: 4 / 3, outputWidth: 1200 } },
                { name: "is_published", label: "Published", type: "switch" },
              ]}
            />
          </TabsContent>}

          {isAdmin && <TabsContent value="assets" className="mt-8">
            <RecordManager
              table="community_assets"
              title="Community assets"
              description="Items members can request to rent."
              orderBy={{ column: "name" }}
              primaryLabel={(row) => String(row['name'])}
              secondaryLabel={(row) =>
                `${row['quantity']} available${row['is_available'] ? "" : " · hidden"}`
              }
              defaults={{ is_available: true, quantity: 1 }}
              fields={[
                { name: "name", label: "Asset name", required: true },
                { name: "description", label: "Description", type: "textarea" },
                { name: "image_url", label: "Asset picture", type: "image", crop: { aspect: 16 / 9, outputWidth: 1400 } },
                { name: "quantity", label: "Quantity", type: "number", required: true },
                { name: "member_price", label: "Member price", type: "number" },
                { name: "non_member_price", label: "Non-member price", type: "number" },
                { name: "is_available", label: "Available", type: "switch" },
              ]}
            />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="village-groups" className="mt-8">
            <RecordManager
              table="village_groups"
              title="Our groups"
              description="Community groups listed under About CCGMs."
              orderBy={{ column: "sort_order" }}
              primaryLabel={(row) => String(row['name'])}
              secondaryLabel={(row) =>
                `${row['region']}${row['is_published'] ? "" : " · hidden"}`
              }
              defaults={{ is_published: true, region: "General", sort_order: 0, group_category: "village" }}
              fields={[
                { name: "name", label: "Group name", required: true },
                { name: "region", label: "Region / division", required: true },
                {
                  name: "group_category",
                  label: "Group category",
                  type: "select",
                  options: [
                    { value: "village", label: "Village-based Group" },
                    { value: "other", label: "Other Group" },
                  ],
                },
                { name: "short_description", label: "Short description" },
                { name: "description", label: "Full description", type: "textarea" },
                { name: "image_url", label: "Group picture", type: "image", crop: { aspect: 16 / 9, outputWidth: 1400 } },
                { name: "meeting_info", label: "Meeting details" },
                { name: "contact_name", label: "Contact name" },
                { name: "contact_phone", label: "Contact phone" },
                { name: "contact_email", label: "Contact email" },
                { name: "sort_order", label: "Sort order", type: "number" },
                { name: "is_published", label: "Published", type: "switch" },
              ]}
            />
          </TabsContent>}
          {isAdmin && <TabsContent value="surveys" className="mt-8">
            <SurveysManager />
          </TabsContent>}

          {isAdmin && <TabsContent value="admins" className="mt-8">
            <AdminAccounts adminLevel={isSuperAdmin ? 1 : 2} />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="activity" className="mt-8">
            <AuditLog />
          </TabsContent>}

          {isContentAdmin && <TabsContent value="roles" className="mt-8">
            <Card className="border-border/70">
              <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
                <h2 className="text-lg text-foreground">Who can manage what</h2>
                <ul className="list-disc space-y-1 pl-5">
                  <li><span className="text-foreground">Level 1 administrator</span> — every area of the site, plus creating and managing other admin accounts.</li>
                  <li><span className="text-foreground">Level 2 administrator</span> — every area of the site except admin account management.</li>
                  <li><span className="text-foreground">Level 3 content administrator</span> — site content only (news, events, RSVPs, gallery, partners, jobs, documents, groups, board, brand and site wording). No access to asset rentals, membership, the president's message or the Get Involved areas.</li>
                  <li><span className="text-foreground">Board manager</span> — board & team members only.</li>
                  <li><span className="text-foreground">President manager</span> — the president's message only.</li>
                  <li><span className="text-foreground">Event manager</span> — event RSVP and interest lists only.</li>
                  <li><span className="text-foreground">Fundraising manager</span> — fundraising campaigns only.</li>
                </ul>
                <p>
                  These limits are enforced in the database, so a manager cannot edit another area
                  even outside this dashboard.
                </p>
              </CardContent>
            </Card>
          </TabsContent>}
        </Tabs>
      </section>
    </>
  );
}