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

## Tech Stack
- Vanilla HTML, CSS, JavaScript
- No build tools required (fully static)

## Deployment

Because this app consists solely of pure static files (HTML, CSS, JS), it can be deployed anywhere immediately.

### Deploying to Vercel
1. Push this code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com/) and click **Add New... > Project**.
3. Import your GitHub repository.
4. Leave all build settings as their defaults and click **Deploy**.

### Deploying to GitHub Pages
1. Push this code to your GitHub repository.
2. Go to your repository **Settings** > **Pages**.
3. Under **Build and deployment**, set the Source to **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder, then click **Save**.
