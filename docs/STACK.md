# Stack

## Components

| Piece | Role | What it does in the app |
|---|---|---|
| React | UI | Draws the UI: the countdown, the start/pause buttons, the settings panel |
| TypeScript | Language (UI side) | The language for the UI and the timer logic (work/break cycle, remaining time) |
| Vite | Build tool | Compiles the React/TS into plain HTML, JS, and CSS, and runs the hot-reload dev server |
| WebView2 | Renderer | The browser engine built into Windows (the same one Edge uses) that renders the HTML inside the app window |
| Tauri | Native shell | Creates the window, hosts the WebView, owns the tray icon, and packages everything into an .exe and installer |
| Rust | Language (native side) | The language Tauri's native side is written in; only written by hand for custom native features |

## Native capabilities

| Capability | What Tauri provides | Called from |
|---|---|---|
| Window control | Set always-on-top, move the window, read its position so it can be saved | TypeScript, via Tauri's JS API |
| Tray | Create the icon and its menu, and react to clicks | TypeScript, via Tauri's JS API |
| Notifications | Show a Windows toast when a session ends | TypeScript, via an official plugin |
| Autostart | Register the app to launch at login | TypeScript, via an official plugin |
