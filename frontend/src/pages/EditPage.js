import { createViewer } from "../viewer.js";
import { buildRegionMasks } from "../masks.js";
import { applyFaceDeformation, DEFAULT_PARAMS } from "../deform.js";

const CONTROL_GROUPS = [
  {
    title: "Nose",
    controls: [
      { key: "nose_bridge_height", label: "Bridge Height", min: -1, max: 1, step: 0.01, live: true },
      { key: "nose_tip_projection", label: "Tip Projection", min: -1, max: 1, step: 0.01, live: false },
      { key: "nose_width", label: "Nose Width", min: -1, max: 1, step: 0.01, live: false },
      { key: "tip_rotation", label: "Tip Rotation", min: -1, max: 1, step: 0.01, live: false },
    ],
  },
  {
    title: "Chin & Jaw",
    controls: [
      { key: "chin_projection", label: "Chin Projection", min: -1, max: 1, step: 0.01, live: true },
      { key: "jaw_width", label: "Jaw Width", min: -1, max: 1, step: 0.01, live: true },
      { key: "jawline_sharpness", label: "Jawline Sharpness", min: -1, max: 1, step: 0.01, live: false },
      { key: "cheek_fullness", label: "Cheek Fullness", min: -1, max: 1, step: 0.01, live: true },
    ],
  },
];

const ANGLE_PRESETS = [
  { label: "Front", key: "front" },
  { label: "30° Left", key: "left30" },
  { label: "60° Left", key: "left60" },
  { label: "30° Right", key: "right30" },
  { label: "60° Right", key: "right60" },
];

const LIGHT_MODES = ["Studio", "Natural", "Dramatic", "Soft"];

