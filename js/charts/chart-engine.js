/**
 * PORTFOLIO CRASH THEATRE — NATIVE CANVAS FINANCIAL CHART ENGINE
 * High-performance, zero-dependency HTML5 Canvas rendering for trading charts, allocations, and stress visualizers.
 */

export class ChartEngine {
  /**
   * Initialize canvas with proper device pixel ratio for crystal clear rendering on retina/high-DPI screens
   */
  static setupCanvas(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set display size
    const width = rect.width || canvas.parentElement?.clientWidth || 400;
    const height = rect.height || canvas.parentElement?.clientHeight || 250;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    return { ctx, width, height };
  }

  /**
   * Render Multi-Line / Area Financial Trajectory Chart
   */
  static renderLineChart(canvas, options) {
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const {
      labels = [],
      series = [], // [{ name, color, data: [], isBaseline: false }]
      showArea = true,
      yAxisPrefix = '$',
      yAxisDecimals = 0,
      zeroLine = false,
      fillUnderZero = false,
    } = options;

    if (series.length === 0 || series[0].data.length === 0) {
      this._renderEmptyState(ctx, width, height, 'No data points available');
      return;
    }

    // Chart padding
    const padLeft = 65;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Find min and max across all series
    let minY = Infinity;
    let maxY = -Infinity;

    for (const s of series) {
      for (const val of s.data) {
        if (!isNaN(val)) {
          if (val < minY) minY = val;
          if (val > maxY) maxY = val;
        }
      }
    }

    if (zeroLine) {
      if (minY > 0) minY = 0;
      if (maxY < 0) maxY = 0;
    }

    // Add 8% buffer top and bottom
    const yRange = (maxY - minY) || 1;
    minY -= yRange * 0.05;
    maxY += yRange * 0.05;

    // Coordinate mapping functions
    const getX = index => padLeft + (index / Math.max(labels.length - 1, 1)) * plotW;
    const getY = val => padTop + plotH - ((val - minY) / (maxY - minY)) * plotH;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw horizontal grid lines & Y labels
    const gridLines = 5;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const val = minY + (i / gridLines) * (maxY - minY);
      const yPos = getY(val);

      // Grid line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(width - padRight, yPos);
      ctx.stroke();

      // Y-axis Label
      ctx.fillStyle = '#5F6575';
      let formattedVal = val.toLocaleString('en-US', { maximumFractionDigits: yAxisDecimals });
      ctx.fillText(`${yAxisPrefix}${formattedVal}`, padLeft - 8, yPos);
    }

