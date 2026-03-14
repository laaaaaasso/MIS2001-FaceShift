# Task: Build Phase 1 MVP for FaceShift

## Objective

Build the first working milestone of the FaceShift project:

**Input one face image -> reconstruct a basic 3D face mesh using 3DDFA_V2 -> export the mesh as `.obj` -> display it in a minimal Three.js web viewer.**

This phase does **not** require:
- mobile app development
- live camera input
- facial editing sliders
- texture mapping
- multi-view reconstruction
- photogrammetry
- backend API deployment

The goal is only to prove that the technical pipeline works end to end.

---

## Technical Context

We are using the official `3DDFA_V2` repository as the 3D face fitting backbone.  
Its `demo.py` supports serialization to `.ply` and `.obj`.  
For the frontend viewer, use `Three.js`, whose ecosystem supports loading `.obj` files via `OBJLoader`.

---

## Deliverables

Please generate a minimal but runnable project with the following outcomes:

1. A Python script that:
   - takes one input face image
   - runs 3DDFA_V2 inference
   - exports the reconstructed face mesh as an `.obj` file

2. A minimal Three.js frontend that:
   - loads the exported `.obj`
   - renders it in a browser
   - allows mouse orbit / zoom / pan
   - shows basic lighting
   - centers the model reasonably in view

3. A short README that explains:
   - environment setup
   - how to install dependencies
   - how to run the Python export step
   - how to launch the frontend viewer
   - known limitations

---

## Constraints

### Scope constraints
- Do not add extra features beyond this phase.
- Do not implement live video capture.
- Do not implement face editing controls yet.
- Do not implement full-stack upload APIs unless absolutely necessary.
- Do not redesign the project into a different architecture.

### Engineering constraints
- Prefer a simple, clean structure over overengineering.
- Keep the frontend minimal and readable.
- Keep Python code modular enough for later extension.
- Use clear comments only where needed.
- Avoid unnecessary abstractions.

### Output constraints
- If 3DDFA_V2 does not directly output an `.obj` in the exact way needed, write an adapter/export script that converts the available mesh vertices/faces into `.obj`.
- If the exported model appears inverted, off-center, or too large/small in Three.js, fix it in the viewer code with transforms.
- If the model has no material, use a simple neutral material for display.

---

## Preferred Project Structure

Please create or output code matching roughly this structure:

```text
FaceShift/
├── backend/
│   ├── export_face_obj.py
│   ├── utils/
│   │   └── mesh_utils.py
│   ├── input/
│   │   └── sample_face.jpg
│   └── output/
│       └── face.obj
│
├── frontend/
│   ├── index.html
│   ├── main.js
│   ├── style.css
│   └── public/
│       └── face.obj
│
└── README.md
```

You may adjust filenames if needed, but keep the structure simple.

---

## Backend Requirements

### Goal
Implement a Python script, e.g. `export_face_obj.py`, that does the following:

1. Loads a single test image from disk
2. Runs 3DDFA_V2 inference
3. Obtains reconstructed face geometry
4. Exports the mesh to `backend/output/face.obj`

### Notes
- Reuse the official 3DDFA_V2 codebase as much as possible.
- Prefer calling its existing inference pipeline rather than rewriting internals.
- If needed, wrap the official logic into a smaller script for this project.
- Make the code robust enough that the input path and output path can be changed easily.

### Implementation expectations
- Include error handling for:
  - missing image
  - no face detected
  - failed export
- Print clear console messages for each step.

---

## Frontend Requirements

### Goal
Implement a minimal Three.js viewer.

### Required features
- load `face.obj`
- render the model in a canvas
- support orbit controls
- show ambient light + directional light
- responsive canvas sizing
- neutral background
- basic material if `.obj` has no material
- auto-frame or manually position camera so the face is visible on load

### Viewer behavior
- The face should be visible immediately after loading.
- The user should be able to rotate the face with the mouse.
- If the model orientation is wrong, correct it in code.

### Keep it simple
Do not add UI panels, sliders, or upload widgets yet.

---

## README Requirements

Write a concise README with:

### 1. What this phase does
Explain that this is Phase 1 of FaceShift:
- single-image 3D face reconstruction
- mesh export
- web visualization

### 2. Setup
Include:
- Python version
- Node.js version if needed
- dependency installation steps

### 3. Backend run instructions
Example:
- where to place input image
- how to run export script
- where the `.obj` appears

### 4. Frontend run instructions
Example:
- how to serve the frontend
- how to open the viewer in browser

### 5. Limitations
Mention:
- single image only
- no texture
- no editing controls yet
- no mobile capture yet
- reconstruction quality depends on image quality

---

## Coding Preferences

- Python for backend
- Plain Three.js or very lightweight JS frontend
- Keep dependencies minimal
- Prefer readable filenames and small modules
- Do not use TypeScript unless there is a strong reason
- Do not introduce React in this phase unless necessary

---

## What I want from you

Please provide:

1. The full code for all required files
2. The final folder structure
3. A step-by-step run guide
4. Any assumptions you made
5. Any place where 3DDFA_V2 integration may differ depending on local installation

If some part of 3DDFA_V2 needs manual setup because of checkpoints or model files, state that clearly and show exactly where those files should go.

---

## Success Criteria

This task is complete only if the following is true:

- I can run one Python command to generate `face.obj`
- I can run one frontend command or static server
- I can open the browser and see the reconstructed 3D face model
- I can rotate the model interactively

---

## Important

Do not just describe the solution.  
Actually generate the code files and README content.
