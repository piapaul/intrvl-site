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

## Links back to the main site
Every page ends with a **Back to paulemmettmusic.co.uk** link, and every game page (and the Games page) has a **Want more practice?** card linking to Music lessons and Free resources. Both are built in `buildFooter()` in `src/shared/core.js`; the wording and the two links are there, the look is `.iv-promo` / `.iv-foot` in `styles.css`.

## Games and tools

| Page | Squarespace address to create | Notes |
| --- | --- | --- |
| Note Sprint / Note Sprint (Easy) | `/intrvl-notes`, `/intrvl-notes-easy` | Easy: treble and bass clef, natural notes only |
| Clef Sprint / Clef Sprint (Easy) | `/intrvl-clefs`, `/intrvl-clefs-easy` | Easy: just treble and bass, with sharps and flats (drawn in the page) |
| Key Signature Sprint / (Easy) | `/intrvl-keysigs`, `/intrvl-keysigs-easy` | Normal asks "What MAJOR key is this?" or "What MINOR key is this?" and every answer is in that mode. Easy: major keys, up to 4 sharps or flats, treble clef |
| Rhythm Tap / Rhythm Tap (Easy) | `/intrvl-rhythm`, `/intrvl-rhythm-easy` | 4/4, 3/4 and 6/8. See below |
| Interval Reader / Interval Reader (Easy) | `/intrvl-interval-reader`, `/intrvl-interval-reader-easy` | Two notes on the stave. Easy: just the number (2nd … octave), natural notes. Normal: with the quality (Minor 3rd, Perfect 5th …), sharps and flats, and intervals beyond the octave (up to a 12th) |
| Chord Quality | `/intrvl-chord-quality` | A chord on the stave: Major, Minor, Diminished, Augmented, or (for 4-note chords) Major 7th, Dominant 7th, Minor 7th, Half-diminished 7th. Root position, treble or bass clef |
| Practice Log | `/intrvl-practice` | Timer with a switch for what you're practising, overview, "send to teacher" text for My Music Staff |

The **home page order** is set by the lists at the top of `src/shared/core.js` (`IV.GAMES`, `IV.TOOLS`). Games with an Easy version (`variantOf`) show as one tile with **Normal | Easy** buttons on the home and Games pages; the order is Note Sprint, Clef Sprint, Key Signature Sprint, Rhythm Tap, Interval Reader, Chord Quality, then the rest. Practice Log is first in Tools. Games you've finished today drop to the bottom of both lists, so what's left is at the top.

**Each new page needs its own Squarespace page and loader**, like the existing ones (the installable app needs nothing).

### Rhythm Tap
Two bars of **4/4, 3/4 or 6/8** shown as notation. The daily rhythm's time signature is chosen from the date (the start screen says which; Easy and Normal share it). Practice has a **Mixed / 4/4 / 3/4 / 6/8** choice.
- **Look first.** *Start* only shows the rhythm. Nothing plays until you press **Go**, so you can read it through. **Test sound is optional**: *Go* is always available, and *Test sound* plays a few clicks at the rhythm's tempo if you want to check your volume first.
- A one-bar count-in plays (6/8 counts all six quavers), then you tap in time.
- **Easy:** up to quavers and simple rests; the metronome keeps going throughout.
- **Normal:** up to semiquavers, triplets (4/4 and 3/4), dotted rhythms, syncopation and tricky rests; the metronome stops after the count-in so you keep time yourself.
- Each tap is matched to the nearest written note. Full marks within 45 ms (Easy) / 30 ms (Normal), fading to zero at 200 / 150 ms; missed notes score nothing and extra taps cost half a note. The score is accuracy out of 100.
- The review picture shows the notation with a dot under every note: above the line = late, below = early, colour = how far out. *Save my review picture* makes a PNG (or opens the share sheet on a phone).
- **Calibration and timing** (start screen and **You** tab): *Calibrate* plays 12 clicks and you tap along; the median of your taps against the clicks (ignoring the first two and any wild ones) becomes the adjustment, which you can accept or retry. The slider (±150 ms) fine-tunes it and *Reset to 0* clears it. The adjustment belongs to the device, so it is **not** carried by online sync.
- Because it measures *you* tapping along, a calibration also absorbs the usual human habit of tapping a touch early. If someone is consistently early or late by the same amount on a device, that is exactly what it is for. Browsers can't measure a phone's real audio delay exactly, so results on a real device can differ a little from a computer.
- 3/4 and 6/8 are tracked as their own topics ("Three-time (3/4)", "Compound time (6/8)") for weak-spot practice.

## Friends League
A league is a named group with an owner. Everyone's finished daily games earn points for the week (Monday to Sunday): **1 point per game finished, +2 for the best score of the day in that game, +1 for second best** (ties share). 
- The **home page card** and the **Friends → League** tab let you start a league, join one, and see the table. 
- The owner's **League manager** panel: member progress (below), invite link (copy / share / make a new one), rename, remove members, delete. Members can leave. 
- Invite links look like `…/intrvl?league=CODE` (or `…/app/?league=CODE`). 
- Admin actions are checked against the device that registered the player code, so knowing someone's friend code isn't enough to remove people from their league. 
- Everyone in a league can see each other's name, avatar and daily scores, nothing else.

