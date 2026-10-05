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
- Published `AssessmentVersion` เป็น immutable snapshot ของประเภท Assessment/Exam, หมวด คำถาม options/answer keys, scoring thresholds และ dashboard profile
- `EvaluationTopic.activeAssessmentVersionId` กำหนดแบบประเมินที่ใช้; หลายหลักสูตรอ้าง version เดียวกันได้
- Published versions immutable; แก้แบบประเมินโดย clone เป็น draft แล้ว publish version ใหม่
- ผลประเมินใหม่เก็บ `assessmentVersionId`; ผลเก่าที่ไม่มี version ใช้ legacy shared assessment
- เกณฑ์ผ่านรวมเลือกได้ระหว่างค่าเฉลี่ยเต็ม 5 (`overallPassThresholdType: average`) และเปอร์เซ็นต์ 0–100 (`percentage`); การเปลี่ยนหน่วยใน editor แปลงค่าให้เทียบเท่ากัน
- เวอร์ชันเก่าที่ไม่มี `overallPassThresholdType` และข้อมูล legacy ใช้ค่าเฉลี่ยรวม ≥ 3.5 AND ทุกหมวดสำคัญ ≥ 3.0
- คะแนนรายงานและ Dashboard ต้องใช้ policy ของ Assessment Version เดียวกับผล ห้ามเปรียบเทียบคะแนน/pass rate ข้าม version หรือข้ามเกณฑ์

## Current Feature Contract
- `/admin/evaluations` ใช้เป็นหน้า Result: มีตัวกรองผู้ประเมินและตัวกรองหลัก, pagination 25/50/100 รายการ, ดูรายงาน, export PDF, ลบพร้อมยืนยัน และแก้ไขผลผ่าน modal
- Login ให้ผู้ประเมินเลือกหลักสูตรก่อนเข้าแบบประเมิน และ preselect published version ของหลักสูตร
- `/admin/assessment-versions` ใช้สร้าง/แก้ draft, กำหนดหมวด คำถาม options เกณฑ์ผ่าน และ dashboard profile ก่อน publish
- Assessment editor มี Preview แบบผู้ประเมิน ใช้คำถาม/controls จาก draft ปัจจุบันได้โดยไม่ส่งหรือบันทึกคำตอบ
- คำถาม Date ใช้ localized calendar popover แต่เก็บคำตอบเป็น `YYYY-MM-DD`; ปุ่ม Clear ส่งค่า `undefined`
- Exam รองรับ answer key ของ Choice สำหรับตรวจอัตโนมัติ และข้อที่ให้คะแนนด้วยคนจะค้างใน `ExamAttempt` สถานะ `PendingGrading`
- Exam attempt แยกจาก `evaluations` จนกว่าจะตรวจครบ; เมื่อให้คะแนน ระบบเปลี่ยน attempt เป็น `Graded` และสร้าง Evaluation/รายละเอียดคะแนนใน transaction เดียว
- Login แยก Assessment/Exam และกรองหลักสูตรตามชนิดของ active published version; Exam ใช้ evaluator ที่ล็อกอินเป็นผู้ตรวจ และผู้เข้าสอบเลือก Recipient/รอบสอบ
- `/evaluator/exams` แสดงคิวข้อสอบรอตรวจแก่ evaluator; `PATCH /api/exam-attempts/[id]/grade` ใช้ identity จาก session ไม่รับชื่อผู้ตรวจจาก client
- Answer keys เป็นข้อมูลเฉพาะ Admin/ผู้ตรวจ: `/api/questions` และผล Evaluation ที่ส่งให้ evaluator ต้อง redaction `correctAnswer`; ห้ามส่งเฉลยใน form ผู้เข้าสอบ
- `/admin/topics` ผูกหลักสูตรกับ published assessment version หรือเลือก legacy shared assessment
- Admin edit ใช้ `PATCH /api/evaluations` และคำนวณผลใหม่จาก assessment version เดิมของ evaluation
- Dashboard กรองทั้งหลักสูตรและ version; ภาพรวมทุกหลักสูตร/หลายเวอร์ชันไม่เปรียบเทียบคะแนนหรือ pass rate ข้ามเกณฑ์
- Dashboard profile รองรับ category scores, overall score และ pass/fail; Summary Result Comparison จำกัดการเลือกไว้ใน assessment version เดียวกัน
- `/admin/evaluation-summaries` ใช้ชื่อ Summary Result: มีตัวกรองผู้ประเมินและตัวกรองหลัก, เลือกหลายพนักงาน และเปิด Summary Result Comparison
- Summary Result Comparison แสดง radar แยกแต่ละพนักงานด้วยสีต่างกัน, ปุ่ม Detail ซ่อนรายละเอียดเป็นค่าเริ่มต้น และ Save PNG รองรับรายงานเต็มความสูงพร้อม share/download บนมือถือ
- ตรา PASSED/FAIL ใน comparison ใช้ SVG เพื่อให้ตำแหน่งตัวอักษรคงที่ระหว่างหน้าเว็บและ PNG
- Import MS Forms อยู่ในหน้า Result: เลือก evaluator, BU, recipient, course, date, round และกรอกคะแนนตามจำนวนหมวดของ assessment version
- ทุก modal ใหม่ต้องปิดด้วย Escape และรองรับการเลื่อนด้วยเมาส์/ทัช โดยเฉพาะ modal ที่มีเนื้อหายาว

## Auth, Security, and Persistence
- Auth ใช้ NextAuth Credentials + JWT cookie; session มีอายุสูงสุด 8 ชั่วโมงและต่ออายุระหว่างใช้งานทุก 1 ชั่วโมง
- การปิดแอปไม่ใช่การออกจากระบบ; ผู้ใช้ต้องกด Sign out หากต้องการลบ session ทันที ไม่มีการเก็บข้อมูลล็อกอินใน localStorage
- `middleware.ts` มี process-local rate limit, แยก bucket ตาม client/session, จำกัด request body และต้องใช้ WAF/shared rate limit เพิ่มเมื่อ deploy หลาย instance
- API mutation ต้องตรวจ session, role, same-origin และ validate payload ด้วย Zod; การแก้ไข/ลบผลประเมินจำกัดเฉพาะ Admin
- Exam submission/grading ต้องตรวจ session, role, same-origin และ validate payload ด้วย Zod; การปิดคะแนนต้องป้องกันการตรวจซ้ำและบันทึกผลแบบ atomic
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
