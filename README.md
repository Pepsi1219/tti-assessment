# Nanyang Trainer Certification Evaluation System

Next.js 15 web application to replace Microsoft Forms for trainer certification evaluation.

## Features

- Evaluator flow: trainer search, category scoring, comments, result page, radar chart, and evaluation history API foundation.
- Admin portal: dashboard cards, trainer/question management surfaces, evaluation listing/export API foundation.
- Repository pattern: default storage is in-memory seed data; `ExcelGraphEvaluationRepository` is the adapter point for Microsoft Graph workbook tables.
- Result logic: pass requires overall average >= 3.5 and every critical category >= 3.0.
- Responsive UI: mobile single column with sticky submit, tablet two-column form areas, desktop sidebar/dashboard layout.
- i18n-ready dictionary for Thai, English, Lao, Vietnamese.

## Install

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Microsoft Entra ID

Create an app registration and set the values from `.env.example`. Users are mapped to roles through the `Users` table. Unknown signed-in users default to `Evaluator`.

## Storage

Set `STORAGE_PROVIDER=excel-graph` after implementing Graph workbook table reads/writes in `lib/repositories/excel-graph-repository.ts`.

Frontend pages and API routes consume `EvaluationRepository`, so the storage provider can later change to SharePoint List or SQL Server without major UI changes.

## API

- `GET /api/trainers`
- `POST /api/trainers`
- `GET /api/questions`
- `POST /api/questions`
- `GET /api/evaluations`
- `POST /api/evaluations`
- `GET /api/export/excel`
- `GET /api/export/pdf`

## Note

The supplied requirement lists 7 categories and 24 questions, but the provided question text starts at item 5 and ends at item 24. The seed includes the 20 supplied questions. Admin question management is designed so missing or future questions can be added without redeploying.
