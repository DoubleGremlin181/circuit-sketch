# GitHub Pages Deployment Guide

This document explains how to deploy Circuit Sketch to GitHub Pages with a custom domain.

## Prerequisites

- Repository is public or you have GitHub Pages enabled for private repos
- DNS is configured to point circuit-sketch.kavi.sh to GitHub Pages

## Initial Setup

### 1. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment":
   - Source: GitHub Actions
4. The workflow will automatically deploy on pushes to `main`

### 2. Configure Custom Domain

The CNAME file in the `public/` directory will automatically configure the custom domain when deployed.

If you need to manually configure it:
1. Go to repository Settings > Pages
2. Under "Custom domain", enter: `circuit-sketch.kavi.sh`
3. Click Save
4. Enable "Enforce HTTPS" (wait for DNS check to complete)

### 3. DNS Configuration

Ensure your DNS has the following records:

```
Type: CNAME
Host: circuit-sketch
Value: <username>.github.io
TTL: 3600 (or your preference)
```

Or if using A records for apex domain:
```
Type: A
Host: circuit-sketch
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

## Automatic Deployment

The site automatically deploys when you push to the `main` branch via the `.github/workflows/deploy.yml` workflow.

## Manual Deployment

You can manually trigger a deployment:
1. Go to Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Verify Deployment

After deployment:
1. Check the Actions tab for workflow status
2. Visit https://circuit-sketch.kavi.sh/
3. Verify the site loads correctly

## Troubleshooting

### DNS Not Resolving
- Wait up to 24 hours for DNS propagation
- Use `dig circuit-sketch.kavi.sh` to check DNS records
- Verify kavi.sh DNS is properly configured

### 404 Errors
- Ensure GitHub Pages source is set to "GitHub Actions"
- Check that the deploy workflow completed successfully
- Verify CNAME file exists in the deployment

### Custom Domain Not Working
- Check repository Settings > Pages for any warnings
- Ensure CNAME file contains: `circuit-sketch.kavi.sh`
- Try removing and re-adding the custom domain in settings

## Monthly Data Updates

Circuit data automatically updates via `.github/workflows/update-data.yml`:
- Runs on the 1st of every month at 00:00 UTC
- Fetches latest circuit layouts
- Scrapes updated Wikipedia data
- Commits changes back to the repository
- Triggers a new deployment automatically

## Local Preview

To preview the production build locally:

```bash
npm run build
npm run preview
```

Then visit http://localhost:4173
