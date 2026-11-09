#!/bin/bash
# ============================================================
# use-provider.sh — สลับผู้ให้บริการโมเดลของ NovaAgent
# ------------------------------------------------------------
# เขียนค่าลง "$NOVA_DATA_DIR/config.json" (ค่าเริ่มต้น = ./config.json)
# โดย **ไม่แตะไฟล์ที่ track ใน git** ถ้าตั้ง NOVA_DATA_DIR ไว้ เช่น ~/.nova
#
# ใช้งาน:
#   TYPHOON_API_KEY=xxx bash scripts/use-provider.sh typhoon
#   GEMINI_API_KEY=xxx  bash scripts/use-provider.sh gemini
#   GROQ_API_KEY=xxx    bash scripts/use-provider.sh groq
#   OPENROUTER_API_KEY=xxx bash scripts/use-provider.sh openrouter
#   DEEPSEEK_API_KEY=xxx bash scripts/use-provider.sh deepseek
#   bash scripts/use-provider.sh ollama        # กลับไปใช้โมเดลในเครื่อง
#
# ถ้าไม่ใส่ env var สคริปต์จะถามแบบซ่อนตัวอักษร (read -s)
# ตัวเลือกเสริม:
#   MODEL=<ชื่อโมเดล>          ระบุโมเดลเอง
#   NOVA_DATA_DIR=~/.nova        เก็บ config (รวม key) นอก repo
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."
BASE_DIR="$(pwd)"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info() { echo -e "${CYAN}[provider]${NC} $*"; }
ok()   { echo -e "${GREEN}[provider]${NC} $*"; }
warn() { echo -e "${YELLOW}[provider]${NC} $*"; }
die()  { echo -e "${RED}[provider]${NC} $*" >&2; exit 1; }

PROVIDER="${1:-}"
[ -n "$PROVIDER" ] || die "ระบุ provider: typhoon | gemini | groq | openrouter | deepseek | ollama"

# ---------- config ที่จะเขียน (ไม่ทับไฟล์ใน git ถ้าตั้ง NOVA_DATA_DIR) ----------
DATA_DIR="${NOVA_DATA_DIR:-$BASE_DIR}"
mkdir -p "$DATA_DIR"
CFG="$DATA_DIR/config.json"
if [ ! -f "$CFG" ]; then
  TEMPLATE="$BASE_DIR/config.json"
  [ -f "$TEMPLATE" ] || TEMPLATE="$BASE_DIR/config-template.json"
  [ -f "$TEMPLATE" ] || die "ไม่พบ config.json หรือ config-template.json ใน repo"
  cp "$TEMPLATE" "$CFG"
  info "สร้าง config ใหม่จาก template: $CFG"
fi

PY="python3"
[ -x "$BASE_DIR/.venv/bin/python" ] && PY="$BASE_DIR/.venv/bin/python"

# ---------- ถาม key แบบซ่อน (ถ้ายังไม่มีใน env) ----------
read_key() {          # read_key ENV_VAR "ข้อความ"
  local var="$1" label="$2" val=""
  val="${!var:-}"
  if [ -z "$val" ]; then
    [ -t 0 ] || die "ไม่พบ $var และไม่ได้รันแบบ interactive — ใส่ key ผ่าน env var ก่อน"
    printf "%s" "$label (จะไม่แสดงบนจอ): "
    read -rs val
    echo
    [ -n "$val" ] || die "ไม่ได้ใส่ key"
  fi
  printf '%s' "$val"
}

case "$PROVIDER" in
  ollama)
    KEY="ollama"
    ;;
  typhoon)
    KEY="$(read_key TYPHOON_API_KEY 'Typhoon API key (opentyphoon.ai)')"
    ;;
  gemini)
    KEY="$(read_key GEMINI_API_KEY 'Google AI Studio API key')"
    ;;
  groq)
    KEY="$(read_key GROQ_API_KEY 'Groq API key')"
    ;;
  openrouter)
    KEY="$(read_key OPENROUTER_API_KEY 'OpenRouter API key')"
    ;;
  deepseek)
    KEY="$(read_key DEEPSEEK_API_KEY 'DeepSeek API key')"
    ;;
  *)
    die "ไม่รู้จัก provider '$PROVIDER' (รองรับ: typhoon | gemini | groq | openrouter | deepseek | ollama)"
    ;;
esac

# ---------- embedding: ใช้ Ollama ในเครื่องถ้ามี ไม่งั้น keyword-only ----------
EMBED="none"
if curl -fsS -m 2 "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
  EMBED="ollama"
fi

# ---------- เขียน config ----------
"$PY" - "$CFG" "$PROVIDER" "$KEY" "$EMBED" "${MODEL:-}" <<'PYEOF'
import json, sys

cfg_path, provider, key, embed, model_override = sys.argv[1:6]

with open(cfg_path, encoding="utf-8") as f:
    cfg = json.load(f)

TID = "typhoon01"
GID = "groq0001"
OID = "openrt01"
OLLAMA_ID = "fe01f280"


