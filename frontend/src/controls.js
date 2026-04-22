import { DEFAULT_PARAMS } from "./deform.js";

const CONTROL_CONFIG = [
  {
    key: "nose_bridge_height",
    label: "Nose Bridge Height",
    min: -1,
    max: 1,
    step: 0.01,
  },
  {
    key: "chin_projection",
    label: "Chin Projection",
    min: -1,
    max: 1,
    step: 0.01,
  },
  {
    key: "jaw_width",
    label: "Jaw Width",
    min: -1,
    max: 1,
    step: 0.01,
  },
  {
    key: "cheek_fullness",
    label: "Cheek Fullness",
    min: -1,
    max: 1,
    step: 0.01,
  },
];

export function initControls({ panelEl, onChange, onReset }) {
  const params = { ...DEFAULT_PARAMS };
  const valueEls = {};

  const list = panelEl.querySelector("[data-control-list]");
  const resetBtn = panelEl.querySelector("[data-reset]");

  for (const cfg of CONTROL_CONFIG) {
    const row = document.createElement("div");
    row.className = "control-row";

    const top = document.createElement("div");
    top.className = "control-top";

    const label = document.createElement("label");
    label.textContent = cfg.label;
    label.setAttribute("for", `slider-${cfg.key}`);

    const value = document.createElement("span");
    value.className = "control-value";
    value.textContent = "0.00";
    valueEls[cfg.key] = value;

    top.appendChild(label);
    top.appendChild(value);

    const slider = document.createElement("input");
    slider.id = `slider-${cfg.key}`;
    slider.type = "range";
    slider.min = String(cfg.min);
    slider.max = String(cfg.max);
    slider.step = String(cfg.step);
    slider.value = "0";
    slider.dataset.key = cfg.key;

    slider.addEventListener("input", (e) => {
      const key = e.target.dataset.key;
      const v = Number(e.target.value);
      params[key] = v;
      valueEls[key].textContent = v.toFixed(2);
      onChange({ ...params });
    });

    row.appendChild(top);
    row.appendChild(slider);
    list.appendChild(row);
  }

  resetBtn.addEventListener("click", () => {
    Object.assign(params, DEFAULT_PARAMS);
    list.querySelectorAll("input[type='range']").forEach((el) => {
      el.value = "0";
      const key = el.dataset.key;
      if (key && valueEls[key]) valueEls[key].textContent = "0.00";
    });
    onReset();
    onChange({ ...params });
  });
}

