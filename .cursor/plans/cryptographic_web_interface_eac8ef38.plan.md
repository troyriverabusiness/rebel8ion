---
name: Cryptographic Web Interface
overview: Initialize a React + TypeScript Vite app with Shadcn UI, implementing a minimal cryptographic-themed interface with a dropdown selector and "Penetrate" button using a black/purple color scheme.
todos:
  - id: init-vite
    content: Initialize Vite React+TS project in client folder
    status: completed
  - id: setup-tailwind
    content: Install and configure Tailwind CSS
    status: completed
  - id: setup-shadcn
    content: Initialize Shadcn and add Select + Button components
    status: completed
  - id: customize-theme
    content: Configure black/purple color scheme in CSS variables
    status: completed
  - id: build-interface
    content: Implement main screen with dropdown and Penetrate button
    status: completed
---

# Cryptographic Web Interface Implementation

## Overview

Build a minimal, cryptographic-themed single screen using React + TypeScript with Shadcn components. The interface will feature a dropdown with 5 hacker-themed names and a "Penetrate" button.

## Tech Stack

- **Vite** + React + TypeScript
- **Shadcn/ui** for components
- **Tailwind CSS** for styling (required by Shadcn)

## Design Direction

- **Aesthetic**: Minimal, dark, cryptographic - think terminal meets cipher
- **Colors**: Deep black background (#0a0a0a) with electric purple accents (#a855f7 / #9333ea)
- **Typography**: Monospace font (JetBrains Mono or similar) for the crypto feel
- **Layout**: Centered, focused interface with generous negative space

## Implementation Steps

### 1. Initialize Vite React+TS Project

Run in [`client/`](client/):

```bash
npm create vite@latest . -- --template react-ts
npm install
```

### 2. Install and Configure Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Install and Configure Shadcn

```bash
npx shadcn@latest init
```

Configure with:

- Style: Default
- Base color: Neutral (we'll customize to black/purple)
- CSS variables: Yes

### 4. Add Required Shadcn Components

```bash
npx shadcn@latest add select button
```

### 5. Customize Theme

Update CSS variables in [`client/src/index.css`](client/src/index.css) for black/purple scheme:

- Background: near-black (#0a0a0a)
- Foreground: light gray for text
- Primary: purple (#a855f7)
- Accent: deeper purple for hover states

### 6. Build Main Interface

Create the single screen in [`client/src/App.tsx`](client/src/App.tsx):

```tsx
// Dropdown with 5 crypto-themed names
const names = ["Cipher", "Phantom", "Vector", "Specter", "Nexus"];

// Centered layout with:
// - Title/branding
// - Select dropdown
// - "Penetrate" button (logs selected name)
```

### 7. Add Custom Styling

- Import JetBrains Mono from Google Fonts
- Apply monospace typography throughout
- Add subtle glow effects on purple elements
- Minimal animations on button hover

## Visual Mockup

```
+------------------------------------------+
|                                          |
|                                          |
|             [ REVEL8 ]                   |
|                                          |
|         +------------------+             |
|         |  Select Target ▼ |             |
|         +------------------+             |
|                                          |
|           [ PENETRATE ]                  |
|                                          |
|                                          |
+------------------------------------------+
```

## Files to Create/Modify

| File | Action |

|------|--------|

| `client/*` | Initialize Vite project |

| `client/src/index.css` | Custom dark theme variables |

| `client/src/App.tsx` | Main interface component |

| `client/tailwind.config.js` | Extend with custom colors |

| `client/components.json` | Shadcn configuration |