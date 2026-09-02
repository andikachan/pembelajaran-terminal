# Terminal Quest — Linux Terminal Academy

An interactive game-based learning platform for Linux/Unix terminal commands. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Web Audio API procedural sound synthesis, and Upstash Redis.

![Terminal Quest](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.jpg)

## 🎮 Features

- **Indie Game Aesthetic**: Dark workstation aesthetic (`#08090A`), custom CRT scanline overlay, cyber brackets, and retro color accents (terminal green, amber, cyan, and boss red). No generic SaaS or AI templates.
- **20 Progressive Missions**: Across 4 sectors (Terminal Basics, File Operations, Search & Inspection, Shell Mastery & Boss Challenge).
- **Interactive Simulated Terminal**:
  - Full Virtual Filesystem (VFS) in memory (`pwd`, `ls -a -l`, `cd`, `mkdir -p`, `touch`, `cat`, `echo > >>`, `cp -r`, `mv`, `rm -rf`, `grep -i`, `find`, `head`, `tail`, `wc -l`, `sort`, `chmod`, `chown`, `ps`, `kill`, `ping`, `curl`, `clear`, `help`, `history`, `reset`).
  - Command history navigation (Arrow Up / Down).
  - Tab path & command auto-completion.
  - `Ctrl+L` screen clearing.
  - Custom blinking retro cursor.
- **Boss Mission — The Rogue Daemon**:
  - Multi-step challenge combining `find`, `cat`, and `kill 142` with an authentic ASCII victory banner:
  ```
  ╔═══════════════════════════════════════╗
  ║             BOSS DEFEATED             ║
  ║                                       ║
  ║                +500 XP                ║
  ╚═══════════════════════════════════════╝
  ```
- **Campaign World Map**: Interactive node-based sector map with real-time level gating and unlock prerequisites.
- **XP & Level Progression**: Mathematical level formulas with live HUD progress gauge.
- **Daily Streak Tracking**: Multi-day streak tracking with bonus multipliers.
- **12 Collectible Badges**: Achievements for first command, filesystem navigation, pattern filtering, night operations, boss defeats, and academy graduation.
- **Global Leaderboard**: Powered by Upstash Redis Sorted Set (`leaderboard:xp`) with graceful in-memory fallback for local development.
- **Tactical Hint System**: Progressive hint disclosures with proportional XP penalty deductions (-30 XP / -60 XP).
- **Procedural 8-Bit Web Audio Synthesizer**: Low-latency typing clicks, command execution buzzes, victory arpeggios, and boss fanfares using Web Audio API (default OFF with sound toggle).
- **Operator Dossier**: Player profile screen with telemetry stats, JSON save export, and clearance handles.
- **Free Sandbox Mode**: Unrestricted terminal sandbox with live visual filesystem inspector.
- **Zero Native Shell Execution**: 100% simulated client/server sandbox — never runs unsafe child processes.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database / Cache**: Upstash Redis (`@upstash/redis`)
- **Animation & FX**: Framer Motion, Canvas Confetti
- **Icons**: Lucide React
- **Validation**: Zod
- **Audio**: Web Audio API (Procedural Synthesizer)

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18.17+ or Node.js 20+
- npm, pnpm, or yarn

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/terminal-quest.git
cd terminal-quest
npm install
```

> **Note for Android / Termux / FAT32 filesystems without symlink support**:
> Run with `--no-bin-links`:
> ```bash
> npm install --no-bin-links
> ```

### 3. Environment Variables Setup

Copy the sample environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Upstash Redis credentials (get a free database at [Upstash](https://upstash.com)):

```env
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

> **Development Mode Note**: If Upstash credentials are not provided, Terminal Quest automatically falls back to an internal in-memory database and browser storage, allowing full offline gameplay out of the box!

### 4. Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺 Application Routes

- `/` — Fast retro bootloader sequence & interactive game intro.
- `/play` — Direct launcher that routes the operator to the next active mission.
- `/missions` — Sector Campaign World Map with mission nodes and level gating.
- `/missions/[id]` — Main Mission Game HUD with scenario, objectives, interactive terminal, hints, and VFS observer.
- `/sandbox` — Free-play Linux terminal sandbox with live filesystem tree.
- `/leaderboard` — Global operator rankings backed by Upstash Redis Sorted Sets.
- `/profile` — Player dossier, level stats, unlocked trophies, and save data backup.

---

## ☁ Deploying to Vercel

1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: initial terminal quest release"
   git push origin main
   ```

2. Go to [Vercel](https://vercel.com) and click **"New Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Click **Deploy**.

The project is fully pre-configured for Vercel deployment with zero additional build configuration needed.

---

## 🔒 Security Guarantee

This application runs **exclusively inside an in-memory virtual filesystem simulator**. It never executes shell commands on the hosting server (`child_process`, `exec`, `execSync`, and `spawn` are strictly prohibited). All progress submissions and XP awards are validated server-side using Zod schemas to prevent tampering.

---

## 📜 License

MIT License. Designed with precision for terminal explorers.
