# parla

Learn the slang, fillers, and vibes textbooks skip — so you sound like you’ve actually lived there.

In Latin languages, _parla_ means to speak. In Turkic languages, it means to shine.

## What’s in the app

- **Slang drop, vibe check, unpack** — short practice sessions sized to your pace
- **AI chat** with language personas and naturalness feedback
- **Explore** — browse by dialect and category
- **Review & bookmarks** — spaced repetition for due words, save slang you want to keep
- **Auth + onboarding** — sign in, pick languages, goals, pace, and preferences

Live languages: French, Spanish, Italian, Turkish, Azerbaijani (Portuguese, German, Russian coming soon).

## Stack

- [Expo](https://expo.dev) / React Native (TypeScript)
- [React Navigation](https://reactnavigation.org)
- [Supabase](https://supabase.com) (auth, database, edge functions)
- [Zustand](https://zustand-demo.pmnd.rs) (state)

## Setup

```sh
npm install
```

Add a `.env` at the project root:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```sh
npm start
```

Or `npm run ios` / `npm run android` for a simulator/emulator.

## Project structure

```
src/
  components/   # shared UI
  data/         # languages, personas, types
  lib/          # supabase client, quizzes, SRS, streaks
  navigation/   # navigators + route types
  providers/    # auth provider
  screens/      # app screens (home, explore, chat, lessons, auth, onboarding)
  store/        # zustand stores
  theme/        # colors, spacing, typography
supabase/
  functions/    # edge functions (e.g. chat)
  migrations/   # SQL migrations
```

## License

See [LICENSE](./LICENSE).
