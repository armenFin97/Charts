# Interactive Conversion Line Chart

An interactive dashboard for monitoring A/B test conversion rates. The UI mirrors the provided mockup, renders the conversion-rate trend for each variation, and adapts gracefully between 671 px and 1300 px viewports.

> Live data source: `data.json` (visits + conversions per variation per day).

## Tech Stack

- **React 18 + TypeScript**
- **Vite 4** for development/build
- **Recharts** for the line/area visualizations
- **CSS Modules** for component-scoped styling

## Feature Highlights

- Conversion-rate chart with hover cursor, tooltip, and responsive axes.
- **Variation selector** (always keeps at least one active line).
- **Day / Week** aggregation toggle with automatic axis recalculation.
- **Line style selector** (Line, Smooth, Area) — bonus requirement.
- **Light/Dark theme toggle** — bonus requirement.
- Fully responsive layout between 671 px and 1300 px.
- Ready for GitHub Pages deployment via `npm run deploy`.

## Getting Started

```bash
npm install
npm run dev
```

Open the dev server URL (shown in the terminal) to view the dashboard locally.

### Available Scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start Vite dev server with hot reload        |
| `npm run build`   | Type-check and create a production build     |
| `npm run preview` | Preview the production bundle locally        |
| `npm run lint`    | Run ESLint (flat config)                     |
| `npm run deploy`  | Build + publish `dist/` to GitHub Pages      |

## Deploying to GitHub Pages

1. Make sure your repository has GitHub Pages enabled (e.g., `gh-pages` branch).
2. (Optional) Set the base path for non-root deployments:
   ```bash
   # Example for username.github.io/frontend-interview-task
   set VITE_BASE_PATH=/frontend-interview-task/
   ```
3. Run `npm run deploy`. The script builds the project and pushes `dist/` to the `gh-pages` branch via the [`gh-pages`](https://www.npmjs.com/package/gh-pages) package.

## Project Structure

```
src/
├── components/          # Chart + UI controls
├── data/abData.ts       # Data parsing + aggregation helpers
├── types/               # Shared TypeScript contracts
├── App.tsx / .module.css
└── index.css            # Theme tokens + base styles
```

## Notes

- Conversion rate formula: `(conversions / visits) * 100`.
- Weekly aggregation groups by ISO weeks starting on Monday.
- Tooltip + axes always show percentages, rounded for readability.
