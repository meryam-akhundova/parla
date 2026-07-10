# Parla — Project Brief for Cursor

## What is Parla?
Parla is a mobile app (React Native + Expo) for learning slang and casual 
language — the words and phrases you'd never learn in a classroom. Think 
Duolingo but for sounding natural, not just grammatically correct. The name 
"parla" means both "to speak" and "to shine" — that duality runs through 
the whole brand.

Target users: people who are already formally fluent (or learning) and want 
to sound like they've actually lived in the country. Also total beginners 
who want to skip the stiff textbook version from day one.

V1 launches with Turkish only.

---

## Tech Stack
- Framework: React Native + Expo (TypeScript)
- Navigation: React Navigation
- Backend & DB: Supabase
- AI Chat: Anthropic API
- State Management: Zustand
- Version Control: GitHub

---

## Design Philosophy
- Light mode, clean and warm — not a kids app, not a corporate app
- The sparkle/shine (✦) motif is the brand signature — appears on badges, 
  lesson tags, hints, and score displays
- Feels like a premium lifestyle app, not a gamified learning tool
- Duolingo's gamification is a reference but Parla is more restrained and 
  aesthetic about it

---

## Design Tokens

### Colors
```ts
export const colors = {
  // Primary (purple)
  primary: '#534AB7',
  primaryLight: '#EEEDFE',
  primaryMid: '#CECBF6',
  primaryText: '#3C3489',
  primaryDark: '#26215C',

  // Coral
  coralBg: '#FAECE7',
  coralText: '#993C1D',
  coralMid: '#F5C4B3',
  coralStrong: '#D85A30',

  // Teal
  tealBg: '#E1F5EE',
  tealText: '#0F6E56',
  tealStrong: '#1D9E75',
  tealDark: '#085041',

  // Amber
  amberBg: '#FAEEDA',
  amberText: '#854F0B',
  amberStrong: '#633806',
  amberDark: '#412402',

  // Neutrals
  white: '#ffffff',
  surface: '#FAFAFA',
  background: '#F1EFE8',
  border: '#D3D1C7',
  borderLight: '#EDE9F5',

  // Text
  textPrimary: '#2C2C2A',
  textSecondary: '#888780',
  textMuted: '#B4B2A9',
  textPurple: '#26215C',
}
```

### Spacing
```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
}
```

### Border Radius
```ts
export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  full: 999,
}
```

### Typography
```ts
export const fontSize = {
  micro: 10,
  label: 11,
  small: 12,
  body: 13,
  bodyLg: 14,
  heading: 15,
  headingLg: 17,
  title: 20,
  display: 28,
}

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
}
```

---

## Core Screens (V1)
1. Splash
2. Onboarding — language select, goal select, pace select, first word reveal
3. Home — streak banner, today's lesson cards, bottom nav
4. Slang Drop — word card, vibe meter, similar words, leads to quiz
5. Quiz — scenario card, 3 options, correct/wrong state, hint box
6. AI Chat — persona (Zeynep), free text + suggested replies, naturalness badges
7. Profile (minimal) — streak, shine score, words learned

---

## Key Components to Build
- `Button` — primary (#534AB7) and ghost variants
- `Tag` — purple, coral, teal, amber variants
- `HintBox` — purple ✦ hint box, always shows cultural context
- `WordCard` — word, romanization, meaning, in-a-message example
- `VibeMeter` — three tiles: friends / strangers / formal with color coding
- `BottomNav` — home, explore, chat, me
- `BubbleLeft` / `BubbleRight` — chat bubbles
- `NaturalnessBadge` — ✦ natural / ✦ great use of... feedback in chat
- `LessonCard` — home screen cards with color variants and progress bar
- `QuizOption` — default, correct, wrong, dim states

---

## Component Rules
- Always use StyleSheet, never inline styles
- Always TypeScript with proper prop interfaces
- Colors always reference the theme file, never hardcoded
- Border widths use 0.5 for subtle borders (StyleSheet.hairlineWidth 
  alternatively)
- The ✦ character is used as the brand sparkle — never an emoji star

---

## Content Structure (Supabase)
Each slang word entry has:
- word (string)
- romanization (string)
- meaning (string)
- example_message (string) — the fake text message scenario
- example_translation (string)
- vibe_friends (good | caution | avoid)
- vibe_strangers (good | caution | avoid)
- vibe_formal (good | caution | avoid)
- category (slang | expression | contraction | filler | reaction)
- dialect (istanbul | anatolian | general)
- language (turkish | azerbaijani)
- similar_words (string[])
- cultural_note (string) — what goes in the HintBox

---

## Tone & Personality
- App copy is lowercase and casual — "hey, sofia ✦" not "Hello Sofia"
- Lesson categories have personality names: "slang drop", "vibe check", 
  "ear training"
- Pace options: "quick spark" (5min), "steady glow" (10min), 
  "full shine" (20min)
- XP is called "shine score"
- Streaks show as "12 days 🔥" or "12 ✦"
- Hint boxes always start with ✦ and give cultural context, not just 
  definitions

---

## What I'm Building Towards
V1.0 — Turkish only, core loop (slang drop → quiz → AI chat)
V1.1 — Push notifications, badges, more content
V1.2 — Azerbaijani language added
V2.0 — Explore page, ear training, regional dialects, leaderboards

---

## How to Help Me
I am learning React Native while building this. When you generate code:
1. Use the design tokens above — never hardcode colors or spacing
2. Always TypeScript with proper interfaces
3. After generating, explain what each part does if I ask
4. If I ask how to build something, explain the concept first before 
   writing code
5. Build components one at a time, not whole screens at once
6. If you see me doing something in a way that will cause problems later, 
   flag it
