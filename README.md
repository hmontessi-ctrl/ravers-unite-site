# SameSet

SameSet is a 100% free 18+ electronic music connections platform for finding dates, mutual hookups, friends, solo-raver buddies, local events, clubs, crews, DJ profiles, music links, upcoming sets, merch, producer tools, and safer scene resources.

Tagline:

**Electronic music connections, DJs, and events.**

## What Is Included

- Mobile-first static prototype
- Public beta waitlist form
- Venue/promoter local event submission form
- Supabase-ready database schema
- Google and Apple OAuth scaffolding
- Scene Guide for top clubs and local events
- DICE-style ticket links with UTM tracking
- Going Solo buddy section
- Dating + hookup intent section
- 18+ onboarding and profile builder flow
- Connections match feed language
- Frequency Match system that explains why people matched by intent, sound, DJs, events, location, and trust
- Profile builder with 18+ gate, 3-6 photos, prompts, music links, socials, intent, identity, boundaries, favorite DJs, and next event
- DJ showcase pages for music, socials, booking info, and upcoming sets
- DJ claim form for artists to submit music links, socials, booking info, and upcoming gigs for review
- Founder dashboard preview for waitlist, event submissions, partner requests, DJ claims, and ticket-click proof
- Private admin dashboard at `admin.html` for approved founders to review queues and approve/reject submissions
- Admin-approved DJ claims and event submissions publish safe public records into `djs` and `events`
- Ticket attribution concept
- Marketplace and sticker merch section
- Stemulator partner section for upcoming producers
- Frequency Match with favorite DJ filters
- Identity and relationship filters
- Rave Safety Guide
- Dope Vibes trust badges
- Business plan and launch checklist

## GitHub Pages Setup

This project is ready for GitHub Pages as a static site.

1. Create a GitHub repository named `sameset` for a fresh launch, or keep the current `ravers-unite-site` deploy repo until you are ready to rename the GitHub URL.
2. Upload these files to the repository root.
3. Go to `Settings` -> `Pages`.
4. Set source to `Deploy from a branch`.
5. Select branch `main` and folder `/root`.
6. Save.

The site will publish at a URL like:

`https://YOUR_USERNAME.github.io/sameset/`

## Public Website

Live public site:

`https://hmontessi-ctrl.github.io/ravers-unite-site/`

Public deployment repo:

`https://github.com/hmontessi-ctrl/ravers-unite-site`

The public deployment repo contains only the website files. This main product repo can stay private. The current repo URLs still use the original project slug so existing links do not break.

## Files

- `index.html` - app prototype
- `styles.css` - app styles
- `script.js` - prototype interactions
- `admin.html` - private Supabase Auth admin dashboard
- `admin.js` - admin login with Google or email magic link, queue loading, and approve/reject actions
- `supabase/schema.sql` - Supabase database tables, triggers, and RLS policies
- `supabase-config.js` - public browser config for Supabase URL and anon key
- `assets/pulsecrew/hero-rave-community.png` - hero image
- `assets/sameset-logo-smile.png` - approved smiling disco ball brand logo
- `assets/sameset-disco-logo.svg` - earlier vector logo concept
- `ravers-unite-business-plan.md` - business plan and launch checklist
- `ravers-unite-launch-business-plan.html` - printable launch and business plan
- `ravers-unite-launch-business-plan.pdf` - PDF launch and business plan

## Notes

This is currently a static prototype. The next production steps are:

- Create a Supabase project
- Run `supabase/schema.sql` in Supabase SQL Editor
- Add the project URL and public anon key to `supabase-config.js`
- Enable Google and Apple providers in Supabase Auth
- Test waitlist, event submissions, ticket clicks, profile save, admin review queues, and approved public content
- Add your founder email to `admin_users`
- Live event feed
- Real ticket purchase attribution
- Merch store integration
- Moderation tools

See `PRODUCTION_ROADMAP.md` for the full build plan from static website to working app.

## Supabase Setup

1. Create a new Supabase project.
2. Open `SQL Editor` and run `supabase/schema.sql`.
3. Go to `Project Settings` -> `API`.
4. Copy the project URL and public anon key into `supabase-config.js`.
5. Go to `Authentication` -> `Providers` and enable Google and Apple OAuth.
6. Add the production website URL to the allowed redirect URLs.
7. Add the founder email you use with Google login to the admin allowlist:

```sql
insert into public.admin_users (email, role)
values ('your-google-email@example.com', 'founder')
on conflict (email) do update
set active = true,
    role = excluded.role;
```

Admin dashboard URL:

`https://hmontessi-ctrl.github.io/ravers-unite-site/admin.html`

Until `supabase-config.js` has real values, the app stays in prototype mode and saves waitlist,
event submission, and profile data in the browser's local storage.

## Live Supabase Project

- Project name: `ravers-unite` currently, with SameSet as the public brand
- Project ref: `igrulcxkkypicoeagbxx`
- Project URL: `https://igrulcxkkypicoeagbxx.supabase.co`
- OAuth provider callback URL: `https://igrulcxkkypicoeagbxx.supabase.co/auth/v1/callback`

Google login still needs a Google Cloud OAuth Client ID and Client Secret.
Apple login still needs an Apple Developer account, Service ID, Team ID, Key ID, and private key.
Add those provider credentials in Supabase Dashboard -> Authentication -> Providers.

Admin login can use the email magic-link fallback while Google OAuth is being configured.
