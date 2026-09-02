# Beatok

Welcome to **Beatok**! A React application for competitive beat making.

The backend API is available in a [separate repository](https://github.com/upyrov/beatok-api).

## 🛠️ Features

- **Modern Stack**: React 19, React Router 8, and TailwindCSS 4.
- **Audio Playback**: Waveform rendering and audio playing via [wavesurfer.js](https://wavesurfer.xyz).
- **Real-Time Capabilities**: WebSockets through SignalR.
- **State Management**: Robust client state using Zustand and TanStack Query.
- **Strictly Typed**: End-to-end type safety with TypeScript.

## 📦 Getting Started

### Prerequisites

**[Bun](https://bun.sh/)** is the official package manager and runtime for this project. Please ensure you have it installed.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/upyrov/beatok.git
   cd beatok
   ```

2. Install the dependencies using Bun:

   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

Your application will be available at `http://localhost:5173`.

## 🤝 Contributing

We welcome contributions to Beatok!

Please refer to our **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed instructions on:

- Local development workflow
- Coding guidelines
- Pull request process

## 📜 License

This project is licensed under the terms of the [MIT License](./LICENSE).
