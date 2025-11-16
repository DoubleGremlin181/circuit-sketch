# Circuit Sketch

Draw shapes and match them against real Formula 1 circuit layouts using shape recognition algorithms.

🏎️ **[Live Demo: https://circuit-sketch.kavi.sh/](https://circuit-sketch.kavi.sh/)**

## Features

- 🎨 **Draw & Match**: Draw shapes to match F1 circuits with instant feedback
- 🏎️ **Browse Circuits**: Explore all F1 circuits with detailed information
- 📊 **Multiple Algorithms**: Choose between Hausdorff, Frechet, or turning angle matching
- 📚 **Rich Data**: Pre-loaded Wikipedia facts and statistics
- 🌓 **Dark Mode**: Full theme support
- ⚡ **Static Hosting**: No server required, works offline

## Matching Algorithms

Circuit Sketch uses three different algorithms to compare your drawing with F1 circuit layouts. All algorithms return a **similarity score from 0 to 100**, where:

- **100** = Perfect match (identical shapes)
- **75-99** = Excellent match
- **50-74** = Good match  
- **25-49** = Fair match
- **0-24** = Poor match

### Algorithm Types

1. **Hausdorff Distance**: Measures the greatest distance from any point on one shape to the closest point on another. Best for overall shape similarity.

2. **Fréchet Distance**: Considers the order of points along the path, similar to walking a dog on a leash. Better for comparing directional flow and path ordering.

3. **Turning Angle**: Compares the sequence of turning angles at each point. Excellent for matching corner sequences and shape complexity.

All algorithms normalize shapes for scale and position, then resample to 64 points before comparison. The raw distance metrics are converted to percentage scores using exponential decay functions, ensuring the final score always falls within the 0-100 range.

## Quick Start

```bash
npm install
npm run dev
```

## Deployment

The site is automatically deployed to GitHub Pages at [circuit-sketch.kavi.sh](https://circuit-sketch.kavi.sh/) on every push to the main branch.

**⚠️ First-time setup required:** To enable deployment, you must configure GitHub Pages in repository settings. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick setup:**
1. Go to Settings → Pages
2. Set "Source" to **GitHub Actions** (not "Deploy from a branch")
3. Push to main branch to trigger deployment

## Data Management

Circuit layouts and Wikipedia data are stored locally in `src/data/` and updated monthly via GitHub Actions.

**Manual update:**
```bash
npm run data:pull
```

**Individual updates:**
```bash
npm run data:circuits     # Update circuit layouts from bacinger/f1-circuits
npm run data:wikipedia    # Update Wikipedia data
```

## Adding New Circuits

1. Add the circuit to [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits)
2. Add Wikipedia mapping in `scripts/scrape-wikipedia.ts` (`WIKIPEDIA_MAPPING` object)
3. Run `npm run data:pull`

## Build

```bash
npm run build
npm run preview
```

## License

MIT License - Copyright GitHub, Inc.
