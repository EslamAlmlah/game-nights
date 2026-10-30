# 🎮 Game Night: Mr.B vs Za3tr

A small, fast website for long-distance game nights. Open it on two devices (phone, tablet or PC) with the same couple code while you're on a WhatsApp or Discord call, and play live together.

- **9 original games**: Vanishing XO, Underdog Duel (cards), Box Claim, Trivia Duel, Letter Rush, Do You Know Me?, Doodle Duo, Would You Rather, Challenge Cards
- **One point system** for everything, weighted by difficulty, plus a way to log outside games (Jawaker, Uno…)
- **Themed nights** with a rule, a vibe and double-points games; the night winner gets +5
- **Scoreboard**: all-time and monthly crown, wins per game, badges, week streak
- **Memory log** of every night, **countdown** to the next one (your time and Damascus time) and a calendar reminder
- **Arabic and English**, with right-to-left layout

## How it works

No accounts and no server of our own. Each device saves the scores locally. The two devices talk through a private channel, named from the couple code, on several free public MQTT relays at once (EMQX, HiveMQ, Mosquitto), so it keeps working as long as both devices can reach any one of them. Mr.B's device runs the live game while both are connected. Both keep a full copy of the history and merge it whenever they reconnect. Use **More → Download backup** now and then, and **More → Connection check** if you can't connect.

## Run locally

Any static file server works, e.g. `python3 -m http.server`. To test two players in one browser, open two tabs with `?local=1&slot=a` and `?local=1&slot=b`. To test against your own MQTT-over-WebSocket broker, add `&relay=ws://localhost:8888`.
