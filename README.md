# FaceShift Phase 1 MVP

Phase 1 proves one end-to-end pipeline:

1. Single face image -> 3DDFA_V2 inference  
2. Export reconstructed mesh to `.obj`  
3. View mesh in a minimal Three.js page

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

Controls:

- Left drag: orbit
- Mouse wheel: zoom
- Right drag: pan

## Known Limitations

- Single image only
- No texture mapping
- No facial editing controls
- No mobile capture
- No backend upload API
- Reconstruction quality depends heavily on image quality and face visibility

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

