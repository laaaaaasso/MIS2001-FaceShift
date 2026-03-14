from __future__ import annotations

import argparse
import os
import re
import shlex
import subprocess
import sys
import time
from pathlib import Path

from utils.mesh_utils import copy_file, find_newest_file


def build_parser() -> argparse.ArgumentParser:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(
        description="Run 3DDFA_V2 on one image and export face mesh to OBJ."
    )
    parser.add_argument(
        "--image",
        default=str(root / "backend" / "input" / "sample_face.jpg"),
        help="Input face image path.",
    )
    parser.add_argument(
        "--output",
        default=str(root / "backend" / "output" / "face.obj"),
        help="Output OBJ path.",
    )
    parser.add_argument(
        "--repo",
        default=os.environ.get("THREEDDFA_V2_DIR", str(root / "3DDFA_V2")),
        help="Path to local 3DDFA_V2 repository.",
    )
    parser.add_argument(
        "--frontend-copy",
        default=str(root / "frontend" / "public" / "face.obj"),
        help="Optional frontend copy path. Use empty string to disable.",
    )
    parser.add_argument(
        "--python-bin",
        default=sys.executable,
        help="Python executable used to run 3DDFA_V2 demo.py.",
    )
    return parser


def run_cmd(cmd: list[str], cwd: Path) -> subprocess.CompletedProcess:
    print(f"[run] {shlex.join(cmd)}")
    return subprocess.run(
        cmd,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )


def resolve_demo_script(repo_hint: Path) -> tuple[Path | None, Path | None]:
    if repo_hint.is_file() and repo_hint.name == "demo.py":
        return repo_hint.parent, repo_hint

    if not repo_hint.exists():
        return None, None

    direct_demo = repo_hint / "demo.py"
    if direct_demo.exists():
        return repo_hint, direct_demo

    demos = sorted(
        [p for p in repo_hint.rglob("demo.py") if "3ddfa" in str(p).lower()],
        key=lambda p: len(str(p)),
    )
    if demos:
        return demos[0].parent, demos[0]
    return None, None


def build_demo_command(help_text: str, image_arg: str) -> list[str]:
    cmd = ["demo.py"]
    lower_help = help_text.lower()

    if "--img_fp" in help_text:
        cmd += ["--img_fp", image_arg]
    elif "-f" in help_text and "img" in lower_help:
        cmd += ["-f", image_arg]
    elif "--image" in help_text:
        cmd += ["--image", image_arg]
    else:
        cmd += [image_arg]

    for flag in ("--save_obj", "--dump_obj", "--to_obj", "--write_obj"):
        if flag in help_text:
            cmd.append(flag)
            break

    if "--opt" in help_text:
        cmd += ["--opt", "obj"]
    elif "-o" in help_text and "2d_sparse" in lower_help:
        cmd += ["-o", "obj"]

    for obj_arg in ("--obj_fp", "--obj_path", "--output_obj"):
        if obj_arg in help_text:
            cmd += [obj_arg, "output/face.obj"]
            break

    for out_arg in ("--save_dir", "--out_dir", "--output_dir"):
        if out_arg in help_text:
            cmd += [out_arg, "output"]
            break

    if "--show_flag" in help_text:
        cmd += ["--show_flag", "false"]
    return cmd


def main() -> int:
    args = build_parser().parse_args()

    image_path = Path(args.image).resolve()
    output_path = Path(args.output).resolve()
    repo_dir = Path(args.repo).resolve()
    frontend_copy = Path(args.frontend_copy).resolve() if args.frontend_copy else None

    print(f"[info] Input image: {image_path}")
    print(f"[info] Output obj : {output_path}")
    print(f"[info] 3DDFA_V2   : {repo_dir} (hint)")

    if not image_path.exists():
        print(f"[error] Image not found: {image_path}")
        return 1

    resolved_repo, demo_file = resolve_demo_script(repo_dir)
    if resolved_repo is None or demo_file is None:
        print(
            "[error] demo.py not found. "
            "Please install 3DDFA_V2 and set --repo (or THREEDDFA_V2_DIR) to its folder."
        )
        print(
            "[hint] Example: python backend/export_face_obj.py --repo C:\\path\\to\\3DDFA_V2"
        )
        return 1
    repo_dir = resolved_repo
    print(f"[info] demo.py    : {demo_file}")

    demo_image_path = image_path
    demo_image_arg = str(image_path)
    if any(ord(ch) > 127 for ch in str(image_path)):
        ascii_input = repo_dir / "faceshift_input.jpg"
        copy_file(image_path, ascii_input)
        demo_image_path = ascii_input
        demo_image_arg = "faceshift_input.jpg"
        print(
            "[info] Non-ASCII path detected. "
            f"Using repo-local ASCII image for OpenCV compatibility: {demo_image_path}"
        )

    started = time.time()
    help_proc = run_cmd([args.python_bin, "demo.py", "-h"], cwd=repo_dir)
    if help_proc.returncode == 0:
        demo_args = build_demo_command(help_proc.stdout, demo_image_arg)
    else:
        err_text = (help_proc.stderr or help_proc.stdout).strip()
        print("[warn] Cannot read demo.py help output, fallback to official 3DDFA_V2 args.")
        if err_text:
            print(err_text)
        demo_args = [
            "demo.py",
            "-f",
            demo_image_arg,
            "-o",
            "obj",
            "--show_flag",
            "false",
        ]
    demo_cmd = [args.python_bin] + demo_args
    result = run_cmd(demo_cmd, cwd=repo_dir)

    if result.returncode != 0:
        print("[error] 3DDFA_V2 inference failed.")
        err = (result.stderr or result.stdout).strip()
        if err:
            print(err)
        if "no face" in err.lower():
            print("[hint] No face detected. Try a clearer frontal face photo.")
        match = re.search(r"No module named '([^']+)'", err)
        if match:
            missing_mod = match.group(1)
            print(f"[hint] Missing Python package/module: {missing_mod}")
            print(
                f"[hint] Install deps in your current env: "
                f"pip install -r {repo_dir / 'requirements.txt'}"
            )
            if missing_mod in {"torch", "torchvision"}:
                print(
                    "[hint] If pip default fails on Windows CPU, try:\n"
                    "      pip install torch torchvision --index-url "
                    "https://download.pytorch.org/whl/cpu"
                )
            if missing_mod == "Sim3DR_Cython":
                print(
                    "[hint] Sim3DR_Cython is an optional compiled extension for rendering.\n"
                    "      OBJ export should work after the lazy-import patch in 3DDFA_V2/demo.py."
                )
        return 1

    repo_output_obj = repo_dir / "output" / "face.obj"
    source_obj = repo_output_obj if repo_output_obj.exists() else None
    if source_obj is None:
        source_obj = find_newest_file(repo_dir, [".obj"], newer_than=started - 1)

    if source_obj is None:
        print("[error] No OBJ file found after inference.")
        print("[hint] Verify your 3DDFA_V2 demo supports OBJ export.")
        return 1

    copy_file(source_obj, output_path)
    print(f"[ok] Exported OBJ: {output_path}")

    if frontend_copy is not None:
        copy_file(output_path, frontend_copy)
        print(f"[ok] Synced OBJ to frontend: {frontend_copy}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
