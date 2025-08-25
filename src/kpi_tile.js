import 'chart.js/auto';
looker.plugins.visualizations.add({
  // --- Visualization Configuration ---
  options: {
    title: {
      type: 'string',
      label: 'Title',
      placeholder: 'My KPI'
    },
    kpiValueSize: {
      type: 'number',
      label: 'KPI Value Font Size',
      default: 48
    },
    kpiValueColor: {
      type: 'string',
      label: 'KPI Value Color',
      display: 'color',
      default: '#212121'
    },
    showTooltip: {
        type: 'boolean',
        label: 'Show Measure Description on KPI Name Hover on Dashboard',
        default: true,
        section: 'Tooltip'
    },
    comparisonType: {
        type: 'string',
        label: 'Comparison Type',
        values: [
        {"Percentage": "Percentage"},
        {"Raw": "Raw"},
      ],
        default: "Percentage",
        display: "radio",
        section: 'Comparisons'
    },
    showComparison1: {
      type: 'boolean',
      label: 'Show First Comparison',
      default: true,
      section: 'Comparisons'
    },
    comparison1Label: {
      type: 'string',
      label: 'First Comparison Label',
      placeholder: 'vs. Previous Period',
      section: 'Comparisons'
    },
    showComparison2: {
      type: 'boolean',
      label: 'Show Second Comparison',
      default: false,
      section: 'Comparisons'
    },
    comparison2Label: {
      type: 'string',
      label: 'Second Comparison Label',
      placeholder: 'vs. Target',
      section: 'Comparisons'
    },
    comparisonColorPositive: {
      type: 'string',
      label: 'Comparison Color (Positive)',
      display: 'color',
      default: '#4CAF50',
      section: 'Comparisons'
    },
    comparisonColorNegative: {
      type: 'string',
      label: 'Comparison Color (Negative)',
      display: 'color',
      default: '#F44336',
      section: 'Comparisons'
    },
    show_line_chart: {
      type: 'boolean',
      label: 'Show Line Chart',
      default: true,
      section: 'Chart'
    },
    line_chart_color: {
      type: 'string',
      label: 'Line Chart Color',
      display: 'color',
      default: '#1A73E8',
      section: 'Chart'
    },
    goal: {
      type: 'number',
      label: 'Goal',
      section: 'Goal'
    },
    show_goal_progress: {
      type: 'boolean',
      label: 'Show Goal Progress',
      default: true,
      section: 'Goal'
    },
    progress_bar_color: {
      type: 'string',
      label: 'Progress Bar Color',
      display: 'color',
      default: '#1A73E8',
      section: 'Goal'
    }
  },

  // --- Create Method ---
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .kpi-tile-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-family: 'Google Sans', 'Noto Sans', 'Noto Sans JP', 'Noto Sans CJK KR', 'Noto Sans Arabic UI', 'Noto Sans Devanagari UI', 'Noto Sans Hebrew UI', 'Noto Sans Thai UI', 'Helvetica', 'Arial', sans-serif;
          text-align: center;
        }
        .kpi-title-container {
            position: relative;
        }
        .kpi-title {
          font-size: 14px;
          color: #616161;
          margin-bottom: 5px;
        }
        .kpi-tooltip {
            visibility: hidden;
            width: 200px;
            background-color: #555;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 5px 0;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            margin-left: -100px;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .kpi-title-container:hover .kpi-tooltip {
            visibility: visible;
            opacity: 1;
        }
        .kpi-value {
          font-weight: bold;
          line-height: 1;
        }
        .kpi-comparison-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 10px;
        }
        .kpi-comparison {
          font-size: 16px;
          font-weight: 500;
          margin-top: 8px;
        }
        .kpi-chart-container {
          width: 100%;
          height: 100px;
          margin-top: 10px;
        }
        .progress-bar-container {
          width: 80%;
          height: 10px;
          background-color: #e0e0e0;
          border-radius: 5px;
          margin-top: 10px;
        }
        .progress-bar {
          height: 100%;
          border-radius: 5px;
        }
      </style>
      <div class="kpi-tile-container">
        <div class="kpi-title-container">
            <div class="kpi-title"></div>
            <div class="kpi-tooltip"></div>
        </div>
        <div class="kpi-value"></div>
        <div class="kpi-comparison-container">
            <div class="kpi-comparison" id="kpi-comparison-1"></div>
            <div class="kpi-comparison" id="kpi-comparison-2"></div>
        </div>
        <div class="kpi-chart-container">
          <canvas id="kpi-chart"></canvas>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar"></div>
        </div>
      </div>
    `;
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();

    if (queryResponse.fields.measures.length < 1) {
      this.addError({
        title: "No Measures",
        message: "This visualization requires at least one measure."
      });
      return;
    }

    const firstRow = data[0];
    if (!firstRow) {
      done();
      return;
    }

    const kpiMeasure = queryResponse.fields.measures[0];
    const kpiCell = firstRow[kpiMeasure.name];
    const kpiValue = LookerCharts.Utils.textForCell(kpiCell);

    const titleElement = element.querySelector('.kpi-title');
    const tooltipElement = element.querySelector('.kpi-tooltip');
    const valueElement = element.querySelector('.kpi-value');
    const comparison1Element = element.querySelector('#kpi-comparison-1');
    const comparison2Element = element.querySelector('#kpi-comparison-2');
    const chartContainer = element.querySelector('.kpi-chart-container');
    const progressBarContainer = element.querySelector('.progress-bar-container');
    const progressBar = element.querySelector('.progress-bar');

    titleElement.textContent = config.title || kpiMeasure.label_short || kpiMeasure.label;
    if (config.showTooltip) {
        tooltipElement.textContent = kpiMeasure.description;
    } else {
        tooltipElement.style.display = 'none';
    }

    valueElement.textContent = kpiValue;
    valueElement.style.color = config.kpiValueColor;
    valueElement.style.fontSize = `${config.kpiValueSize}px`;

    comparison1Element.style.display = 'none';
    comparison2Element.style.display = 'none';
    chartContainer.style.display = 'none';
    progressBarContainer.style.display = 'none';

    // Comparison 1
    if (config.showComparison1 && queryResponse.fields.measures.length > 1) {
      const comparisonMeasure = queryResponse.fields.measures[1];
      const comparisonCell = firstRow[comparisonMeasure.name];
      
      if (typeof kpiCell.value === 'number' && typeof comparisonCell.value === 'number' && comparisonCell.value !== 0) {
        const mainValue = kpiCell.value;
        const comparisonValue = comparisonCell.value;
        const difference = mainValue - comparisonValue;
        const isPositive = difference >= 0;
        const arrow = isPositive ? '▲' : '▼';
        let formattedDifference;

        if (config.comparisonType === 'Raw') {
            formattedDifference = difference.toFixed(1);
        } else {
            const pctChange = difference / Math.abs(comparisonValue);
            formattedDifference = (pctChange * 100).toFixed(1) + '%';
        }

        comparison1Element.textContent = `${arrow} ${formattedDifference} ${config.comparison1Label || 'vs. Previous Period'}`;
        comparison1Element.style.color = isPositive ? config.comparisonColorPositive : config.comparisonColorNegative;
        comparison1Element.style.display = 'block';
      }
    }

    // Comparison 2
    if (config.showComparison2 && queryResponse.fields.measures.length > 2) {
      const comparisonMeasure = queryResponse.fields.measures[2];
      const comparisonCell = firstRow[comparisonMeasure.name];
      
      if (typeof kpiCell.value === 'number' && typeof comparisonCell.value === 'number' && comparisonCell.value !== 0) {
        const mainValue = kpiCell.value;
        const comparisonValue = comparisonCell.value;
        const difference = mainValue - comparisonValue;
        const isPositive = difference >= 0;
        const arrow = isPositive ? '▲' : '▼';
        let formattedDifference;

        if (config.comparisonType === 'Raw') {
            formattedDifference = difference.toFixed(1);
        } else {
            const pctChange = difference / Math.abs(comparisonValue);
            formattedDifference = (pctChange * 100).toFixed(1) + '%';
        }

        comparison2Element.textContent = `${arrow} ${formattedDifference} ${config.comparison2Label || 'vs. Target'}`;
        comparison2Element.style.color = isPositive ? config.comparisonColorPositive : config.comparisonColorNegative;
        comparison2Element.style.display = 'block';
      }
    }

    // Line Chart
    if (config.show_line_chart && queryResponse.fields.dimensions.length > 0) {
      chartContainer.style.display = 'block';
      const dimension = queryResponse.fields.dimensions[0];
      const labels = data.map(row => row[dimension.name].value);
      const chartData = data.map(row => row[kpiMeasure.name].value);

      const ctx = element.querySelector('#kpi-chart').getContext('2d');

      if (this._chart) {
        this._chart.destroy();
      }

      this._chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: chartData,
            borderColor: config.line_chart_color,
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: { display: false },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }

    // Goal Progress
    if (config.show_goal_progress && config.goal) {
      progressBarContainer.style.display = 'block';
      const progress = (kpiCell.value / config.goal) * 100;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
      progressBar.style.backgroundColor = config.progress_bar_color;
    }

    done();
  }
});