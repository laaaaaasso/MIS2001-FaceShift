# FaceShift UI Phase Prompt for Codex

## Task

Please modify the existing FaceShift codebase so that the project first focuses on **frontend web UI polish and product-style flow**, based on the reference design I provided.

Current project status:
- The core pipeline already works at a minimum level.
- From a single image, the system can generate a 3D face model.
- The model can already be displayed in the browser.
- The user can drag / orbit / inspect the face from different angles.

Now I want to prioritize **web UI development** before deeper algorithm upgrades.

Your task is to **refactor and improve the frontend UI** so the project looks like a coherent product prototype rather than a raw technical demo.

---

## Main Goal

Build a **clean, modern, soft medical-aesthetic style web interface** for FaceShift, using the uploaded reference image as visual inspiration.

The new UI should communicate a 4-step product flow:

1. **Capture**
2. **3D Model**
3. **Edit**
4. **Export**

Even if some backend features are still mock / placeholder for now, the frontend structure should already support this complete user journey.

---

## Important Constraints

- Do **not** rewrite the entire project from scratch.
- Build on the existing codebase.
- Keep the current working 3D viewer functionality intact.
- Focus on **frontend UI / UX**, layout, components, flow, and styling.
- If some product stages are not fully implemented yet, use placeholders or simulated states, but make the UI complete and coherent.
- Keep the implementation practical and easy to maintain.
- Do not overengineer.

---

## Design Direction

Use the reference image as inspiration.

Target style:
- clean
- bright
- product-demo-like
- soft purple / blue accent color
- white / light gray background
- rounded cards
- lightweight medical-beauty-tech aesthetic
- modern but not flashy

The interface should feel like:
- a startup product prototype
- consumer-friendly
- polished enough for class presentation / demo

---

## What I Want Implemented

## 1. Global App Structure

Create a clear multi-step UI shell with:
- top navigation bar
- centered FaceShift branding
- back button or home button area
- top step progress indicator showing:
  - Capture
  - 3D Model
  - Edit
  - Export

The step indicator should visually show current progress.

---

## 2. Capture Page UI

Build a polished **Step 1: Capture Your Face** page.

It should include:
- title: `Step 1: Capture Your Face`
- subtitle explaining the user should choose how to provide facial images
- two main cards:
  - **Use Camera**
  - **Upload Photos**

### Use Camera card
Should include:
- icon
- short description
- button like `Start Camera`
- a note that user should rotate the head around 180 degrees while capturing multiple angles

### Upload Photos card
Should include:
- icon
- short description
- upload button like `Select Files`
- note saying user should upload 3-6 photos from different angles

Also include a small help / tips section below, for example:
- use good lighting
- keep face unobstructed
- avoid heavy shadows
- use multiple side angles

Important:
- This page does not need full real camera implementation if it does not already exist.
- But the UI should be complete and realistic.
- If necessary, camera mode can be a placeholder action for now.

---

## 3. Processing / Loading Page UI

Build a polished intermediate processing state for the transition from Capture to 3D Model.

This page should include:
- a large central loading illustration or minimal animation area
- progress bar
- percentage text
- processing label such as `Processing facial data...`
- task checklist cards showing pipeline stages like:
  - Face Detection
  - Face Segmentation
  - Landmark Detection
  - Depth Estimation
  - 3D Mesh Generation

Each item should be able to show one of these states:
- pending
- active
- complete

The implementation may use mock timing if the real backend progress is not available yet.
But the UI structure should support real progress integration later.

---

## 4. 3D Model / Edit Page UI

Build a polished **Step 3: Edit Your Face** page.

This is the most important screen.

It should contain:

### Left / center side
- the current face viewer area
- preserve the actual working 3D viewer if already available
- the viewer should sit inside a clean card / panel
- include tabs or quick view selectors for angles, such as:
  - Front
  - 30° Left
  - 60° Left
  - 30° Right
  - 60° Right

If those exact camera presets are not implemented yet, the UI can show them and partially simulate behavior while still preserving free orbit interaction.

