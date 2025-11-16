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

## Quick Start

```bash
npm install
npm run dev
```

## Deployment

The site is automatically deployed to GitHub Pages at [circuit-sketch.kavi.sh](https://circuit-sketch.kavi.sh/) on every push to the main branch via GitHub Actions.

**⚠️ First-time setup required:** To enable deployment, configure GitHub Pages in repository settings:

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

## Acknowledgements

The checkered flag emoji used in the logo and favicon is from [Twemoji](https://github.com/twitter/twemoji) by Twitter, Inc and other contributors. Licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
