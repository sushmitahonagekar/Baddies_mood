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
