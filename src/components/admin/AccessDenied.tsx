import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert, LogOut, Mail, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestAdminAccess } from "@/lib/access-requests.functions";

type AccessDeniedProps = {
  /** Human name of the blocked area, e.g. "Membership". */
  section?: string;
  /** What role or admin level unlocks it. */
  requirement: string;
  /** Current role wording, shown so the user can quote it in a request. */
  currentLevel?: string;
  onSignOut?: () => void;
  onBack?: () => void;
};

export function AccessDenied({
  section,
  requirement,
  currentLevel,
  onSignOut,
  onBack,
}: AccessDeniedProps) {
  const submitRequest = useServerFn(requestAdminAccess);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  const requestMutation = useMutation({
    mutationFn: () =>
      submitRequest({
        data: {
          section: section || "Admin dashboard",
          requirement,
          currentLevel: currentLevel || "No admin role",
          reason: reason.trim() || undefined,
        },
      }),
    onSuccess: () => {
      setSent(true);
      toast.success("Your request has been sent to the administrators");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="container-page py-16">
      <Card className="mx-auto max-w-xl border-border/70">
        <CardContent className="space-y-6 p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-full bg-secondary p-3 text-foreground">
              <ShieldAlert className="size-5" aria-hidden />
            </span>
            <div className="space-y-1">
              <h1 className="text-xl">Access denied</h1>
              <p className="text-sm text-muted-foreground">
                {section
                  ? `Your account can't open the ${section} section of the admin dashboard.`
                  : "Your account doesn't have access to the admin dashboard."}
              </p>
            </div>
          </div>

          <dl className="grid gap-3 rounded-lg bg-secondary/50 p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-muted-foreground">Your current access</dt>
              <dd className="font-medium">{currentLevel || "No admin role"}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-muted-foreground">Access required</dt>
              <dd className="font-medium">{requirement}</dd>
            </div>
          </dl>

          <div className="space-y-2 text-sm">
            <p className="font-medium">How to request this level</p>
            <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Contact a level 1 (super) administrator of CCGMs.</li>
              <li>
                Send them the email address you sign in with, the section you need
                {section ? ` (${section})` : ""}, and why you need it.
              </li>
              <li>
                They can grant it in <span className="font-medium text-foreground">Admin → Admin accounts</span>; the
                change is recorded in the activity log.
              </li>
              <li>Sign out and back in once the new level is granted.</li>
            </ol>
          </div>

          <div className="space-y-3 rounded-lg border border-border/70 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Request this access</p>
              <p className="text-sm text-muted-foreground">
                We email the level 1 administrators with your account details and the section you
                need.
              </p>
            </div>
            {sent ? (
              <p className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="size-4" aria-hidden /> Request sent. An administrator will
                be in touch.
              </p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="access-reason">Why do you need it? (optional)</Label>
                  <Textarea
                    id="access-reason"
                    rows={3}
                    maxLength={1000}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="e.g. I manage membership payments and need to confirm a family registration."
                  />
                </div>
                <Button
                  variant="hero"
                  disabled={requestMutation.isPending}
                  onClick={() => requestMutation.mutate()}
                >
                  <Send /> {requestMutation.isPending ? "Sending…" : "Send access request"}
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="soft">
              <a href="/contact">
                <Mail /> Contact an administrator
              </a>
            </Button>
            {onBack ? (
              <Button variant="outline" onClick={onBack}>
                Back to my dashboard
              </Button>
            ) : null}
            {onSignOut ? (
              <Button variant="ghost" onClick={onSignOut}>
                <LogOut /> Sign out
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}