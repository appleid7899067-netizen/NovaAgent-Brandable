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

**หมายเหตุ**
- ถ้ารัน NovaAgent ใน **Docker** ให้เปลี่ยน `custom_api_base` เป็น `http://host.docker.internal:11434/v1`
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
