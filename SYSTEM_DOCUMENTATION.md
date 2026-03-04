# ระบบรับสมัครงานออนไลน์ — เทศบาลเมืองอุทัยธานี
**System Documentation | อัปเดตล่าสุด: มีนาคม 2569**

---

## � ภาพรวมระบบ (System Overview)

ระบบรับสมัครงานออนไลน์สำหรับเทศบาลเมืองอุทัยธานี พัฒนาเพื่อให้ประชาชนสามารถยื่นใบสมัครได้ผ่านเว็บไซต์อย่างสะดวก รวดเร็ว และโปร่งใส

**สโลแกน:** *"เมืองน่าอยู่ บุคลากรมีคุณภาพ บริการด้วยใจ"*

**ผู้พัฒนา:** นักวิชาการคอมพิวเตอร์ และ นักทรัพยากรบุคคล — เทศบาลเมืองอุทัยธานี

---

## 🔗 Deployment & Repository

| รายการ | รายละเอียด |
|--------|------------|
| **GitHub Repository** | https://github.com/poppatompong-dev/test_hirejobs |
| **Deployment** | Vercel (Production) — ตรวจสอบได้ที่ GitHub Deployments |
| **Deploy Engine** | `vercel[bot]` — Auto-deploy เมื่อ push ไปที่ main |
| **Build Tool** | Vite 6.4.1 |
| **Node.js** | v24.x |

---

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

| หมวดหมู่ | เทคโนโลยี | เวอร์ชัน |
|----------|------------|----------|
| Frontend Framework | React | 19.x |
| Build Tool | Vite | 6.4.x |
| Styling | Tailwind CSS v4 (CSS-based config) | 4.2.x |
| Routing | React Router | 7.x |
| Backend/Database | Supabase (PostgreSQL + Storage + Realtime) | 2.x |
| 3D Graphics | Three.js + @react-three/fiber + drei | Latest |
| PDF Generation | jsPDF + html2canvas | Latest |
| Excel Export | XLSX (SheetJS) | Latest |
| QR Code | qrcode | Latest |
| Notifications | Line Notify API | — |
| Image Compression | browser-image-compression | Latest |
| Thai Address Input | thai-address-autocomplete-react | Latest |

---

## �️ โครงสร้างไฟล์ (Project Structure)

```text
src/
├── components/
│   ├── wizard/
│   │   ├── StepPosition.jsx        # ขั้นตอนเลือกตำแหน่ง
│   │   ├── StepPersonalInfo.jsx    # ขั้นตอนข้อมูลส่วนตัว
│   │   ├── StepEducation.jsx       # ขั้นตอนการศึกษาและทักษะ
│   │   ├── StepDocuments.jsx       # ขั้นตอนอัปโหลดเอกสาร
│   │   └── StepSignature.jsx       # ขั้นตอนลงลายมือชื่อ
│   ├── Navbar.jsx                  # Navigation bar สำหรับหน้า public
│   ├── Footer.jsx                  # Footer พร้อมสโลแกน
│   ├── ClockTowerScene.jsx         # 3D หอนาฬิกา (Three.js)
│   ├── ExamCardTemplate.jsx        # แม่แบบบัตรประจำตัวสอบ
│   └── ApplicationFormTemplate.jsx # แม่แบบใบสมัครงาน
├── contexts/
│   └── ThemeContext.jsx            # Dark/Light mode context + ThemeToggle
├── lib/
│   └── supabaseClient.js           # Supabase client
├── pages/
│   ├── LandingPage.jsx             # หน้าแรก + Modal รายละเอียดตำแหน่ง
│   ├── ConsentPage.jsx             # ยินยอม PDPA
│   ├── ApplicationWizard.jsx       # ระบบสมัครงานแบบ wizard 5 ขั้นตอน
│   ├── ApplicationSuccess.jsx      # หน้าสำเร็จหลังสมัคร
│   ├── CheckStatus.jsx             # ตรวจสอบสถานะ + ดาวน์โหลดบัตรสอบ
│   ├── AdminLogin.jsx              # หน้าเข้าสู่ระบบแอดมิน
│   ├── AdminDashboard.jsx          # แผงควบคุมแอดมิน (full CRUD)
│   └── NotFound.jsx                # หน้า 404
├── utils/
│   ├── exportExcel.js              # ส่งออก Excel
│   ├── generateExamCard.js         # สร้าง PDF บัตรประจำตัวสอบ
│   ├── generateApplicationForm.js  # สร้าง PDF ใบสมัคร
│   └── lineNotify.js               # Line Notify
├── App.jsx                         # Router configuration
├── main.jsx                        # Entry point + ThemeProvider
└── index.css                       # Tailwind v4 + dark mode variant
```

