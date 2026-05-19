# Masonry Weather Score

A React + TypeScript + Vite decision aid for masonry crews to evaluate whether weather conditions are suitable for concrete, mortar, pavers, and other masonry work.

## Tech Stack

- React
- TypeScript
- Vite
- Open-Meteo for weather forecasts
- Zippopotam.us for US ZIP code geocoding

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run locally:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Current Features

- Responsive mobile-first UI
- ZIP code input with real US ZIP geocoding
- Job type dropdown for masonry work
- Start time and duration inputs
- Sun exposure selector
- Weather snapshot card
- Masonry score card with status and recommendations
- Job-type-specific scoring modifiers
- Hourly work window breakdown
- Friendly loading and error states

## Future Roadmap

- Add city/place search and recent ZIP history
- Improve live weather error handling and caching
- Add printable job/weather summary
- Incorporate concrete cure timing and mix guidance
- Add more job-specific risk factors and thresholds
