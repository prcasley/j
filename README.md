# Shadow Monarch OS ⚡

Solo Leveling-themed Life Operating System — fitness, nutrition, habits, trading, and personal growth tracker.

## Features

- **Animated Hunter Avatar** with purple lightning aura and particle effects
- **8 Tabs**: Home, Check-In, Quests, Missions, Train, Fuel, Body, EOD Reflection
- **XP & Rank System** — Level from E-Rank to Shadow Monarch
- **Shadow Army** — Earn shadow soldiers through discipline
- **Fasting Timer** — Track intermittent fasting with live timer
- **Eating Tracker** — Quick-select meals (SEC, Corporate Cafe, Mexican, etc.)
- **Shower & Sleep Timers** — Track hygiene and rest
- **Daily Quests** — Auto-generated strength/endurance/discipline quests
- **Mission Gallery** — Work, Money, Discipline, Fitness, Social missions
- **Workout Logger** — V-Taper Protocol (Mon/Tue/Wed/Thu split)
- **Macro Tracker** — Calories, Protein, Fat, Carbs with ring visualizations
- **Weekly Fitness Goals** — 50 pull-ups, 100 push-ups, 6 miles
- **EOD Reflection** — Mood, sugar, vaping, trading, improvement goals
- **Motivational Quotes** — SJW, Drake, Luffy, Minato, Itachi, Tyson, Goku
- **10-Year Vision** tracker

## Setup

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repo
4. Deploy — done

Or use GitHub Pages with `npm run build` and serve the `dist/` folder.

## Add to Phone Home Screen

After deploying, open the URL in Safari/Chrome → Share → Add to Home Screen. It runs as a standalone app (PWA).

## Discord Workout Bot (Webhook Server)

Send a photo of your workout to Discord and the bot will:
1. **Read the image** using Claude Vision API (OCR)
2. **Extract** exercises, sets, reps, and weights
3. **Update an Excel spreadsheet** (`data/workout_log.xlsx`) with Solo Leveling styling
4. **Update the dashboard** data store (`data/dashboard.json`)
5. **Reply** with a congrats message, workout breakdown, and stats for day/week/month/year

### Bot Setup

```bash
cd server
cp .env.example .env
# Fill in your Discord bot token, channel ID, and Anthropic API key
npm install
npm run dev
```

### Discord Bot Setup

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Create a new application → Bot tab → Copy token → paste in `.env`
3. Enable **Message Content Intent** under Bot → Privileged Intents
4. Go to OAuth2 → URL Generator → select `bot` scope → select permissions: `Send Messages`, `Attach Files`, `Read Message History`
5. Open the generated URL to invite the bot to your server
6. Right-click the channel you want to use → Copy ID → paste in `.env`

### Bot Commands

- **Send a workout photo** → Bot extracts data, updates Excel + dashboard, replies with summary
- `!stats` → View your day/week/month/year stats and remaining workouts
- `!help` → Show available commands

## Tech

- React 18 + Vite
- localStorage for data persistence
- Pure CSS animations (no dependencies)
- Embedded base64 avatar image
- **Discord.js** bot for workout photo intake
- **Claude Vision API** for OCR/image extraction
- **ExcelJS** for styled workout spreadsheets
- **Express** health check server
