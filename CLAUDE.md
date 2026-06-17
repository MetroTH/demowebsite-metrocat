# CLAUDE.md

แนวทางสำหรับ Claude Code เมื่อทำงานกับโปรเจกต์นี้

## 🔗 ลิงก์สำคัญ (อ่านก่อนเริ่มงานทุกครั้ง)

| สิ่งที่ต้องการ | ลิงก์ / ที่อยู่ |
|---------------|----------------|
| **เว็บจริง (GitHub Pages)** | https://metroth.github.io/demowebsite-metrocat/ |
| **ดูในเครื่องตัวเอง (dev)** | http://localhost:8080/demowebsite-metrocat/ (หลังรัน `npm start`) |
| **GitHub repository** | https://github.com/MetroTH/demowebsite-metrocat |
| **รายการ Pull Requests** | https://github.com/MetroTH/demowebsite-metrocat/pulls |
| **GitHub Actions (สถานะ deploy)** | https://github.com/MetroTH/demowebsite-metrocat/actions |
| **แก้เนื้อหาผ่าน CMS** | Pages CMS dashboard (เชื่อมกับ repo นี้ — config ที่ `.pages.yml`) |
| **โดเมนจริงของบริษัท** | https://www.metrocat.com |
| **Facebook** | https://www.facebook.com/metrocat.th/ |

> 💡 **เปิด session ใหม่แล้วจำไม่ได้ว่าทำงานที่ไหน?** ดูตารางนี้ได้เลย —
> เว็บที่ deploy แล้วอยู่ที่ GitHub Pages, โค้ดอยู่ที่ GitHub repo ด้านบน

## ภาพรวมโปรเจกต์

เว็บไซต์การตลาดสองภาษา (ไทย/อังกฤษ) ของ **Metro CAT (Metro Machinery Co., Ltd.)**
ตัวแทนจำหน่าย Caterpillar อย่างเป็นทางการในประเทศไทย

- **Static site generator:** Eleventy (11ty) v3
- **CMS:** Pages CMS (แก้เนื้อหาผ่าน dashboard, config ที่ `.pages.yml`)
- **Deploy:** GitHub Pages อัตโนมัติผ่าน GitHub Actions
- **ภาษาหลักในการสื่อสารกับผู้ใช้:** ภาษาไทย

## คำสั่งที่ใช้บ่อย

```bash
npm install        # ติดตั้ง dependencies (ครั้งแรก)
npm start          # รัน dev server (eleventy --serve) → http://localhost:8080/demowebsite-metrocat/
npm run build      # build เว็บไปที่ _site/
```

> ⚠️ ก่อน build ทุกครั้งต้องมั่นใจว่า `npm install` แล้ว (ต้องใช้ `js-yaml`)

## โครงสร้างไฟล์

```
src/
  index.njk                    หน้าแรก (hero, features, สินค้า, รุ่นเครื่องจักร, about, services, ฯลฯ)
  blog.njk / promotions.njk    หน้ารวมบทความ / โปรโมชัน
  products/                    หน้าสินค้า (index + category.njk)
  posts/                       บทความ (ไฟล์ .th.md / .en.md แยกภาษา)
  promotions/                  โปรโมชัน (ไฟล์ .th.md / .en.md แยกภาษา)
  _data/
    site.yaml                  ข้อมูลเว็บทั่วไป (url, ช่องทางติดต่อ, head_code)
    th.yaml / en.yaml          เนื้อหาทุกส่วนแยกตามภาษา
    productCatalog.yaml         แคตตาล็อกหมวดสินค้า
  _includes/
    base.njk                   layout หลัก + สคริปต์สลับภาษา
    partials/                  header, footer, cards
  images/                      รูปภาพ (passthrough copy ไป _site/images/)
  styles.css                   stylesheet เดียวของทั้งเว็บ
.eleventy.js                   config (pathPrefix = /demowebsite-metrocat/)
.github/workflows/deploy.yml   build & deploy ไป GitHub Pages
```

