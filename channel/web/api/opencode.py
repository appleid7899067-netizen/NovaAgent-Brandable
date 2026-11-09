"""OpenCode catalog and function registry for the web console."""

import atexit
import json
import os
import re
import signal
import socket
import subprocess
import threading

import web

from channel.web.core._common import _require_auth
from common.log import logger


_HOME = os.path.expanduser("~")
_PROJECTS = os.path.join(_HOME, "projects")
_OPENCODE = os.environ.get("OPENCODE_BIN", "opencode")

# The embedded OpenCode web console is a headless ``opencode serve`` process.
# It is owned by this module so the web channel can start it on boot and stop
# it on shutdown, and the UI can ask /api/opencode/web when it is reachable.
_WEB_PORT = int(os.environ.get("OPENCODE_WEB_PORT", "17009"))
_web_lock = threading.Lock()
_web_proc = None


def _port_open(port: int) -> bool:
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.5):
            return True
    except OSError:
        return False


def ensure_web_server(port: int = None) -> bool:
    """Start ``opencode serve`` once and reuse it on later calls."""
    global _web_proc
    port = int(port or _WEB_PORT)
    with _web_lock:
        if _web_proc is not None and _web_proc.poll() is None:
            return True
        if _port_open(port):
            logger.info(f"[OpenCode] Web UI already listening on http://127.0.0.1:{port}")
            return True
        try:
            _web_proc = subprocess.Popen(
                [_OPENCODE, "serve", "--port", str(port), "--hostname", "127.0.0.1"],
                cwd=_PROJECTS,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
        except Exception as exc:
            logger.warning(f"[OpenCode] Failed to start web UI on port {port}: {exc}")
            _web_proc = None
            return False
        logger.info(f"[OpenCode] Starting web UI on http://127.0.0.1:{port} (pid {_web_proc.pid})")
        return True


def stop_web_server() -> None:
    global _web_proc
    with _web_lock:
        proc, _web_proc = _web_proc, None
    if proc is None or proc.poll() is not None:
        return
    try:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except Exception:
        try:
            proc.terminate()
        except Exception:
            pass
    try:
        proc.wait(timeout=5)
    except Exception:
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except Exception:
            pass
    logger.info("[OpenCode] Web UI stopped")


atexit.register(stop_web_server)


def _run(args, timeout=20):
    try:
        proc = subprocess.run(
            [_OPENCODE, *args], cwd=_PROJECTS, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            timeout=timeout, check=False,
        )
        return proc.returncode, proc.stdout or ""
    except Exception as exc:
        return 1, str(exc)


def _models():
    code, output = _run(["models"])
    if code:
        return {"status": "error", "message": output.strip() or "OpenCode models failed"}
    items = []
    for line in output.splitlines():
        value = line.strip()
        if value and "/" in value and not value.startswith(("[", "┌", "│", "└")):
            provider, model = value.split("/", 1)
            items.append({"id": value, "provider": provider, "name": model})
    return {"status": "success", "models": items, "count": len(items), "version": _version()}


def _version():
    code, output = _run(["--version"], timeout=8)
    return output.strip().splitlines()[-1] if code == 0 and output.strip() else "unknown"


def _skills():
    code, output = _run(["debug", "skill"])
    if code:
        return []
    try:
        data = json.loads(output)
        return [{"name": x.get("name", ""), "description": x.get("description", "")}
                for x in data if x.get("name")]
    except Exception:
        return []


def _tools():
    """Return NovaAgent built-in tools alongside the OpenCode catalog."""
    try:
        from agent.tools.tool_manager import ToolManager
        tm = ToolManager()
        if not tm.tool_classes:
            tm.load_tools()
        tools = []
        for name, cls in tm.tool_classes.items():
            try:
                description = getattr(cls(), "description", "") or ""
            except Exception:
                description = ""
            tools.append({"name": name, "description": description})
        return tools
    except Exception as exc:
        logger.warning(f"[OpenCode] Failed to load built-in tools: {exc}")
        return []


def _mcp():
    code, output = _run(["mcp", "list"])
    text = output.strip()
    if not text:
        return []
    servers = []
    for match in re.finditer(r"(?:●\s+)?([✓✗])\s+(\S+).*?(?:\n│\s+[^\n]*)?", text):
        servers.append({"name": match.group(2), "status": "connected" if match.group(1) == "✓" else "failed"})
    if not servers and "No MCP servers configured" in text:
        return []
    return servers


class OpenCodeWebHandler:
    """Readiness probe for the embedded OpenCode web console."""

    def GET(self):
        _require_auth()
        web.header("Content-Type", "application/json; charset=utf-8")
        web.header("Cache-Control", "no-store")
        return json.dumps({
            "status": "success",
            "port": _WEB_PORT,
            "url": f"http://127.0.0.1:{_WEB_PORT}/",
            "running": _port_open(_WEB_PORT),
        }, ensure_ascii=False)


class OpenCodeCatalogHandler:
    def GET(self):
        _require_auth()
        web.header("Content-Type", "application/json; charset=utf-8")
        models = _models()
        return json.dumps({
            "status": "success" if models.get("status") == "success" else "error",
            "version": models.get("version", _version()),
            "models": models.get("models", []),
            "model_count": models.get("count", 0),
            "tools": _tools(),
            "skills": _skills(),
            "mcp": _mcp(),
            "message": models.get("message", ""),
        }, ensure_ascii=False)
