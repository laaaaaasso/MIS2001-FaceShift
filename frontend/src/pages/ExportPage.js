export function createExportPage({ onBackToEdit }) {
  const root = document.createElement("section");
  root.className = "page export-page";

  root.innerHTML = `
    <div class="page-header">
      <h1>Step 4: Save & Export</h1>
      <p>Finalize your edited result and choose output settings.</p>
    </div>
    <div class="export-layout">
      <section class="export-preview-card">
        <h3>Result Preview</h3>
        <div class="export-preview-placeholder">Final preview panel (viewer snapshot integration ready)</div>
        <div class="preview-options">
          <label><input type="checkbox" checked /> Before / After comparison</label>
          <label><input type="checkbox" /> Include watermark</label>
        </div>
      </section>
      <aside class="export-options-card">
        <h3>Export Options</h3>
        <div class="option-row">
          <label>Format</label>
          <div class="format-buttons">
            <button class="chip-btn active">JPG</button>
            <button class="chip-btn">PNG</button>
            <button class="chip-btn" disabled>3D OBJ (Soon)</button>
          </div>
        </div>
        <div class="option-row">
          <label for="quality">Image Quality</label>
          <select id="quality">
            <option>High</option>
            <option selected>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div class="option-row">
          <button class="primary-btn">Export Current View (Mock)</button>
        </div>
        <div class="option-row">
          <button class="ghost-btn" data-back>Edit Again</button>
        </div>
      </aside>
    </div>
  `;

  root.querySelector("[data-back]").addEventListener("click", onBackToEdit);
  return { el: root };
}

