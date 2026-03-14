from __future__ import annotations

import argparse
import os
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


def build_demo_command(help_text: str, image_path: Path) -> list[str]:
    cmd = ["demo.py"]
    lower_help = help_text.lower()

    if "--img_fp" in help_text:
        cmd += ["--img_fp", str(image_path)]
    elif "-f" in help_text and "img" in lower_help:
        cmd += ["-f", str(image_path)]
    elif "--image" in help_text:
        cmd += ["--image", str(image_path)]
    else:
        cmd += [str(image_path)]

    for flag in ("--save_obj", "--dump_obj", "--to_obj", "--write_obj"):
        if flag in help_text:
            cmd.append(flag)
            break

    for obj_arg in ("--obj_fp", "--obj_path", "--output_obj"):
        if obj_arg in help_text:
            cmd += [obj_arg, "output/face.obj"]
            break

    for out_arg in ("--save_dir", "--out_dir", "--output_dir"):
        if out_arg in help_text:
            cmd += [out_arg, "output"]
            break

    return cmd


def main() -> int:
    args = build_parser().parse_args()

    image_path = Path(args.image).resolve()
    output_path = Path(args.output).resolve()
    repo_dir = Path(args.repo).resolve()
    frontend_copy = Path(args.frontend_copy).resolve() if args.frontend_copy else None

    print(f"[info] Input image: {image_path}")
    print(f"[info] Output obj : {output_path}")
    print(f"[info] 3DDFA_V2   : {repo_dir}")

    if not image_path.exists():
        print(f"[error] Image not found: {image_path}")
        return 1

    demo_file = repo_dir / "demo.py"
    if not demo_file.exists():
        print(
            "[error] demo.py not found in 3DDFA_V2 path. "
            "Set --repo or THREEDDFA_V2_DIR correctly."
        )
        return 1

    help_proc = run_cmd([args.python_bin, "demo.py", "-h"], cwd=repo_dir)
    if help_proc.returncode != 0:
        print("[error] Cannot read demo.py help output.")
        if help_proc.stderr.strip():
            print(help_proc.stderr.strip())
        return 1

    started = time.time()
    demo_cmd = [args.python_bin] + build_demo_command(help_proc.stdout, image_path)
    result = run_cmd(demo_cmd, cwd=repo_dir)

    if result.returncode != 0:
        print("[error] 3DDFA_V2 inference failed.")
        err = (result.stderr or result.stdout).strip()
        if err:
            print(err)
        if "no face" in err.lower():
            print("[hint] No face detected. Try a clearer frontal face photo.")
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
