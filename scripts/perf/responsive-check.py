#!/usr/bin/env python3
"""Automated responsive screenshot test.

Loads key routes at iOS Safari and Android Chrome breakpoints, asserts there is
no horizontal overflow, and writes screenshots to scripts/perf/screenshots/.

Usage: python3 scripts/perf/responsive-check.py [base_url]
Exits non-zero if any breakpoint overflows.
"""
import asyncio
import sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
OUT = Path(__file__).parent / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

IOS_UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 "
          "(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1")
ANDROID_UA = ("Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) "
              "Chrome/126.0.0.0 Mobile Safari/537.36")

DEVICES = [
    ("ios-iphone-se", 375, 667, 2, IOS_UA),
    ("ios-iphone-14", 390, 844, 3, IOS_UA),
    ("ios-iphone-14-pro-max", 430, 932, 3, IOS_UA),
    ("ios-ipad-mini", 768, 1024, 2, IOS_UA),
    ("android-galaxy-s8", 360, 740, 3, ANDROID_UA),
    ("android-pixel-7", 412, 915, 2.6, ANDROID_UA),
    ("android-tablet", 800, 1280, 2, ANDROID_UA),
]

ROUTES = ["/", "/events", "/news", "/fundraising", "/membership"]


async def main() -> int:
    failures = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        for name, w, h, dpr, ua in DEVICES:
            ctx = await browser.new_context(
                viewport={"width": w, "height": h},
                device_scale_factor=dpr,
                user_agent=ua,
                is_mobile=True,
                has_touch=True,
            )
            page = await ctx.new_page()
            for route in ROUTES:
                await page.goto(BASE + route, wait_until="networkidle")
                metrics = await page.evaluate(
                    "() => ({ scrollWidth: document.documentElement.scrollWidth,"
                    " clientWidth: document.documentElement.clientWidth })"
                )
                slug = route.strip("/").replace("/", "-") or "home"
                await page.screenshot(path=str(OUT / f"{name}__{slug}.png"))
                overflow = metrics["scrollWidth"] - metrics["clientWidth"]
                status = "ok" if overflow <= 0 else f"OVERFLOW +{overflow}px"
                print(f"{name:24} {route:14} {metrics['scrollWidth']}/{metrics['clientWidth']} {status}")
                if overflow > 0:
                    failures.append(f"{name} {route} (+{overflow}px)")
            await ctx.close()
        await browser.close()

    if failures:
        print("\nFAILED breakpoints:\n  " + "\n  ".join(failures))
        return 1
    print("\nAll breakpoints passed with no horizontal overflow.")
    return 0


sys.exit(asyncio.run(main()))
