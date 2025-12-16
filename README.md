# Looker Custom Visualizations

This repository contains custom visualizations for Looker:

*   **KPI Tile:** A configurable KPI tile with comparisons and tooltips.
*   **Dynamic Measure Bar Chart:** A stacked bar chart that allows you to choose as many measures as you want.
*   **Image Heatmap:** A heatmap overlay on top of an image, using 2 dimensions (X, Y coordinates) and 1 measure (Intensity).

## Development

To develop these visualizations locally, you need to have Node.js and npm installed.

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm start
```
This runs a local webpack server at `https://localhost:8080` (or http depending on config).

### 3. Expose via Tunnel (Required for Looker (Cloud))

Looker (Cloud) cannot access your `localhost`. You must expose your local server to the internet using a tunnel.

```bash
npm run tunnel
```

This will output a public URL, for example: `https://abcd-1234.lhr.life`.
Use this URL to point Looker to your local scripts.

**Example Looker Manifest for Local Dev:**
```lookml
visualization: {
  id: "local_heatmap"
  label: "Local Image Heatmap"
  url: "https://<your-tunnel-url>/src/image_heatmap.js" 
  # OR if using the bundle locally (which is rare, usually we use src directly)
  # url: "https://<your-tunnel-url>/dist/image_heatmap_lib.js"
}
```

## Deployment

For production, we bundle the visualizations to ensure all dependencies (like `heatmap.js`) are included and the code is minified.

### 1. Build the project

```bash
npm run build
```

This generates the following files in the `dist/` directory:
*   `dist/kpi_tile.js`
*   `dist/dynamic_measure_bar_chart.js`
*   `dist/image_heatmap.js` (Standalone, no dependencies included)
*   `dist/image_heatmap_lib.js` (Bundled with `heatmap.js` dependency - **RECOMMENDED for Looker**)

### 2. Commit and Push

Commit the `dist/` folder to your GitHub repository.

```bash
git add dist
git commit -m "Update production builds"
git push origin main
```

### 3. Usage in Looker

To use these visualizations in Looker without hosting them on a separate server, use **jsDelivr** to serve the files directly from GitHub.

**Manifest.lkml Example:**

```lookml
visualization: {
  id: "image_heatmap_lib"
  label: "Image Heatmap"
  # Use jsDelivr to serve the bundled file with correct Content-Type -> application/javascript
  url: "https://cdn.jsdelivr.net/gh/zacharagosa/KPI-Tile@main/dist/image_heatmap_lib.js"
}
```

*Note: Change `@main` to a specific commit hash or tag if you want to lock the version.*

## Visualizations Guide

### KPI Tile
*   **Configuration:** Title, Font Size, Colors, Comparisons (Raw/Percent).
*   **Data Requirements:** 1 Measure (Main Value), optional additional measures for comparison.

### Dynamic Measure Bar Chart
*   **Configuration:** Title, Chart Type (Grouped/Stacked), Color Scheme.
*   **Data Requirements:** 1-2 Dimensions, Multiple Measures. It includes a dropdown to switch between measures dynamically.

### Image Heatmap
Maps data points onto a background image using X/Y coordinates.

*   **Configuration:**
    *   **Image URL:** The URL of the background image (defaults to a hosted map image).
    *   **Coordinate Mode:** `Pixels` (absolute X/Y) or `Percent` (0-100 relative to image size).
    *   **Style:** Radius, Blur, Opacity, and Color Gradient (Classic, Fire, Cool).
*   **Data Requirements:**
    *   **Dimension 1:** X Coordinate
    *   **Dimension 2:** Y Coordinate
    *   **Measure 1:** Heat Intensity

**Files:**
*   `image_heatmap_lib.js`: **Preferred**. Bundles `heatmap.js` library. Use this for standard Looker deployments.
*   `image_heatmap.js`: Lightweight version if `heatmap.js` is already loaded or not needed.