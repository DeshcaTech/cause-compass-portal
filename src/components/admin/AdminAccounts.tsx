import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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
import {
  createAdminAccount,
  listAdminAccounts,
  revokeAdminAccess,
  setAdminLevel,
} from "@/lib/admins.functions";
import { AdminInvites } from "@/components/admin/AdminInvites";

const LEVELS = [
  { value: "admin", label: "Level 1 — full admin + account management" },
  { value: "admin_l2", label: "Level 2 — full admin, no account management" },
  { value: "admin_l3", label: "Level 3 — site content only" },
] as const;

type Level = (typeof LEVELS)[number]["value"];

export function AdminAccounts({ adminLevel = 1 }: { adminLevel?: 1 | 2 }) {
  const levelOptions = adminLevel === 1 ? LEVELS : LEVELS.filter((l) => l.value === "admin_l3");
  const queryClient = useQueryClient();
  const list = useServerFn(listAdminAccounts);
  const create = useServerFn(createAdminAccount);
  const setLevel = useServerFn(setAdminLevel);
  const revoke = useServerFn(revokeAdminAccess);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => list({}),
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Level>("admin_l3");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });

  const createMutation = useMutation({
    mutationFn: () => create({ data: { fullName, email, password, role } }),
    onSuccess: async () => {
      toast.success("Admin account created");
      setFullName("");
      setEmail("");
      setPassword("");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const levelMutation = useMutation({
    mutationFn: (input: { userId: string; role: Level }) => setLevel({ data: input }),
    onSuccess: async () => {
      toast.success("Admin level updated");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => revoke({ data: { userId } }),
    onSuccess: async () => {
      toast.success("Admin access removed");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl">Admin accounts</h2>
        <p className="text-sm text-muted-foreground">
          {adminLevel === 1
            ? "Only level 1 administrators can create accounts or change admin levels."
            : "As a level 2 administrator you can create and manage level 3 accounts."}
        </p>
      </div>

      <AdminInvites adminLevel={adminLevel} />

      <Card className="border-border/70">
        <CardContent className="space-y-4 p-6">
          <h3 className="text-lg">Create an account directly</h3>
          <p className="text-sm text-muted-foreground">
            Sets a temporary password yourself instead of sending an invitation.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Full name</Label>
              <Input id="admin-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Temporary password</Label>
              <Input
                id="admin-password"
                type="text"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Admin level</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Level)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="hero"
            disabled={createMutation.isPending || !email || password.length < 8 || fullName.length < 2}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Creating…" : "Create admin account"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="space-y-4 p-6">
          <h3 className="text-lg">Existing administrators</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admin accounts yet.</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {admins.map((admin) => (
                <li
                  key={`${admin.userId}-${admin.role}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium">{admin.fullName ?? admin.email}</p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={admin.role}
                      onValueChange={(value) =>
                        levelMutation.mutate({ userId: admin.userId, role: value as Level })
                      }
                    >
                      <SelectTrigger className="w-[320px] max-w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levelOptions.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => revokeMutation.mutate(admin.userId)}
                    >
                      <Trash2 /> Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
