# OmniVision Security PRO

A modern, responsive surveillance dashboard built with React, Vite, and Tailwind CSS.

## Features

- **Real-time Monitoring**: Dashboard view with multiple camera feeds.
- **Network Scanner**: Simulated local network scanner to find IP cameras.
- **AI Analysis**: Integration with Groq LPU (simulated) for intruder detection.
- **Dark Mode**: Fully supported dark/light themes.
- **Responsive Design**: Works on mobile, tablet, and desktop.

## Project Structure

```
src/
├── components/
│   ├── layout/       # Layout components (AnimatedBackground)
│   ├── surveillance/ # Feature-specific components (VideoCard)
│   └── ui/           # Reusable UI components (Button, Input, OmniLogo)
├── context/          # React Context (ThemeContext)
├── hooks/            # Custom Hooks (useNetworkScan)
├── pages/            # Page components (AuthPage, DashboardPage)
├── App.jsx           # Main Application Router/Switch
└── main.jsx          # Entry point
```

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start development server**:
    ```bash
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```

## Technologies

-   [Vite](https://vitejs.dev/)
-   [React](https://react.dev/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Lucide React](https://lucide.dev/)
