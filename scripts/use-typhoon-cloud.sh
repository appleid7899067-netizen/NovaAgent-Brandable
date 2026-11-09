#!/bin/bash
# Configure NovaAgent to use the Typhoon 4B model hosted on GitHub Actions.
# The API key is prompted securely and stored only in COW_DATA_DIR/config.json.
set -euo pipefail
cd "$(dirname "$0")/.."
BASE_DIR="$(pwd)"
DATA_DIR="${COW_DATA_DIR:-$HOME/.cow}"
mkdir -p "$DATA_DIR"
CFG="$DATA_DIR/config.json"

if [ ! -f "$CFG" ]; then
  TEMPLATE="$BASE_DIR/config-template.json"
  [ -f "$TEMPLATE" ] || TEMPLATE="$BASE_DIR/config.json"
  [ -f "$TEMPLATE" ] || { echo "ไม่พบ config-template.json หรือ config.json"; exit 1; }
  cp "$TEMPLATE" "$CFG"
fi

if [ -z "${NOVA_LLM_API_KEY:-}" ]; then
  [ -t 0 ] || { echo "กรุณารันแบบ interactive เพื่อป้อน API key"; exit 1; }
  read -rsp "ใส่ NOVA_LLM_API_KEY จาก GitHub Secret (จะไม่แสดง): " NOVA_LLM_API_KEY
  echo
fi
[ -n "$NOVA_LLM_API_KEY" ] || { echo "ไม่ได้ใส่ API key"; exit 1; }

python3 - "$CFG" "$NOVA_LLM_API_KEY" <<'PY'
import json, sys
path, key = sys.argv[1:3]
with open(path, encoding="utf-8") as f:
    cfg = json.load(f)

pid = "typhooncloud"
base = "https://drew-kids-pictures-machinery.trycloudflare.com/v1"
model = "typhoon-local"
providers = [p for p in cfg.get("custom_providers", []) if isinstance(p, dict) and p.get("id") != pid]
providers.append({
    "id": pid,
    "name": "Typhoon 4B (GitHub Cloud)",
    "api_key": key,
    "api_base": base,
    "model": model
})
cfg["custom_providers"] = providers
cfg.update({
    "model": model,
    "bot_type": "custom:" + pid,
    "custom_api_key": key,
    "custom_api_base": base,
    "open_ai_api_key": "",
    "open_ai_api_base": base,
    "enable_thinking": False,
    "reasoning_effort_by_model": {},
    "reasoning_effort": "high"
})
with open(path, "w", encoding="utf-8") as f:
    json.dump(cfg, f, ensure_ascii=False, indent=4)
print("ตั้งค่า Typhoon 4B Cloud สำเร็จ")
print("API base:", base)
print("Model:", model)
print("Config:", path)
PY
echo
echo "เปิด NovaAgent ด้วย:"
echo "COW_DATA_DIR=\"$DATA_DIR\" python app.py"