---

## 🗄️ ฐานข้อมูล Supabase (Database Schema)

### ตารางที่มีอยู่แล้ว (Existing Tables)

| ตาราง | หน้าที่ |
|-------|--------|
| `applications` | ข้อมูลใบสมัครงานทั้งหมด |
| `positions` | ตำแหน่งงานที่เปิดรับสมัคร |
| `documents` | ไฟล์เอกสารแนบของผู้สมัคร |
| `audit_logs` | บันทึกการดำเนินการของแอดมิน |

### ตารางที่ต้องสร้างเพิ่ม (Required New Tables)

```sql
-- ตาราง Fiscal Years (ปีงบประมาณ)
CREATE TABLE fiscal_years (
  id BIGSERIAL PRIMARY KEY,
  year INTEGER NOT NULL,           -- เช่น 2568
  label TEXT NOT NULL,             -- เช่น "ปีงบประมาณ 2568"
  open_date DATE,
  close_date DATE,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง Admin Users (ผู้ดูแลระบบ)
CREATE TABLE admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,          -- ควร hash ด้วย bcrypt ในงานจริง
  role TEXT DEFAULT 'admin',       -- 'admin' | 'superadmin'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✨ ฟีเจอร์ทั้งหมด (All Features)

### 🌐 หน้าประชาชน (Public Pages)

#### Landing Page (`/`)
- หอนาฬิกา 3 มิติ (Three.js) ที่เป็น signature ของเมืองอุทัยธานี
- แสดงรายการตำแหน่งงานที่เปิดรับสมัคร (Realtime)
- **Modal รายละเอียดตำแหน่ง:** กดแต่ละตำแหน่งเพื่อดูรายละเอียดเต็ม พร้อมปุ่มพิมพ์/ส่งออก
- Info strip แสดงขั้นตอนการสมัคร
- Footer พร้อมข้อมูลติดต่อและสโลแกน

#### Navbar (ทุกหน้า public)
- Logo + ชื่อองค์กร
- Links: หน้าหลัก, ตรวจสอบสถานะ, ยื่นใบสมัคร (highlight)
- Responsive mobile menu
- Scroll effect (backdrop blur เมื่อ scroll)

#### ConsentPage (`/consent`)
- แสดงนโยบาย PDPA ฉบับเต็ม
- Checkbox ยืนยันการยินยอม
- บันทึก timestamp ใน sessionStorage

#### ApplicationWizard (`/apply`) — 5 ขั้นตอน
1. **เลือกตำแหน่ง** — ดึงจาก Supabase Realtime
2. **ข้อมูลส่วนตัว** — ตรวจสอบเลขบัตรประชาชน 13 หลัก, Thai Address Autocomplete
3. **การศึกษา** — วุฒิการศึกษา, สถาบัน, GPA, ทักษะพิเศษ
4. **อัปโหลดเอกสาร** — รูปถ่าย, บัตรประชาชน, ใบระเบียน, ทะเบียนบ้าน (max 5MB/ไฟล์)
5. **ลงลายมือชื่อ** — ด้วย canvas digital signature
- บันทึก draft ลง localStorage อัตโนมัติ
- Progress bar และ stepper แสดงขั้นตอน

#### CheckStatus (`/check-status`)
- ค้นหาด้วยเลขบัตรประชาชน 13 หลัก
- แสดงสถานะ: รอตรวจสอบ / มีสิทธิ์สอบ / ไม่ผ่าน / ขอแก้ไข
- ดาวน์โหลดบัตรประจำตัวสอบ (PDF, เฉพาะสถานะ approved)
- ดาวน์โหลดใบสมัคร (PDF)

---

### 🔐 ระบบแอดมิน (Admin Panel) — `/admin/dashboard`

#### การเข้าสู่ระบบ
- Password: `uthai2026` (เก็บใน AdminLogin.jsx — ควรเปลี่ยนเป็น env var)
- Session เก็บใน `sessionStorage['admin_auth']`

#### แผงภาพรวม (Dashboard)
- สถิติผู้สมัคร: ทั้งหมด / รอตรวจสอบ / มีสิทธิ์สอบ / ไม่ผ่าน / ขอแก้ไข
- กด card สถิติเพื่อ filter รายการ
- Bar chart แสดงสัดส่วนผู้สมัครต่อตำแหน่ง
- รายการรอตรวจสอบล่าสุด

#### จัดการผู้สมัคร
- ค้นหาด้วยชื่อหรือเลขบัตรประชาชน
- Filter ตามสถานะและตำแหน่ง
- Bulk select + พิมพ์บัตรสอบพร้อมกันหลายคน
- ตรวจสอบใบสมัครพร้อมเอกสารแนบ
- อนุมัติ / ไม่อนุมัติ / ขอแก้ไข (พร้อมระบุเหตุผล)
- บันทึก Admin Notes (ไม่แสดงต่อผู้สมัคร)
- พิมพ์บัตรประจำตัวสอบ (PDF)
- พิมพ์ใบสมัคร (PDF)
- ลบใบสมัครพร้อมเอกสารทั้งหมด
- Export Excel

#### จัดการตำแหน่งงาน (CRUD)
- เพิ่ม / แก้ไข / ลบตำแหน่ง
- ตั้งวันเปิด-ปิดรับสมัครต่อตำแหน่ง
- ระบุจำนวนรับ (quota) และอัตราค่าจ้าง
- ระบุคุณสมบัติ
- เปิด/ปิดรับสมัครแต่ละตำแหน่ง (Toggle)

#### จัดการปีงบประมาณ (NEW - Fiscal Years)
- CRUD ปีงบประมาณหลายปี (รองรับอย่างน้อย 5+ ปี)
- ตั้งวันเปิด-ปิดรับสมัครแบบภาพรวมต่อปี
- กำหนดปีที่ "ใช้งานอยู่" (Active) — ระบบ toggle อัตโนมัติ
- ⚠️ ต้องสร้างตาราง `fiscal_years` ใน Supabase ก่อน

#### จัดการผู้ดูแลระบบ (NEW - Admin Users CRUD)
- เพิ่ม / แก้ไข / ลบบัญชีผู้ดูแล
- กำหนด Role: Admin / Super Admin
- ระงับบัญชี (Deactivate)
- ⚠️ ต้องสร้างตาราง `admin_users` ใน Supabase ก่อน

#### ประวัติการใช้งาน (Audit Log)
- บันทึกทุก action ของแอดมิน (approve, reject, delete, etc.)
- แสดง 100 รายการล่าสุด

#### ตั้งค่าระบบ
- กำหนดช่วงเวลารับสมัครภาพรวม (เก็บใน localStorage)

---

## 🌙 Dark / Light Mode

- ระบบ: Tailwind CSS v4 `@variant dark (&:is(.dark, .dark *))`  
- Toggle: `ThemeContext.jsx` — เพิ่ม/ลบ class `dark` บน `<html>`
- บันทึก preference ใน localStorage (`theme: 'dark' | 'light'`)
- Auto-detect ตาม OS preference (`prefers-color-scheme`)
- ปุ่ม toggle: floating button ล่างขวา (ทุกหน้า)
- รองรับทุกหน้าและ component ด้วย `dark:` classes

---

## 📄 ระบบ PDF Output

### บัตรประจำตัวสอบ (`ExamCardTemplate.jsx`)
- ขนาด 600×380px เหมาะสำหรับพิมพ์
- Header สีเขียว + โลโก้เทศบาล + ตราครุฑ
- ข้อมูลผู้สมัคร: ชื่อ, ตำแหน่ง, เลขประจำตัวสอบ, เลขบัตรประชาชน
- รูปถ่ายผู้สมัคร (ดึงจาก Supabase Storage)
- QR Code สำหรับตรวจสอบความถูกต้อง (ชี้ไปที่ Supabase)
- ลายมือชื่อผู้สมัคร

### ใบสมัครงาน (`ApplicationFormTemplate.jsx`)
- ขนาด A4 (794×1123px at 96 DPI)
- ตามแบบฟอร์มราชการไทย
- ข้อมูลครบถ้วน: ส่วนตัว, การศึกษา, ที่อยู่, ทักษะ
- ลายมือชื่อผู้สมัครท้ายฟอร์ม

**วิธีสร้าง PDF:** ใช้ `html2canvas` capture DOM element จากนั้น `jsPDF` สร้างไฟล์ PDF

---

## 🔄 Realtime Features

- **Positions:** หน้า Landing Page subscribe Supabase Realtime — ตำแหน่งอัปเดตทันทีที่แอดมินเปลี่ยน
- **Applications:** Admin Dashboard subscribe — แสดงผู้สมัครใหม่โดยไม่ต้อง refresh

---

## 🔒 Security & Auth

| รายการ | รายละเอียด |
|--------|------------|
| Admin Password | `uthai2026` (hardcoded — ควรย้ายเป็น env) |
| Admin Session | `sessionStorage['admin_auth'] = 'true'` |
| PDPA Consent | `sessionStorage['pdpa_consent'] = ISO timestamp` |
| Draft Storage | `localStorage['uthai_application_draft']` |
| Settings | `localStorage['uthai_admin_settings']` |
| File Upload | Max 5MB, types: jpg/png/webp/pdf/doc/docx |

---

## 🖥️ วิธีรันระบบ (Development)

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🛣️ Routes ทั้งหมด

| Path | Component | หน้าที่ |
|------|-----------|--------|
| `/` | LandingPage | หน้าแรก |
| `/consent` | ConsentPage | ยอมรับ PDPA |
| `/apply` | ApplicationWizard | สมัครงาน |
| `/success` | ApplicationSuccess | สมัครสำเร็จ |
| `/check-status` | CheckStatus | ตรวจสอบสถานะ |
| `/admin` | AdminLogin | เข้าสู่ระบบแอดมิน |
| `/admin/dashboard` | AdminDashboard | แผงควบคุมแอดมิน |
| `*` | NotFound | 404 |

---

## 📦 Dependencies หลัก (package.json)

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.3.0",
    "@supabase/supabase-js": "^2.49.0",
    "@react-three/fiber": "^9.1.0",
    "@react-three/drei": "^10.0.0",
    "three": "^0.173.0",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.2",
    "xlsx": "^0.18.5",
    "qrcode": "^1.5.4",
    "lucide-react": "^0.575.0",
    "react-signature-canvas": "^1.1.0-alpha.2",
    "thai-address-autocomplete-react": "^1.2.2",
    "browser-image-compression": "^2.0.2"
  },
  "devDependencies": {
    "vite": "^6.2.0",
    "@vitejs/plugin-react": "^4.4.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

---

## � Changelog / สิ่งที่พัฒนาล่าสุด

### มีนาคม 2569 (ล่าสุด)
- ✅ **Dark/Light Mode Toggle** — `@variant dark` Tailwind v4, toggle ทำงานได้
- ✅ **Navbar Component** — สวยงาม responsive สำหรับทุกหน้า public
- ✅ **Footer ใหม่** — สโลแกน "เมืองน่าอยู่ บุคลากรมีคุณภาพ บริการด้วยใจ"
- ✅ **Position Detail Modal** — กดตำแหน่งบนหน้าแรกเพื่อดูรายละเอียด + พิมพ์/ส่งออก
- ✅ **Fiscal Year Management** — Admin จัดการปีงบประมาณหลายปี (CRUD + set active)
- ✅ **Admin Users CRUD** — จัดการบัญชีผู้ดูแลระบบ
- ✅ **Dark mode** ครอบคลุมทุกหน้า: ConsentPage, CheckStatus, ApplicationWizard, AdminDashboard
- ✅ **Wizard steps dark mode** — StepPosition, StepPersonalInfo, StepEducation, StepSignature

### ก่อนหน้า
- ✅ ระบบสมัครงาน wizard 5 ขั้นตอน
- ✅ Admin Dashboard + CRUD ตำแหน่งงาน
- ✅ PDF บัตรประจำตัวสอบ + ใบสมัคร
- ✅ Bulk print exam cards
- ✅ Excel export
- ✅ Audit log
- ✅ Line Notify integration
- ✅ Supabase Realtime
- ✅ 3D Clock Tower Scene

---

## ⚠️ สิ่งที่ต้องทำเพิ่มเติม (Pending / Known Issues)

1. **สร้างตาราง Supabase ใหม่:** `fiscal_years` และ `admin_users` (SQL อยู่ในส่วน Database Schema ด้านบน)
2. **PDF Templates:** ยังสามารถปรับปรุงให้ตรงกับตัวอย่างจริงมากยิ่งขึ้น (ดูตัวอย่างใน `Example Output/`)
3. **Admin Password:** ควรย้ายจาก hardcode ไปเป็น environment variable
4. **Dark mode contrast:** ตรวจสอบสีที่อาจมองไม่เห็นบาง component
5. **Fiscal Year integration:** เชื่อม active fiscal year กับ LandingPage header (แสดงปีปัจจุบัน)
