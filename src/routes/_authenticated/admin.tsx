import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { RecordManager } from "@/components/admin/RecordManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { galleriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin")({
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

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return !!data;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <section className="container-page py-20 text-sm text-muted-foreground">Loading…</section>;
  }

  if (!isAdmin) {
    return (
      <section className="container-page py-20">
        <Card className="mx-auto max-w-md border-border/70">
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="text-xl">Admin access required</h1>
            <p className="text-sm text-muted-foreground">
              Your account doesn't have the admin role. Ask an existing administrator to grant it.
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

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Manage site content"
        description="Add, edit and remove events, gallery albums and photos, partners and fundraising campaigns."
      />
      <section className="container-page py-12">
        <div className="mb-6 flex justify-end">
          <Button variant="soft" size="sm" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>

        <Tabs defaultValue="events">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-8">
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
                { name: "image_url", label: "Image URL" },
                { name: "ticket_url", label: "Ticket link" },
              ]}
            />
          </TabsContent>

          <TabsContent value="gallery" className="mt-8 space-y-12">
            <RecordManager
              table="galleries"
              title="Gallery albums"
              description="One album per event. The default album opens first on the gallery page."
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
                { name: "cover_url", label: "Cover image URL" },
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
                      { name: "photo_url", label: "Photo URL", required: true },
                      { name: "caption", label: "Caption" },
                      { name: "sort_order", label: "Sort order", type: "number" },
                    ]}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Create an album first.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="partners" className="mt-8">
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
                { name: "logo_url", label: "Logo URL" },
                { name: "phone", label: "Phone" },
                { name: "email", label: "Email" },
                { name: "website", label: "Website" },
                { name: "address", label: "Address" },
                { name: "is_published", label: "Published", type: "switch" },
              ]}
            />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-8">
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
                { name: "image_url", label: "Image URL" },
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
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}