import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

looker.plugins.visualizations.add({
  // --- Visualization Configuration ---
  options: {
    title: {
      type: 'string',
      label: 'Title',
      placeholder: 'My Bar Chart'
    },
    chart_type: {
      type: 'string',
      label: 'Chart Type',
      display: "select",

      values: [
        {"Grouped": "grouped"},
        {"Stacked": "stacked"}
      ],
      default: 'grouped'
    },
    color_scheme: {
      type: 'string',
      label: 'Color Scheme',
      display: "select",
      values: [
        {"Default": "default"},
        {"Cool": "cool"},
        {"Warm": "warm"}
      ],
      default: 'default'
    },
    selected_measure: {
        type: 'string',
        hidden: true
    }
  },

  // --- Create Method ---
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .bar-chart-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: 'Google Sans', 'Noto Sans', 'Noto Sans JP', 'Noto Sans CJK KR', 'Noto Sans Arabic UI', 'Noto Sans Devanagari UI', 'Noto Sans Hebrew UI', 'Noto Sans Thai UI', 'Helvetica', 'Arial', sans-serif;
        }
        .bar-chart-title {
          font-size: 18px;
          font-weight: 500;
          text-align: center;
          margin-bottom: 10px;
        }
        .controls {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
        }
        .measure-select {
          padding: 5px;
          border-radius: 5px;
          border: 1px solid #ccc;
          background-color: white;
        }
        .chart-container {
          flex-grow: 1;
          position: relative;
        }
      </style>
      <div class="bar-chart-container">
        <div class="bar-chart-title"></div>
        <div class="controls"></div>
        <div class="chart-container">
          <canvas id="myChart"></canvas>
        </div>
      </div>
    `;
    this._chart = null;
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();

    if (queryResponse.fields.dimensions.length == 0) {
      this.addError({ title: "No Dimensions", message: "This chart requires one dimension." });
      return;
    }

    if (queryResponse.fields.measures.length < 1) {
      this.addError({
        title: "No Measures",
        message: "This visualization requires at least one measure."
      });
      return;
    }

    const titleElement = element.querySelector('.bar-chart-title');
    titleElement.textContent = config.title || queryResponse.fields.measures[0].view_label;

    const measures = queryResponse.fields.measures;

    const colorSchemes = {
      default: ['#1A73E8', '#4285F4', '#8AB4F8', '#AECBFA', '#C6DAFC'],
      cool: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9AA0A6'],
      warm: ['#EA4335', '#FBBC05', '#FF8F00', '#E53935', '#FDD835']
    };

    const controls = element.querySelector('.controls');
    controls.innerHTML = '';

    if (!config.selected_measure) {
      config.selected_measure = measures[0].name;
    }

    const select = document.createElement('select');
    select.className = 'measure-select';
    measures.forEach(measure => {
      const option = document.createElement('option');
      option.value = measure.name;
      option.textContent = measure.label;
      if (measure.name === config.selected_measure) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', () => {
      this.trigger('updateConfig', [{ selected_measure: select.value }]);
    });

    controls.appendChild(select);

    if (queryResponse.fields.dimensions.length === 2) {
      // Two dimensions logic
      const dimension1 = queryResponse.fields.dimensions[0];
      const dimension2 = queryResponse.fields.dimensions[1];
      const measure = measures.find(m => m.name === config.selected_measure) || measures[0];

      const labels = [...new Set(data.map(row => row[dimension1.name].value))];
      const dimension2Values = [...new Set(data.map(row => row[dimension2.name].value))];

      const datasets = dimension2Values.map((dim2Value, i) => {
        const dataForDataset = labels.map(label => {
          const row = data.find(d => d[dimension1.name].value === label && d[dimension2.name].value === dim2Value);
          return row ? row[measure.name].value : null;
        });
        return {
          label: dim2Value,
          data: dataForDataset,
          backgroundColor: (colorSchemes[config.color_scheme] || colorSchemes['default'])[i % (colorSchemes[config.color_scheme] || colorSchemes['default']).length]
        };
      });

      const ctx = element.querySelector('#myChart').getContext('2d');

      if (this._chart) {
        this._chart.destroy();
      }

      this._chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: config.chart_type === 'stacked',
            },
            y: {
              stacked: config.chart_type === 'stacked',
              beginAtZero: true
            }
          }
        }
      });

    } else {
      // One dimension logic
      const dimension = queryResponse.fields.dimensions[0];
      const labels = data.map(row => row[dimension.name].value);
      const selectedMeasure = measures.find(m => m.name === config.selected_measure) || measures[0];

      const datasets = [{
        label: selectedMeasure.label,
        data: data.map(row => row[selectedMeasure.name].value),
        backgroundColor: (colorSchemes[config.color_scheme] || colorSchemes['default'])[0],
      }];

      const ctx = element.querySelector('#myChart').getContext('2d');

      if (this._chart) {
        this._chart.destroy();
      }

      this._chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: config.chart_type === 'stacked',
            },
            y: {
              stacked: config.chart_type === 'stacked',
              beginAtZero: true
            }
          }
        }
      });
    }

    done();
  }
});
