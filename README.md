# PandaPal

Mobile app with tab-based navigation for iOS (and Android). Built with Expo and Expo Router. Gamified pediatric epilepsy care companion.

## Auth & Role Select

- **Role Select Gate**: After login (or app open when logged in), user chooses "I'm a Kid" or "I'm an Adult (Caregiver)".
- **Kid**: No PIN. Goes straight to child home (tabs). Caregiver tab is hidden.
- **Caregiver**: PIN required (set on first use). Dashboard, Trends, Logs, Care Plan, Settings. "Switch Role" returns to Role Select.
- See [features/auth/README.md](features/auth/README.md) for flow, storage, and how to reset PIN in dev.

## Tabs

- **Quests** – default tab
- **Avatar**
- **Learn** – Interactive lessons for children (ages 7–12). See [features/lessons/README.md](features/lessons/README.md)
- **Caregiver** – Lessons progress, mastery by topic, recommended next
- **More**

## Lessons Feature

Interactive, gamified lessons for children. Education + adherence support only (no diagnosis or treatment advice).

- **Navigate to Lessons:** Learn tab → Lessons Home. Tap any lesson card to open the player.
- **Demo flow:** Tap "What is Epilepsy?" → Story → Tap-to-reveal cards → Breathing break → Complete → Rewards modal.

## Run on iOS

```bash
npm install
npm run ios
```

This starts the dev server and opens the app in the iOS simulator. Use **Expo Go** on a device, or run a development build with `npx expo run:ios` after `npx expo prebuild` if you need a custom native build.

## Requirements

- Node.js 20+
- Xcode and iOS Simulator (Mac)
