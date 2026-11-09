// PuterXboss view logic
// Goal: simple opencode-like panel that triggers a chat run using the existing
// NovaAgent web console APIs.

function _setStatus(text, kind) {
  const el = document.getElementById('puterxboss-status');
  if (!el) return;
  el.textContent = text || '';
  el.className = '';
  if (kind) el.classList.add(kind);
}

async function _postJson(url, body, method = 'POST') {
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

// This view intentionally uses a “single agent” mode by relying on the
// backend's active/default agent routing.
async function runTest() {
  const out = document.getElementById('puterxboss-output');
  const prompt = document.getElementById('puterxboss-prompt')?.value || '';
  if (out) out.textContent = '';
  _setStatus('Running…');

  // Minimal approach: send message to the current web chat session.
  // NovaAgent's chat composer uses /message + /stream. We can mimic it by
  // calling /message first and then polling /stream.

  // If the app already has a session_id concept, the backend will resolve it
  // from cookies/session. The web console does the same.
  const activeModel = document.getElementById('puterxboss-model')?.value;

  // /message expects { instruction, agent_id?, model?, ... } depending on backend.
  // We keep the payload small: instruction + model (if provided).
  const payload = {
    instruction: prompt,
  };
  if (activeModel) payload.model = activeModel;

  try {
    // Start turn
    const msg = await _postJson('/message', payload);
    // If response already has streaming data, it will be in msg.
    out && (out.textContent = msg?.message || msg?.text || '');
    _setStatus('Done', 'ok');
  } catch (e) {
    console.error(e);
    _setStatus('Failed: ' + (e?.message || String(e)), 'error');
  }
}

function init() {
  const btn = document.getElementById('puterxboss-run');
  if (btn) btn.addEventListener('click', runTest);

  // Model list is populated by backend provider list in the full app.
  // We keep the dropdown enabled later; for now, allow user to select via
  // models already present.
  const sel = document.getElementById('puterxboss-model');
  if (sel) {
    // Try to load models list from backend.
    // /api/models returns provider+models depending on server.
    fetch('/api/models')
      .then(r => r.json())
      .then(data => {
        const options = [];
        const modelIds = [];
        // best-effort: support multiple response shapes
        if (Array.isArray(data)) {
          for (const row of data) if (String(row.id || '').startsWith('puterx/')) modelIds.push(row.id);
        } else {
          // common shape: { models: [...] }
          const arr = data?.models || data?.data || [];
          if (Array.isArray(arr)) {
            for (const m of arr) {
              const id = m?.id || m?.model_id || m?.modelID;
              if (id && String(id).startsWith('puterx/')) modelIds.push(id);
            }
          }
        }
        if (modelIds.length === 0) {
          // fallback: keep disabled
          sel.disabled = true;
          sel.innerHTML = '<option value="">(no puterx models)</option>';
          return;
        }
        sel.disabled = false;
        sel.innerHTML = modelIds.slice(0, 50).map(id => `<option value="${id}">${id}</option>`).join('');
      })
      .catch(() => {
        // Keep disabled if /api/models isn't available
        if (sel) sel.disabled = true;
      });
  }

  _setStatus('Ready');
}

window.addEventListener('load', init);
