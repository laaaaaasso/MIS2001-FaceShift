from __future__ import annotations

import shutil
from pathlib import Path
from typing import Iterable


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def find_newest_file(
    root: Path,
    suffixes: Iterable[str],
    newer_than: float | None = None,
) -> Path | None:
    suffix_set = {s.lower() for s in suffixes}
    candidates = []
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix.lower() not in suffix_set:
            continue
        if newer_than is not None and p.stat().st_mtime < newer_than:
            continue
        candidates.append(p)
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.stat().st_mtime)


def copy_file(src: Path, dst: Path) -> Path:
    ensure_parent(dst)
    shutil.copy2(src, dst)
    return dst

