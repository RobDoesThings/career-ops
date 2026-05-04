# Career-Ops Web UI

Welcome to the **Career-Ops Web UI**! 

This sub-project adds a rich, dynamic, glassmorphic visual interface on top of the original CLI-based `career-ops` agentic job search system. It provides a visual dashboard for your metrics, a filterable view of your applications pipeline, and a built-in terminal interface for executing your commands seamlessly.

## 🏗️ Architecture

The Web UI is fully self-contained in this `webui` directory to ensure zero interference with the original `career-ops` CLI tools.

It operates on a decoupled architecture:
1. **Frontend (`ui/` folder)**: A modern Single Page Application (SPA) built with Vite and React. It uses Vanilla CSS with a customized premium design system (dark mode, glassmorphism, responsive grids).
2. **Backend (`server.mjs`)**: A lightweight Express API server that acts as a bridge. It parses your local Markdown tracking files (`data/applications.md` and `data/pipeline.md`) to serve data to the frontend, and it manages spawning child processes for CLI execution.

## ✨ Features

- **Dashboard**: High-level visual metrics covering jobs processed, your success rate, upcoming deadlines, and a quick view of your pending URL inbox.
- **Jobs Pipeline**: A dynamic data table parsing your tracker data. Sort, filter, and search through all evaluated job opportunities visually. Quick-action buttons let you sync the tracker or batch-evaluate jobs with a single click.
- **Prompt Runner**: A clean, web-based terminal that allows you to submit commands directly to Claude Code or Gemini CLI.
- **Settings**: Easily toggle which AI provider you want to use for execution. Preferences are saved automatically to `config.yml`.

## 🚀 How to Run

You don't need to dive into this directory to start the app. We've provided simple launcher scripts in the **root** `career-ops` folder!

**Mac / Linux:**
```bash
# Run from the root career-ops directory
./start-webui.sh
```

**Windows:**
```bat
# Run from the root career-ops directory
start-webui.bat
```

These scripts will automatically check your dependencies, install them if necessary, and boot up both the API server (on port `3001`) and the Vite development server (on port `5173`). 

Once started, open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Manual Setup / Development

If you wish to run things manually or contribute to the Web UI:

```bash
# 1. Navigate to the webui folder
cd webui

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd ui && npm install && cd ..

# 4. Start the stack concurrently
npm run dev
```

> **Note:** When using the Gemini CLI via the Prompt Runner, the backend automatically provisions trust variables (`GEMINI_CLI_TRUST_WORKSPACE=true`) to ensure seamless execution in programmatic environments.
