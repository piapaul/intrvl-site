# intrvl

Daily music games and practice tools for paulemmettmusic.co.uk. Two copies are built from one set of source files:

| What | Where | Used for |
| --- | --- | --- |
| **Squarespace pages** | `blocks/*.html` | Loaded by the small loaders on the Squarespace site (unchanged way of working) |
| **Installable app** | `app/` | `https://piapaul.github.io/intrvl-site/app/` — can be added to a phone's home screen and works offline |

## Changing things (the important bit)

**Never edit `blocks/` or `app/` by hand.** They are generated. Edit the files in `src/` instead, then run:

```
node build.mjs
```

| To change… | Edit… |
| --- | --- |
| Colours, fonts, buttons, anything every page shares | `src/shared/styles.css` |
| Shared behaviour (leaderboard, friends, progress screen, tab bar, accessibility helpers) | `src/shared/core.js` |
| One game or tool | `src/pages/<name>.html` |
| An Easy version of a page (same page, different settings) | `src/variants.json` |
| Drawing staves, notes and key signatures | `src/shared/notation.js` |
| App name, colours, icons for the installed app | `src/app/app.json` |

`node build.mjs --check` tells you whether the generated files are out of date.

## Brand

- Headings: **Fraunces Black** (900). Body and buttons: **Raleway Medium/Bold** (a heavier weight than the thin brand-kit weight, because thin is hard to read on screens).
- Accent: Muted Sage `#A9B9A2`. Text that sits on the sage uses Charcoal; sage-coloured *text* uses the darker `#566B50` so it passes accessibility contrast checks.
- Fallback fonts are set in `--intrvl-font-head` / `--intrvl-font-body` at the top of `styles.css` (Georgia and the phone's own sans-serif).

## The installable app

- Install: open `https://piapaul.github.io/intrvl-site/app/` on the phone → Share → **Add to Home Screen** (iPhone) / **Install app** (Android Chrome).
- Everything except the leaderboard and the stave pictures is saved on the phone at install time. Stave pictures (Clef Sprint, Note Sprint, Enharmonic Matchmaker) are saved the first time each game is opened while online.
- Updates arrive by themselves the next time the app is opened with a signal.
- **The website and the app keep their progress separately** (they are different web addresses). Use **Progress → Back up or move your progress** to copy everything from one to the other.

## Games and tools

| Page | Squarespace address to create | Notes |
| --- | --- | --- |
| Note Sprint / Note Sprint (Easy) | `/intrvl-notes`, `/intrvl-notes-easy` | Easy: treble and bass clef, natural notes only |
| Clef Sprint / Clef Sprint (Easy) | `/intrvl-clefs`, `/intrvl-clefs-easy` | Easy: just treble and bass, with sharps and flats (drawn in the page) |
| Key Signature Sprint / (Easy) | `/intrvl-keysigs`, `/intrvl-keysigs-easy` | Easy: major keys, up to 4 sharps or flats, treble clef |
| Rhythm Tap / Rhythm Tap (Easy) | `/intrvl-rhythm`, `/intrvl-rhythm-easy` | See below |
| Practice Log | `/intrvl-practice` | Timer with a switch for what you're practising, overview, "send to teacher" text for My Music Staff |

The **home page order** is set by the lists at the top of `src/shared/core.js` (`IV.GAMES`, `IV.TOOLS`). Games with an Easy version (`variantOf`) show as one tile with **Normal | Easy** buttons on the home and Games pages; the order is Note Sprint, Clef Sprint, Key Signature Sprint, Rhythm Tap, then the rest. Practice Log is first in Tools.

**Each new page needs its own Squarespace page and loader**, like the existing ones (the installable app needs nothing).

### Rhythm Tap
Two bars of 4/4 shown as notation. A four-beat count-in plays, then you tap in time.
- **Easy:** up to quavers and simple rests; the metronome keeps going throughout.
- **Normal:** up to semiquavers, triplets, dotted rhythms, syncopation and tricky rests; the metronome stops after the count-in so you keep time yourself.
- Each tap is matched to the nearest written note. Full marks within 45 ms (Easy) / 30 ms (Normal), fading to zero at 200 / 150 ms; missed notes score nothing and extra taps cost half a note. The score is accuracy out of 100.
- The review picture shows the notation with a dot under every note: above the line = late, below = early, colour = how far out. *Save my review picture* makes a PNG (or opens the share sheet on a phone).
- **Timing adjustment** (start screen) compensates for Bluetooth headphones or phones that play sound late.
- Browsers can't measure a phone's real audio delay exactly, so results on a real device can differ a little from a computer. If someone is always 40 ms late, that slider is the fix.

## Friends League
A league is a named group with an owner. Everyone's finished daily games earn points for the week (Monday to Sunday): **1 point per game finished, +2 for the best score of the day in that game, +1 for second best** (ties share). 
- The **home page card** and the **Friends → League** tab let you start a league, join one, and see the table. 
- The owner's **Manage this league** panel: invite link (copy / share / make a new one), rename, remove members, delete. Members can leave. 
- Invite links look like `…/intrvl?league=CODE` (or `…/app/?league=CODE`). 
- Admin actions are checked against the device that registered the player code, so knowing someone's friend code isn't enough to remove people from their league. 
- Everyone in a league can see each other's name, avatar and daily scores, nothing else. If you run leagues for children, tell parents that, and encourage first names or nicknames.

## Progress tracking

Every answer in the seven games is remembered against a short label (an interval, a chord, a clef, a note…). The **Progress** tab shows the daily streak, a five-week activity calendar, the topics that need most work, and a per-game summary. Data lives in the browser (`localStorage`); nothing extra is sent to the leaderboard.

Rhythm Tap records how you do on triplets, dotted rhythms, semiquavers and entries after a rest, so those appear in the weak spots too.

**Practise my weak spots:** once a topic has 3+ answers and you're getting under about 85% of your recent answers right, each game shows a *Practise my weak spots* button (start screen and finished screen). It runs a practice round (not the daily puzzle) that leans towards those topics, about 70% of the time in the sprint games. The Progress screen's *Practise* links start it directly (`?weak=1`). The daily puzzle is never changed, so it stays the same for everyone.

## Accessibility

Dialogs trap and restore focus and close with Esc; buttons and the circle of fifths work from the keyboard; right/wrong answers are announced to screen readers and shown with a tick/cross as well as colour; animations stop for people who ask for reduced motion; the picture games describe each picture in words. Checked with axe-core (WCAG 2.2 AA) on every page.

## The leaderboard (Google Apps Script)

`backend/Code.gs.txt` is a copy of the script behind the friends leaderboard and the leagues (**version 5** — creates two new tabs, `leagues` and `league_members`, by itself the first time it runs). After changing it: paste it over the old code in the Sheet's Apps Script project, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.

### The leaderboard secret

The `secret` in `src/shared/core.js` is visible to anyone who views the page source, so it can only keep casual bots out — it is **not** real security. What really protects the leaderboard is on the server: score limits per game, one score per device per game per day, a date check, rate limits (20 writes a minute per device, 150 a minute overall), friend/player caps and input cleaning. The worst a determined person can do is post a fake score for their own device.

To change the secret without breaking the live site: (1) in Apps Script → Project Settings → Script properties add `SHARED_SECRET_NEXT` = the new value and redeploy; (2) change `secret` in `src/shared/core.js`, run `node build.mjs` and publish; (3) later, set `SHARED_SECRET` to the new value and delete `SHARED_SECRET_NEXT`.

## Word Game Help

Not part of intrvl. It lives in `word-games/`. The old address (`/word-games.html`) simply forwards there so existing home-screen icons keep working.
