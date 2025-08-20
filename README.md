# Looker KPI Tile Visualization

This is a configurable KPI tile visualization for Looker.

## Development

To develop this visualization locally, you need to have Node.js and npm installed.

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm start
   ```

   This will start a webpack development server that will host the visualization at `https://localhost:8080/kpi_tile.bundle.js`.

## Deployment

To deploy this visualization to a Looker instance, you need to build the production version of the visualization.

1. **Build the visualization:**

   ```bash
   npm run build
   ```

   This will create a production-ready JavaScript file at `dist/kpi_tile.bundle.js`.

2. **Upload to Looker:**

   You can then upload the `dist/kpi_tile.bundle.js` file to your Looker instance through the Looker UI or by referencing it in a Looker project.

## Configuration

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

## Testing

To test this visualization, you can use the development server and a Looker instance. Make sure to add at least three measures to your query to test both comparisons.
