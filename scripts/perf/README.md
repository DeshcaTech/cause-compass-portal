# Performance & responsive checks

## Lighthouse (mobile)
```bash
bash scripts/perf/lighthouse.sh              # defaults to http://localhost:8080/
bash scripts/perf/lighthouse.sh https://cause-compass-portal.lovable.app/
```
Mobile form factor with simulated slow-4G + CPU throttling. Reports land in
`scripts/perf/reports/home.report.{json,html}`.
Note: run it against the **published** URL for realistic numbers — the dev
server ships unminified, uncompressed JS.

## Responsive screenshot regression test
```bash
python3 scripts/perf/responsive-check.py [base_url]
```
Loads /, /events, /news, /fundraising, /membership at iOS Safari
(375/390/430/768) and Android Chrome (360/412/800) breakpoints, saves
screenshots to `scripts/perf/screenshots/`, and exits non-zero on any
horizontal overflow.
