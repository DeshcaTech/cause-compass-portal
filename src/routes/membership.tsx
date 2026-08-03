import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
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
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/queries";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership — Join CCGMs Today" },
      {
        name: "description",
        content:
          "Join CCGMs as an individual, student or family member. Family membership covers mum, dad and children up to 21 years old.",
      },
      { property: "og:title", content: "Membership — Join CCGMs Today" },
      {
        property: "og:description",
        content: "Individual, student and family membership with a unique registration number.",
      },
    ],
  }),
  component: MembershipPage,
});

const TIERS = [
  {
    key: "individual" as const,
    name: "Individual",
    price: 30,
    blurb: "For one adult member.",
    perks: ["Voting rights at the AGM", "Member rates on assets", "Event discounts"],
  },
  {
    key: "student" as const,
    name: "Student",
    price: 15,
    blurb: "For students in full-time education.",
    perks: ["All individual benefits", "Mentoring & study support", "Youth programme access"],
  },
  {
    key: "family" as const,
    name: "Family",
    price: 60,
    blurb: "Mum, dad and children up to 21 years old.",
    perks: ["Covers partner & dependents", "One number for the household", "Family event rates"],
  },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type FamilyMember = {
  full_name: string;
  relation: "partner" | "dependent";
  birth_month: string;
  birth_year: string;
  phone: string;
};

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(6, "Enter a phone number").max(30),
  address: z.string().trim().min(5, "Enter your address").max(300),
  birth_month: z.coerce.number().int().min(1).max(12),
  birth_year: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
});

function MembershipPage() {
  const [tier, setTier] = useState<(typeof TIERS)[number]["key"]>("individual");
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [number, setNumber] = useState<string | null>(null);

  const price = TIERS.find((t) => t.key === tier)!.price;

  function updateFamily(index: number, patch: Partial<FamilyMember>) {
    setFamily((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    if (tier === "family") {
      const invalid = family.some(
        (member) =>
          member.full_name.trim().length < 2 || !member.birth_month || !member.birth_year,
      );
      if (invalid) {
        toast.error("Complete the name and birth month/year for every family member");
        return;
      }
    }

    setSaving(true);
    const { data, error } = await supabase.rpc("submit_membership", {
      _full_name: parsed.data.full_name,
      _email: parsed.data.email,
      _phone: parsed.data.phone,
      _address: parsed.data.address,
      _birth_month: parsed.data.birth_month,
      _birth_year: parsed.data.birth_year,
      _membership_type: tier,
      _amount: price,
      _family:
        tier === "family"
          ? family.map((member) => ({
              full_name: member.full_name,
              relation: member.relation,
              birth_month: Number(member.birth_month),
              birth_year: Number(member.birth_year),
              phone: member.relation === "partner" ? member.phone : "",
            }))
          : [],
    });
    setSaving(false);

    if (error) {
      toast.error("Registration failed. Please check your details and try again.");
      return;
    }
    setNumber(data as string);
    toast.success("Welcome to CCGMs!");
  }

  if (number) {
    return (
      <>
        <PageHeader eyebrow="Membership" title="You're registered" />
        <section className="container-page py-16">
          <Card className="mx-auto max-w-xl border-border/70 text-center">
            <CardContent className="p-10">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[image:var(--gradient-gold)] text-gold-foreground">
                <Check className="size-7" />
              </span>
              <h2 className="mt-6 text-2xl">Your registration number</h2>
              <p className="mt-3 font-mono text-3xl tracking-widest text-primary">{number}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                A confirmation email with your registration details is on its way. Keep this number
                — you'll be asked for it when donating, volunteering, renting assets or referring
                someone.
              </p>
            </CardContent>
          </Card>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Become a member of CCGMs"
        description="Choose the membership that fits your household. Every member receives a unique registration number by email."
      />

      <section className="container-page py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {TIERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTier(item.key)}
              className={`rounded-2xl border p-6 text-left transition-all ${
                tier === item.key
                  ? "border-primary bg-accent shadow-[var(--shadow-lift)]"
                  : "border-border bg-card hover:-translate-y-1"
              }`}
            >
              <p className="eyebrow text-terracotta">{item.name}</p>
              <p className="mt-2 text-3xl font-semibold">
                {formatMoney(item.price)}
                <span className="text-sm font-normal text-muted-foreground"> / year</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{item.blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {item.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {perk}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <Card className="mt-10 border-border/70">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl">Registration details</h2>
            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" required maxLength={120} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" name="phone" required maxLength={30} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" required maxLength={300} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_month">Month of birth</Label>
                  <select
                    id="birth_month"
                    name="birth_month"
                    required
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select month</option>
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_year">Year of birth</Label>
                  <Input
                    id="birth_year"
                    name="birth_year"
                    type="number"
                    min={1900}
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>

              {tier === "family" ? (
                <div className="rounded-xl border border-border/70 bg-secondary/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg">Family members</h3>
                      <p className="text-sm text-muted-foreground">
                        Add your partner and dependents up to 21 years old.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() =>
                        setFamily((prev) => [
                          ...prev,
                          {
                            full_name: "",
                            relation: "dependent",
                            birth_month: "",
                            birth_year: "",
                            phone: "",
                          },
                        ])
                      }
                    >
                      <Plus /> Add member
                    </Button>
                  </div>

                  <div className="mt-5 space-y-5">
                    {family.map((member, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Member {index + 1}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Remove member"
                            onClick={() =>
                              setFamily((prev) => prev.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 />
                          </Button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Relation</Label>
                            <Select
                              value={member.relation}
                              onValueChange={(value) =>
                                updateFamily(index, {
                                  relation: value as FamilyMember["relation"],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="partner">Partner</SelectItem>
                                <SelectItem value="dependent">Dependent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Full name</Label>
                            <Input
                              value={member.full_name}
                              maxLength={120}
                              onChange={(e) =>
                                updateFamily(index, { full_name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Month of birth</Label>
                            <select
                              value={member.birth_month}
                              onChange={(e) =>
                                updateFamily(index, { birth_month: e.target.value })
                              }
                              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                            >
                              <option value="">Select month</option>
                              {MONTHS.map((month, monthIndex) => (
                                <option key={month} value={monthIndex + 1}>
                                  {month}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Year of birth</Label>
                            <Input
                              type="number"
                              min={1900}
                              max={new Date().getFullYear()}
                              value={member.birth_year}
                              onChange={(e) =>
                                updateFamily(index, { birth_year: e.target.value })
                              }
                            />
                          </div>
                          {member.relation === "partner" ? (
                            <div className="space-y-2 sm:col-span-2">
                              <Label>Partner phone number</Label>
                              <Input
                                value={member.phone}
                                maxLength={30}
                                onChange={(e) => updateFamily(index, { phone: e.target.value })}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
                <p className="text-sm text-muted-foreground">
                  Total due:{" "}
                  <span className="text-base font-semibold text-foreground">
                    {formatMoney(price)}
                  </span>{" "}
                  per year
                </p>
                <Button type="submit" variant="hero" size="lg" disabled={saving}>
                  {saving ? "Registering…" : "Complete registration"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}