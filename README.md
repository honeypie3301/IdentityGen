# Identity Generator

A clean, offline-first web application that generates random realistic identities, inspired by premium macOS and developer utilities (Linear, Raycast).

## Features

- **100% Client-Side:** No backend, databases, or external APIs are used. Everything is processed instantly in the browser.
- **Robust Generator:** 
  - Choose between Male, Female, or Random gender identities.
  - Generates multiple realistic Gmail combinations with optional numeric variations.
- **Copy Utilities:** One-click copy buttons for individual fields and a "Copy All" function.
- **History Tracking:** Automatically keeps track of your last 20 generated identities for easy retrieval.
- **Premium Design:** Clean typography (Inter font), smooth Framer Motion animations, large border radii, and soft shadows.
- **Dark Mode:** Built-in Light/Dark mode toggle that persists to `localStorage`.

## Deployment (GitHub Pages)

This project is configured out-of-the-box for GitHub Pages. 

To deploy:
1. Run `npm run build`
2. The generated `dist` folder can be uploaded to GitHub or published directly to GitHub Pages. It uses relative base paths (`base: './'`), so it works on custom domains or GitHub subdirectories.

## Tech Stack
- React 19
- Vite
- Tailwind CSS (v4)
- Lucide React (Icons)
- Framer Motion (Animations)
