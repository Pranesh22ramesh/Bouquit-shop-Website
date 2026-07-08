const colors = [
  { name: "Red", rgb: [255, 0, 0] },
  { name: "Green", rgb: [0, 255, 0] },
  { name: "Blue", rgb: [0, 0, 255] },
  { name: "White", rgb: [255, 255, 255] },
  { name: "Black", rgb: [0, 0, 0] },
  { name: "Yellow", rgb: [255, 255, 0] },
  { name: "Pink", rgb: [255, 192, 203] },
  { name: "Orange", rgb: [255, 165, 0] },
  { name: "Purple", rgb: [128, 0, 128] },
  { name: "Brown", rgb: [165, 42, 42] },
  { name: "Gray", rgb: [128, 128, 128] },
  { name: "Gold", rgb: [255, 215, 0] },
  { name: "Silver", rgb: [192, 192, 192] },
  { name: "Maroon", rgb: [128, 0, 0] },
  { name: "Navy", rgb: [0, 0, 128] },
  { name: "Teal", rgb: [0, 128, 128] },
  { name: "Olive", rgb: [128, 128, 0] },
  { name: "Cyan", rgb: [0, 255, 255] },
  { name: "Magenta", rgb: [255, 0, 255] },
  { name: "Violet", rgb: [238, 130, 238] }
];

export function hexToColorName(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;

  let closest = colors[0];
  let minDistance = Infinity;
  
  for (const c of colors) {
    const dist = Math.sqrt(
      Math.pow(r - c.rgb[0], 2) + 
      Math.pow(g - c.rgb[1], 2) + 
      Math.pow(b - c.rgb[2], 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }
  return closest.name;
}
