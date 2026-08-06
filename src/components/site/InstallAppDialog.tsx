import { useEffect, useState, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

type InstallPromptEvent = Event & { prompt: () => Promise<void> };

/**
 * Wraps a store badge. When a store link is configured it simply opens it;
 * otherwise it explains how to install the web app on the visitor's phone.
 */
export function InstallAppDialog({
  platform,
  storeUrl,
  label,
  children,
}: {
  platform: "android" | "ios";
  storeUrl: string | null | undefined;
  label: string;
  children: ReactNode;
}) {
  const t = useT();
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if (platform !== "android") return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [platform]);

  if (storeUrl) {
    return (
      <a
        href={storeUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        className="inline-flex min-w-0 shrink-0 transition-transform hover:scale-[1.03]"
      >
        {children}
      </a>
    );
  }

  const steps =
    platform === "ios"
      ? [
          t("Open this website in Safari on your iPhone or iPad."),
          t("Tap the Share button at the bottom of the screen."),
          t("Choose \u201cAdd to Home Screen\u201d, then tap Add."),
        ]
      : [
          t("Open this website in Chrome on your Android phone."),
          t("Tap the menu button (three dots) at the top right."),
          t("Choose \u201cInstall app\u201d or \u201cAdd to Home screen\u201d."),
        ];

  return (
    <Dialog>
      <DialogTrigger
        aria-label={label}
        className="inline-flex min-w-0 shrink-0 transition-transform hover:scale-[1.03]"
      >
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            {t(
              "Install CCGMs on your phone in seconds — it works just like an app, with its own icon on your home screen.",
            )}
          </DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {prompt && (
          <Button
            onClick={() => {
              void prompt.prompt();
              setPrompt(null);
            }}
          >
            {t("Install now")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}