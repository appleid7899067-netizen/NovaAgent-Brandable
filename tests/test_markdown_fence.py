"""Tests for common/markdown_fence.py — fenced code block scanning."""

from common.markdown_fence import (
    _scan,
    replace_fenced_blocks,
    transform_outside_fences,
)


def test_scan_reports_fence_and_plain_lines():
    text = "hello\n```py\nx=1\n```\nbye"
    assert list(_scan(text)) == [
        (None, "hello"),
        ("py", ["```py", "x=1", "```"]),
        (None, "bye"),
    ]


def test_replace_passes_info_code_and_block():
    text = "hello\n```py\nx=1\n```\nbye"
    seen = {}

    def render(info, code, block):
        seen["info"] = info
        seen["code"] = code
        seen["block"] = block
        return "[BLOCK]"

    out = replace_fenced_blocks(text, render)
    assert out == "hello\n[BLOCK]\nbye"
    assert seen["info"] == "py"
    assert seen["code"] == "x=1\n"
    assert seen["block"] == "```py\nx=1\n```"


def test_transform_leaves_fence_untouched():
    text = "a\n```py\ncode\n```\nb"
    assert transform_outside_fences(text, str.upper) == "A\n```py\ncode\n```\nB"


def test_tilde_fences_are_recognised():
    text = "a\n~~~\ncode\n~~~\nb"
    assert replace_fenced_blocks(text, lambda i, c, b: "X") == "a\nX\nb"
    assert transform_outside_fences(text, str.upper) == "A\n~~~\ncode\n~~~\nB"


def test_no_fences_is_passthrough():
    text = "no fences here"
    assert replace_fenced_blocks(text, lambda i, c, b: "X") == text
    assert transform_outside_fences(text, str.upper) == "NO FENCES HERE"


def test_unclosed_fence_is_left_alone():
    text = "open ```py\nnever closed"
    assert replace_fenced_blocks(text, lambda i, c, b: "X") == text
    assert transform_outside_fences(text, str.upper) == "OPEN ```PY\nNEVER CLOSED"


def test_longer_fence_can_wrap_shorter_one():
    text = "````\nnested ``` here\n````\nafter"
    scanned = list(_scan(text))
    assert scanned == [("", ["````", "nested ``` here", "````"]), (None, "after")]
    assert replace_fenced_blocks(text, lambda i, c, b: "X") == "X\nafter"


def test_backtick_in_info_string_is_not_an_opener():
    text = "```a`b\nbody\n```"
    # None of these lines open a valid fence, so everything is prose.
    assert all(info is None for info, _ in _scan(text))


def test_empty_input():
    assert replace_fenced_blocks("", lambda i, c, b: "X") == ""
    assert transform_outside_fences("", str.upper) == ""
