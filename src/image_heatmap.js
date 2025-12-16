looker.plugins.visualizations.add({
    // Id and Label
    id: "image_heatmap",
    label: "Image Heatmap",

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
            default: 15,
            display: "range",
            min: 0,
            max: 50,
            section: "Style"
        },
        opacity: {
            type: "number",
            label: "Heatmap Opacity",
            default: 0.7,
            display: "range",
            min: 0,
            max: 1,
            step: 0.1,
            section: "Style"
        },
        showGrid: {
            type: "boolean",
            label: "Show Grid",
            default: false,
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

        // Create a canvas for the heat map
        this.canvas = document.createElement("canvas");
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";
        this.container.appendChild(this.canvas);

        // Internal state for image loading
        this._img = new Image();
        this._imgLoaded = false;
        this._img.crossOrigin = "Anonymous";
        this._img.onload = () => {
            this._imgLoaded = true;
            this.frameUpdate();
        };

        // Gradient definitions
        this.gradients = {
            classic: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' },
            fire: { 0.4: 'black', 0.6: 'darkred', 0.8: 'red', 0.95: 'orange', 1.0: 'white' },
            cool: { 0.4: 'white', 0.6: 'cyan', 0.8: 'blue', 0.9: 'indigo', 1.0: 'black' } // inverted idea?
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

        if (this._img.src !== imageUrl) {
            this._imgLoaded = false;
            this._img.src = imageUrl;
            // The onload handler will trigger a re-render
            return;
        }

        if (!this._imgLoaded) {
            // Wait for load
            return;
        }

        // 2. Validate Data
        // We expect 2 dimensions (x, y) and 1 measure (intensity)
        // Or 1 dim (coords) and measuring (intensity)?
        // Let's assume standard usage: Dim 1 (X), Dim 2 (Y), Measure 1 (Heat)
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

        // 3. Prepare Canvas
        // We want to fit the image inside the element, maintaining aspect ratio.
        const rect = element.getBoundingClientRect();
        const containerWidth = rect.width;
        const containerHeight = rect.height;

        // Calculate aspect ratios
        const imgRatio = this._img.width / this._img.height;
        const containerRatio = containerWidth / containerHeight;

        let renderW, renderH;

        if (containerRatio > imgRatio) {
            // Container is wider than image -> fit by height
            renderH = containerHeight;
            renderW = renderH * imgRatio;
        } else {
            // Container is taller than image -> fit by width
            renderW = containerWidth;
            renderH = renderW / imgRatio;
        }

        // Set canvas size
        // Note: We use high DPI scaling if needed, but for now 1:1 map
        this.canvas.width = renderW;
        this.canvas.height = renderH;

        // Position canvas to center (handled by flex parent, but ensure specific size)
        this.canvas.style.width = `${renderW}px`;
        this.canvas.style.height = `${renderH}px`;

        const ctx = this.canvas.getContext("2d");

        // 4. Draw Background
        ctx.drawImage(this._img, 0, 0, renderW, renderH);

        // 5. Draw Heatmap
        // We'll generate a "shadow" canvas for the gradients to mix the colors properly
        // Step A: Draw black/white alpha circles
        const heatCanvas = document.createElement('canvas');
        heatCanvas.width = renderW;
        heatCanvas.height = renderH;
        const heatCtx = heatCanvas.getContext('2d');

        const radius = config.radius || 20;
        const blur = config.blur || 15;
        const maxValue = Math.max(...data.map(d => d[heatKey].value || 0)); // Find max for normalization

        // Pre-create the gradient brush
        // Helper to draw a point
        const drawPoint = (x, y, value) => {
            // Normalize value 0-1
            const intensity = maxValue > 0 ? (value / maxValue) : 0;

            heatCtx.globalAlpha = Math.max(0.05, intensity); // Min opacity to show something? Or just pure intensity
            heatCtx.beginPath();

            // Gradient for the point
            const r = radius + blur;
            const grad = heatCtx.createRadialGradient(x, y, radius - blur > 0 ? radius - blur : 0, x, y, r);
            grad.addColorStop(0, 'rgba(0,0,0,1)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            heatCtx.fillStyle = grad;
            heatCtx.arc(x, y, r, 0, 2 * Math.PI);
            heatCtx.fill();
        };

        data.forEach(row => {
            let xVal = row[xKey].value;
            let yVal = row[yKey].value;
            let heatVal = row[heatKey].value;

            if (xVal == null || yVal == null) return;

            let x, y;

            if (config.coordinateMode === 'percent') {
                // Assume input is 0-100 or 0-1? Let's detect?
                // Safer to assume 0-100 as it's more human friendly in SQL usually, but let's check max
                // If user provides 0.5, treat as 0.5%. Wait, no.
                // Let's assume standard behavior: strict 0-100 range for 'percent'.
                x = (xVal / 100) * renderW;
                y = (yVal / 100) * renderH;
            } else {
                // Pixel mode - scale relative to original image size? or just raw pixels?
                // If usage says "pixels", it likely means coordinates on the *original* image.
                const scaleX = renderW / this._img.width;
                const scaleY = renderH / this._img.height;
                x = xVal * scaleX;
                y = yVal * scaleY;
            }

            drawPoint(x, y, heatVal);
        });

        // Step B: Colorize
        // Create color palette
        const gradientConfig = this.gradients[config.colorGradient] || this.gradients.classic;
        const paletteCanvas = document.createElement('canvas');
        paletteCanvas.width = 256;
        paletteCanvas.height = 1;
        const paletteCtx = paletteCanvas.getContext('2d');
        const lineGrad = paletteCtx.createLinearGradient(0, 0, 256, 1);

        for (const key in gradientConfig) {
            lineGrad.addColorStop(parseFloat(key), gradientConfig[key]);
        }
        paletteCtx.fillStyle = lineGrad;
        paletteCtx.fillRect(0, 0, 256, 1);
        const paletteData = paletteCtx.getImageData(0, 0, 256, 1).data;

        // Read the grayscale heatmap
        const heatData = heatCtx.getImageData(0, 0, renderW, renderH);
        const pixels = heatData.data;

        // Map opacity (alpha) to colors
        for (let i = 0; i < pixels.length; i += 4) {
            const alpha = pixels[i + 3]; // The alpha channel holds our "intensity" map from the black radial gradients
            if (alpha > 0) {
                const offset = alpha * 4;
                pixels[i] = paletteData[offset];     // R
                pixels[i + 1] = paletteData[offset + 1]; // G
                pixels[i + 2] = paletteData[offset + 2]; // B
                // Adjust final alpha
                pixels[i + 3] = (config.opacity || 0.7) * 255;
                if (alpha < 10) pixels[i + 3] = 0; // Cutoff for cleanliness
            }
        }

        // Put colored data back into the temporary heat canvas
        heatCtx.putImageData(heatData, 0, 0);

        // Draw the heatmap layer onto the main canvas (over the background image)
        ctx.drawImage(heatCanvas, 0, 0);

        // 6. Draw Grid (Optional)
        if (config.showGrid) {
            ctx.strokeStyle = "rgba(128, 128, 128, 0.5)"; // Semi-transparent gray
            ctx.lineWidth = 1;
            ctx.font = "10px sans-serif";
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const gridSize = 10; // 10x10 grid

            // Draw vertical lines
            for (let i = 0; i <= 100; i += gridSize) {
                const x = (i / 100) * renderW;

                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, renderH);
                ctx.stroke();

                // Label X axis
                if (i > 0 && i < 100) {
                    ctx.fillText(i, x, 10);
                }
            }

            // Draw horizontal lines
            for (let i = 0; i <= 100; i += gridSize) {
                const y = (i / 100) * renderH;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(renderW, y);
                ctx.stroke();

                // Label Y axis
                if (i > 0 && i < 100) {
                    ctx.fillText(i, 10, y);
                }
            }
        }

        done();
    }
});

