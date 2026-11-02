# Bengaluru Builder Calendar

Hackathons, company-hosted meetups and tech conferences in Bengaluru, plus online hackathons open to India, recurring tech communities and a short networking playbook.

**Live site:** https://bodhi12496.github.io/blr-builder-calendar/

Made by Bodhisattwa Dhara.

## How it works

The site is a plain static page with no build step.

| File | What it holds |
|---|---|
| `index.html` | The page: layout, styles, filters, calendar strip, communities and playbook |
| `events.json` | All event data. The page loads this file when it opens |
| `scripts/validate.mjs` | Checks `events.json` for mistakes before it is committed |

GitHub Pages serves the `main` branch, so any change pushed to `events.json` appears on the live site within a minute or two. Events whose dates have passed hide themselves automatically.

## Weekly updates

A Claude scheduled task runs every week. It researches new Bengaluru events (Luma, Meetup, Devfolio, Unstop, Devpost, HackIndia, indiahackathons.com, HackathonRadar and company community pages), removes events that have ended, updates `events.json`, runs the validator, and pushes the change to `main`.

## Editing by hand

Add an event by copying an existing entry in `events.json` and changing its fields:

```json
{
  "id": "unique-short-id",
  "kind": "agenda",
  "type": "meetup",
  "title": "Event name",
  "start": "2026-12-05",
  "end": "2026-12-05",
  "time": "10:00",
  "endTime": "13:00",
  "area": "Koramangala",
  "venue": "Venue name and address",
  "host": "Who runs it",
  "company": true,
  "cost": "Free",
  "prize": "₹50,000",
  "deadline": "2026-12-01",
  "tags": ["AI", "Hands-on"],
  "url": "https://link-to-event-page",
  "why": "One sentence on who you will meet and why it is worth going.",
  "note": "Optional caveat, e.g. waitlist only."
}
```

- `kind`: `agenda` (dated in-person event in Bengaluru), `online` (online hackathon), or `campus` (college hackathon with a multi-week window)
- `type`: `hackathon`, `meetup`, `conference` or `workshop`
- Dates are `YYYY-MM-DD`; times are 24-hour IST (`HH:MM`). Only `id`, `kind`, `type`, `title`, `host` and `url` are always required; agenda events also need `start` and `venue`.
- `company: true` marks events run at or by a company's own team.

Then check it:

```sh
node scripts/validate.mjs
```

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000 (opening `index.html` directly as a file blocks it from loading `events.json`).