## ข้อตกลงสำคัญ (conventions)

### ระบบสองภาษา
- เนื้อหาเก็บใน `_data/th.yaml` และ `_data/en.yaml` โครงสร้างต้องตรงกัน
- ใน template ใช้ `data-th="..."` และ `data-en="..."` บน element
  สคริปต์ใน `base.njk` จะสลับข้อความตามภาษาที่เลือก (เก็บใน localStorage คีย์ `metrocat-lang`)
- รายการที่แยกภาษา (โพสต์/โปรโม) ใช้ class `lang-item` + `data-lang`

### ลิงก์
- ใช้ filter `| url` กับทุกลิงก์/พาธรูปเสมอ (รองรับ `pathPrefix`)
  เช่น `{{ '/images/foo.png' | url }}`

### Brand / สี (ใน styles.css)
- CAT Yellow `#FFCD11`, Charcoal/Black `#1A1A1A`
- ใช้ CSS variables เช่น `var(--cat-yellow)`, `var(--black)`
- ฟอนต์: Oswald (หัวข้อ), Noto Sans Thai (เนื้อหา)
- รองรับ `prefers-reduced-motion` เสมอเมื่อเพิ่มอนิเมชัน

## ฟีเจอร์ "รุ่นเครื่องจักร" (interactive hologram)

ส่วน `#lineup` ในหน้าแรก — แสดงรุ่นเครื่องจักรเป็นปุ่ม (badge) พร้อมเอฟเฟกต์โฮโลแกรม:
- คลิกที่รุ่น → ภาพเปลี่ยนบน "เวที" (`.holo-stage`) พร้อมเอฟเฟกต์ปรากฏตัว
- hover ที่ปุ่ม → ภาพโฮโลแกรมเล็กลอยขึ้น (`.model-badge-holo`)
- โค้ด: markup + JS อยู่ใน `src/index.njk`, สไตล์อยู่ใน `src/styles.css` (หมวด "Machine lineup")
- ปัจจุบันใช้รูป placeholder `src/images/excavator-holo.svg` (ทุกรุ่นใช้ภาพเดียวกันชั่วคราว)

### การตั้งชื่อไฟล์รูปรุ่น
รูปจริงของแต่ละรุ่นให้เซฟใน `src/images/` ด้วยรูปแบบ:

```
<หมวด>-<รุ่น>.png      ตัวพิมพ์เล็ก, แทนเว้นวรรค/จุดด้วยขีดกลาง
```

| หมวด | prefix | ตัวอย่าง |
|------|--------|---------|
| รถขุด | `excavator-` | `excavator-305-cr.png`, `excavator-310.png` |
| รถโดเซอร์ | `dozer-` | `dozer-d6.png` |
| รถตักล้อยาง | `loader-` | `loader-950.png` |
| รถเกลี่ยดิน | `grader-` | `grader-12m3.png` |

- รูปแนะนำ: PNG พื้นหลังโปร่ง, กว้าง ~800–1200px
- ถ้าผู้ใช้ส่งรูปชื่อไม่ตรงกฎ (เช่น `305.cr`, `310`) ให้ **เปลี่ยนชื่อให้เป็นมาตรฐานเองก่อนใส่** และยืนยันหมวดถ้ากำกวม

## Git workflow

- พัฒนาบน branch ที่กำหนดให้ในแต่ละ session (ไม่ push เข้า `main` ตรงๆ)
- `main` คือ branch ที่ deploy ขึ้น GitHub Pages (เว็บจริงอัปเดตเมื่อ merge เข้า main)
- เว็บจริง: https://metroth.github.io/demowebsite-metrocat/
- สร้าง Pull Request เฉพาะเมื่อผู้ใช้ขอ
- commit message เขียนเป็นภาษาไทยได้ ให้สื่อความหมายชัดเจน
