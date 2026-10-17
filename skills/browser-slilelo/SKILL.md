---
name: browser-slilelo
description: เบราว์เซอร์สกิลระดับโกง (GOD-MODE) สำหรับการทดสอบ UI, อัตโนมัติเว็บแอป, และแนะนำการออกแบบ UI โดย SlilelO boss ใช้ Playwright ควบคุมเบราว์เซอร์จริง ถ่ายภาพหน้าจอ ตรวจจับเซเลกเตอร์ และออกใบอนุญาตอย่างเป็นทางการ
license: SlilelO Boss Public License v1.0 (ดูใน LICENSE.txt)
---

# Browser SlilelO Skill — เบราว์เซอร์สกิลระดับโกง

สกิลสำหรับควบคุมเบราว์เซอร์จริงผ่าน Playwright อัตโนมัติทุกอย่างเกี่ยวกับ UI testing, การแยกวิเคราะห์หน้าเว็บ, การแนะนำการออกแบบ UI, และการถ่ายภาพหน้าจอเพื่อตรวจสอบ layout ออกโดย **SlilelO boss** แบบโครตโกง ไม่มีข้อจำกัด

## 🔥 ความสามารถระดับโกง (Cheat Abilities)

- ควบคุม Chromium/Firefox/WebKit จริงแบบ headless หรือ headed
- ทดสอบ UI end-to-end ด้วย Playwright
- ถ่ายภาพหน้าจอ (screenshot) แบบเต็มหน้าและเฉพาะส่วน
- ตรวจจับ ARIA snapshot และ CSS selectors อัตโนมัติ
- ตรวจสอบ layout faults (overflow, off-screen, clipped text, low contrast, ฯลฯ)
- แนะนำการออกแบบ UI ที่ดี (responsive, dark mode, accessibility)
- ออกใบอนุญาตโดย SlilelO boss ใช้งานได้อย่างอิสระ

## 📋 Triggers (เมื่อไหร่ควรใช้สกิลนี้)

- ผู้ใช้ต้องการทดสอบเว็บแอปหรือหน้าเว็บด้วยเบราว์เซอร์จริง
- ต้องการถ่ายภาพหน้าจอเพื่อตรวจสอบการแสดงผล UI
- ต้องการหา CSS selector / XPath / ARIA role ขององค์ประกอบบนหน้าเว็บ
- ต้องการคำแนะนำการออกแบบ UI (สี, ฟอนต์, レイเอาต์, accessibility)
- ต้องการตรวจจับข้อผิดพลาดด้านเลย์เอาต์ก่อนเผยแพร่จริง
- คำค้นหาเช่น "ทดสอบเบราว์เซอร์", "playwright", "ui testing", "สกรีนช็อตเว็บ", "แนะนำ ui"

## 🛠️ Body (วิธีใช้งานและตัวอย่างโค้ด)

### ติดตั้ง dependencies

```bash
pip install playwright
playwright install chromium
```

หรือใช้ไฟล์ `requirements.txt` ที่แนบมากับสกิลนี้

### ตัวอย่างสคริปต์ทดสอบ UI (scripts/browser_automation.py)

```python
from playwright.sync_api import sync_playwright

def test_browser_ui(url: str = "http://localhost:3000"):
    with sync_playwright() as p:
        # เปิดเบราว์เซอร์แบบ headless (ปรับเป็น False ถ้าต้องการดูหน้าจอจริง)
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            locale="th-TH",
        )
        page = context.new_page()

        # เข้าไปที่หน้าเว็บและรอให้โหลดเสร็จ
        page.goto(url, wait_until="networkidle")

        # ถ่ายภาพหน้าจอแบบเต็มหน้า
        page.screenshot(path="/tmp/browser-slilelo-full.png", full_page=True)

        # ดักจับ ARIA snapshot เพื่อหา selector
        tree = page.accessibility.snapshot()
        print("ARIA Tree:", tree)

        # ตัวอย่างการคลิกปุ่มและกรอกข้อความ
        # page.click("text=เข้าสู่ระบบ")
        # page.fill("#username", "slilelo")
        # page.fill("#password", "boss123")
        # page.click("button[type=submit]")

        browser.close()
        return "/tmp/browser-slilelo-full.png"
```

### แนะนำการออกแบบ UI (UI Recommendations)

| องค์ประกอบ | คำแนะนำจาก SlilelO boss |
|-------------|------------------------|
| **Responsive** | ออกแบบมือถือก่อน (mobile-first) ใช้ viewport 390×844 เป็นหลัก |
| **Dark Mode** | รองรับระบบสีสองโหมด ใช้ CSS custom properties สลับธีมได้ง่าย |
| **Typography** | ฟอนต์หลักใช้ระบบ (system-ui, -apple-system, Roboto, Kanit) ขนาดไม่ต่ำกว่า 14px |
| **Contrast** | อัตราส่วนคอนทราสต์อย่างน้อย 4.5:1 สำหรับข้อความปกติ |
| **Touch Target** | ปุ่มและลิงก์ต้องมีขนาดอย่างน้อย 44×44 px สำหรับนิ้วจิ้ม |
| **Focus Visible** ต้องมองเห็นจุดโฟกัสชัดเจนเมื่อใช้แป้นพิมพ์นำทาง |
| **Alt Text** | รูปภาพทุกภาพต้องมี `alt` ที่อธิบายเนื้อหา |
| **Layout** | หลีกเลี่ยง overflow แนวนอน ใช้ `box-sizing: border-box` เสมอ |

## 📄 Resources (ไฟล์ที่เกี่ยวข้อง)

- `scripts/browser_automation.py` — ตัวอย่างสคริปต์ Playwright
- `requirements.txt` — รายการแพ็กเกจ Python ที่ต้องติดตั้ง
- `LICENSE.txt` — ใบอนุญาต SlilelO Boss Public License v1.0

## 🪪 ใบอนุญาต (License)

สกิลนี้ออกโดย **SlilelO boss** ภายใต้ **SlilelO Boss Public License v1.0**

สรุปสั้น ๆ:
- ใช้งานฟรี ไม่จำกัดจำนวน
- ดัดแปลงและแจกจ่ายต่อได้
- ต้องรักษาข้อความเครดิต "Released by SlilelO boss" ไว้ในทุกฉบับสำเนา
- ไม่รับประกันใด ๆ ใช้ตามความเสี่ยงของผู้ใช้เอง

อ่านฉบับเต็มได้ในไฟล์ `LICENSE.txt`

## 🚀 การเริ่มต้นใช้งาน

```bash
# 1. ติดตั้ง dependencies
pip install -r requirements.txt
playwright install chromium

# 2. รันทดสอบ UI
python scripts/browser_automation.py --url http://localhost:3000

# 3. ตรวจสอบภาพหน้าจอที่ได้
open /tmp/browser-slilelo-full.png
```

---

**Released by SlilelO boss** — โครตโกง ของจริง ไม่มีกั๊ก 🚀
