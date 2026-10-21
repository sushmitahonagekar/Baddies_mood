# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

---

# 🌈 Baddies Mood

A cute, animated productivity app with tasks, a timer, a schedule, habits and notes. It installs on your phone like a real app.

👉 **Live app: https://baddiesmood.netlify.app**

## ✨ Features

- 🔐 Sign up and log in with email and password
- 🎀 First-time setup: your name, your pet's name and a cartoon companion
- 🏡 **Home:** a personal greeting, today's progress, your next task and activity, plus your task list with confetti when you finish a task
- ⏰ **Timer:** countdown timer, stopwatch with laps, schedule, and a week and month calendar
- 📒 **Notes:** notes with search, plus daily habits with streaks and reward badges
- ⚙️ **Settings:** edit your profile, choose a theme (Blue, Yellow, Pink, Red or Night Sky) and turn decorations on or off
- 🫧 Floating bubbles, clouds, cartoon friends and a custom cursor on desktop

## 📱 How to use

1. Open https://baddiesmood.netlify.app
2. Tap **New here? Create an account**, then enter an email and a password. The password needs at least 8 characters, with upper and lower case letters, a number and a symbol.
3. Fill in the welcome popup. You only see it once, and you can change it later in **Settings**.
4. Add your tasks on **Home**, then tick them off.
5. Use the bottom bar (or the sidebar on a computer) to move between **Home, Timer, Notes and Settings**.

### Install it as an app

- **Android (Chrome):** open the link, tap **⋮ → Install app**.
- **iPhone (Safari):** tap **Share → Add to Home Screen**.
- **Computer (Chrome or Edge):** click the install icon in the address bar.

## 💾 Where your data is stored

- **Saved in your account (Supabase):** your tasks and your profile.
- **Saved on your device only:** schedule events, habits, notes, rewards and theme settings. These don't sync between devices.

## 🛠️ Built with

- React and Vite
- Tailwind CSS
- Framer Motion and canvas-confetti
- Supabase (database and login)
- Hosted on Netlify

## 💻 Run it on your computer

You need Node.js installed.

```bash
git clone https://github.com/sushmitahonagekar/Baddies_mood.git
cd Baddies_mood
npm install
```

Create a file named `.env` in the project folder:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

Then start it:

```bash
npm run dev
```

Open the address it prints, usually http://localhost:5173.

## 🗄️ Supabase setup

1. Create a free project at https://supabase.com.
2. Open **SQL Editor** and run this to create the tasks table with Row Level Security, so each user only sees their own tasks:

```sql
create table if not exists public.todos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  is_completed boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists todos_user_created_idx on public.todos (user_id, created_at desc);

alter table public.todos enable row level security;

create policy "Users read own todos"   on public.todos for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own todos" on public.todos for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own todos" on public.todos for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own todos" on public.todos for delete to authenticated using (auth.uid() = user_id);
```

3. In **Authentication → Sign In / Providers**, make sure **Email** is enabled. For a simple signup, turn **Confirm email** off in **User Signups**.
4. Copy your **Project URL** and **publishable key** from **Project Settings → API Keys** into your `.env`.
5. In **Authentication → URL Configuration**, set **Site URL** to your own app link.

## 🔒 Security notes

- Never put the Supabase **secret key** (`sb_secret_...`) in this project.
- The project URL and the publishable key are safe to be public. Row Level Security protects the data.
- `.env` is listed in `.gitignore`, so it is not uploaded to GitHub.

## 🚀 Deploy

```bash
npm run build
```

Upload the generated `dist` folder to Netlify (or connect this repository and set the same two `VITE_` variables in Netlify's settings).

## 📄 Project structure

```
src/
  App.jsx       login, tasks and app wiring
  Shell.jsx     navigation, welcome setup, Home, Habits, Notes, Settings
  DoraKit.jsx   themes, timer, stopwatch, schedule, cursor, clouds
  Extras.jsx    calendar, rewards, cheer bunny, quick-travel door
  Friends.jsx   cartoon characters
public/         app icons, manifest and service worker
```

Made with 💙 by Sushmita
