#!/bin/bash
# ============================================================
# start-ollama.sh — รัน NovaAgent ด้วยโมเดล Ollama (Local ฟรี)
# ------------------------------------------------------------
# สคริปต์นี้จะ:
#   1) เช็กว่ามี ollama ในเครื่องไหม
#   2) ถ้า ollama ยังไม่รัน จะสตาร์ท `ollama serve` ให้
#   3) ดึงโมเดล (ถ้ายังไม่มี)
#   4) สตาร์ท NovaAgent (ค่าเริ่มต้น binds 0.0.0.0:9999)
#
# ใช้งาน:
#   bash scripts/start-ollama.sh                 # โมเดลเริ่มต้น = qwen2.5:3b
#   OLLAMA_MODEL=qwen2.5:7b bash scripts/start-ollama.sh
#   WEB_HOST=127.0.0.1 bash scripts/start-ollama.sh   # เปิดแค่ในเครื่อง
# ============================================================
set -e

cd "$(dirname "$0")/.."
BASE_DIR="$(pwd)"

OLLAMA_HOST_URL="${OLLAMA_HOST_URL:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5:3b}"
OLLAMA_EMBED_MODEL="${OLLAMA_EMBED_MODEL:-nomic-embed-text}"
WEB_HOST="${WEB_HOST:-0.0.0.0}"
export NOVA_WEB_PORT="${NOVA_WEB_PORT:-9999}"
# config ที่แอปอ่านจริง = "$NOVA_DATA_DIR/config.json" (ถ้าไม่ตั้ง จะใช้ ./config.json)
DATA_DIR="${NOVA_DATA_DIR:-$BASE_DIR}"
export NOVA_DATA_DIR="$DATA_DIR"
mkdir -p "$DATA_DIR"
CFG="$DATA_DIR/config.json"
if [ ! -f "$CFG" ]; then
  cp "$BASE_DIR/config.json" "$CFG"
fi

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[ollama-start]${NC} $*"; }
ok()    { echo -e "${GREEN}[ollama-start]${NC} $*"; }
warn()  { echo -e "${YELLOW}[ollama-start]${NC} $*"; }
die()   { echo -e "${RED}[ollama-start]${NC} $*" >&2; exit 1; }

# ---------- 1) มี ollama ไหม ----------
if ! command -v ollama >/dev/null 2>&1; then
  die "ไม่พบคำสั่ง 'ollama' ในเครื่อง
ติดตั้งก่อน:
  macOS : brew install ollama    (หรือดาวน์โหลดจาก https://ollama.com/download)
  Linux : curl -fsSL https://ollama.com/install.sh | sh
  Windows: ดาวน์โหลดตัวติดตั้งจาก https://ollama.com/download"
fi
ok "พบ ollama: $(command -v ollama)"

# ---------- 2) ollama server รันอยู่หรือยัง ----------
if ! curl -fsS -m 2 "${OLLAMA_HOST_URL}/api/tags" >/dev/null 2>&1; then
  info "ยังไม่มี ollama server — กำลังสตาร์ท 'ollama serve' ..."
  mkdir -p "$NOVA_DATA_DIR"
  nohup ollama serve > "$NOVA_DATA_DIR/ollama.log" 2>&1 &
  for _ in $(seq 1 30); do
    sleep 1
    if curl -fsS -m 2 "${OLLAMA_HOST_URL}/api/tags" >/dev/null 2>&1; then break; fi
  done
  curl -fsS -m 2 "${OLLAMA_HOST_URL}/api/tags" >/dev/null 2>&1 \
    || die "สตาร์ท ollama server ไม่สำเร็จ — ดู log ที่ $NOVA_DATA_DIR/ollama.log"
fi
ok "ollama server พร้อมใช้งานที่ ${OLLAMA_HOST_URL}"

# ---------- 3) มีโมเดลหรือยัง ----------
if ! ollama list 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "${OLLAMA_MODEL}"; then
  info "ยังไม่มีโมเดล ${OLLAMA_MODEL} — กำลังดาวน์โหลด (อาจใช้เวลาสักครู่) ..."
  ollama pull "${OLLAMA_MODEL}" || die "ดาวน์โหลดโมเดล ${OLLAMA_MODEL} ไม่สำเร็จ"
fi
ok "โมเดลพร้อม: ${OLLAMA_MODEL}"

# โมเดล embedding ใช้สำหรับ memory + knowledge base (ถ้าไม่โหลด ระบบจะทำงานแบบค้นด้วยคีย์เวิร์ด)
if ! ollama list 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "${OLLAMA_EMBED_MODEL}"; then
  info "กำลังดาวน์โหลด embedding model ${OLLAMA_EMBED_MODEL} ..."
  ollama pull "${OLLAMA_EMBED_MODEL}" || warn "โหลด ${OLLAMA_EMBED_MODEL} ไม่สำเร็จ — memory จะใช้ keyword search แทน"
fi

# ---------- 4) สตาร์ท NovaAgent ----------
# ใช้ python จาก venv ถ้ามี
PY="python3"
if [ -x "$BASE_DIR/.venv/bin/python" ]; then
  PY="$BASE_DIR/.venv/bin/python"
fi

# ให้ config ชี้ไปที่โมเดลที่เลือก (ถ้าเลือกโมเดลอื่นผ่าน OLLAMA_MODEL)
"$PY" - "$CFG" "$OLLAMA_MODEL" "$OLLAMA_EMBED_MODEL" <<'PYEOF'
import json, sys
path, model, embed_model = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path, encoding="utf-8") as f:
    cfg = json.load(f)
cfg["model"] = model
for prov in cfg.get("custom_providers", []):
    if prov.get("id") == "fe01f280":          # provider "Ollama (Local ฟรี)"
        prov["model"] = model
        prov["api_base"] = "http://127.0.0.1:11434/v1"
        prov["api_key"] = "ollama"
cfg["bot_type"] = "custom:fe01f280"
cfg["custom_api_base"] = "http://127.0.0.1:11434/v1"
cfg["custom_api_key"] = "ollama"
cfg["embedding_provider"] = "custom:fe01f280"
cfg["embedding_model"] = embed_model
cfg["embedding_dimensions"] = 768
with open(path, "w", encoding="utf-8") as f:
    json.dump(cfg, f, ensure_ascii=False, indent=4)
PYEOF

ok "สตาร์ท NovaAgent — เปิดเบราว์เซอร์ที่ http://localhost:${NOVA_WEB_PORT}"
info "โมเดล: ${OLLAMA_MODEL} | bind: ${WEB_HOST}:${NOVA_WEB_PORT}"
info "config ที่ใช้: ${CFG}"
echo

WEB_HOST="$WEB_HOST" exec "$PY" "$BASE_DIR/app.py"
