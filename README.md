# Liquid Glass To-Do List

A beautifully designed, standalone To-Do List desktop application built with Electron, HTML, CSS, and JavaScript. 

Features a stunning **Liquid Glass (iOS 26-inspired)** design language with smooth animations, dark/light mode toggling, and native desktop window integration.

## Features
- ✨ **Liquid Glass UI:** Blurry, frosted glass containers with a sleek aesthetic.
- 🌓 **Dark & Light Mode:** Seamless, animated transitions between themes.
- 📅 **Custom Scheduling:** Sleek, integrated date picker for scheduling future tasks.
- ⚠️ **Smart Warnings:** Glass-morphism confirmation dialogs to prevent accidental task completion.
- 💾 **Persistent Storage:** Tasks automatically save locally so you never lose them.

## How to Run the App from Source

If you want to download this code and run it yourself, you'll need to have [Node.js](https://nodejs.org/) installed on your computer.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mandinu999/To-Do-List.git
   cd To-Do-List
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the app:**
   ```bash
   npm start
   ```

## How to Build the Executable (.exe)

To package the app into a standalone `.exe` file that can be shared and run without Node.js:

```bash
npx @electron/packager . "Liquid To-Do" --platform=win32 --arch=x64 --out=dist_packager --overwrite
```
The resulting executable will be generated inside the `dist_packager` folder!
