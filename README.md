# 🦸 HuisHelden — Gamified Klusjes Tracker voor Gezinnen

**HuisHelden** maakt huishoudelijke taken leuk voor kinderen! Kinderen verdienen XP, levelen op, verdienen badges, strijden op het leaderboard en claimen beloningen.

🌐 [huis-helden.nl](https://huis-helden.nl)

## ✨ Features

- 🎮 **Gamificatie** — XP, levels, streaks, badges en een leaderboard
- 👨‍👩‍👧‍👦 **Gezinnen** — Ouders beheren taken, kinderen voeren ze uit
- 🏆 **Beloningen** — Verdien munten en wissel ze in voor beloningen
- 🔄 **Terugkerende taken** — Dagelijks, wekelijks, doordeweeks of weekend
- 🕵️ **Taken stelen** — Steel verlopen taken van andere kinderen voor extra XP
- 📊 **Weekoverzicht** — Ouders zien statistieken per kind

## 🛠 Tech Stack

| Component | Technologie |
|-----------|-------------|
| Frontend | Angular 17+ (standalone components) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Containers | Docker (multi-stage builds) |
| Orchestratie | Kubernetes |
| Styling | Tailwind CSS (dark space theme) |

## 📁 Project Structuur

```
huis-helden/
├── frontend/          # Angular app
├── backend/           # Express + TypeScript API
├── prisma/            # Prisma schema
├── docker/            # Dockerfiles
├── k8s/               # Kubernetes manifests
├── README.md
├── package.json       # Root workspace
└── .gitignore
```

## 🚀 Aan de Slag

### Vereisten
- Node.js 20+
- PostgreSQL 15+
- Angular CLI (`npm i -g @angular/cli`)

### Installatie

```bash
# Clone de repo
git clone https://github.com/bmartensNL/huis-helden.git
cd huis-helden

# Installeer dependencies
npm install

# Setup database
cp .env.example .env
# Pas DATABASE_URL aan in .env
npx prisma migrate dev

# Start backend
cd backend && npm run dev

# Start frontend (in nieuw terminal)
cd frontend && ng serve
```

### Docker

```bash
# Build images
docker build -f docker/Dockerfile.frontend -t huis-helden-frontend .
docker build -f docker/Dockerfile.backend -t huis-helden-backend .

# Of met docker-compose
docker-compose up
```

## 🎮 Game Mechanics

### Levels
| Level | Titel | XP Nodig |
|-------|-------|----------|
| 1 | Beginner | 0 |
| 2 | Helper | 100 |
| 3 | Taakster | 140 |
| 4 | Held | 196 |
| 5 | Superster | 274 |
| 6 | Kampioen | 384 |
| 7 | Legende | 538 |

XP vereiste schaalt 1.4x per level.

### Badges
- 🌟 Eerste Taak — Voltooi je eerste taak
- 🔥 Streak Master — 7 dagen streak
- 💪 Hard Werker — 10 moeilijke taken voltooid
- 🏃 Speedster — 5 taken in één dag
- 🕵️ Taak Dief — Steel 3 taken
- 👑 Legende — Bereik level 7

## 📸 Screenshots

> *Coming soon*

## 📄 Licentie

MIT © [Benjamin Martens](https://github.com/bmartensNL)
