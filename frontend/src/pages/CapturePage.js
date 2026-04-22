function createCaptureCard({ icon, title, description, buttonText, note, onAction }) {
  const card = document.createElement("section");
  card.className = "capture-card";

  const iconEl = document.createElement("div");
  iconEl.className = "capture-icon";
  iconEl.textContent = icon;

  const titleEl = document.createElement("h3");
  titleEl.textContent = title;

  const descEl = document.createElement("p");
  descEl.textContent = description;

  const actionBtn = document.createElement("button");
  actionBtn.className = "primary-btn";
  actionBtn.textContent = buttonText;
  actionBtn.addEventListener("click", onAction);

  const noteEl = document.createElement("p");
  noteEl.className = "card-note";
  noteEl.textContent = note;

  card.appendChild(iconEl);
  card.appendChild(titleEl);
  card.appendChild(descEl);
  card.appendChild(actionBtn);
  card.appendChild(noteEl);
  return card;
}

export function createCapturePage({ onContinue }) {
  const root = document.createElement("section");
  root.className = "page capture-page";

  const header = document.createElement("div");
  header.className = "page-header";
  header.innerHTML = `
    <h1>Step 1: Capture Your Face</h1>
    <p>Choose how to provide facial images for reconstruction. Good input quality improves the 3D result.</p>
  `;

  const cards = document.createElement("div");
  cards.className = "capture-grid";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.multiple = true;
  fileInput.accept = "image/*";
  fileInput.className = "hidden-input";
  fileInput.addEventListener("change", () => {
    onContinue("upload");
  });

  const cameraCard = createCaptureCard({
    icon: "CAM",
    title: "Use Camera",
    description: "Capture a guided sequence directly from camera mode.",
    buttonText: "Start Camera",
    note: "Tip: rotate your head across about 180 degrees and capture multiple angles.",
    onAction: () => onContinue("camera"),
  });

  const uploadCard = createCaptureCard({
    icon: "UPL",
    title: "Upload Photos",
    description: "Use existing photos from different viewpoints.",
    buttonText: "Select Files",
    note: "Upload 3-6 photos including front, left, and right views.",
    onAction: () => fileInput.click(),
  });

  cards.appendChild(cameraCard);
  cards.appendChild(uploadCard);

  const tips = document.createElement("section");
  tips.className = "tips-card";
  tips.innerHTML = `
    <h3>Capture Tips</h3>
    <ul>
      <li>Use bright, even lighting.</li>
      <li>Keep face unobstructed and centered.</li>
      <li>Avoid heavy shadows or strong backlight.</li>
      <li>Include side angles for better geometry stability.</li>
    </ul>
  `;

  root.appendChild(header);
  root.appendChild(cards);
  root.appendChild(tips);
  root.appendChild(fileInput);

  return { el: root };
}