export function createEditPage({ onContinue }) {
  const root = document.createElement("section");
  root.className = "page edit-page";

  root.innerHTML = `
    <div class="page-header">
      <h1>Step 3: Edit Your Face</h1>
      <p>Adjust semantic controls with local mesh deformation while keeping full orbit interaction.</p>
    </div>
    <div class="edit-layout">
      <section class="viewer-card">
        <div class="viewer-toolbar">
          <div class="toolbar-group" data-angle-group></div>
          <div class="toolbar-group" data-light-group></div>
        </div>
        <canvas class="viewer-canvas"></canvas>
        <div class="viewer-status">Loading ./public/face.obj ...</div>
      </section>
      <aside class="control-card">
        <h3>Feature Controls</h3>
        <p class="card-sub">Live controls are connected. Placeholder sliders are UI-ready for next binding phase.</p>
        <div data-groups></div>
        <div class="control-actions">
          <button class="ghost-btn" data-reset>Reset</button>
          <button class="primary-btn" data-apply>Apply Changes</button>
          <button class="ghost-btn" data-before-after>Before / After</button>
        </div>
        <button class="primary-btn next-btn" data-next>Continue to Export</button>
      </aside>
    </div>
  `;

  const canvas = root.querySelector(".viewer-canvas");
  const statusEl = root.querySelector(".viewer-status");
  const groupsEl = root.querySelector("[data-groups]");
  const angleGroup = root.querySelector("[data-angle-group]");
  const lightGroup = root.querySelector("[data-light-group]");
  const resetBtn = root.querySelector("[data-reset]");
  const applyBtn = root.querySelector("[data-apply]");
  const beforeAfterBtn = root.querySelector("[data-before-after]");
  const nextBtn = root.querySelector("[data-next]");

  const params = {
    ...DEFAULT_PARAMS,
    nose_tip_projection: 0,
    nose_width: 0,
    tip_rotation: 0,
    jawline_sharpness: 0,
  };
  const valueSpans = {};
  let viewer = null;
  let basePositions = null;
  let workPositions = null;
  let masks = null;
  let previewMode = "after";

  function liveParams() {
    return {
      nose_bridge_height: params.nose_bridge_height,
      chin_projection: params.chin_projection,
      jaw_width: params.jaw_width,
      cheek_fullness: params.cheek_fullness,
    };
  }

  function applyLiveParams() {
    if (!basePositions || !workPositions || !masks || !viewer) return;
    applyFaceDeformation(basePositions, workPositions, masks, liveParams());
    if (previewMode === "before") {
      viewer.updatePositions(basePositions);
      return;
    }
    viewer.updatePositions(workPositions);
  }

  function resetAll() {
    Object.keys(params).forEach((k) => {
      params[k] = 0;
      if (valueSpans[k]) valueSpans[k].textContent = "0.00";
    });
    groupsEl.querySelectorAll("input[type='range']").forEach((el) => {
      el.value = "0";
    });
    previewMode = "after";
    beforeAfterBtn.textContent = "Before / After";
    applyLiveParams();
  }

  CONTROL_GROUPS.forEach((group) => {
    const section = document.createElement("section");
    section.className = "slider-group";
    section.innerHTML = `<h4>${group.title}</h4>`;

    group.controls.forEach((cfg) => {
      const row = document.createElement("div");
      row.className = "slider-row";
      const top = document.createElement("div");
      top.className = "slider-top";
      const label = document.createElement("span");
      label.textContent = cfg.label;
      if (!cfg.live) label.className = "muted";

      const value = document.createElement("span");
      value.textContent = "0.00";
      value.className = "slider-value";
      valueSpans[cfg.key] = value;

      const input = document.createElement("input");
      input.type = "range";
      input.min = String(cfg.min);
      input.max = String(cfg.max);
      input.step = String(cfg.step);
      input.value = "0";
      input.addEventListener("input", (e) => {
        const v = Number(e.target.value);
        params[cfg.key] = v;
        value.textContent = v.toFixed(2);
        if (cfg.live) applyLiveParams();
      });

      top.appendChild(label);
      top.appendChild(value);
      row.appendChild(top);
      row.appendChild(input);
      if (!cfg.live) {
        const tag = document.createElement("span");
        tag.className = "ui-ready-tag";
        tag.textContent = "UI Ready";
        row.appendChild(tag);
      }
      section.appendChild(row);
    });
    groupsEl.appendChild(section);
  });

  ANGLE_PRESETS.forEach((p, idx) => {
    const btn = document.createElement("button");
    btn.className = `chip-btn ${idx === 0 ? "active" : ""}`;
    btn.textContent = p.label;
    btn.addEventListener("click", () => {
      angleGroup.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (viewer) viewer.setViewPreset(p.key);
    });
    angleGroup.appendChild(btn);
  });

  LIGHT_MODES.forEach((mode, idx) => {
    const btn = document.createElement("button");
    btn.className = `chip-btn ${idx === 0 ? "active" : ""}`;
    btn.textContent = mode;
    btn.addEventListener("click", () => {
      lightGroup.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (viewer) viewer.setLightMode(mode.toLowerCase());
    });
    lightGroup.appendChild(btn);
  });

  resetBtn.addEventListener("click", resetAll);
  applyBtn.addEventListener("click", () => {
    statusEl.textContent = "Changes applied (local session).";
  });
  beforeAfterBtn.addEventListener("click", () => {
    if (!viewer || !basePositions || !workPositions) return;
    previewMode = previewMode === "after" ? "before" : "after";
    beforeAfterBtn.textContent = previewMode === "after" ? "Before / After" : "Show Edited";
    viewer.updatePositions(previewMode === "before" ? basePositions : workPositions);
  });
  nextBtn.addEventListener("click", onContinue);

  return {
    el: root,
    async onEnter() {
      if (!viewer) {
        viewer = createViewer({ canvas, statusEl });
        const loaded = await viewer.loadFace("./public/face.obj");
        basePositions = new Float32Array(loaded.positionArray);
        workPositions = new Float32Array(loaded.positionArray);
        masks = buildRegionMasks(basePositions);
        applyLiveParams();
      }
    },
  };
}

