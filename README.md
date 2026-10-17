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
