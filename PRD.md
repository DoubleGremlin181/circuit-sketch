# Circuit Sketch - Product Requirements

An interactive web application that challenges users to draw shapes matching Formula 1 circuit layouts using shape recognition algorithms.

**Live at: [https://circuit-sketch.kavi.sh/](https://circuit-sketch.kavi.sh/)**

## Overview

**Experience**: Playful drawing game that's immediate and informative, revealing F1 circuit facts through shape matching.

**Data Architecture**: All circuit layouts and Wikipedia data are stored locally as static JSON files for instant access with no API dependencies.

## Core Features

### Drawing & Matching
- Touch and mouse-enabled canvas for drawing circuit shapes
- Three configurable matching algorithms: Hausdorff distance, Frechet distance, and turning angle
- Real-time shape comparison with similarity percentage
- Circuit overlay visualization for comparison

### Circuit Information
- Browse all F1 circuits with detailed layouts
- Pre-scraped Wikipedia data: facts, statistics, lap records
- Dark/light theme support with localStorage persistence
- Settings panel for algorithm selection

## Data Management

Circuit data is updated via scripts that run monthly via GitHub Actions:
- `scripts/fetch-circuits.ts` - Downloads circuit layouts from [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits)
- `scripts/scrape-wikipedia.ts` - Fetches Wikipedia data for each circuit

Run manually with: `npm run data:pull`

## Technical Stack

- **Framework**: React + TypeScript + Vite
- **UI**: shadcn/ui components with Tailwind CSS
- **Canvas**: HTML5 Canvas with pointer events
- **Storage**: LocalStorage for user preferences
- **Hosting**: Static hosting compatible (no server required)
