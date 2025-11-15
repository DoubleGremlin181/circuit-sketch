# Circuit Sketch - F1 Track Matcher

Draw shapes and match them against real Formula 1 circuit layouts! This interactive web application uses shape recognition algorithms to find the best matching F1 circuits and provides detailed information from Wikipedia.

## Features

- 🎨 **Draw to Match**: Draw shapes with your finger or mouse and instantly match them against F1 circuits
- 🏎️ **Browse Circuits**: Explore all available F1 circuits with detailed layouts and information
- 📊 **Multiple Algorithms**: Choose between Hausdorff distance, Frechet distance, or turning angle matching
- 📚 **Live Wikipedia Data**: Get up-to-date facts and statistics from Wikipedia with visible loading progress
- 🌓 **Dark Mode**: Full dark mode support for comfortable viewing
- 💾 **Local Circuit Data**: Circuit layouts are stored locally for instant matching (no loading delays!)

## Circuit Data

Circuit layouts are pre-fetched from the [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) repository and stored locally in `src/data/circuits.json`. This ensures instant matching without network delays.

Facts and statistics are fetched live from Wikipedia when viewing a circuit, with a progress indicator showing the loading status.

### Adding More Circuits

To add more circuits to the database:

1. Add the circuit layout data to `src/data/circuits.json`
2. Add the Wikipedia page mapping to `src/data/wikipedia-mapping.ts`
3. The circuit will automatically be available for matching and browsing

## Development

```bash
npm run dev
```

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
