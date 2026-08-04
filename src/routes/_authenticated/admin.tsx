import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { RecordManager } from "@/components/admin/RecordManager";
import { FundraisingReport } from "@/components/admin/FundraisingReport";
import { NewsNotifier } from "@/components/admin/NewsNotifier";
import { RsvpManager } from "@/components/admin/RsvpManager";
import { JobApplicationsManager } from "@/components/admin/JobApplicationsManager";
import { SubscriberList } from "@/components/admin/SubscriberList";
import { BrandSettings } from "@/components/admin/BrandSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { galleriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin")({
  // Drilldown dialog state lives in the URL so back/forward reopen it.
  validateSearch: (search: Record<string, unknown>) => ({
    campaign: typeof search['campaign'] === "string" ? search['campaign'] : undefined,
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

  const isAdmin = roles.includes("admin");
  const can = (area: "board" | "president" | "fundraising" | "event") =>
    isAdmin || roles.includes(`${area}_manager`);
  const hasAnyAccess = isAdmin || can("board") || can("president") || can("fundraising") || can("event");

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
      <section className="container-page py-20">
        <Card className="mx-auto max-w-md border-border/70">
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="text-xl">Admin access required</h1>
            <p className="text-sm text-muted-foreground">
              Your account doesn't have an admin or manager role. Ask an existing administrator to
              grant you access to the board, president's message or fundraising area.
            </p>
            <Button variant="soft" onClick={signOut}>
              <LogOut /> Sign out
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const activeAlbum = albumId || galleries[0]?.id || "";
  const defaultTab = isAdmin
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
              {isAdmin ? "administrator" : roles.map((role) => role.replace(/_/g, " ")).join(", ")}
            </span>
          </p>
          <Button variant="soft" size="sm" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList>
            {isAdmin && <TabsTrigger value="events">Events</TabsTrigger>}
            {isAdmin && <TabsTrigger value="news">News</TabsTrigger>}
            {can("event") && <TabsTrigger value="rsvps">RSVPs</TabsTrigger>}
            {isAdmin && <TabsTrigger value="gallery">Gallery</TabsTrigger>}
            {isAdmin && <TabsTrigger value="partners">Partners</TabsTrigger>}
            {isAdmin && <TabsTrigger value="jobs">Jobs</TabsTrigger>}
            {isAdmin && <TabsTrigger value="job-applications">Applications</TabsTrigger>}
            {isAdmin && <TabsTrigger value="brand">Brand</TabsTrigger>}
            {can("fundraising") && <TabsTrigger value="campaigns">Campaigns</TabsTrigger>}
            {can("fundraising") && <TabsTrigger value="reports">Reports</TabsTrigger>}
            {can("board") && <TabsTrigger value="board">Board</TabsTrigger>}
            {can("president") && <TabsTrigger value="president">President</TabsTrigger>}
            {isAdmin && <TabsTrigger value="assets">Assets</TabsTrigger>}
            {isAdmin && <TabsTrigger value="surveys">Surveys</TabsTrigger>}
            {isAdmin && <TabsTrigger value="roles">Roles</TabsTrigger>}
          </TabsList>

          {isAdmin && <TabsContent value="news" className="mt-8">
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
              ]}
            />
          </TabsContent>}

          {can("event") && <TabsContent value="rsvps" className="mt-8">
            <RsvpManager />
          </TabsContent>}

          {isAdmin && <TabsContent value="job-applications" className="mt-8">
            <JobApplicationsManager />
          </TabsContent>}

          {isAdmin && <TabsContent value="events" className="mt-8">
            <RecordManager
              table="events"
              title="Events"
              description="Coming and past events shown on the events page and calendar."
              orderBy={{ column: "start_at", ascending: false }}
              primaryLabel={(row) => String(row['title'])}
              secondaryLabel={(row) =>
                `${new Date(String(row['start_at'])).toLocaleString("en-GB")} · ${row['location'] ?? "No location"}`
              }
              defaults={{ event_type: "ccgms" }}
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
                  options: [
                    { value: "ccgms", label: "CCGMs event" },
                    { value: "other", label: "Other event" },
                  ],
                },
                { name: "organiser", label: "Organiser" },
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

          {isAdmin && <TabsContent value="gallery" className="mt-8 space-y-12">
            <RecordManager
              table="galleries"
              title="Gallery albums"
              description="One album per event. Set a main photo for each album — it leads the gallery page. The default album opens first."
              orderBy={{ column: "event_date", ascending: false }}
              primaryLabel={(row) => String(row['title'])}
              secondaryLabel={(row) =>
                `${row['event_date'] ?? "Undated"}${row['is_default'] ? " · default album" : ""}`
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
          </TabsContent>}

          {isAdmin && <TabsContent value="partners" className="mt-8">
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
                { name: "address", label: "Address" },
                { name: "is_published", label: "Published", type: "switch" },
              ]}
            />
          </TabsContent>}

          {isAdmin && <TabsContent value="jobs" className="mt-8">
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

          {isAdmin && <TabsContent value="surveys" className="mt-8">
            <RecordManager
              table="surveys"
              title="Surveys"
              description="Surveys shown on the surveys page."
              orderBy={{ column: "created_at", ascending: false }}
              primaryLabel={(row) => String(row['title'])}
              secondaryLabel={(row) => (row['is_active'] ? "Active" : "Closed")}
              defaults={{ is_active: true, questions: [] }}
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "description", label: "Description", type: "textarea" },
                { name: "image_url", label: "Survey picture", type: "image", crop: { aspect: 16 / 6, outputWidth: 1600 } },
                {
                  name: "questions",
                  label: "Questions (JSON)",
                  type: "json",
                  required: true,
                  help: 'e.g. [{"id":"q1","type":"choice","label":"Your view?","options":["Yes","No"]}]',
                },
                { name: "is_active", label: "Active", type: "switch" },
                { name: "closes_at", label: "Closing date", type: "date" },
              ]}
            />
          </TabsContent>}

          {isAdmin && <TabsContent value="roles" className="mt-8">
            <Card className="border-border/70">
              <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
                <h2 className="text-lg text-foreground">Who can manage what</h2>
                <ul className="list-disc space-y-1 pl-5">
                  <li><span className="text-foreground">Administrator</span> — every area of the site.</li>
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