    // Zero line if applicable
    if (minY <= 0 && maxY >= 0) {
      const zeroY = getY(0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, zeroY);
      ctx.lineTo(width - padRight, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw series
    series.forEach(s => {
      if (s.data.length === 0) return;

      const color = s.color || '#F4B942';

      // Fill area under curve if requested
      if (showArea) {
        ctx.beginPath();
        const baseZeroY = fillUnderZero && minY <= 0 ? getY(0) : getY(minY);
        ctx.moveTo(getX(0), baseZeroY);

        for (let i = 0; i < s.data.length; i++) {
          ctx.lineTo(getX(i), getY(s.data[i]));
        }

        ctx.lineTo(getX(s.data.length - 1), baseZeroY);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
        grad.addColorStop(0, color.replace(')', ', 0.25)').replace('rgb', 'rgba'));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw stroke curve
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = s.isBaseline ? 1.5 : 2.5;
      if (s.isBaseline) ctx.setLineDash([3, 3]);
      else ctx.setLineDash([]);

      for (let i = 0; i < s.data.length; i++) {
        const x = getX(i);
        const y = getY(s.data[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw glowing end dot on active point
      if (s.data.length > 0) {
        const lastIdx = s.data.length - 1;
        const lastX = getX(lastIdx);
        const lastY = getY(s.data[lastIdx]);

        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // Draw X labels (sample every few steps to avoid clutter)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#5F6575';
    const labelStep = Math.max(1, Math.floor(labels.length / 6));

    for (let i = 0; i < labels.length; i += labelStep) {
      const xPos = getX(i);
      ctx.fillText(labels[i] || '', xPos, height - padBottom + 8);
    }
  }

  /**
   * Render Donut Chart for Asset/Sector Allocation
   */
  static renderDonutChart(canvas, segments = []) {
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    if (!segments || segments.length === 0) {
      this._renderEmptyState(ctx, width, height, 'No allocations defined');
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const centerX = width * 0.35;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 15;
    const innerRadius = outerRadius * 0.65;

    const totalVal = segments.reduce((sum, s) => sum + s.value, 0);
    if (totalVal <= 0) return;

    let startAngle = -Math.PI / 2;

    // Palette for donut slices
    const defaultColors = [
      '#F4B942', '#38BDF8', '#22C55E', '#A855F7', '#EC4899', '#EF4444', '#F59E0B', '#14B8A6', '#6366F1'
    ];

    segments.forEach((seg, idx) => {
      const sliceAngle = (seg.value / totalVal) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const color = seg.color || defaultColors[idx % defaultColors.length];

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#090A0D';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center text summary
    ctx.font = '700 13px "Inter", sans-serif';
    ctx.fillStyle = '#F5F5F5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${segments.length} Assets`, centerX, centerY - 6);

    ctx.font = '10px "Inter", sans-serif';
    ctx.fillStyle = '#5F6575';
    ctx.fillText('Allocated', centerX, centerY + 10);

    // Legend on the right side
    const legendX = width * 0.68;
    const legendStartY = Math.max(20, (height - segments.length * 20) / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    segments.slice(0, 7).forEach((seg, idx) => {
      const y = legendStartY + idx * 22;
      const color = seg.color || defaultColors[idx % defaultColors.length];
      const pct = ((seg.value / totalVal) * 100).toFixed(1);

      // Color swatch dot
      ctx.beginPath();
      ctx.arc(legendX, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label & percentage
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillStyle = '#9298A5';
      const label = seg.label.length > 12 ? seg.label.substr(0, 11) + '…' : seg.label;
      ctx.fillText(label, legendX + 10, y);

      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F5F5F5';
      ctx.fillText(`${pct}%`, legendX + 115, y);
    });
  }

  /**
   * Render Horizontal Bar Chart for Sector Concentrations
   */
  static renderBarChart(canvas, items = []) {
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    if (!items || items.length === 0) {
      this._renderEmptyState(ctx, width, height, 'No sector data');
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const padLeft = 110;
    const padRight = 60;
    const padTop = 15;
    const padBottom = 15;

    const plotW = width - padLeft - padRight;
    const totalBars = Math.min(items.length, 6);
    const rowH = (height - padTop - padBottom) / totalBars;
    const barH = Math.min(18, rowH * 0.6);

    const maxVal = Math.max(...items.map(i => i.value), 1);

    items.slice(0, totalBars).forEach((item, idx) => {
      const y = padTop + idx * rowH + (rowH - barH) / 2;
      const barW = (item.value / maxVal) * plotW;

      // Sector label
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillStyle = '#9298A5';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, padLeft - 10, y + barH / 2);

      // Background track
      ctx.fillStyle = '#171A21';
      ctx.beginPath();
      ctx.roundRect?.(padLeft, y, plotW, barH, 4) || ctx.rect(padLeft, y, plotW, barH);
      ctx.fill();

      // Active colored bar
      ctx.fillStyle = item.color || '#F4B942';
      ctx.beginPath();
      ctx.roundRect?.(padLeft, y, Math.max(barW, 4), barH, 4) || ctx.rect(padLeft, y, Math.max(barW, 4), barH);
      ctx.fill();

      // Percentage label on right
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F5F5F5';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.value.toFixed(1)}%`, padLeft + barW + 8, y + barH / 2);
    });
  }

  /**
   * Helper to draw empty state message in canvas
   */
  static _renderEmptyState(ctx, width, height, msg) {
    ctx.clearRect(0, 0, width, height);
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = '#5F6575';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(msg, width / 2, height / 2);
  }
}
