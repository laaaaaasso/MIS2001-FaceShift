import { STEPS } from "./constants.js";
import { createTopBar } from "./components/TopBar.js";
import { createStepIndicator } from "./components/StepIndicator.js";
import { createCapturePage } from "./pages/CapturePage.js";
import { createProcessingPage } from "./pages/ProcessingPage.js";
import { createEditPage } from "./pages/EditPage.js";
import { createExportPage } from "./pages/ExportPage.js";

export function bootstrapApp(rootEl) {
  let currentStep = 0;
  let maxEnabledStep = 0;
  let activePage = null;

  const shell = document.createElement("div");
  shell.className = "app-shell";

  const topBar = createTopBar({
    onHome: () => navigateTo(0),
  });
  const stepsWrap = document.createElement("div");
  const content = document.createElement("main");
  content.className = "content";

  shell.appendChild(topBar);
  shell.appendChild(stepsWrap);
  shell.appendChild(content);
  rootEl.innerHTML = "";
  rootEl.appendChild(shell);

  function rerenderSteps() {
    stepsWrap.innerHTML = "";
    stepsWrap.appendChild(
      createStepIndicator({
        steps: STEPS,
        currentStep,
        maxEnabledStep,
        onStepClick: (i) => navigateTo(i),
      })
    );
  }

  function createPage(step) {
    if (step === 0) {
      return createCapturePage({
        onContinue: () => {
          maxEnabledStep = Math.max(maxEnabledStep, 1);
          navigateTo(1);
        },
      });
    }
    if (step === 1) {
      return createProcessingPage({
        onContinue: () => {
          maxEnabledStep = Math.max(maxEnabledStep, 2);
          navigateTo(2);
        },
      });
    }
    if (step === 2) {
      return createEditPage({
        onContinue: () => {
          maxEnabledStep = Math.max(maxEnabledStep, 3);
          navigateTo(3);
        },
      });
    }
    return createExportPage({
      onBackToEdit: () => navigateTo(2),
    });
  }

  async function navigateTo(step) {
    if (step > maxEnabledStep) return;
    if (activePage?.onLeave) activePage.onLeave();
    currentStep = step;
    rerenderSteps();

    activePage = createPage(step);
    content.innerHTML = "";
    content.appendChild(activePage.el);
    if (activePage.onEnter) await activePage.onEnter();
  }

  rerenderSteps();
  navigateTo(0);
}

