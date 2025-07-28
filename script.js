class LangtonsAnt {
  constructor() {
    this.canvas = document.getElementById("antCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.gridSize = 100;
    this.cellSize = 6;
    this.isRunning = false;
    this.intervalId = null;
    this.speed = 50;
    this.stepCount = 0;
    this.colorScheme = "classic";

    // Initialize grid and ant
    this.initializeGrid();
    this.initializeAnt();
    this.initializeCanvas();
    this.setupEventListeners();
    this.updateStats();
    this.draw();
  }

  initializeGrid() {
    this.grid = [];
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = 0; // 0 = white, 1 = black
      }
    }
  }

  initializeAnt() {
    this.ant = {
      x: Math.floor(this.gridSize / 2),
      y: Math.floor(this.gridSize / 2),
      direction: 0, // 0=North, 1=East, 2=South, 3=West
    };
  }

  initializeCanvas() {
    this.canvas.width = this.gridSize * this.cellSize;
    this.canvas.height = this.gridSize * this.cellSize;
    this.ctx.imageSmoothingEnabled = false;
  }

  setupEventListeners() {
    // Control buttons
    document
      .getElementById("startBtn")
      .addEventListener("click", () => this.start());
    document
      .getElementById("pauseBtn")
      .addEventListener("click", () => this.pause());
    document
      .getElementById("resetBtn")
      .addEventListener("click", () => this.reset());
    document
      .getElementById("stepBtn")
      .addEventListener("click", () => this.step());

    // Speed slider
    const speedSlider = document.getElementById("speedSlider");
    speedSlider.addEventListener("input", (e) => {
      this.speed = 101 - parseInt(e.target.value);
      document.getElementById("speedValue").textContent = this.speed + "ms";
      if (this.isRunning) {
        this.pause();
        this.start();
      }
    });

    // Color scheme selector
    document.getElementById("colorScheme").addEventListener("change", (e) => {
      this.colorScheme = e.target.value;
      this.draw();
    });

    // Canvas click to toggle cells
    this.canvas.addEventListener("click", (e) => {
      if (!this.isRunning) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);

        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
          this.grid[y][x] = 1 - this.grid[y][x];
          this.draw();
          this.updateStats();
        }
      }
    });
  }

  getColorForCell(value, x, y) {
    switch (this.colorScheme) {
      case "classic":
        return value === 0 ? "#f5f5f5" : "#1a1a1a";

      case "retro":
        return value === 0 ? "#8fbc8f" : "#0a2e0a";

      default:
        return value === 0 ? "#f5f5f5" : "#1a1a1a";
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#0a0a0a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const color = this.getColorForCell(this.grid[y][x], x, y);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
          x * this.cellSize,
          y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      }
    }

    // Draw ant
    this.drawAnt();
  }

  drawAnt() {
    const centerX = this.ant.x * this.cellSize + this.cellSize / 2;
    const centerY = this.ant.y * this.cellSize + this.cellSize / 2;

    // Draw ant body
    this.ctx.fillStyle = "#e74c3c";
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.cellSize * 0.3, 0, 2 * Math.PI);
    this.ctx.fill();

    // Draw direction indicator
    this.ctx.strokeStyle = "#c0392b";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";

    const size = this.cellSize * 0.25;
    let endX, endY;

    switch (this.ant.direction) {
      case 0: // North
        endX = centerX;
        endY = centerY - size;
        break;
      case 1: // East
        endX = centerX + size;
        endY = centerY;
        break;
      case 2: // South
        endX = centerX;
        endY = centerY + size;
        break;
      case 3: // West
        endX = centerX - size;
        endY = centerY;
        break;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Draw ant outline
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.cellSize * 0.3, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  step() {
    const currentCell = this.grid[this.ant.y][this.ant.x];

    // Apply Langton's Ant rules
    if (currentCell === 0) {
      // White cell: turn right and make black
      this.ant.direction = (this.ant.direction + 1) % 4;
      this.grid[this.ant.y][this.ant.x] = 1;
    } else {
      // Black cell: turn left and make white
      this.ant.direction = (this.ant.direction + 3) % 4;
      this.grid[this.ant.y][this.ant.x] = 0;
    }

    // Move ant forward
    switch (this.ant.direction) {
      case 0: // North
        this.ant.y = (this.ant.y - 1 + this.gridSize) % this.gridSize;
        break;
      case 1: // East
        this.ant.x = (this.ant.x + 1) % this.gridSize;
        break;
      case 2: // South
        this.ant.y = (this.ant.y + 1) % this.gridSize;
        break;
      case 3: // West
        this.ant.x = (this.ant.x - 1 + this.gridSize) % this.gridSize;
        break;
    }

    this.stepCount++;
    this.updateStats();
    this.draw();
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.intervalId = setInterval(() => this.step(), this.speed);

      document.getElementById("startBtn").disabled = true;
      document.getElementById("pauseBtn").disabled = false;
      document.getElementById("stepBtn").disabled = true;
      document.getElementById("resetBtn").disabled = false;
    }
  }

  pause() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.intervalId);

      document.getElementById("startBtn").disabled = false;
      document.getElementById("pauseBtn").disabled = true;
      document.getElementById("stepBtn").disabled = false;
      document.getElementById("resetBtn").disabled = false;
    }
  }

  reset() {
    this.pause();
    this.stepCount = 0;
    this.initializeGrid();
    this.initializeAnt();
    this.initializeCanvas();
    this.updateStats();
    this.draw();

    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("stepBtn").disabled = false;
    document.getElementById("resetBtn").disabled = false;
  }

  updateStats() {
    document.getElementById("stepCount").textContent =
      this.stepCount.toLocaleString();
    document.getElementById(
      "antPosition"
    ).textContent = `(${this.ant.x}, ${this.ant.y})`;

    const directions = ["North", "East", "South", "West"];
    document.getElementById("antDirection").textContent =
      directions[this.ant.direction];

    // Count black cells
    let blackCells = 0;
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x] === 1) {
          blackCells++;
        }
      }
    }
    document.getElementById("blackCells").textContent =
      blackCells.toLocaleString();
  }

  // Method to save the current state as an image
  saveAsImage() {
    const link = document.createElement("a");
    link.download = `langtons-ant-step-${this.stepCount}.png`;
    link.href = this.canvas.toDataURL();
    link.click();
  }
}

