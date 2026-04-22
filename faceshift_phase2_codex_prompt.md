# Task: Build Phase 2 MVP for FaceShift

## Objective

Build the second working milestone of the FaceShift project:

**Take the reconstructed 3D face mesh from Phase 1 -> add local semantic facial editing controls -> update the mesh interactively in the browser.**

This phase focuses on **local deformation editing**, not better reconstruction.

---

## What Phase 2 should achieve

Starting from the existing Phase 1 result, implement a minimal but convincing editing pipeline:

1. Load the base 3D face mesh in the browser
2. Define several local editable facial regions
3. Connect semantic sliders to region-based mesh deformation
4. Update the 3D face interactively in real time
5. Keep the face stable and visually plausible during editing

At the end of this phase, I should be able to:
- open the browser viewer
- see the reconstructed 3D face
- drag sliders such as nose, chin, jaw
- watch the mesh update immediately
- rotate the edited face and inspect changes

---

## Scope

### Must implement
- local editable facial regions (vertex masks or equivalent)
- deformation functions for a small number of semantic controls
- browser-side interactive slider panel
- real-time mesh update
- reset button

### Do not implement yet
- texture editing
- medical realism
- anatomically accurate surgery simulation
- mobile app
- video input
- face re-reconstruction
- backend API
- user accounts
- sharing/community features
- advanced preset packs

---

## Recommended Editing Parameters

Only implement **3 or 4 controls** in this phase.

Required:
- `nose_bridge_height`
- `chin_projection`
- `jaw_width`

Optional:
- `cheek_fullness`

Do **not** add too many controls.  
Keep the semantic space small and stable.

---

## Project Assumption

Phase 1 is already complete:
- a base 3D face mesh can be loaded in the browser
- the face is visible and rotatable
- the Three.js viewer already works

Phase 2 should build directly on top of that codebase.

---

## Core Technical Goal

The main goal is to implement a **region-constrained deformation system**.

This means:
- each semantic slider only affects a local facial region
- nearby geometry should change smoothly
- the rest of the face should remain mostly stable
- the mesh should not visibly break, explode, or deform globally

---

## Deliverables

Please generate code for the following:

1. **Vertex region masks**
   - define which vertices belong to:
     - nose region
     - chin region
     - jaw region
     - optional cheek region

2. **Deformation functions**
   - apply smooth local displacement to selected vertices
   - each slider should map to one clear geometric direction

3. **Interactive frontend controls**
   - slider panel in browser
   - live updates when sliders move
   - reset to original face

4. **Readable code structure**
   - separate mask logic from deformation logic
   - avoid putting everything into one file if it becomes messy

5. **README update**
   - explain how Phase 2 works
   - explain what each slider does
   - mention limitations

---

## Preferred Approach

### Region definition
Use one of the following:
- predefined vertex index groups
- landmark-neighborhood based grouping
- manually selected regions on the template mesh

Choose the most practical solution for a Phase 2 MVP.

### Deformation strategy
Use simple, controllable geometric deformation:
- local displacement
- falloff weighting
- smoothing by distance from region center

Do **not** overcomplicate this with ML-based editing.

### Frontend interaction
The sliders should update the mesh in real time in the browser.

---

## Implementation Requirements

### 1. Vertex masks / facial regions

Create clear region definitions for:
- nose
- chin
- jaw
- optional cheek

Requirements:
- regions should be local, not global
- neighboring vertices should be deformable with smooth falloff
- region definitions should be easy to adjust later

If exact semantic segmentation is difficult, use a practical approximation based on vertex positions or known facial structure.

---

### 2. Deformation functions

Implement deformation logic for each semantic control.

#### `nose_bridge_height`
Expected effect:
- raise or lower the bridge area
- primarily move vertices in a forward/upward local direction
- avoid changing the whole face

#### `chin_projection`
Expected effect:
- move the chin region forward/backward
- preserve surrounding lower-face continuity

#### `jaw_width`
Expected effect:
- widen or narrow the jaw laterally
- keep deformation symmetric

#### Optional: `cheek_fullness`
Expected effect:
- push cheek area slightly outward/inward
- keep change subtle

### Deformation quality requirements
- no sharp spikes
- no obvious tearing
- no large-scale distortion of unrelated regions
- symmetric controls should stay symmetric
- every control should have a bounded safe range

---

## Important Engineering Detail

The base mesh should remain preserved.

Please maintain:
- the original vertex positions as a stable reference
- the current edited vertex positions as a derived state

Do **not** permanently overwrite the original mesh in a way that makes reset difficult.

---

## Frontend Requirements

Extend the existing Phase 1 Three.js viewer with:

### Required UI
- slider for `nose_bridge_height`
- slider for `chin_projection`
- slider for `jaw_width`
- optional slider for `cheek_fullness`
- reset button

### Required behavior
- changes happen live while dragging
- the model remains visible at all times
- user can still rotate/zoom/orbit the face
- reset restores the original mesh exactly

### UI simplicity
Keep the UI minimal and readable.
Do not build a complex design system.

---

## Suggested File Structure

Please adapt the existing project and add something roughly like:

```text
FaceShift/
├── backend/
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── main.js
│   ├── style.css
│   ├── src/
│   │   ├── masks.js
│   │   ├── deform.js
│   │   ├── controls.js
│   │   └── viewer.js
│   └── public/
│       └── face.obj
│
└── README.md
```

You may change filenames if needed, but keep the code organized.

---

## Coding Guidance

### Keep it practical
This is a course-project-style MVP.  
Favor robustness and clarity over sophistication.

### Avoid overengineering
- do not introduce unnecessary frameworks
- do not redesign the whole viewer
- do not introduce backend services for this phase
- do not use TypeScript unless clearly helpful

### Keep deformation understandable
Each slider should have:
- one semantic meaning
- one primary geometric effect
- one safe numeric range

---

## README Update Requirements

Please update the README to include:

### Phase 2 summary
Explain that this phase adds local facial editing to the base 3D reconstruction.

### Controls
Document:
- what each slider means
- how the mesh changes
- what “reset” does

### Limitations
Mention clearly:
- not medically accurate
- only approximate semantic editing
- region masks may be heuristic
- quality depends on the base reconstruction mesh
- deformation is intended for interactive visualization only

---

## What I want from you

Please provide:

1. The full code for all new or modified files
2. The updated project structure
3. A clear explanation of how region masks are defined
4. A clear explanation of how each deformation function works
5. Run instructions
6. Any assumptions made about the existing Phase 1 viewer

---

## Success Criteria

This task is complete only if the following is true:

- I can open the browser viewer
- I can drag the `nose_bridge_height` slider and see a local nose change
- I can drag the `chin_projection` slider and see a local chin change
- I can drag the `jaw_width` slider and see a symmetric jaw change
- the face remains visually stable
- I can click reset and recover the original face exactly

---

## Important

Do not only describe the architecture.  
Actually generate the code files and README updates needed to make Phase 2 work.
