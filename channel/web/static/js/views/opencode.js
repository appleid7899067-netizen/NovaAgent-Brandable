/* OpenCode view: frames the headless `opencode serve` console.
   The backend starts that server on boot (channel/web/api/opencode.py) and
   /api/opencode/web reports when it is reachable. This script waits for that
   before pointing the iframe at it, so the view never shows a dead frame.
   These are classic scripts sharing one global scope; see
   channel/web/README.md before changing the load order. */

const OPENCODE_READY_POLL_MS = 1500;
let _opencodePollTimer = null;

function _opencodeFrameUrl(port) {
    // Same host the console was reached on, so it also works over a LAN
    // address; only the port differs from the web console's.
    const host = window.location.hostname || '127.0.0.1';
    return window.location.protocol + '//' + host + ':' + port + '/';
}

function _opencodeShowFrame(frame, loading) {
    if (frame) frame.style.display = '';
    if (loading) loading.style.display = 'none';
}

function loadOpenCodeView() {
    const frame = document.getElementById('opencode-frame');
    const loading = document.getElementById('opencode-loading');
    if (!frame) return;
    // The iframe keeps its state while hidden, so only load it once per page.
    if (frame.dataset.loaded === '1') return;

    const retry = () => {
        if (_opencodePollTimer) return;
        _opencodePollTimer = setTimeout(() => {
            _opencodePollTimer = null;
            if (currentView === 'opencode') loadOpenCodeView();
        }, OPENCODE_READY_POLL_MS);
    };

    fetch('/api/opencode/web', { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
            if (data && data.running && data.port) {
                frame.src = _opencodeFrameUrl(data.port);
                frame.dataset.loaded = '1';
                _opencodeShowFrame(frame, loading);
                return;
            }
            retry();
        })
        .catch(retry);
}

function reloadOpenCodeView() {
    const frame = document.getElementById('opencode-frame');
    const loading = document.getElementById('opencode-loading');
    if (!frame) return;
    frame.dataset.loaded = '';
    frame.removeAttribute('src');
    frame.style.display = 'none';
    if (loading) loading.style.display = '';
    loadOpenCodeView();
}
