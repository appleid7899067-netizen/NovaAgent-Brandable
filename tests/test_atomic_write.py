"""Tests for common/atomic_write.py — crash-safe file replacement."""

import json
import os
import stat

import pytest

from common.atomic_write import write_json_atomic, write_text_atomic


@pytest.fixture
def workdir(tmp_path):
    return tmp_path


def test_write_text_creates_file(workdir):
    p = workdir / "a.txt"
    write_text_atomic(str(p), "hello\nworld")
    assert p.read_text() == "hello\nworld"


def test_write_text_overwrites(workdir):
    p = workdir / "a.txt"
    write_text_atomic(str(p), "first")
    write_text_atomic(str(p), "second")
    assert p.read_text() == "second"


def test_write_json_roundtrip(workdir):
    p = workdir / "a.json"
    data = {"k": [1, 2], "u": "é"}
    write_json_atomic(str(p), data)
    assert json.loads(p.read_text(encoding="utf-8")) == data


def test_write_json_default_formatting(workdir):
    p = workdir / "a.json"
    write_json_atomic(str(p), {"a": "é", "n": 1})
    raw = p.read_text(encoding="utf-8")
    assert "\n    " in raw  # indent=4
    assert "é" in raw  # ensure_ascii=False keeps non-ASCII literal


def test_no_temp_files_left_behind(workdir):
    p = workdir / "a.txt"
    write_text_atomic(str(p), "x")
    leftovers = [f for f in os.listdir(workdir) if f.endswith(".tmp")]
    assert leftovers == []


def test_no_temp_file_left_when_write_raises(workdir):
    from common.atomic_write import _replace

    p = workdir / "a.txt"

    def boom(_):
        raise RuntimeError("nope")

    # Exercise the cleanup path in _replace with a writer that raises.
    with pytest.raises(RuntimeError):
        _replace(str(p), boom)

    leftovers = [f for f in os.listdir(workdir) if ".tmp" in f]
    assert leftovers == []
    # A failed write must not have created the target either.
    assert not p.exists()


def test_existing_permissions_are_preserved(workdir):
    p = workdir / "creds.txt"
    p.write_text("old")
    os.chmod(p, 0o600)
    write_text_atomic(str(p), "new")
    assert stat.S_IMODE(os.stat(p).st_mode) == 0o600
    assert p.read_text() == "new"


def test_new_file_uses_umask_default(workdir):
    old = os.umask(0o022)
    try:
        p = workdir / "fresh.txt"
        write_text_atomic(str(p), "x")
        assert stat.S_IMODE(os.stat(p).st_mode) == 0o644
    finally:
        os.umask(old)


def test_symlink_is_followed_not_replaced(workdir):
    real = workdir / "real.txt"
    real.write_text("r")
    link = workdir / "link.txt"
    os.symlink(str(real), str(link))

    write_text_atomic(str(link), "updated")

    assert os.path.islink(str(link))
    assert real.read_text() == "updated"


def test_newline_empty_writes_text_verbatim(workdir):
    p = workdir / "a.txt"
    write_text_atomic(str(p), "line1\nline2\n", newline="")
    assert p.read_bytes() == b"line1\nline2\n"