// Initialize the simulation when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const ant = new LangtonsAnt();

  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case " ": // Spacebar
        e.preventDefault();
        if (ant.isRunning) {
          ant.pause();
        } else {
          ant.start();
        }
        break;
      case "r":
      case "R":
        ant.reset();
        break;
      case "s":
      case "S":
        if (!ant.isRunning) {
          ant.step();
        }
        break;
      case "i":
      case "I":
        ant.saveAsImage();
        break;
    }
  });

  // Add some visual feedback for keyboard shortcuts
  const shortcutInfo = document.createElement("div");
  shortcutInfo.style.position = "fixed";
  shortcutInfo.style.bottom = "20px";
  shortcutInfo.style.left = "20px";
  shortcutInfo.style.background = "rgba(5, 5, 5, 0.95)";
  shortcutInfo.style.color = "#c0c0c0";
  shortcutInfo.style.padding = "16px 20px";
  shortcutInfo.style.borderRadius = "12px";
  shortcutInfo.style.fontSize = "12px";
  shortcutInfo.style.zIndex = "9999";
  shortcutInfo.style.border = "2px solid #333";
  shortcutInfo.style.boxShadow = "0 8px 32px rgba(0,0,0,0.8)";
  shortcutInfo.style.fontFamily = "'Courier New', monospace";
  shortcutInfo.style.backdropFilter = "blur(10px)";
  shortcutInfo.style.minWidth = "200px";
  shortcutInfo.style.lineHeight = "1.6";

  shortcutInfo.innerHTML = `
        <div style="margin-bottom: 8px;">
            <strong style="color: #00ff41; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">⌨ Keyboard Shortcuts</strong>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <kbd style="background: linear-gradient(135deg, #1a1a1a, #0a0a0a); padding: 4px 8px; border-radius: 6px; border: 1px solid #444; color: #00ff41; font-size: 11px; min-width: 50px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">SPACE</kbd>
                <span style="color: #c0c0c0;">Start/Pause</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <kbd style="background: linear-gradient(135deg, #1a1a1a, #0a0a0a); padding: 4px 8px; border-radius: 6px; border: 1px solid #444; color: #00d4ff; font-size: 11px; min-width: 50px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">S</kbd>
                <span style="color: #c0c0c0;">Single Step</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <kbd style="background: linear-gradient(135deg, #1a1a1a, #0a0a0a); padding: 4px 8px; border-radius: 6px; border: 1px solid #444; color: #ff073a; font-size: 11px; min-width: 50px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">R</kbd>
                <span style="color: #c0c0c0;">Reset Grid</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <kbd style="background: linear-gradient(135deg, #1a1a1a, #0a0a0a); padding: 4px 8px; border-radius: 6px; border: 1px solid #444; color: #ff9500; font-size: 11px; min-width: 50px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">I</kbd>
                <span style="color: #c0c0c0;">Save Image</span>
            </div>
        </div>
    `;
  document.body.appendChild(shortcutInfo);

  // Auto-hide shortcuts after 5 seconds
  setTimeout(() => {
    shortcutInfo.style.opacity = "0.3";
    shortcutInfo.style.transition = "opacity 0.5s ease";
  }, 5000);

  // Show shortcuts on hover
  shortcutInfo.addEventListener("mouseenter", () => {
    shortcutInfo.style.opacity = "1";
  });

  shortcutInfo.addEventListener("mouseleave", () => {
    shortcutInfo.style.opacity = "0.3";
  });
});