def upsert(pid, entry):
    provs = [p for p in cfg.get("custom_providers", []) if isinstance(p, dict)]
    provs = [p for p in provs if p.get("id") != pid]
    provs.append(entry)
    cfg["custom_providers"] = provs


# ค่าเริ่มต้นร่วม: ปิด thinking/effort ที่ผู้ให้บริการ OpenAI-compatible บางรายไม่รับ
cfg["enable_thinking"] = False
cfg["reasoning_effort_by_model"] = {}
cfg["reasoning_effort"] = "high"

if provider == "ollama":
    model = model_override or "qwen2.5:3b"
    cfg.update({
        "model": model,
        "bot_type": f"custom:{OLLAMA_ID}",
        "custom_api_key": "ollama",
        "custom_api_base": "http://127.0.0.1:11434/v1",
        "open_ai_api_key": "",
        "open_ai_api_base": "http://127.0.0.1:11434/v1",
    })
    upsert(OLLAMA_ID, {"id": OLLAMA_ID, "name": "Ollama (Local ฟรี)",
                       "api_key": "ollama", "api_base": "http://127.0.0.1:11434/v1",
                       "model": model})

elif provider == "typhoon":
    model = model_override or "typhoon-v2.5-30b-a3b-instruct"
    cfg.update({
        "model": model,
        "bot_type": f"custom:{TID}",
        "custom_api_key": key,
        "custom_api_base": "https://api.opentyphoon.ai/v1",
        "open_ai_api_key": "",
        "open_ai_api_base": "https://api.opentyphoon.ai/v1",
    })
    upsert(TID, {"id": TID, "name": "Typhoon (ฟรี · ไทย)",
                 "api_key": key, "api_base": "https://api.opentyphoon.ai/v1",
                 "model": model})

elif provider == "groq":
    model = model_override or "openai/gpt-oss-120b"
    cfg.update({
        "model": model,
        "bot_type": f"custom:{GID}",
        "custom_api_key": key,
        "custom_api_base": "https://api.groq.com/openai/v1",
        "open_ai_api_key": "",
        "open_ai_api_base": "https://api.groq.com/openai/v1",
    })
    upsert(GID, {"id": GID, "name": "Groq (ฟรี)",
                 "api_key": key, "api_base": "https://api.groq.com/openai/v1",
                 "model": model})

elif provider == "openrouter":
    model = model_override or "google/gemma-4-26b-a4b-it:free"
    cfg.update({
        "model": model,
        "bot_type": f"custom:{OID}",
        "custom_api_key": key,
        "custom_api_base": "https://openrouter.ai/api/v1",
        "open_ai_api_key": "",
        "open_ai_api_base": "https://openrouter.ai/api/v1",
    })
    upsert(OID, {"id": OID, "name": "OpenRouter (ฟรี)",
                 "api_key": key, "api_base": "https://openrouter.ai/api/v1",
                 "model": model})

elif provider == "deepseek":
    model = model_override or "deepseek-flash"
    cfg.update({
        "model": model,
        "bot_type": "deepseek",
        "deepseek_api_key": key,
        "deepseek_api_base": "https://api.deepseek.com/v1",
        "open_ai_api_key": "",
    })

# embedding
if embed == "ollama":
    cfg["embedding_provider"] = f"custom:{OLLAMA_ID}"
    cfg["embedding_model"] = "nomic-embed-text"
    cfg["embedding_dimensions"] = 768
    upsert(OLLAMA_ID, next((p for p in cfg["custom_providers"] if p.get("id") == OLLAMA_ID),
                           {"id": OLLAMA_ID, "name": "Ollama (Local ฟรี)",
                            "api_key": "ollama", "api_base": "http://127.0.0.1:11434/v1",
                            "model": "qwen2.5:3b"}))
else:
    cfg["embedding_provider"] = ""
    cfg["embedding_model"] = ""
    cfg["embedding_dimensions"] = 0

with open(cfg_path, "w", encoding="utf-8") as f:
    json.dump(cfg, f, ensure_ascii=False, indent=4)

print(f"  model      : {cfg['model']}")
print(f"  bot_type   : {cfg['bot_type']}")
base = cfg.get("custom_api_base") or cfg.get("deepseek_api_base") or ""
if base:
    print(f"  api_base   : {base}")
print(f"  embedding  : {cfg['embedding_provider'] or 'keyword-only (ไม่ใช้ embedding)'}")
PYEOF

ok "ตั้งค่า '$PROVIDER' เรียบร้อย → $CFG"
echo
info "เปิดใช้งาน:"
if [ "$DATA_DIR" = "$BASE_DIR" ]; then
  warn "  config อยู่ใน repo (config.json) — ถ้าใส่ API key จริง แนะนำย้ายไปนอก repo:"
  warn "  export NOVA_DATA_DIR=\"\$HOME/.nova\" แล้วรันสคริปต์นี้ซ้ำ"
  echo "  ./.venv/bin/python app.py"
else
  echo "  NOVA_DATA_DIR=\"$DATA_DIR\" ./.venv/bin/python app.py"
fi
echo
info "ตรวจว่าโมเดลตอบได้:"
echo "  curl -s http://127.0.0.1:9999/api/models | head -c 400"
