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

## Commands
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npx tsc --noEmit` — type check

## Working Preferences
- **ห้าม preview/run dev server** — ให้ตั้งใจเขียนโค้ดให้ถูกต้อง ผู้ใช้จะ preview และทดสอบเอง เพราะทำได้ดีกว่า
- ห้ามใช้ `preview_start`, `preview_logs`, `preview_stop` หรือ browser tools ใดๆ
- ตรวจสอบ TypeScript compilation ด้วย `npx tsc --noEmit` ได้
- ใช้ภาษาไทยในการสื่อสารกับผู้ใช้
