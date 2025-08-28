# Looker Custom Visualizations

This repository contains two custom visualizations for Looker:

*   **KPI Tile:** A configurable KPI tile with comparisons and tooltips.
*   **Dynamic Measure Bar Chart:** A stacked bar chart that allows you to choose as many measures as you want.

## Development

To develop these visualizations locally, you need to have Node.js and npm installed.

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm start
   ```

   This will start a webpack development server that will host the visualizations at:
   * `https://localhost:8080/kpi_tile.js`
   * `https://localhost:8080/dynamic_measure_bar_chart.js`

## Deployment

To deploy these visualizations to a Looker instance, you need to build the production version of the visualizations.

1. **Build the visualizations:**

   ```bash
   npm run build
   ```

   This will create production-ready JavaScript files at:
   * `dist/kpi_tile.js`
   * `dist/dynamic_measure_bar_chart.js`

2. **Upload to Looker:**

   You can then upload the `dist/kpi_tile.js` and `dist/dynamic_measure_bar_chart.js` files to your Looker instance through the Looker UI or by referencing them in a Looker project.

## KPI Tile

### Configuration

This visualization can be configured with the following options:

*   **Title:** The title of the KPI tile.
*   **KPI Value Font Size:** The font size of the main KPI value.
*   **KPI Value Color:** The color of the main KPI value.
*   **Show Tooltip on Title Hover:** Show or hide the tooltip on the title hover.
*   **Comparison Type:** Choose between "Percentage" and "Raw" for the comparison display.
*   **Show First Comparison:** Show or hide the first comparison.
*   **First Comparison Label:** The label for the first comparison.
*   **Show Second Comparison:** Show or hide the second comparison.
*   **Second Comparison Label:** The label for the second comparison.
*   **Comparison Color (Positive):** The color of the comparison text when the value is positive.
*   **Comparison Color (Negative):** The color of the comparison text when the value is negative.

### Testing

To test this visualization, you can use the development server and a Looker instance. Make sure to add at least three measures to your query to test both comparisons.

## Dynamic Measure Bar Chart

### Configuration

This visualization can be configured with the following options:

*   **Title:** A custom title for the chart.
*   **Chart Type:** Choose between "Grouped" and "Stacked" display types (this only applies when using two dimensions).
*   **Color Scheme:** Select from "Default", "Cool", and "Warm" color palettes.

### How it Works

The chart includes a dropdown menu that allows you to dynamically select which measure from your query is displayed.

*   **With one dimension,** it renders a standard bar chart.
*   **With two dimensions,** it renders a grouped or stacked bar chart, using the second dimension to create the groups or stacks.