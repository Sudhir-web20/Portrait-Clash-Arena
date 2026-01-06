# Portrait Clash Arena 🏆

Portrait Clash Arena is an ultra-premium, interactive face-off voting experience. It allows users to vote between two iconic personalities in a high-stakes, side-by-side "clash" view. Designed for both personal mobile use and large-scale event projections.

## ✨ Key Features

- **High-Stakes Clashes**: A cinematic side-by-side voting interface with glassmorphism effects and micro-interactions.
- **Projection Mode**: A specialized "TV Mode" that simplifies the UI and enlarges the joining QR code, making it perfect for projecting at events or on office screens.
- **Global Leaderboard**: Real-time rankings of all participants based on win rate, total victories, and overall vote count.
- **Dynamic QR Integration**: Every clash generates a unique QR code instantly, allowing observers to scan and join the battle from their own devices.
- **Session-Based Voting**: Prevents multi-voting in the same clash through anonymous session tracking.
- **Admin Dashboard**: A protected management suite to add, edit, or remove participants and monitor arena stats.

## 🛠️ Tech Stack

- **Frontend**: React 19 with functional components and Hooks.
- **Styling**: Tailwind CSS for a modern, responsive "Dark Mode" aesthetic.
- **Routing**: React Router (HashRouter) for seamless navigation between the Arena, Leaderboard, and Admin sections.
- **Persistence**: Optimized `localStorage` database service with event-driven "real-time" updates across tabs.
- **Graphics**: High-performance CSS animations (shimmer sweeps, victory pulses) for a "premium arena" feel.

## 🚀 Getting Started

1. **Launch the App**: Open the `index.html` in your browser.
2. **Start Voting**: Click the "Start Voting" button on the home page to enter the Arena.
3. **Scan to Join**: If using the app on a large screen, toggle **Projection Mode** in the footer to show a giant QR code for remote participants.
4. **Manage Participants**: Access the `/admin` route (default key: `arena123`) to populate the arena with your own custom personalities.

## 📱 Mobile Experience

The app is fully responsive, stacking portraits on mobile devices while maintaining the premium interactive feel of the desktop version.

---

*Designed for high-impact visual storytelling and community engagement.*