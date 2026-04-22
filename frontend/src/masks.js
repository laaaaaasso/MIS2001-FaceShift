function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function gaussian3(x, y, z, cx, cy, cz, sx, sy, sz) {
  const dx = (x - cx) / sx;
  const dy = (y - cy) / sy;
  const dz = (z - cz) / sz;
  return Math.exp(-(dx * dx + dy * dy + dz * dz));
}

export function buildRegionMasks(basePositions) {
  const n = basePositions.length / 3;
  const nose = new Float32Array(n);
  const chin = new Float32Array(n);
  const jaw = new Float32Array(n);
  const cheek = new Float32Array(n);

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < n; i++) {
    const x = basePositions[i * 3];
    const y = basePositions[i * 3 + 1];
    const z = basePositions[i * 3 + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  const cx = (minX + maxX) * 0.5;
  const cz = (minZ + maxZ) * 0.5;
  const sx = Math.max(1e-6, (maxX - minX) * 0.5);
  const sy = Math.max(1e-6, maxY - minY);
  const sz = Math.max(1e-6, (maxZ - minZ) * 0.5);

  for (let i = 0; i < n; i++) {
    const x = basePositions[i * 3];
    const y = basePositions[i * 3 + 1];
    const z = basePositions[i * 3 + 2];

    const nx = (x - cx) / sx;
    const ny = (y - minY) / sy;
    const nz = (z - cz) / sz;
    const absNx = Math.abs(nx);

    const noseBand = smoothstep(0.28, 0.45, ny) * (1 - smoothstep(0.78, 0.9, ny));
    const noseCenter = gaussian3(nx, ny, nz, 0.0, 0.62, 0.25, 0.2, 0.18, 0.55);
    nose[i] = clamp01(noseBand * (1 - smoothstep(0.16, 0.42, absNx)) * noseCenter);

    const chinBand = 1 - smoothstep(0.24, 0.38, ny);
    const chinCore = gaussian3(nx, ny, nz, 0.0, 0.14, 0.04, 0.32, 0.18, 0.7);
    chin[i] = clamp01(chinBand * (1 - smoothstep(0.34, 0.78, absNx)) * chinCore);

    const jawBand = smoothstep(0.08, 0.16, ny) * (1 - smoothstep(0.5, 0.66, ny));
    const jawSide = smoothstep(0.18, 0.48, absNx) * (1 - smoothstep(0.92, 1.08, absNx));
    jaw[i] = clamp01(jawBand * jawSide);

    const cheekBand = smoothstep(0.34, 0.44, ny) * (1 - smoothstep(0.72, 0.84, ny));
    const cheekSide = smoothstep(0.16, 0.46, absNx) * (1 - smoothstep(0.74, 0.96, absNx));
    const cheekDepth = smoothstep(0.0, 0.55, nz);
    cheek[i] = clamp01(cheekBand * cheekSide * cheekDepth);
  }

  return {
    nose,
    chin,
    jaw,
    cheek,
    dimensions: {
      width: maxX - minX,
      height: maxY - minY,
      depth: maxZ - minZ,
      centerX: cx,
    },
  };
}

