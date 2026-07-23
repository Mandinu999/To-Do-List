# Liquid Glass To-Do List

A beautifully designed, standalone To-Do List desktop application built with Electron, HTML, CSS, and JavaScript. 

Features a stunning **Liquid Glass** design language with smooth animations, dark/light mode toggling, and native desktop window integration.

## Features
- **Liquid Glass UI:** Blurry, frosted glass containers with a sleek aesthetic.
  <img width="951" height="646" alt="image" src="https://github.com/user-attachments/assets/cccc9c82-41f6-4954-b6dd-a55916ff6b9b" />


- **Dark & Light Mode:** Seamless, animated transitions between themes.
  <img width="947" height="646" alt="image" src="https://github.com/user-attachments/assets/b336330f-95b3-4a75-a861-ea8d3f41c8d8" />

- **Custom Scheduling:** Sleek, integrated date picker for scheduling future tasks.
  <img width="945" height="650" alt="image" src="https://github.com/user-attachments/assets/30384654-3935-480d-960d-e568a71bcd9f" />

- **Smart Warnings:** Glass-morphism confirmation dialogs to prevent accidental task completion.
  <img width="943" height="641" alt="image" src="https://github.com/user-attachments/assets/de04e4dc-9027-43ad-badb-a20dc1a115f0" />

- **Persistent Storage:** Tasks automatically save locally so you never lose them.

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
