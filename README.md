# Overfitter

> Welcome. You're probably going to overfit.

A gamified machine learning playground that teaches **linear regression** through real-time parameter guessing, dynamic scatter plots, error metrics, and personalized feedback.
check this out:https://overfitter-r92xfq4tp-jobebolders-projects.vercel.app/



## What is this?

Most people learn about regression by reading equations. Overfitter teaches it by making you *feel* the difference between a well-fit line and an overfit one.

You adjust slope and intercept manually, watch MSE and R² update in real time, submit your guess, and then see exactly how far off your intuition was — complete with a **Gradient Descent animation** that walks your line to the optimal solution.

## Features

- **Real-time metrics** — MSE, MAE, R² update as you drag the sliders
- **Gradient Descent animation** — watch your guess converge to the OLS solution
- **Error visualization** — residual lines drawn from each point after submission
- **Rule-based feedback** — tells you *why* your guess was off, not just by how much
- **Difficulty levels** — Easy / Medium / Hard (controls noise and outlier ratio)
- **Score history** — per-round bar chart to track your improvement

## ML Concepts Covered

| Concept | How it's shown |
|---|---|
| Linear regression | The line you're fitting |
| Slope & intercept | Direct slider control |
| MSE / MAE | Live metric panel |
| R² | Updates in real time |
| Residuals | Error lines on submit |
| Gradient Descent | Animated convergence |
| Overfitting intuition | The whole game |

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tooling
- **HTML5 Canvas** — all visualization (no chart library dependency)
- **Custom hooks** — `useGame` manages all game state

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
```

Output goes to `dist/` — deploy anywhere (Vercel, Netlify, GitHub Pages).

## Project Structure

```
src/
├── components/
│   ├── ScatterPlot.tsx   # Canvas rendering + gradient descent animation
│   ├── ControlPanel.tsx  # Sliders, metrics, feedback, buttons
│   └── ScoreHistory.tsx  # Per-round bar chart
├── hooks/
│   └── useGame.ts        # All game state logic
├── utils/
│   ├── math.ts           # OLS, metrics, scoring, data generation
│   └── canvas.ts         # Drawing utilities
├── types.ts
└── App.tsx
```

## Scoring

Points are calculated based on MSE, slope error, and intercept error:

```
score = 1000 - (MSE × 2) - (|ΔSlope| × 150) - (|ΔIntercept| × 4)
```

Minimum score per round: **−2500** (penalty for being completely off).

---

Built as a portfolio project to demonstrate interactive ML visualization + React/TypeScript.
