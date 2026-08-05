import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { acceptAdminInvite, getAdminInvite } from "@/lib/admin-invites.functions";

export const Route = createFileRoute("/admin-invite")({
  validateSearch: (search: Record<string, unknown>): { token?: string } =>
    typeof search['token'] === "string" ? { token: search['token'] } : {},
  head: () => ({
    meta: [
      { title: "Set up your CCGMs admin account" },
      {
        name: "description",
        content:
          "Accept your CCGMs administrator invitation and set your name and password to access the admin dashboard.",
      },
      { property: "og:title", content: "Set up your CCGMs admin account" },
      {
        property: "og:description",
        content: "Accept your administrator invitation for the CCGMs community website.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminInvitePage,
});

function AdminInvitePage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const readInvite = useServerFn(getAdminInvite);
  const accept = useServerFn(acceptAdminInvite);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const { data: invite, isLoading } = useQuery({
    queryKey: ["admin-invite", token],
    queryFn: () => readInvite({ data: { token: token! } }),
    enabled: Boolean(token),
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => accept({ data: { token: token!, fullName, password } }),
    onSuccess: async (result) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: result.email,
        password,
      });
      if (error) {
        toast.success("Account ready — please sign in.");
        navigate({ to: "/auth", replace: true });
        return;
      }
      toast.success("Welcome aboard — your admin account is ready.");
      navigate({ to: "/admin", replace: true });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const invalidReason = !token
    ? "This page needs an invitation link."
    : invite && !invite.valid
      ? invite.reason
      : null;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Set up your admin account"
        description="Your invitation link works once. Choose your name and a password to finish."
      />
      <section className="container-page py-12">
        <Card className="mx-auto max-w-lg border-border/70">
          <CardContent className="space-y-6 p-8">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Checking your invitation…</p>
            ) : invalidReason ? (
              <div className="space-y-4">
                <h2 className="text-lg">Invitation unavailable</h2>
                <p className="text-sm text-muted-foreground">{invalidReason}</p>
                <p className="text-sm text-muted-foreground">
                  Ask a level 1 administrator to send you a new invitation link.
                </p>
                <Button variant="soft" onClick={() => navigate({ to: "/contact" })}>
                  Contact us
                </Button>
              </div>
            ) : invite?.valid ? (
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (password !== confirm) {
                    toast.error("The two passwords don't match");
                    return;
                  }
                  acceptMutation.mutate();
                }}
              >
                <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4 text-sm">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <div>
                    <p>
                      Invitation for <span className="font-medium">{invite.email}</span>
                    </p>
                    <p className="text-muted-foreground">{invite.roleLabel}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="invite-name">Full name</Label>
                  <Input
                    id="invite-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-password">Choose a password</Label>
                  <Input
                    id="invite-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-confirm">Confirm password</Label>
                  <Input
                    id="invite-confirm"
                    type="password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <Button type="submit" variant="hero" disabled={acceptMutation.isPending}>
                  {acceptMutation.isPending ? "Setting up…" : "Activate my admin account"}
                </Button>
              </form>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
