# 🎮 Game Night: Ab Ahmad vs Za3tr

A small, fast website for long-distance game nights. Open it on two devices (phone, tablet or PC) with the same couple code while you're on a WhatsApp or Discord call, and play live together.

- **13 original games**: Vanishing XO, Underdog Duel (cards), Box Claim, Trivia Duel, Letter Rush, Do You Know Me?, Doodle Duo, Would You Rather, Challenge Cards, Pool Night, Color Clash (Normal and Chaos), Crossword Race, Secret Word Race
- **Never gets old**: add your own questions, dares, doodle words, trivia and crossword/secret words; games avoid repeats; every night gets a random twist and a lucky ×3 game; set stakes for the winner; monthly seasons with champions
- **Big content packs** (`js/content/`): about 500 items per game in English and Arabic: trivia, would you rather, know-me questions, challenges, doodle words, crossword words with clues, and secret words. One item per line; `load.js` builds trivia and removes duplicates.
- **One point system** for everything, weighted by difficulty, plus a way to log outside games (Jawaker, Uno…)
- **Themed nights** with a rule, a vibe and double-points games; the night winner gets +5
- **Scoreboard**: all-time and monthly crown, wins per game, badges, week streak
- **Memory log** of every night, **countdown** to the next one (your time and Damascus time) and a calendar reminder
- **Arabic and English**, with right-to-left layout

## How it works

No accounts and no server of our own. Each device saves the scores locally. The two devices talk through a private channel, named from the couple code, on several free public MQTT relays at once (EMQX, HiveMQ, Mosquitto), so it keeps working as long as both devices can reach any one of them. Ab Ahmad's device runs the live game while both are connected. Both keep a full copy of the history and merge it whenever they reconnect. Use **More → Download backup** now and then, and **More → Connection check** if you can't connect.

## Run locally

Any static file server works, e.g. `python3 -m http.server`. To test two players in one browser, open two tabs with `?local=1&slot=a` and `?local=1&slot=b`. To test against your own MQTT-over-WebSocket broker, add `&relay=ws://localhost:8888`.
