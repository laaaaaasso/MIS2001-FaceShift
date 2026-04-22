export function createStepIndicator({ steps, currentStep, maxEnabledStep, onStepClick }) {
  const wrap = document.createElement("nav");
  wrap.className = "step-indicator";
  wrap.setAttribute("aria-label", "FaceShift flow steps");

  steps.forEach((label, i) => {
    const stepBtn = document.createElement("button");
    const enabled = i <= maxEnabledStep;
    stepBtn.className = "step-pill";
    if (i === currentStep) stepBtn.classList.add("active");
    if (i < currentStep) stepBtn.classList.add("complete");
    stepBtn.disabled = !enabled;
    stepBtn.innerHTML = `<span class="step-index">${i + 1}</span><span>${label}</span>`;
    stepBtn.addEventListener("click", () => onStepClick(i));
    wrap.appendChild(stepBtn);
  });

  return wrap;
}

