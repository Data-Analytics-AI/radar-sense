# SnapFort - Real-Time Fraud & AML Intelligence Platform

## Overview
SnapFort is an enterprise fraud detection and AML (Anti-Money Laundering) transaction monitoring dashboard for financial services institutions. It provides real-time transaction monitoring, alert management, case investigation, and AI-assisted fraud analysis. The platform aims to enhance financial crime prevention capabilities for financial services institutions.

## User Preferences
- (None recorded yet)

## System Architecture
The application features a React 18 frontend with TypeScript, Vite, Tailwind CSS, and Shadcn UI. The backend is an Express.js API server, primarily for proxying AI chat requests. Routing is handled by react-router-dom v6, and state management utilizes TanStack React Query v5. The system currently uses client-side mock data.

Key features include:
- **Dashboard (Fraud Command Center)**: A 10-section command center with system status header, 6 expandable KPI cards, live threat monitor, intelligent trend analytics (channel-segmented volume, fraud trend with anomaly markers, risk pyramid), AI fraud insights panel, investigator operations (enhanced live feed with device icons/geo flags/risk tooltips, priority-sorted alerts with SLA timers, risky entities), model health snapshot, analyst performance, fraud network mini-preview, and compliance status. Data from `src/lib/dashboard-data.ts`.
- **Real-time Monitoring**: Live transaction feed.
- **Alert & Case Management**: Tools for managing alerts and tracking case investigations, including a comprehensive workspace for individual cases with timelines, entities, evidence, and notes.
- **Transaction Analysis**: Search and detailed analysis of transactions.
- **Analytics & Reporting**: Charts and reporting features, including an enhanced executive summary with clickable insights and actionable recommendations, and detailed metrics across fraud, AML, models, rules, geography, channels, users, operations, and audit.
- **Graph Network Analysis**: An investigation-grade workspace for analyzing fraud rings with interactive SVG graphs, pathfinding, and node detail drawers.
- **AI Assistant**: A context-aware AI investigation assistant with structured response rendering supporting six intent-specific views (transaction analysis, customer analysis, SAR drafting, analytics summary, case summary, general answers). It uses a hybrid intent detection system and a markdown-to-structured parser.
- **Rules Engine**: A comprehensive visual builder for fraud detection rules with condition trees, simulation, and version history.
- **Model Management**: Enterprise ML model lifecycle management with 5 sections: Production Model Control Bar (KPIs, promote/rollback/retrain actions), Performance & Risk Impact (detection trends, loss analysis, PR trade-off, confusion matrix), Drift/Data Quality Monitoring (feature drift PSI, data quality checks, "What Changed" insights), Model Registry (searchable/filterable cards with 5-tab detail drawer: Summary, Explainability, Operations, Governance, Evaluation), and Safe Actions (retrain wizard, compare mode, confirmation dialogs). Includes RBAC UI gating for admin/ML engineer/risk analyst/auditor roles. Components: `src/pages/Models.tsx`, `src/lib/models-data.ts`, `src/components/models/`.
- **User & Access Management**: Comprehensive user management with roles, permissions, audit logging, and lifecycle management.
- **Enterprise Settings**: A comprehensive configuration center with 14 sections covering risk, notifications, data retention, integrations, database, model/AI configuration, security, workflow, audit, environment, feature flags, backup, system health, and advanced settings. UX safety features like confirmation modals and unsaved change indicators are included.

The frontend and backend run concurrently, with Vite proxying `/api` requests to the Express server.

## External Dependencies
- **OpenAI API**: Used for AI Assistant functionalities via an Express backend proxy, supporting both standard OpenAI and Azure OpenAI.