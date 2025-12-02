/**
 * Image Color Extractor
 * Extracts dominant color from an image using color quantization
 */

/**
 * Get dominant color from an image element
 * Uses color quantization and mode (most frequent color)
 * @param {HTMLImageElement} imageElement
 * @returns {{r: number, g: number, b: number, hex: string}}
 */
export function getDominantColor(imageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Resize to optimize performance (smaller = faster)
  const maxSize = 150;
  const ratio = Math.min(
    maxSize / imageElement.width,
    maxSize / imageElement.height
  );
  canvas.width = imageElement.width * ratio;
  canvas.height = imageElement.height * ratio;

  // Draw image on canvas
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Color quantization: reduce colors to buckets
  const colorCounts = {};
  const quantizationFactor = 10; // Group similar colors (higher = more grouping)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];

    // Skip transparent pixels
    if (alpha < 125) continue;

    // Quantize color (round to nearest bucket)
    const qr = Math.round(r / quantizationFactor) * quantizationFactor;
    const qg = Math.round(g / quantizationFactor) * quantizationFactor;
    const qb = Math.round(b / quantizationFactor) * quantizationFactor;

    // Create color key
    const colorKey = `${qr},${qg},${qb}`;

    // Count occurrences
    if (colorCounts[colorKey]) {
      colorCounts[colorKey].count++;
      // Accumulate actual values for averaging within bucket
      colorCounts[colorKey].r += r;
      colorCounts[colorKey].g += g;
      colorCounts[colorKey].b += b;
    } else {
      colorCounts[colorKey] = { count: 1, r, g, b };
    }
  }

  // Find the most frequent color (mode)
  let maxCount = 0;
  let dominantColor = null;

  for (const colorKey in colorCounts) {
    const colorData = colorCounts[colorKey];

    // Skip very dark or very light colors (likely background)
    const avgR = colorData.r / colorData.count;
    const avgG = colorData.g / colorData.count;
    const avgB = colorData.b / colorData.count;
    const brightness = (avgR + avgG + avgB) / 3;

    // Skip colors that are too dark (< 20) or too light (> 235)
    if (brightness < 20 || brightness > 235) continue;

    if (colorData.count > maxCount) {
      maxCount = colorData.count;
      dominantColor = {
        r: Math.round(avgR),
        g: Math.round(avgG),
        b: Math.round(avgB),
      };
    }
  }

  // Fallback to average if no suitable color found
  if (!dominantColor) {
    let r = 0,
      g = 0,
      b = 0,
      count = 0;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 125) continue; // Skip transparent
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    dominantColor = {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count),
    };
  }

  // Convert to hex
  const hex = rgbToHex(dominantColor.r, dominantColor.g, dominantColor.b);

  return { ...dominantColor, hex };
}

/**
 * Convert RGB to hex
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}
