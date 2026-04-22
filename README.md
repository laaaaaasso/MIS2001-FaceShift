# FaceShift Phase 1 + Phase 2 + UI Flow MVP

This project currently includes three deliverable layers:

1. Phase 1: Single face image -> 3DDFA_V2 inference -> export `.obj` -> browser viewer.
2. Phase 2: Local semantic facial editing in browser with real-time mesh deformation.
3. UI Flow Phase: Product-style 4-step web prototype (Capture -> 3D Model -> Edit -> Export).

## Project Structure

```text
backend/
  export_face_obj.py
  requirements.txt
  utils/
    mesh_utils.py
  input/
    (put your sample_face.jpg here)
  output/
    face.obj
frontend/
  index.html
  main.js
  style.css
  src/
    app.js
    constants.js
    components/
      TopBar.js
      StepIndicator.js
    pages/
      CapturePage.js
      ProcessingPage.js
      EditPage.js
      ExportPage.js
    viewer.js
    masks.js
    deform.js
  vendor/
    three.module.js
    OrbitControls.js
    OBJLoader.js
  public/
    face.obj
```

## Environment Setup

- Python: 3.9+ recommended
- Node.js: not required (viewer is plain static files)
- Local `3DDFA_V2` repository is required

### 1) Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2) Prepare 3DDFA_V2

Clone 3DDFA_V2 as a sibling folder named `3DDFA_V2`:

```text
project/
  backend/
  frontend/
  3DDFA_V2/
```

If your 3DDFA_V2 folder is elsewhere, pass `--repo` or set env var:

```bash
set THREEDDFA_V2_DIR=C:\path\to\3DDFA_V2
```

Install 3DDFA_V2 dependencies inside your active env:

```bash
pip install -r 3DDFA_V2/requirements.txt
```

If `torch` install fails with default source on Windows CPU-only env, use:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

Download required 3DDFA_V2 model/checkpoint files according to its official README.  
Keep the same relative locations expected by that repo (usually under `weights/` or similar paths).

## Run Backend Export

Place one face image at `backend/input/sample_face.jpg`, then run:

```bash
python backend/export_face_obj.py
```

Optional custom paths:

```bash
python backend/export_face_obj.py --image backend/input/your_face.jpg --output backend/output/face.obj --repo ..\3DDFA_V2
```

Expected result:

- `backend/output/face.obj`
- `frontend/public/face.obj` (auto-copied for viewing)

## Run Frontend Viewer

From project root:

```bash
python -m http.server 5173
```

Open:

```text
http://localhost:5173/frontend/
```

UI flow:

1. Capture page (camera/upload actions as UI-ready flow entry)
2. Processing page (mock progress + checklist states)
3. Edit page (real 3D viewer + local deformation sliders)
4. Export page (presentation-ready options UI)

## Real vs Placeholder

### Real (implemented)

- 3D face OBJ loading and viewer rendering
- Orbit/zoom/pan interaction
- Local deformation masks + mesh update
- Live sliders:
  - `nose_bridge_height`
  - `chin_projection`
  - `jaw_width`
  - `cheek_fullness`
- Reset to original mesh
- Angle preset buttons and lighting mode UI with practical camera/light behavior

### Placeholder / mock (UI complete, backend not fully bound yet)

- Capture camera workflow
- Multi-photo upload processing semantics
- Processing progress linked to real backend stages
- Export action output files
- Some sliders in Edit panel marked `UI Ready` for future binding

## Phase 2 Editing Controls

After loading the face, use the control panel (top-right):

- `nose_bridge_height`: raises/lowers bridge area with local falloff.
- `chin_projection`: pushes/pulls chin region forward/backward.
- `jaw_width`: widens/narrows jaw laterally, symmetric left-right.
- `cheek_fullness` (optional): slight outward/inward cheek change.
- `Reset`: restores original mesh exactly (from preserved base vertices).

## Phase 2 Implementation Notes

### Region masks

`frontend/src/masks.js` builds heuristic vertex masks from normalized mesh coordinates:

- `nose`: central upper-mid face, narrow around x-axis center.
- `chin`: lower central face.
- `jaw`: lower side bands (left/right).
- `cheek`: middle side area with forward-depth preference.

Each mask uses smooth thresholds + Gaussian falloff for continuity.

### Deformation logic

`frontend/src/deform.js` applies bounded displacements to a derived vertex buffer:

- Keep `basePositions` unchanged.
- Compute `workingPositions` from base on every slider change.
- Apply local offsets weighted by region masks.
- Recompute mesh normals for stable shading.

## Known Limitations

- Not medically accurate or anatomically validated.
- Region masks are heuristic approximations from geometry only.
- Editing quality depends on base reconstruction quality.
- Capture/processing/export stages are UI-first in this phase (partly mocked).
- No texture editing in this phase.
- No mobile capture / live video / backend API in this phase.
- Deformation is intended for interactive visualization MVP only.

## Assumptions

- You already have a working local 3DDFA_V2 setup with required weights.
- `demo.py` is the correct entry point for inference in your local 3DDFA_V2 version.
- OBJ export options can vary by 3DDFA_V2 version; this project auto-detects common flags and then searches for generated OBJ files.

## Version-Specific 3DDFA_V2 Notes

Local 3DDFA_V2 versions may differ in CLI flags.  
`backend/export_face_obj.py` handles this by:

1. Reading `python demo.py -h`
2. Building a compatible command using detected options
3. Falling back to finding the newest generated `.obj`

If your version still fails, check:

- `python demo.py -h` output
- whether your demo script supports OBJ export directly
- whether additional dependencies or checkpoints are missing
