"""Tests for common/expired_dict.py — a TTL dict used as a dedup cache."""

import time

import pytest

from common.expired_dict import ExpiredDict


def test_set_and_get_within_ttl():
    d = ExpiredDict(expires_in_seconds=60)
    d["a"] = 1
    assert d["a"] == 1


def test_missing_key_raises():
    d = ExpiredDict(expires_in_seconds=60)
    with pytest.raises(KeyError):
        _ = d["nope"]


def test_get_returns_default_for_missing():
    d = ExpiredDict(expires_in_seconds=60)
    assert d.get("nope") is None
    assert d.get("nope", 42) == 42


def test_entry_expires_after_ttl():
    d = ExpiredDict(expires_in_seconds=0.05)
    d["a"] = 1
    time.sleep(0.08)
    with pytest.raises(KeyError):
        _ = d["a"]
    assert d.get("a") is None
    assert "a" not in d


def test_contains_reflects_expiry():
    d = ExpiredDict(expires_in_seconds=0.05)
    d["a"] = 1
    assert "a" in d
    time.sleep(0.08)
    assert "a" not in d


def test_read_refreshes_ttl():
    """Reading a live entry must extend its life (sliding TTL)."""
    d = ExpiredDict(expires_in_seconds=0.12)
    d["a"] = 1
    time.sleep(0.06)
    assert d["a"] == 1  # refresh
    time.sleep(0.06)
    assert d["a"] == 1  # would have expired without the refresh above


def test_pop_removes_and_returns_value():
    d = ExpiredDict(expires_in_seconds=60)
    d["a"] = 1
    assert d.pop("a") == 1
    assert "a" not in d


def test_pop_expired_without_default_raises():
    d = ExpiredDict(expires_in_seconds=0.05)
    d["a"] = 1
    time.sleep(0.08)
    with pytest.raises(KeyError):
        d.pop("a")


def test_pop_expired_with_default_returns_default():
    d = ExpiredDict(expires_in_seconds=0.05)
    d["a"] = 1
    time.sleep(0.08)
    assert d.pop("a", "fallback") == "fallback"


def test_views_skip_expired_entries_without_refreshing():
    d = ExpiredDict(expires_in_seconds=0.1)
    d["live"] = 1
    d["dead"] = 2
    time.sleep(0.15)
    # Both are now expired; listing must not resurrect them.
    assert d.keys() == []
    assert d.values() == []
    assert d.items() == []
    assert list(iter(d)) == []
    assert len(d) == 0


def test_views_include_live_entries():
    d = ExpiredDict(expires_in_seconds=60)
    d["a"] = 1
    d["b"] = 2
    assert sorted(d.keys()) == ["a", "b"]
    assert sorted(d.values()) == [1, 2]
    assert sorted(d.items()) == [("a", 1), ("b", 2)]


def test_len_counts_only_live_entries():
    d = ExpiredDict(expires_in_seconds=0.05)
    d["a"] = 1
    d["b"] = 2
    assert len(d) == 2
    time.sleep(0.08)
    assert len(d) == 0
