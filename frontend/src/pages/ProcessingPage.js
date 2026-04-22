const TASKS = [
  "Face Detection",
  "Face Segmentation",
  "Landmark Detection",
  "Depth Estimation",
  "3D Mesh Generation",
];

function renderTaskItem(label) {
  const item = document.createElement("div");
  item.className = "task-item pending";
  item.innerHTML = `<span class="task-dot"></span><span>${label}</span><span class="task-state">Pending</span>`;
  return item;
}

function taskState(index, progress) {
  const start = index * 20;
  const end = start + 20;
  if (progress >= end) return "complete";
  if (progress >= start) return "active";
  return "pending";
}

export function createProcessingPage({ onContinue }) {
  const root = document.createElement("section");
  root.className = "page processing-page";

  const header = document.createElement("div");
  header.className = "page-header";
  header.innerHTML = `
    <h1>Step 2: Building Your 3D Model</h1>
    <p>Processing facial data. This UI currently runs with mock timing but is ready for backend progress binding.</p>
  `;

  const center = document.createElement("div");
  center.className = "processing-center";
  center.innerHTML = `
    <div class="processing-anim"></div>
    <div class="processing-label">Processing facial data...</div>
    <div class="progress-row">
      <div class="progress-track"><div class="progress-fill"></div></div>
      <span class="progress-text">0%</span>
    </div>
  `;

  const list = document.createElement("div");
  list.className = "task-list";
  const taskEls = TASKS.map((t) => {
    const el = renderTaskItem(t);
    list.appendChild(el);
    return el;
  });

  const actionRow = document.createElement("div");
  actionRow.className = "action-row";
  const nextBtn = document.createElement("button");
  nextBtn.className = "primary-btn";
  nextBtn.disabled = true;
  nextBtn.textContent = "Continue to Edit";
  nextBtn.addEventListener("click", onContinue);
  actionRow.appendChild(nextBtn);

  root.appendChild(header);
  root.appendChild(center);
  root.appendChild(list);
  root.appendChild(actionRow);

  const fill = center.querySelector(".progress-fill");
  const text = center.querySelector(".progress-text");
  let progress = 0;
  let timer = null;

  function tick() {
    const delta = progress < 70 ? 5 : progress < 90 ? 3 : 2;
    progress = Math.min(100, progress + delta);
    fill.style.width = `${progress}%`;
    text.textContent = `${progress}%`;

    taskEls.forEach((el, i) => {
      const s = taskState(i, progress);
      el.classList.remove("pending", "active", "complete");
      el.classList.add(s);
      const stateText = el.querySelector(".task-state");
      stateText.textContent = s === "complete" ? "Complete" : s === "active" ? "In Progress" : "Pending";
    });

    if (progress >= 100) {
      clearInterval(timer);
      nextBtn.disabled = false;
    }
  }

  return {
    el: root,
    onEnter() {
      progress = 0;
      fill.style.width = "0%";
      text.textContent = "0%";
      nextBtn.disabled = true;
      taskEls.forEach((el) => {
        el.classList.remove("active", "complete");
        el.classList.add("pending");
        el.querySelector(".task-state").textContent = "Pending";
      });
      timer = setInterval(tick, 250);
    },
    onLeave() {
      if (timer) clearInterval(timer);
    },
  };
}

