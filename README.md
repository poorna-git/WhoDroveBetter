# 🏎️ WhoDroveBetter

**The ultimate car-logging competition for you and your friends.**

Track every car you've driven, earn points, collect badges, and compete on leaderboards to see who drove better.

---

## ✨ Features

- **Log Cars Fast** — Autocomplete search + optional details (photo, rating, context)
- **Smart Points System** — Base 10 pts + tier bonuses + photo/review/manual/streak/explorer bonuses
- **Dual Leaderboards** — Pure car count OR full points ranking
- **Groups** — Create crews, share invite codes, compete against friends
- **Driver Passport** — Auto-generated profile with stats, badges, favorite car, and country breakdown
- **Activity Feed** — See what your friends are driving in real-time
- **Mobile-First PWA** — Installs to home screen like a native app
- **Retro Rally Theme** — Vintage motorsport aesthetic with warm blacks, racing red, and rally yellow

---

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (username/password)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (free tier)

---

## 📦 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd WhoDroveBetter
npm install
```

### 2. Set up Database

Create a Postgres database (Vercel Postgres, Supabase, or local).

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/whodrovebetter"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
```

### 3. Run Migrations & Seed

```bash
npx prisma db push
npx prisma db seed
```

This creates the schema and seeds ~150 cars across all tiers.

### 4. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎮 How to Use

1. **Sign up** — Create an account (username + password)
2. **Log a car** — Search for a car, optionally add photo/rating/context
3. **Join/Create a group** — Compete against friends using invite codes
4. **Check the leaderboard** — See rankings by points or pure car count
5. **View your passport** — Auto-generated profile with stats & badges

---

## 🏆 Points System

| Action | Points |
|--------|--------|
| **Base (any car)** | +10 |
| **Tier Bonus** | Common: +0, Enthusiast: +5, Premium: +10, Exotic: +20, Unicorn: +50 |
| **Photo uploaded** | +3 |
| **Rating or comment** | +2 |
| **Manual transmission** | +5 |
| **First in group** | +5 (first to log that car in your group) |
| **New brand** | +5 (first time driving that brand) |
| **Streak (3+ days)** | +3 per day |

---

## 📱 PWA / Mobile

The app is a Progressive Web App. On mobile:

1. Open the site in Safari/Chrome
2. Tap "Add to Home Screen"
3. It installs like a native app

---

## 🎨 Theme

**Retro Rally** — Vintage motorsport palette:

- Background: `#1B1B1B` (warm black)
- Cards: `#2A2A2A` (dark warm grey)
- Primary: `#FF4444` (racing red)
- Secondary: `#FFD700` (rally yellow)
- Text: `#F0ECE3` (cream/off-white)

---

## 🛠️ Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add environment variables in Vercel dashboard
4. Deploy — free tier includes:
   - Vercel Postgres (10,000 rows free)
   - Unlimited bandwidth
   - Auto HTTPS

---

## 📝 Database Schema

- **User** — username, passwordHash, displayName
- **Car** — make, model, year, tier, horsepower, country
- **Drive** — links User + Car, stores points, photo, rating, comment
- **Group** — name, inviteCode
- **GroupMember** — links User + Group

---

## 🤝 Contributing

This is a fun side project. Fork it, customize it, make it yours.

---

## 📄 License

MIT — do whatever you want with it.

---

**Built with ❤️ for car enthusiasts who can't stop arguing about who's driven cooler stuff.**
