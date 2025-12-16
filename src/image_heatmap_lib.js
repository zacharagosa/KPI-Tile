
import h337 from 'heatmap.js';

looker.plugins.visualizations.add({
    // Id and Label
    id: "image_heatmap_lib",
    label: "Image Heatmap (Library)",

    // Options
    options: {
        imageUrl: {
            type: "string",
            label: "Image URL",
            display: "text",
            default: "https://raw.githubusercontent.com/zacharagosa/KPI-Tile/main/map_background.png",
            section: "Data"
        },
        coordinateMode: {
            type: "string",
            label: "Coordinate Mode",
            values: [
                { "Pixels": "pixels" },
                { "Percent": "percent" }
            ],
            display: "select",
            default: "percent",
            section: "Data"
        },
        colorGradient: {
            type: "string",
            label: "Color Gradient",
            values: [
                { "Classic": "classic" },
                { "Fire": "fire" },
                { "Blue/Green": "cool" }
            ],
            display: "select",
            default: "classic",
            section: "Style"
        },
        radius: {
            type: "number",
            label: "Point Radius",
            default: 20,
            display: "range",
            min: 1,
            max: 100,
            section: "Style"
        },
        blur: {
            type: "number",
            label: "Blur",
            default: 0.85,
            display: "range",
            min: 0,
            max: 1,
            step: 0.05,
            section: "Style"
        },
        opacity: {
            type: "number",
            label: "Heatmap Opacity",
            default: 0.6,
            display: "range",
            min: 0,
            max: 1,
            step: 0.1,
            section: "Style"
        }
    },

    // Set up the initial state of the visualization
    create: function (element, config) {
        // Create a container for the visualization
        this.container = element.appendChild(document.createElement("div"));
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.position = "relative";
        this.container.style.overflow = "hidden";
        this.container.style.display = "flex";
        this.container.style.justifyContent = "center";
        this.container.style.alignItems = "center";

        // Image element
        this.img = document.createElement('img');
        this.img.style.position = 'absolute';
        this.img.style.top = '0';
        this.img.style.left = '0';
        // We will control size in update
        this.container.appendChild(this.img);

        // Heatmap wrapper - heatmap.js appends a canvas here
        this.heatmapWrapper = document.createElement('div');
        this.heatmapWrapper.style.position = 'absolute';
        this.heatmapWrapper.style.top = '0';
        this.heatmapWrapper.style.left = '0';
        this.container.appendChild(this.heatmapWrapper);

        // Internal state
        this._heatmapInstance = null;
        this._imgLoaded = false;
        this.img.crossOrigin = "Anonymous";
        this.img.onload = () => {
            this._imgLoaded = true;
            this.frameUpdate();
        };

        // Gradient definitions compatible with heatmap.js (0...1 : color)
        this.gradients = {
            classic: { '.5': 'blue', '.8': 'red', '.95': 'white' },
            fire: { '.4': 'black', '.6': 'darkred', '.8': 'red', '.95': 'orange', '1': 'white' },
            cool: { '.4': 'white', '.6': 'cyan', '.8': 'blue', '.9': 'indigo', '1': 'black' }
        };
    },

    frameUpdate: function () {
        if (this._lastArgs) {
            this.updateAsync(...this._lastArgs);
        }
    },

    // Render in response to the data or settings changing
    updateAsync: function (data, element, config, queryResponse, details, done) {
        this._lastArgs = [data, element, config, queryResponse, details, done];
        this.clearErrors();

        // 1. Validate Configuration
        const imageUrl = config.imageUrl;
        if (!imageUrl) {
            this.addError({ title: "Missing Image", message: "Please provide an Image URL in the options." });
            return;
        }

        if (this.img.src !== imageUrl) {
            this._imgLoaded = false;
            this.img.src = imageUrl;
            return;
        }

        if (!this._imgLoaded) return;

        // 2. Validate Data
        const dimensions = queryResponse.fields.dimensions;
        const measures = queryResponse.fields.measures;

        if (dimensions.length < 2) {
            this.addError({ title: "Insufficient Dimensions", message: "This chart requires 2 dimensions (X, Y)." });
            return;
        }
        if (measures.length < 1) {
            this.addError({ title: "Insufficient Measures", message: "This chart requires 1 measure (Intensity)." });
            return;
        }

        const xKey = dimensions[0].name;
        const yKey = dimensions[1].name;
        const heatKey = measures[0].name;

        // 3. Size Calculation
        const rect = element.getBoundingClientRect();
        const containerWidth = rect.width;
        const containerHeight = rect.height;
        const imgRatio = this.img.naturalWidth / this.img.naturalHeight;
        const containerRatio = containerWidth / containerHeight;

        let renderW, renderH;

        if (containerRatio > imgRatio) {
            renderH = containerHeight;
            renderW = renderH * imgRatio;
        } else {
            renderW = containerWidth;
            renderH = renderW / imgRatio;
        }

        // Apply sizes
        this.img.width = renderW;
        this.img.height = renderH;
        this.img.style.width = `${renderW}px`;
        this.img.style.height = `${renderH}px`;

        this.heatmapWrapper.style.width = `${renderW}px`;
        this.heatmapWrapper.style.height = `${renderH}px`;

        // 4. Initialize or Update Heatmap Instance
        // We recreate if container size changes significantly or isn't there
        // heatmap.js is a bit finicky with resizing, safest to clear and recreate if easier, 
        // strictly it has .configure() but not for container size changes usually.
        // Let's try to reuse or check dom.

        // Remove old instance if exists to be safe/clean for resizing
        // (Performance note: purely recreating might be heavy but reliable for resizing)
        this.heatmapWrapper.innerHTML = '';

        this._heatmapInstance = h337.create({
            container: this.heatmapWrapper,
            radius: config.radius || 20,
            maxOpacity: config.opacity || 0.6,
            minOpacity: 0,
            blur: config.blur || 0.85,
            gradient: this.gradients[config.colorGradient] || this.gradients.classic
        });

        // 5. Process Data
        const points = [];
        let maxVal = 0;

        data.forEach(row => {
            let xVal = row[xKey].value;
            let yVal = row[yKey].value;
            let heatVal = row[heatKey].value;

            if (xVal == null || yVal == null) return;
            if (heatVal > maxVal) maxVal = heatVal;

            let x, y;
            if (config.coordinateMode === 'percent') {
                x = (xVal / 100) * renderW;
                y = (yVal / 100) * renderH;
            } else {
                const scaleX = renderW / this.img.naturalWidth;
                const scaleY = renderH / this.img.naturalHeight;
                x = xVal * scaleX;
                y = yVal * scaleY;
            }

            points.push({
                x: Math.round(x),
                y: Math.round(y),
                value: heatVal
            });
        });

        // 6. Render
        this._heatmapInstance.setData({
            max: maxVal,
            data: points
        });

        done();
    }
});
