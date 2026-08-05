import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, Mail, Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_ROLES, ROLE_LABELS, type AdminRole } from "@/lib/admin-levels";
import {
  createAdminInvite,
  listAdminInvites,
  revokeAdminInvite,
} from "@/lib/admin-invites.functions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting to be accepted",
  accepted: "Accepted",
  revoked: "Cancelled",
  expired: "Expired",
};

export function AdminInvites() {
  const queryClient = useQueryClient();
  const list = useServerFn(listAdminInvites);
  const create = useServerFn(createAdminInvite);
  const revoke = useServerFn(revokeAdminInvite);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("admin_l3");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [lastLink, setLastLink] = useState<string | null>(null);

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: () => list({}),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-invites"] });

  const inviteMutation = useMutation({
    mutationFn: () => create({ data: { email, role, expiresInDays } }),
    onSuccess: async (result) => {
      setLastLink(result.inviteUrl);
      setEmail("");
      toast.success(
        result.emailSent
          ? "Invitation email sent"
          : "Invitation created — email could not be delivered, share the link below",
      );
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: async () => {
      toast.success("Invitation cancelled");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function copy(link: string) {
    await navigator.clipboard.writeText(link);
    toast.success("Invitation link copied");
  }

  return (
    <div className="space-y-8">
      <Card className="border-border/70">
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="text-lg">Invite an administrator</h3>
            <p className="text-sm text-muted-foreground">
              We email a one-time setup link. The invited person chooses their own password; the
              link stops working once used, cancelled or expired.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Admin level</Label>
              <Select value={role} onValueChange={(value) => setRole(value as AdminRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {ROLE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-expiry">Link valid for (days)</Label>
              <Input
                id="invite-expiry"
                type="number"
                min={1}
                max={30}
                value={expiresInDays}
                onChange={(event) => setExpiresInDays(Number(event.target.value) || 7)}
              />
            </div>
          </div>

          <Button
            variant="hero"
            disabled={inviteMutation.isPending || !email.includes("@")}
            onClick={() => inviteMutation.mutate()}
          >
            <Mail /> {inviteMutation.isPending ? "Sending…" : "Send invitation"}
          </Button>

          {lastLink ? (
            <div className="space-y-2 rounded-lg bg-secondary/50 p-4 text-sm">
              <p className="font-medium">One-time setup link (shown once)</p>
              <p className="break-all text-muted-foreground">{lastLink}</p>
              <Button variant="soft" size="sm" onClick={() => copy(lastLink)}>
                <Copy /> Copy link
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="space-y-4 p-6">
          <h3 className="text-lg">Invitations</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invitations yet.</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {invites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {ROLE_LABELS[invite.role]} · {STATUS_LABEL[invite.status]} ·{" "}
                      {invite.status === "pending"
                        ? `expires ${new Date(invite.expiresAt).toLocaleDateString("en-GB")}`
                        : new Date(invite.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  {invite.status === "pending" ? (
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => revokeMutation.mutate(invite.id)}
                    >
                      <Ban /> Cancel
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
