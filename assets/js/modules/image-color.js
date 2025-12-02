/**
 * Image Color Extractor
 * Extracts dominant color from an image
 */

/**
 * Get dominant color from an image element
 * @param {HTMLImageElement} imageElement
 * @returns {{r: number, g: number, b: number, hex: string}}
 */
export function getDominantColor(imageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Resize to optimize performance (smaller = faster)
  const maxSize = 100;
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

  // Calculate average color (simple method)
  let r = 0,
    g = 0,
    b = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    // Skip alpha channel (data[i + 3])
  }

  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  // Convert to hex
  const hex = rgbToHex(r, g, b);

  return { r, g, b, hex };
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
