project_name: "looker_custom_visualizations"

# ==============================================================================
# VISUALIZATION MANIFEST
#
# This file contains the configuration blocks needed to add these visualizations
# to your Looker project.
#
# USAGE:
# 1. Copy the "PRODUCTION" block for the visualization you want to use.
# 2. Paste it into your project's manifest.lkml file.
# 3. Apply the changes in Looker.
#
# FOR DEVELOPMENT:
# Uncomment the "DEVELOPMENT" block and replace <YOUR_TUNNEL_URL> with the
# URL provided by `npm run tunnel` (e.g., https://abcd-1234.lhr.life).
# ==============================================================================


# ------------------------------------------------------------------------------
# 1. KPI TILE
# A configurable tile for displaying single values with comparisons.
# ------------------------------------------------------------------------------

# PRODUCTION (Recommended)
visualization: {
  id: "kpi_tile"
  label: "KPI Tile"
  url: "https://cdn.jsdelivr.net/gh/zacharagosa/KPI-Tile@main/dist/kpi_tile.js"
}

# DEVELOPMENT
# visualization: {
#   id: "kpi_tile_dev"
#   label: "KPI Tile (Dev)"
#   url: "https://<YOUR_TUNNEL_URL>/src/kpi_tile.js"
# }


# ------------------------------------------------------------------------------
# 2. IMAGE HEATMAP
# Plot heatmaps over a custom background image.
# ------------------------------------------------------------------------------

# PRODUCTION (Recommended - Includes Dependencies)
visualization: {
  id: "image_heatmap_lib"
  label: "Image Heatmap"
  url: "https://cdn.jsdelivr.net/gh/zacharagosa/KPI-Tile@main/dist/image_heatmap_lib.js"
}

# DEVELOPMENT
# visualization: {
#   id: "image_heatmap_dev"
#   label: "Image Heatmap (Dev)"
#   url: "https://<YOUR_TUNNEL_URL>/src/image_heatmap_lib.js"
# }


# ------------------------------------------------------------------------------
# 3. DYNAMIC MEASURE BAR CHART
# A bar chart that allows users to switch measures dynamically.
# ------------------------------------------------------------------------------

# PRODUCTION (Recommended)
visualization: {
  id: "dynamic_measure_bar_chart"
  label: "Dynamic Measure Bar Chart"
  url: "https://cdn.jsdelivr.net/gh/zacharagosa/KPI-Tile@main/dist/dynamic_measure_bar_chart.js"
}

# DEVELOPMENT
# visualization: {
#   id: "dynamic_measure_bar_chart_dev"
#   label: "Dynamic Measure Bar Chart (Dev)"
#   url: "https://<YOUR_TUNNEL_URL>/src/dynamic_measure_bar_chart.js"
# }
