# สร้าง/อัปเดตคอนเทนต์อัตโนมัติด้วย n8n

เว็บไซต์นี้เก็บ **บทความ** และ **โปรโมชัน** เป็นไฟล์ Markdown ใน GitHub
ดังนั้น n8n เพียงแค่ "สร้างไฟล์ลง GitHub" ที่เหลือ GitHub Actions จะ build และเผยแพร่ให้อัตโนมัติ

```
n8n (Trigger → AI เขียนเนื้อหา → จัดรูปแบบ Markdown)
   → GitHub: Create File ที่ src/posts/...md
   → GitHub Actions build → เว็บอัปเดตภายใน 1-2 นาที
```

> หลักการ: **1 ไฟล์ = 1 บทความ ต่อ 1 ภาษา** (มี `lang: th` หรือ `lang: en`)

---

## 1. โครงสร้างไฟล์และการตั้งชื่อ

| ประเภท | โฟลเดอร์ | รูปแบบชื่อไฟล์ | ตัวอย่าง |
|--------|----------|----------------|----------|
| บทความ | `src/posts/` | `<YYYY-MM-DD>-<slug>.<lang>.md` | `2026-06-10-cat-tips.th.md` |
| โปรโมชัน | `src/promotions/` | `<slug>.<lang>.md` | `mid-year-sale.en.md` |

- `slug` ใช้ตัวอักษรอังกฤษ ตัวเลข และขีดกลาง (`a-z 0-9 -`) เท่านั้น
- URL ที่ได้: บทความ → `/blog/<slug>-<lang>/` · โปรโมชัน → `/promotions/<slug>-<lang>/`
- ไฟล์คู่ภาษา (slug เดียวกัน คนละ `lang`) จะลิงก์ "อ่านอีกภาษา" ให้อัตโนมัติ

---

## 2. รูปแบบเนื้อหา (front matter + Markdown)

### บทความ (Blog)
```markdown
---
title: "หัวข้อบทความ"
lang: th                        # th หรือ en
date: 2026-06-10
category: "ข่าวสาร"
excerpt: "สรุปย่อ 1-2 ประโยคสำหรับการ์ดและ SEO"
image: /images/posts/cover.jpg  # เว้นว่าง "" ได้ (จะใช้พื้นหลังสำรอง)
author: "Metro CAT"
draft: false                    # true = ยังไม่เผยแพร่
---

เนื้อหาเป็น **Markdown** ได้เต็มรูปแบบ

## หัวข้อย่อย
- รายการ
- รายการ
```

### โปรโมชัน
```markdown
---
title: "ชื่อโปรโมชัน"
lang: th
date: 2026-06-01                # ใช้จัดเรียง (ตั้ง = วันเริ่ม)
start_date: 2026-06-01
end_date: 2026-07-31
excerpt: "สรุปข้อเสนอสั้นๆ"
image: /images/promotions/cover.jpg
draft: false
---

รายละเอียดโปรโมชันเป็น Markdown
```

> **รูปภาพ:** อัปโหลดไฟล์ไป `src/images/posts/` หรือ `src/images/promotions/`
> (เช่น ผ่าน GitHub Create File แบบ binary) แล้วอ้างอิง path ที่ขึ้นต้นด้วย `/images/...`
> ถ้าเว้น `image: ""` ระบบจะใช้พื้นหลังสำรองให้เองโดยไม่พัง

---

## 3. ตั้งค่า n8n

### 3.1 สร้าง GitHub Token
- สร้าง **Personal Access Token (Fine-grained)** ที่ผูกเฉพาะ repo `MetroTH/demowebsite-metrocat`
- ให้สิทธิ์ **Contents: Read and write** (ถ้าจะเปิด PR ให้เพิ่ม **Pull requests: Read and write**)
- เก็บเป็น Credential ใน n8n (GitHub API)

### 3.2 Flow ตัวอย่าง
1. **Trigger** — Schedule / Webhook / Manual
2. **AI node** — สร้างเนื้อหา (เช่น Anthropic Claude) ให้คืนค่า: `title`, `excerpt`, `category`, `body_markdown`
3. **Function/Set node** — ประกอบไฟล์ Markdown:
   ```
   ---
   title: "{{$json.title}}"
   lang: th
   date: {{$now.format('yyyy-MM-dd')}}
   category: "{{$json.category}}"
   excerpt: "{{$json.excerpt}}"
   image: ""
   author: "Metro CAT"
   draft: false
   ---

   {{$json.body_markdown}}
   ```
4. **GitHub node → Create/Update File**
   - Owner: `MetroTH` · Repo: `demowebsite-metrocat` · Branch: `main`
   - File Path: `src/posts/{{$now.format('yyyy-MM-dd')}}-{{$json.slug}}.th.md`
   - File Content: ผลจากขั้นที่ 3
   - Commit Message: `content: เพิ่มบทความ {{$json.title}}`

> หมายเหตุ: ถ้าใช้ GitHub HTTP API ตรง (`PUT /repos/{owner}/{repo}/contents/{path}`)
> ต้องส่ง `content` เป็น **Base64** — ใน n8n ใช้ `{{ Buffer.from($json.markdown).toString('base64') }}`
> ส่วน GitHub node สำเร็จรูปจัดการ encoding ให้อยู่แล้ว

---

## 4. สองโหมดการเผยแพร่

| โหมด | วิธีตั้งค่าใน n8n | ผลลัพธ์ |
|------|------------------|---------|
| **เผยแพร่ทันที** | Create File ที่ branch `main` | เว็บอัปเดตอัตโนมัติใน 1-2 นาที |
| **รีวิวก่อน** | Create File ที่ branch ใหม่ → เปิด Pull Request | รออนุมัติ/merge ก่อนเผยแพร่ |

> อยากให้ AI เขียนแบบ "ฉบับร่าง" ไว้ตรวจก่อน ตั้ง `draft: true` ในไฟล์ —
> หน้าเว็บจะยังไม่แสดงจนกว่าจะเปลี่ยนเป็น `false`

---

## 5. ทิป
- ให้ AI สร้าง **คู่ภาษา** ในรอบเดียว: เขียน 2 ไฟล์ `slug.th.md` และ `slug.en.md` (slug เดียวกัน)
  ระบบจะลิงก์สลับภาษาให้อัตโนมัติ
- ตรวจให้ `slug` ไม่ซ้ำกับไฟล์เดิม ไม่งั้น Create File จะชนกัน (ใช้ Update แทน)
- ไฟล์ที่ n8n สร้าง ยังเปิดแก้ใน Pages CMS (app.pagescms.org) ได้ตามปกติ เพราะเป็นไฟล์เดียวกัน