Optional but desirable:
- a before / after split-view concept or toggle
- lighting mode buttons such as Studio / Natural / Dramatic / Soft

### Right side control panel
A vertical controls card for feature adjustment.

Include grouped controls like:
- **Nose**
  - Bridge Height
  - Tip Projection
  - Nose Width
  - Tip Rotation
- **Chin & Jaw**
  - Chin Projection
  - Jaw Width
  - Jawline Sharpness
- optional future groups can be collapsed

For now, it is okay if not every slider is connected to real mesh deformation.
But the UI must be ready for later binding.

Important:
- If some sliders already work, preserve that.
- If not, implement the UI controls first with clean state management.
- Include reset button and possibly apply / save changes button.

---

## 5. Export Page UI

Build a polished **Step 4: Save & Export** page.

Include:
- title: `Step 4: Save & Export`
- subtitle
- left preview area for final result
- export options card on the right

Suggested export choices:
- JPG
- PNG
- 3D OBJ (can be visually shown as disabled / pro / future if not ready)

Suggested additional settings:
- image quality radio buttons or dropdown
- before/after export option
- include watermark toggle

This page can be partially mock if export is not fully finished yet, but should look complete.

---

## 6. Gray Model / Neutral Viewer Styling Preparation

Even though this task is mainly UI, I want the frontend architecture to be ready for the next step, where the face model becomes a **gray model** instead of skin-colored / makeup-influenced rendering.

For this UI phase:
- prepare the viewer styling and layout so that a neutral gray 3D mesh display fits naturally
- avoid beauty-app style decorations
- the UI should visually emphasize structure, not makeup or texture realism

If easy to do now, switch the current mesh material to a simple neutral matte gray.
If not, at least organize the viewer code so that this can be changed easily in the next phase.

---

## 7. Routing / State Flow

Implement a simple clean app flow between the 4 steps.

Possible approaches:
- single-page app with step state
- route-based pages
- component-based wizard flow

Choose the simplest approach that fits the current codebase.

Requirements:
- user can move through the 4 steps
- current step is visually highlighted
- mock transitions are acceptable where backend support is incomplete
- current implemented 3D viewer must remain usable

---

## 8. Code Quality Requirements

Please keep the code organized.

Preferred structure example:

```text
frontend/
  src/
    components/
      TopBar.*
      StepIndicator.*
      CaptureCard.*
      ProcessingChecklist.*
      ViewerPanel.*
      SliderGroup.*
      ExportOptions.*
    pages/
      CapturePage.*
      ProcessingPage.*
      EditPage.*
      ExportPage.*
    styles/
      ...
```

You do not have to follow this exactly, but avoid putting everything into one giant file.

---

## 9. What To Preserve

Do not break existing functionality.

Preserve as much as possible:
- current image-to-model pipeline
- current browser 3D rendering
- current orbit / drag interaction
- current working project structure unless refactor is clearly helpful

---

## 10. What To Avoid

Do not:
- redesign the backend pipeline right now
- introduce unnecessary frameworks
- add authentication / database / cloud features
- add complex animation libraries unless already used
- implement too many extra features outside the UI scope
- overfocus on mobile app packaging right now

This phase is specifically about **web UI polish and product-style frontend structure**.

---

## Deliverables I Want From You

Please provide:

1. Updated file structure
2. Full code for all modified / newly created files
3. Clear instructions on how to run the updated frontend
4. Notes on which parts are real vs placeholder / mocked
5. Keep all code directly usable

---

## Success Criteria

This task is successful if:
- the project now looks like a coherent FaceShift product demo
- there is a visible 4-step UI flow
- the capture page looks polished
- the processing page looks polished
- the edit page cleanly wraps the existing 3D viewer and control panel
- the export page looks presentation-ready
- existing working 3D browser functionality is preserved
- the UI is much closer to the provided reference image

---

## Final Instruction

Please actually modify the frontend code and generate the implementation.
Do not only give design advice.
I want real code changes based on the current project.
