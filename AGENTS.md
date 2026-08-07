# SUJIN Wish Project

## Project purpose

This project is a one-time interactive cheering experience for Sujin.

The website is themed around Riku from NCT WISH.

It will primarily be shown locally on my laptop through localhost.

The goal is not to create a conventional website.
It should feel like a short interactive Y2K fan-made mini game and decorated scrapbook.

## Tech stack

Use:

- Vite
- React
- JavaScript
- CSS
- Motion for React

Do not introduce additional frameworks or libraries unless explicitly requested.

Do not use:

- Next.js
- TypeScript
- Tailwind CSS
- Redux
- React Router
- Backend
- Database

## Experience structure

This is a sequential single-page experience.

Flow:

Intro
→ MainWish
→ RikuDraw
→ PowerUp
→ DecoCard
→ SecretLetter
→ Ending

Do not use React Router.

The current scene should be controlled with React state.

User choices should persist between scenes when necessary.

For example:

- selected Riku image
- selected cheering message
- power-up status
- photocard decorations

Do not randomly regenerate previously selected results during re-renders.

## Visual direction

The main aesthetic combines:

- photocard
- Polaroid
- Korean/Japanese diary decoration
- scrapbook
- Y2K
- Tamagotchi
- mini game
- cute fan-made website

Main colors:

- pastel pink
- baby blue
- cream
- white

Use decorative elements such as:

- stars
- hearts
- ribbons
- sparkles
- stickers
- masking tape
- handwritten labels

Riku photos should look like physical photocards or Polaroids rather than normal rectangular website images.

Slight rotations and overlapping decorations are encouraged.

Avoid:

- generic SaaS UI
- dashboard layouts
- glassmorphism
- corporate landing-page design
- excessive gradients
- heavy dark shadows

## UX

Each scene should approximately fit within one viewport.

The experience should feel playful and sequential.

Transitions should be smooth but not excessively animated.

Prevent double clicks from skipping multiple scenes.

The selected Riku and other important results must remain consistent through later scenes.

## Images

Riku images will be stored in:

public/images/riku/

Decorative image assets will be stored in:

public/stickers/

Prefer local assets.

Do not introduce remote image URLs unless explicitly requested.

## React structure

Keep major experiences in separate React components.

Preferred components:

- Intro
- MainWish
- RikuDraw
- PowerUp
- DecoCard
- SecretLetter
- Ending

Do not put the entire application inside App.jsx.

App.jsx may manage high-level experience state and pass data through props.

Prefer simple React state over unnecessary abstractions.

Do not add Redux or React Router.

## Animation

Use Motion for React when animations depend on React state or interaction.

Import Motion using:

import { motion } from "motion/react"

Motion is appropriate for:

- scene transitions
- photocard flipping
- draggable stickers
- reveal animations
- interactive movement

Prefer CSS for simple decorative animations such as:

- small twinkles
- hover effects
- slow floating decorations

Do not animate every element at once.

## Code quality

Before modifying code:

1. Read this AGENTS.md.
2. Inspect existing files.
3. Understand the current implementation.
4. Preserve working functionality.
5. Do not rewrite unrelated components.

When implementing a task:

- keep components reasonably small
- reuse existing CSS variables
- avoid unnecessary abstractions
- do not introduce unrelated dependencies
- do not redesign scenes outside the requested task

After every task:

- check for syntax errors
- check for obvious console warnings
- run npm run build
- report which files were changed

## Important Codex rule

When asked to implement one scene or feature:

DO NOT redesign or rewrite unrelated scenes.

Only modify files necessary for the requested task unless a small shared change is required.