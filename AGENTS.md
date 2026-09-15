# Nanyang Trainer Certification Evaluation System

## Project Overview
Web application สำหรับประเมินการรับรองผู้ฝึกสอน (Trainer Certification Evaluation) ของ Nanyang
ใช้แทน Microsoft Forms โดยรองรับ Desktop, Tablet, Mobile

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn-style UI components
- **Backend**: Next.js API Routes
- **Database**: Firestore (Firebase project: `tti-assessment`) — ใช้แบบ free tier, ไม่ต้อง real-time
- **Auth**: Employee ID login via NextAuth v5 Credentials provider (JWT session)
- **Architecture**: Repository Pattern — สามารถเปลี่ยน storage backend ได้ (memory, firestore)

## Key Architecture Decisions
- **Repository Pattern**: `lib/repositories/evaluation-repository.ts` เป็น interface, มี 2 implementation (InMemory, Firestore) เลือกผ่าน `STORAGE_PROVIDER` env var
- **Auth**: ใช้รหัสพนักงาน (Employee ID) ล็อกอิน — lookup จาก users collection, role กำหนดใน seed data (`ADMIN01` = admin, `NY001` = evaluator)
- **Service Layer**: `lib/services/evaluation-service.ts` — business logic แยกจาก storage
- **i18n**: รองรับ 4 ภาษา (th/en/lo/vi) ผ่าน React Context ใน `lib/i18n/`
- **Routing**: แยก portal — `/evaluator` สำหรับผู้ประเมิน, `/admin` สำหรับผู้ดูแลระบบ

## Evaluation Logic
- 7 หมวดหมู่, 20 คำถาม (q-5 ถึง q-24)
- หมวดสำคัญ (critical): ทักษะการนำเสนอ, ทักษะการสื่อสาร, ความสามารถด้านความรู้
- ผ่าน: Overall Avg ≥ 3.5 AND ทุกหมวดสำคัญ ≥ 3.0
- ไม่ผ่าน: Overall Avg < 3.5 OR มีหมวดสำคัญใด ๆ < 3.0

## Current Feature Contract
- `/admin/evaluations` ใช้เป็นหน้า Result: มีตัวกรองผู้ประเมินและตัวกรองหลัก, pagination 25/50/100 รายการ, ดูรายงาน, export PDF, ลบพร้อมยืนยัน และแก้ไขผลผ่าน modal
- Admin edit ใช้ `PATCH /api/evaluations` และคำนวณ Score, Percentage และ Pass/Fail ใหม่จากคะแนน 7 หมวดก่อนบันทึก
- `/admin/evaluation-summaries` ใช้ชื่อ Summary Result: มีตัวกรองผู้ประเมินและตัวกรองหลัก, เลือกหลายพนักงาน และเปิด Summary Result Comparison
- Summary Result Comparison แสดง radar แยกแต่ละพนักงานด้วยสีต่างกัน, ปุ่ม Detail ซ่อนรายละเอียดเป็นค่าเริ่มต้น และ Save PNG รองรับรายงานเต็มความสูงพร้อม share/download บนมือถือ
- ตรา PASSED/FAIL ใน comparison ใช้ SVG เพื่อให้ตำแหน่งตัวอักษรคงที่ระหว่างหน้าเว็บและ PNG
- Import MS Forms อยู่ในหน้า Result: เลือก evaluator, BU, recipient, course, date, round และกรอกคะแนน 7 หมวดก่อนบันทึก Firestore
- ทุก modal ใหม่ต้องปิดด้วย Escape และรองรับการเลื่อนด้วยเมาส์/ทัช โดยเฉพาะ modal ที่มีเนื้อหายาว

## Auth, Security, and Persistence
- Auth ใช้ NextAuth Credentials + JWT cookie; session มีอายุสูงสุด 8 ชั่วโมงและต่ออายุระหว่างใช้งานทุก 1 ชั่วโมง
- การปิดแอปไม่ใช่การออกจากระบบ; ผู้ใช้ต้องกด Sign out หากต้องการลบ session ทันที ไม่มีการเก็บข้อมูลล็อกอินใน localStorage
- `middleware.ts` มี process-local rate limit, แยก bucket ตาม client/session, จำกัด request body และต้องใช้ WAF/shared rate limit เพิ่มเมื่อ deploy หลาย instance
- API mutation ต้องตรวจ session, role, same-origin และ validate payload ด้วย Zod; การแก้ไข/ลบผลประเมินจำกัดเฉพาะ Admin
- `updateEvaluation` เป็นส่วนหนึ่งของ repository contract และมี implementation ทั้ง Firestore และ InMemory
- `categoryActualScores` เป็นค่าหมวดที่ authoritative สำหรับข้อมูล import หรือการแก้ไขโดย Admin เพื่อให้ผลสรุปถูกคำนวณสอดคล้องกัน

## Commands
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npx tsc --noEmit` — type check

## Working Preferences
- **Preview ownership (strict)**: Unless the user explicitly asks, do not preview, simulate, render, or visually inspect the UI. Do not start or operate a dev server, use browser tools, take screenshots, or perform UI automation.
- **มุ่งเน้นคุณภาพโค้ด**: ผู้ใช้เป็นผู้ตรวจผลลัพธ์และ Preview เองทั้งหมด ให้ใช้เวลาไปกับความถูกต้องของโค้ด, data flow, edge cases, security, และ static verification แทน
- ห้ามใช้ `preview_start`, `preview_logs`, `preview_stop`, browser tools, หรือการจำลอง UI ใดๆ หากผู้ใช้ไม่ได้สั่งโดยตรง
- ตรวจสอบ TypeScript compilation ด้วย `npx tsc --noEmit` ได้
- ใช้ภาษาไทยในการสื่อสารกับผู้ใช้
- **ห้าม `git push` ถ้าไม่มีคำสั่งจากผู้ใช้โดยตรง** — commit ในเครื่องได้ แต่ต้องรอผู้ใช้สั่ง push เอง (เช่น "push", "push github", "อัพขึ้น GitHub")
- ก่อนส่งมอบให้ตรวจ `npm test` หรือ `npx tsc --noEmit` และ `git diff --check`; ไม่ต้องเปิด dev server หรือทำ visual preview เว้นแต่ผู้ใช้สั่งโดยตรง
