"""End-to-end test: click every header/footer navigation link and assert the route loads.

Usage:  python3 tests/e2e/nav_links.py [base_url]
Default base_url: http://localhost:8080
"""

import asyncio
import sys
from playwright.async_api import async_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080").rstrip("/")
SCOPES = {"header": "header", "footer": "footer"}
# Links that intentionally leave the site or require auth are skipped.
SKIP_HREFS = {"#", ""}


async def collect_links(page, scope_selector):
    return await page.eval_on_selector_all(
        f"{scope_selector} a[href]",
        """els => els.map(e => ({
            href: e.getAttribute('href'),
            label: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 60),
        }))""",
    )


async def check_route(page, href):
    """Click the link (even when inside a collapsed menu) and verify the route renders."""
    errors = []
    page.once("pageerror", lambda e: errors.append(str(e)))
    await page.goto(BASE + "/", wait_until="domcontentloaded")
    clicked = await page.evaluate(
        """href => {
            const el = document.querySelector(`header a[href="${href}"], footer a[href="${href}"]`);
            if (!el) return false;
            el.click();
            return true;
        }""",
        href,
    )
    if not clicked:
        return False, "link element not found"
    try:
        await page.wait_for_url(f"**{href}", timeout=10_000)
    except Exception:
        return False, f"navigation did not reach {href} (at {page.url})"
    await page.wait_for_load_state("networkidle")
    body = (await page.inner_text("body")).strip()
    if len(body) < 40:
        return False, "blank or near-empty page"
    for marker in ("Something went wrong", "404", "Page not found", "Unhandled"):
        if marker.lower() in body[:400].lower():
            return False, f"error marker on page: {marker}"
    if errors:
        return False, f"runtime error: {errors[0][:200]}"
    return True, "ok"


async def main():
    failures = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        await page.goto(BASE + "/", wait_until="networkidle")

        targets = []
        seen = set()
        for scope, selector in SCOPES.items():
            for link in await collect_links(page, selector):
                href = (link["href"] or "").split("#")[0]
                if href in SKIP_HREFS or href.startswith(("http", "mailto:", "tel:")):
                    continue
                if not href.startswith("/") or href in seen:
                    continue
                seen.add(href)
                targets.append((scope, href, link["label"]))

        print(f"Found {len(targets)} unique internal nav/footer links\n")
        for scope, href, label in targets:
            ok, detail = await check_route(page, href)
            print(f"{'PASS' if ok else 'FAIL'}  [{scope}] {href:<24} {label}" + ("" if ok else f"  -> {detail}"))
            if not ok:
                failures.append((href, detail))

        await browser.close()

    print()
    if failures:
        print(f"{len(failures)} failing route(s):")
        for href, detail in failures:
            print(f"  {href}: {detail}")
        sys.exit(1)
    print(f"All {len(seen)} routes loaded successfully.")


asyncio.run(main())
