# 🎃 Panupan's NovaAgent - Brandable AI Agent ♦️

> **AI Agent Harness ระดับ Production** — สร้างโดย **ภาณุพันธ์ (Panupan)**  
> ฉลาด · สวยงาม · ยืดหยุ่น · ปลอดภัย · ฟรี 100%

---

## 👋 ผู้พัฒนา

- **ชื่อ:** ภาณุพันธ์ (Panupan)
- **GitHub:** [@appleid7899067-netizen](https://github.com/appleid7899067-netizen)
- **โปรเจกต์:** NovaAgent-Brandable
- **Brand:** boss.slilelo

---

## ✨ ฟีเจอร์เด่น

| ฟีเจอร์ | รายละเอียด |
|:---|:---|
| 🧠 **Multi-Provider** | สลับ LLM อัตโนมัติ (OpenRouter x4, Groq, Ollama) |
| 🛠️ **46+ Skills** | Codex, UI/UX, Browser, Video, Image Generation |
| 🔍 **Expert API** | ตรวจโค้ดระดับ Senior Developer (Port 8001) |
| 📊 **Gold API** | ดึงราคาทองคำ Real-time (Port 8000) |
| ✅ **Tasks API** | จัดการงานด้วย SQLite (Port 8002) |
| 💾 **Memory System** | 3 ชั้น: Context -> Daily -> Core |
| 📚 **Knowledge Graph** | คลังความรู้จัดหมวดหมู่ + ค้นหา |
| 🔄 **Self-Evolution** | บอทพัฒนาตัวเองจากบทเรียน |
| 👥 **Multi-Agent Team** | Coordinator + Codex + Pixel + Scout |
| 🎨 **Modern UI** | Dark Theme + Glassmorphism + Tool Timeline |

---

## 🚀 เริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies

pip install -r requirements.txt

### 2. ตั้งค่า API Keys

สร้างไฟล์ secrets.local.json:
{
  "openrouter": ["sk-or-v1-xxx"],
  "groq": ["gsk_xxx"]
}

### 3. รัน NovaAgent

nohup env BRAND_NAME=boss.slilelo python app.py > ~/nova.log 2>&1 &

### 4. เปิดเบราว์เซอร์

http://localhost:9999

> 💡 ถ้าอยากให้เข้าถึงได้จากเครื่องอื่น/LAN ให้ใส่ `WEB_HOST=0.0.0.0` และตั้ง `web_password`
> ใน `config.json` ก่อน (ถ้าไม่ตั้งรหัสผ่าน ระบบจะ bind แค่ `127.0.0.1`)

---

## 🦙 รันด้วย Ollama (Local ฟรี — ไม่ต้องใช้ API key)

`config.json` ตั้งค่าเริ่มต้นไว้ให้ใช้ **Ollama** แล้ว (provider `custom:fe01f280`)

```bash
# 1) ติดตั้ง Ollama  (macOS: brew install ollama | Linux: curl -fsSL https://ollama.com/install.sh | sh)
# 2) รันสคริปต์เดียวจบ — เช็ก/สตาร์ท ollama, ดาวน์โหลดโมเดล, แล้วเปิด NovaAgent
bash scripts/start-ollama.sh
```

สคริปต์จะจัดการให้อัตโนมัติ:

| ขั้นตอน | รายละเอียด |
|:---|:---|
| ตรวจ `ollama` | แจ้งวิธีติดตั้งถ้ายังไม่มี |
| สตาร์ท server | `ollama serve` ถ้ายังไม่รัน (พอร์ต 11434) |
| ดึงโมเดลแชท | `qwen2.5:3b` (เปลี่ยนได้: `OLLAMA_MODEL=qwen2.5:7b bash scripts/start-ollama.sh`) |
| ดึง embedding | `nomic-embed-text` (ใช้กับ Memory + Knowledge base) |
| เปิดเว็บ | `http://localhost:9999` (bind `0.0.0.0`) |

**ค่าที่ตั้งไว้ใน `config.json`:**

```json
{
  "model": "qwen2.5:3b",
  "bot_type": "custom:fe01f280",
  "custom_api_base": "http://127.0.0.1:11434/v1",
  "custom_api_key": "ollama",
  "embedding_provider": "custom:fe01f280",
  "embedding_model": "nomic-embed-text",
  "embedding_dimensions": 768,
  "enable_thinking": false
}
```

---

## 🆓 ผู้ให้บริการฟรี (API key) — สลับได้ด้วยคำสั่งเดียว

```bash
# เก็บ config + key ไว้นอก repo ก่อน (กัน key หลุดขึ้น git)
export COW_DATA_DIR="$HOME/.cow"

TYPHOON_API_KEY=xxx   bash scripts/use-provider.sh typhoon
GEMINI_API_KEY=xxx    bash scripts/use-provider.sh gemini
GROQ_API_KEY=xxx      bash scripts/use-provider.sh groq
OPENROUTER_API_KEY=xxx bash scripts/use-provider.sh openrouter
bash scripts/use-provider.sh ollama          # กลับมาใช้โมเดลในเครื่อง

# ระบุโมเดลเอง / เปลี่ยนโมเดล
MODEL=typhoon-v2.1-12b-instruct bash scripts/use-provider.sh typhoon

COW_DATA_DIR="$HOME/.cow" ./.venv/bin/python app.py
```

| ผู้ให้บริการ | โควตาฟรี (ต.ค. 2026) | จุดเด่น | ข้อควรระวัง |
|:---|:---|:---|:---|
| **Typhoon** (SCB 10X) ⭐ | 200 req/min, 5 req/s — ไม่จำกัด token/วันแบบประกาศ | 30B A3B, ไทยล้ำ, รองรับ tool use, context 128K, OpenAI-compatible | เป็น research showcase — ผู้ให้บริการเก็บข้อมูลไปพัฒนาโมเดล |
| **Gemini** (AI Studio) | ~1,500 req/วัน, 15 RPM, 1M TPM | context 1M, เรียก tool เก่ง, รองรับ native ในโปรเจ็ก | ข้อมูล free tier ถูกนำไปใช้เทรน |
| **OpenRouter** | 50 req/วัน (1,000 หลังเติม $10 ครั้งเดียว) | โมเดล `:free` หลายค่าย | โมเดลฟรีหมุนเวียน/หายบ่อย |
| **Groq** | 1,000 req/วัน แต่ **200K tokens/วัน** | เร็วมาก | prompt ของโปรเจ็ก ~14K tokens → ได้ ~14 ข้อความ/วัน |
| **Cerebras** | ❌ ยกเลิกฟรีถาวรแล้ว (เหลือ $5 trial 30 วัน + ต้องผูกบัตร) | — | — |

> ⚠️ **GitHub Models** ปิดให้บริการ 30 ก.ค. 2026 แล้ว

**ทำไม Typhoon ถึงคุ้มสุดสำหรับโปรเจ็กนี้:** prompt เริ่มต้นของ NovaAgent คือ ~14,000 tokens (system prompt + tool schema 17 ตัว) ผู้ให้บริการที่จำกัด *token/วัน* จะหมดโควตาเร็วมาก ส่วน Typhoon จำกัดแค่ *req/min* ที่ 200 — ใช้ได้จริงทั้งวันโดยไม่ต้องกังวลเรื่อง token

**Embedding:** สคริปต์จะเช็กให้อัตโนมัติ — ถ้าเครื่องมี Ollama รันอยู่จะใช้ `nomic-embed-text` (274 MB) ต่อให้แชทใช้ cloud ไม่งั้นจะตั้งเป็น keyword-only (Memory ยังทำงาน แต่ค้นด้วยคีย์เวิร์ด)

## 📱 Termux (Android) — ไม่มี Docker

> **Docker ใช้บน Termux ไม่ได้** — Termux เป็นแอป Android ไม่มี Docker daemon
> (ต้อง root + kernel ที่รองรับ) ข้อความ `Cannot connect to the Docker daemon ... /data/data/com.termux/...`
> คือเรื่องปกติ ไม่ใช่ความผิดพลาดของคุณ

ติดตั้งแบบ native แทน:

```bash
# 1) แพ็กเกจพื้นฐาน (ใช้เวลาสักครู่)
pkg update -y && pkg upgrade -y
pkg install -y python git clang make binutils libffi openssl

# 2) แพ็กเกจที่ต้องคอมไพล์ — ใช้ตัวที่ Termux เตรียมไว้ (อย่า pip install)
pkg install -y python-numpy python-pillow python-cryptography

# 3) โคลนโปรเจ็ก
cd ~
git clone https://github.com/appleid7899067-netizen/NovaAgent-Brandable.git
cd NovaAgent-Brandable

# 4) venv ต้องใช้ --system-site-packages เพื่อมองเห็น numpy/pillow/cryptography จาก pkg
python -m venv --system-site-packages .venv
source .venv/bin/activate
pip install -U pip setuptools wheel

# 5) ติดตั้งเฉพาะที่จำเป็นกับ Web console (ไม่ต้องลง SDK ของ Telegram/Discord/...)
pip install -r requirements-web.txt
#    ถ้าต้องการทุก channel ค่อยใช้: pip install -r requirements.txt

# 6) ตั้งค่า + รัน
export COW_DATA_DIR="$HOME/.cow"
TYPHOON_API_KEY="sk-..." bash scripts/use-provider.sh typhoon
COW_DATA_DIR="$HOME/.cow" python app.py
```

เปิดเบราว์เซอร์บนมือถือ → **http://localhost:9999**

**ให้มือถือ/แท็บเล็ตอื่นในวง Wi-Fi เดียวกันเข้าถึงได้:**

```bash
ip addr show wlan0 | grep 'inet '     # เอา IP เช่น 192.168.1.42
COW_DATA_DIR="$HOME/.cow" WEB_HOST=0.0.0.0 python app.py
# เปิด http://192.168.1.42:9999 จากเครื่องอื่น
```

**ให้ทำงานต่อแม้ปิดหน้าจอ:**

```bash
pkg install -y termux-api tmux
termux-wake-lock                     # กัน Android ฆ่า process
tmux new -s nova
# ... รัน app.py ใน tmux แล้วกด Ctrl+B แล้ว D เพื่อออกจาก session
tmux attach -t nova                  # กลับมาดู
termux-wake-unlock                   # เลิกใช้เมื่อหยุด
```

และปิด **Battery optimization** ให้ Termux ในการตั้งค่า Android

**แก้ปัญหาบน Termux:**

| อาการ | วิธีแก้ |
|:---|:---|
| `No module named 'numpy'` ใน venv | สร้าง venv ใหม่ด้วย `python -m venv --system-site-packages .venv` |
| `error: command 'clang' failed` | `pkg install clang make binutils` แล้วรัน pip ใหม่ |
| `cryptography` ติดตั้งไม่ผ่าน | `pkg install python-cryptography` แล้วใช้ `--system-site-packages` |
| แอปถูกฆ่าเมื่อปิดจอ | `termux-wake-lock` + ปิด battery optimization |
| อยากได้ wheel สำเร็จรูปเพิ่ม | `pip install --extra-index-url https://termux-user-repository.github.io/pypi/ ...` |

**หมายเหตุ**
- ถ้ารัน NovaAgent ใน **Docker** (บน PC/NAS ไม่ใช่ Termux) ให้เปลี่ยน `custom_api_base` เป็น `http://host.docker.internal:11434/v1`
  (หรือ IP ของเครื่อง host) เพราะ `127.0.0.1` ใน container คือตัว container เอง
- โมเดลเล็ก (3B) เรียก tool ได้ไม่แม่นเท่าโมเดลใหญ่ — งาน agent หลายขั้นตอนแนะนำ `qwen2.5:7b` ขึ้นไป
- ต้องการสลับกลับไปใช้ Puter Bridge / OpenAI ใช้หน้า **Settings** ในคอนโซล หรือแก้ `config.json`
  (ไฟล์สำรองก่อนแก้อยู่ที่ `config.json.bak`) — ค่า `bot_type` ต้องตรงกับ `custom_providers[].id`

---

## 🛠️ API Endpoints

| API | Port | Endpoint | หน้าที่ |
|:---|:---|:---|:---|
| **NovaAgent Core** | 9999 | / | หน้าแชทหลัก |
| **Gold API** | 8000 | /api/gold | ราคาทองคำ |
| **Expert API** | 8001 | /api/expert/review | ตรวจโค้ด |
| **Tasks API** | 8002 | /tasks | จัดการงาน |
| **Puter Bridge** | 8741 | /v1/models | LLM Gateway |
| **Ollama** | 11434 | /api/tags | โมเดล Local |

---

## 📁 โครงสร้างโปรเจกต์

NovaAgent-Brandable/
├── agent/              # Core Agent logic
├── channel/            # Web UI + Channels
├── expert_system/      # Expert API
├── knowledge/          # Knowledge Graph
├── models/             # LLM integrations
├── skills/             # 46+ Skills
├── tasks_api/          # Tasks API
├── app.py              # Entry point
├── config.json         # Config (gitignored)
├── secrets.local.json  # API Keys (gitignored)
└── RULE.md             # Agent rules

---

## 📝 License

MIT License - ดูรายละเอียดใน LICENSE

---

## 🙏 กิตติศัพท์

- สร้างต่อยอดจาก CowAgent (https://github.com/zhayujie/CowAgent)
- ใช้ FastAPI (https://fastapi.tiangolo.com/), Tailwind CSS (https://tailwindcss.com/)
- LLM Providers: OpenRouter, Groq, Ollama

---

<div align="center">

**สร้างด้วย 💜 โดย ภาณุพันธ์ (Panupan)**

⭐ Star โปรเจกต์นี้ถ้าคุณชอบ!

</div>
