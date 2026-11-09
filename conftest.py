"""Pytest bootstrap: make the repo root importable.

Tests live under ``tests/`` and import top-level packages (``common``, ``cli``,
...).  pytest's default import mode puts the *test* directory on ``sys.path``,
not the repo root, so insert the root explicitly.
"""

import os
import sys

_ROOT = os.path.dirname(os.path.abspath(__file__))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)