### League manager: member progress
The owner can see a short **progress summary** for each member who chooses to share one. This is how a teacher sees who is practising.
- **What's shared:** a first name and initial (like "Ben O", letters only, 22 characters max), days played this week, games finished this week, streak, overall accuracy, minutes of Practice Log time this week, last active date, and the three weakest topics. **Nothing else**: no practice notes, no full history, no leaderboard code.
- **Joining asks you to choose.** The join screen explains this and needs either a name or the **Opt out** tick box (unticked by default; ticking it greys out the name). Opting out means nothing is sent and the manager just sees "opted out". A member can change their mind any time in the league's **Your sharing with the league manager** section; opting out deletes any summary already stored if they aren't sharing with another league.
- The owner's own row defaults to *not sharing*.
- The summary is sent after each daily score and at most every 20 minutes when intrvl is opened. Only the league owner can read it (checked against their device), and only for members with sharing on and a name set.
- **Copy as text** gives the manager a paste-able summary for their own notes.
- **If you run leagues for children:** the data is a first name plus a surname initial and practice statistics, stored in your own Google Sheet. Tell parents what's collected, and use *Delete my online data* (You tab) if someone asks to be forgotten.

## Progress tracking

Every answer in the seven games is remembered against a short label (an interval, a chord, a clef, a note…). The **Progress** tab shows the daily streak, a five-week activity calendar, the topics that need most work, and a per-game summary. Data lives in the browser (`localStorage`); nothing extra is sent to the leaderboard.

Rhythm Tap records how you do on triplets, dotted rhythms, semiquavers and entries after a rest, so those appear in the weak spots too.

**Practise my weak spots:** once a topic has 3+ answers and you're getting under about 85% of your recent answers right, each game shows a *Practise my weak spots* button (start screen and finished screen). It runs a practice round (not the daily puzzle) that leans towards those topics, about 70% of the time in the sprint games. The Progress screen's *Practise* links start it directly (`?weak=1`). The daily puzzle is never changed, so it stays the same for everyone.

## Saving your progress online (sync)

Optional, in the **You** tab (*Save your progress online*). Off unless someone switches it on.
- Switching on makes a **recovery code** (`XXXXX-XXXXX`) and stores a copy of the player's progress (scores, streaks, history, practice log, friends list) on the leaderboard server. The server only keeps a **hash** of the recovery code, so it can't be read back from the Sheet.
- On a new phone or browser: **I already have a recovery code**, then enter the friend code and the recovery code. The new device joins the saved player (it takes over the same identity) and merges anything already on it, never dropping either side: histories are combined (higher score wins for a day), per-topic results keep the fuller record, stats keep the best streak and the later activity.
- After that it syncs by itself shortly after changes and when intrvl is opened (not more than every 10 minutes); *Save now* does it immediately. Things that belong to one device (the rhythm timing adjustment, running practice timer, caches) are never synced.
- Wrong recovery codes are rate limited (5 tries an hour per player code).
- **Delete my online data** removes the player, their scores, friends, league memberships, summaries and saved progress from the Sheet (leagues they own must be deleted first). Progress on the device stays.
- Needs a secure (https) page, which Squarespace and GitHub Pages both are.
- Known limit: a practice session deleted on one device can reappear from another until it is deleted there too.

## Accessibility

Dialogs trap and restore focus and close with Esc; buttons and the circle of fifths work from the keyboard; right/wrong answers are announced to screen readers and shown with a tick/cross as well as colour; animations stop for people who ask for reduced motion; the picture games describe each picture in words. Checked with axe-core (WCAG 2.2 AA) on every page.

## The leaderboard (Google Apps Script)

`backend/Code.gs.txt` is a copy of the script behind the friends leaderboard and the leagues (**version 6** — creates the tabs `leagues`, `league_members`, `stats` and `sync` by itself the first time it runs, and adds the `share` and `managerName` columns to `league_members`). After changing it: paste it over the old code in the Sheet's Apps Script project, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.

### The leaderboard secret

The `secret` in `src/shared/core.js` is visible to anyone who views the page source, so it can only keep casual bots out — it is **not** real security. What really protects the leaderboard is on the server: score limits per game, one score per device per game per day, a date check, rate limits (20 writes a minute per device, 150 a minute overall), friend/player caps and input cleaning. The worst a determined person can do is post a fake score for their own device.

To change the secret without breaking the live site: (1) in Apps Script → Project Settings → Script properties add `SHARED_SECRET_NEXT` = the new value and redeploy; (2) change `secret` in `src/shared/core.js`, run `node build.mjs` and publish; (3) later, set `SHARED_SECRET` to the new value and delete `SHARED_SECRET_NEXT`.

## Word Game Help

Not part of intrvl. It lives in `word-games/`. The old address (`/word-games.html`) simply forwards there so existing home-screen icons keep working.
