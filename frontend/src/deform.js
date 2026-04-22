function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const DEFAULT_PARAMS = {
  nose_bridge_height: 0,
  chin_projection: 0,
  jaw_width: 0,
  cheek_fullness: 0,
};

export function applyFaceDeformation(basePositions, outPositions, masks, params) {
  const n = basePositions.length / 3;
  const width = Math.max(1e-6, masks.dimensions.width);
  const height = Math.max(1e-6, masks.dimensions.height);
  const depth = Math.max(1e-6, masks.dimensions.depth);
  const centerX = masks.dimensions.centerX;

  const noseValue = clamp(params.nose_bridge_height ?? 0, -1, 1);
  const chinValue = clamp(params.chin_projection ?? 0, -1, 1);
  const jawValue = clamp(params.jaw_width ?? 0, -1, 1);
  const cheekValue = clamp(params.cheek_fullness ?? 0, -1, 1);

  for (let i = 0; i < n; i++) {
    const idx = i * 3;
    const x0 = basePositions[idx];
    const y0 = basePositions[idx + 1];
    const z0 = basePositions[idx + 2];

    let x = x0;
    let y = y0;
    let z = z0;

    const noseW = masks.nose[i];
    const chinW = masks.chin[i];
    const jawW = masks.jaw[i];
    const cheekW = masks.cheek[i];

    const side = x0 >= centerX ? 1 : -1;

    y += noseValue * noseW * height * 0.035;
    z += noseValue * noseW * depth * 0.028;

    z += chinValue * chinW * depth * 0.08;
    y -= Math.abs(chinValue) * chinW * height * 0.015;

    x += jawValue * jawW * side * width * 0.055;
    z -= Math.abs(jawValue) * jawW * depth * 0.01;

    x += cheekValue * cheekW * side * width * 0.02;
    z += cheekValue * cheekW * depth * 0.035;

    outPositions[idx] = x;
    outPositions[idx + 1] = y;
    outPositions[idx + 2] = z;
  }
}

