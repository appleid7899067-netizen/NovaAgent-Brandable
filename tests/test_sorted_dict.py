"""Tests for common/sorted_dict.py — a dict that iterates in a sorted order."""

import pytest

from common.sorted_dict import SortedDict


def test_insertion_then_sorted_keys():
    d = SortedDict()
    d["b"] = 2
    d["a"] = 1
    d["c"] = 3
    assert d.keys() == ["a", "b", "c"]
    assert d.values() == [1, 2, 3]


def test_reverse_order():
    d = SortedDict(reverse=True)
    for k in ("a", "b", "c"):
        d[k] = k
    assert d.keys() == ["c", "b", "a"]


def test_custom_sort_func_by_value():
    d = SortedDict(sort_func=lambda k, v: v)
    d["a"] = 30
    d["b"] = 10
    d["c"] = 20
    assert d.keys() == ["b", "c", "a"]


def test_update_existing_key_reorders():
    d = SortedDict(sort_func=lambda k, v: v)
    d["a"] = 1
    d["b"] = 2
    assert d.keys() == ["a", "b"]
    d["a"] = 99
    assert d.keys() == ["b", "a"]


def test_init_from_mapping():
    d = SortedDict(init_dict={"b": 2, "a": 1})
    assert d.keys() == ["a", "b"]


def test_contains_and_len():
    d = SortedDict()
    d["x"] = 1
    assert "x" in d
    assert len(d) == 1


def test_delete_removes_from_order():
    d = SortedDict()
    d["a"] = 1
    d["b"] = 2
    del d["a"]
    assert d.keys() == ["b"]
    assert "a" not in d


def test_setdefault_inserts_once():
    d = SortedDict()
    assert d.setdefault("a", 1) == 1
    assert d.setdefault("a", 2) == 1
    assert d["a"] == 1


def test_pop_returns_value_and_removes():
    d = SortedDict()
    d["a"] = 1
    assert d.pop("a") == 1
    assert "a" not in d


def test_pop_missing_with_default():
    d = SortedDict()
    assert d.pop("nope", "d") == "d"


def test_pop_missing_without_default_raises():
    d = SortedDict()
    with pytest.raises(KeyError):
        d.pop("nope")


def test_clear_empties_order():
    d = SortedDict()
    d["a"] = 1
    d.clear()
    assert len(d) == 0
    assert d.keys() == []


def test_update_bulk():
    d = SortedDict()
    d.update({"b": 2, "a": 1})
    assert d.keys() == ["a", "b"]


def test_ior_operator_merges():
    d = SortedDict()
    d |= {"b": 2}
    d |= {"a": 1}
    assert d.keys() == ["a", "b"]


def test_items_are_sorted_pairs():
    d = SortedDict()
    d["b"] = 2
    d["a"] = 1
    assert d.items() == [("a", 1), ("b", 2)]


def test_iter_follows_sorted_keys():
    d = SortedDict()
    d["c"] = 3
    d["a"] = 1
    d["b"] = 2
    assert list(d) == ["a", "b", "c"]
