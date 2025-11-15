# Data Scripts

Scripts to fetch and update circuit data. These run automatically via GitHub Actions on a monthly schedule.

## Circuit Layouts (`fetch-circuits.ts`)

Downloads circuit layouts from [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits), normalizes coordinates, and saves to `src/data/circuits.json`.

```bash
npm run data:circuits
```

## Wikipedia Data (`scrape-wikipedia.ts`)

Scrapes Wikipedia for circuit facts, statistics, and metadata. Saves to `src/data/wikipedia-data.json`.

```bash
npm run data:wikipedia
```

## Update Both

```bash
npm run data:pull
```

## Automation

GitHub Actions runs these scripts monthly to keep data fresh. See `.github/workflows/update-data.yml`.
