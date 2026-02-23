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

## Tech

- React 18 + Vite
- localStorage for data persistence
- Pure CSS animations (no dependencies)
- Embedded base64 avatar image
