# SnapFort - Real-Time Fraud & AML Intelligence Platform

## Overview
SnapFort is an enterprise fraud detection and AML (Anti-Money Laundering) transaction monitoring dashboard for financial services institutions. Built by Snapnet, it provides real-time transaction monitoring, alert management, case investigation, and AI-assisted fraud analysis.

## Project Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend**: Express.js API server (port 3001) for AI chat proxy
- **Routing**: react-router-dom v6
- **State Management**: TanStack React Query v5
- **Data**: Client-side mock data generation (no database tables currently)
- **AI Chat**: OpenAI API via Express backend proxy with streaming

## Directory Structure
```
src/
  components/
    layout/       - Layout, Sidebar, Header
    dashboard/    - Dashboard stat cards, charts, feeds
    cases/        - Case management dialogs
    rules/        - Rule creation dialogs
    ai/           - AI response renderer and intent-specific views
    ui/           - Shadcn UI components
  pages/          - Route pages (Dashboard, Alerts, Cases, etc.)
  hooks/          - Custom hooks (useAIChat, use-toast, etc.)
  lib/            - Utilities and mock data generation
  types/          - TypeScript type definitions
  assets/         - Static assets (logo)
server/
  index.ts        - Express API server with /api/chat endpoint
```

## Key Pages
- Dashboard - Overview stats, charts, risk distribution
- Live Monitoring - Real-time transaction feed
- Alerts - Alert management and investigation
- Cases - Case management and tracking
- Case Investigation (/cases/:id) - Full investigation workspace with timeline, entities, evidence, notes, export
- Transactions - Transaction search and analysis
- Analytics - Charts and analytics
- Graph Network - Investigation-grade fraud ring analysis workspace with interactive SVG graph, path finder, node detail drawer
- AI Assistant - Context-aware AI investigation assistant with structured response rendering (6 intent-specific views)
- Rules Engine - Fraud detection rules
- Models - ML model management
- Users - User management
- Settings - System settings

## Running the Project
- Workflow "Start application" runs both:
  - Express API server on port 3001
  - Vite dev server on port 5000
- Vite proxies `/api` requests to Express server

## Environment Variables
- AI Assistant supports both Azure OpenAI and standard OpenAI (Azure is checked first):
  - `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
  - `AZURE_OPENAI_ENDPOINT` - Azure OpenAI resource URL
  - `AZURE_OPENAI_DEPLOYMENT` - Azure OpenAI deployment name
  - `OPENAI_API_KEY` - Standard OpenAI API key (fallback if Azure not configured)

## Recent Changes
- 2026-02-20: Comprehensive Analytics & Reporting page upgrade
  - Global control bar: time range (24h/7d/30d/90d), channel selector (All/POS/Web/Mobile/ATM/Branch), country selector, export (PDF/CSV/PNG), last updated timestamp
  - Enhanced Executive Summary: evidence-backed clickable insights with severity dots, metric references, "View evidence" drawers; recommended actions with priority badges linking to relevant pages
  - 9 analytics tabs (6 enhanced + 3 new):
    - Fraud: 6 KPIs (clickable with drawers), fraud trend chart, alert funnel, top typologies, risky merchants/customers/devices tables
    - AML: 6 KPIs, AML alert trend, typology distribution, SAR pipeline funnel, high-risk customers/counterparty tables with "Draft SAR" action
    - Models: 10 KPIs, model performance comparison, drift trend with threshold, score distribution histogram, confusion matrix, "Run Backtest" stub
    - Rules: 5 KPIs, rules effectiveness table with sparklines, clickable rows with "Simulate Change"/"Propose Tuning" actions
    - Geography: metric selector toggle, country risk heatmap grid, rankings table, geo anomalies panel (IP mismatch, impossible travel, first-seen country)
    - Channels: volume distribution chart, risk trend (multi-line), comparison table, per-channel alert funnel
    - Users (NEW): 7 KPIs, login/failed trends, analyst productivity table, unusual access patterns, role distribution
    - Operations (NEW): 6 KPIs, backlog trend, SLA compliance with 95% threshold, case aging histogram, oldest cases, team queues
    - Audit (NEW): summary stats, filter bar (search/action type/user), immutable audit events table, JSON detail drawer with correlation IDs
  - Reusable AnalyticsDrawer component for all drilldowns (KPI detail, chart segment, table row, evidence)
  - All tables have clickable rows with chevrons, all KPIs clickable with definition/breakdown drawers
  - Files: src/pages/Analytics.tsx, src/lib/analytics-data.ts, src/components/analytics/*.tsx (9 tab components + AnalyticsDrawer)
- 2026-02-20: Major Graph Network page upgrade - Investigation-grade fraud ring analysis workspace
  - Enriched mock data: 17 nodes (customer/account/device/merchant), 21 edges with relationship types (sent_money/shared_device/common_beneficiary/linked_account), risk scores, amounts
  - 10-metric KPI strip: Total Nodes, Connections, Communities, Risk Clusters, Avg Degree, High-Risk %, Suspicious Paths, Cross-Border, Shared Devices, Velocity Spikes (all clickable)
  - Investigation controls: search, depth slider, time/risk/entity-type filters, show-flagged/freeze-layout/suspicious-paths toggles
  - SVG visual encoding: node size=volume, color=risk, border=intensity, badge=alerts; edge thickness=txn count, color=risk, dashed=device sharing
  - Node/edge hover tooltips with entity details, risk badges, transaction metrics
  - Node Detail Drawer (Sheet) with 4 tabs: Overview (summary/flags/alerts), Transactions (linked txn table), Connections (neighbor list), Cases (open cases)
  - AI Network Insights panel: severity badges, evidence snippets, confidence %, View/Create Case actions
  - Risk Clusters panel: risk score, node count, total value, velocity, jurisdictions, type, confidence
  - Path Finder tool: BFS shortest path between 2 selected nodes with highlighted animated edges
  - Action toolbar: Export, Create Case, Tag Cluster
  - Files: src/pages/Graph.tsx
- 2026-02-20: Context-aware AI Response Rendering System
  - New: AIResponseEnvelope type system with intent, sections, entities, actions, confidence
  - New: Hybrid intent detection (heuristic classifier) for 6 intent types: transaction_analysis, customer_analysis, sar_draft, analytics_summary, case_summary, general_answer
  - New: Markdown-to-structured parser that extracts sections, bullets, tables, entities (TXN-xxx, CUST-xxx, CASE-xxx)
  - New: AIResponseRenderer component with 6 intent-specific views:
    - TransactionInvestigationView: risk driver cards, entity badges, action buttons
    - CustomerRiskProfileView: behavioral pattern cards, anomaly lists
    - SARDocumentView: document editor layout with structured SAR sections, copy/export
    - AnalyticsInsightView: KPI metric cards grid, ranked key drivers
    - CaseSummaryTimelineView: vertical timeline, linked entity badges, recommendation box
    - StructuredAnswerView: key takeaways box, clean bullet formatting
  - Updated useAIChat hook to track user prompts per message and generate envelope after streaming completes
  - Updated AIAssistant page with categorized suggested queries (icons + labels), response type sidebar, streaming skeleton
  - Files: src/lib/ai-response-parser.ts, src/components/ai/AIResponseRenderer.tsx, src/hooks/useAIChat.ts, src/pages/AIAssistant.tsx
- 2026-02-20: Fixed stat-card CSS overlay blocking clicks on Users table rows
  - Added pointer-events-none to .stat-card::before pseudo-element
  - Added active row highlight, aria-expanded, proper chevron button
- 2026-02-20: Comprehensive User & Access Management module
  - Extended types: IAMUser, UserStatus, PrivilegeLevel, SSOProvider, UserSession, UserAuditEntry, AccessApproval, RoleDefinition, PERMISSION_GROUPS
  - Mock data: 20 IAM users with sessions, audit logs, approvals; 6 role definitions with permissions
  - KPI cards: Total Users, Active, Privileged, MFA %, SSO, Locked/Suspended, Failed Logins, Pending Approvals (all clickable to filter)
  - Toolbar: search, role/status/MFA/SSO filters, saved views (Privileged, MFA Disabled, Locked/Suspended, Invited), sort options
  - Enhanced table: roles, privilege level, status, MFA, SSO, last login with tooltip, last activity, failed logins
  - User Detail Drawer (Sheet) with 5 tabs: Profile, Roles & Permissions, Security, Audit Activity, Approvals/SoD
  - Add User modal: name, email, roles, department, team, auth method, MFA requirement, invite message
  - Role Management modal: role list with permissions matrix, permission groups (Monitoring, Investigations, Rules, Models, Analytics, Admin)
  - Audit logging: actions logged for status changes, MFA toggles, password resets, session terminations
  - User lifecycle: invite → activate → suspend → lock → deactivate (with status transition buttons)
- 2026-02-20: Built comprehensive Case Investigation workspace
  - Expanded Case types: CaseTimelineEvent, LinkedEntity (vendor/employee/contract/invoice), Evidence with custody chain, CaseResolution
  - Changed CaseStatus from 'resolved' to 'closed' for proper workflow (Open → In Review → Escalated → Closed)
  - Rich mock data generation: timeline events, linked entities, evidence files with custody chains, investigator notes
  - New CaseInvestigation page at /cases/:caseId with 5 tabs:
    - Timeline: color-coded vertical timeline (alert → investigation → resolution)
    - Entities: linked vendor/employee/contract/invoice cards with add entity dialog
    - Evidence: file cards with source attribution, custody chain, upload dialog, tag management
    - Notes: investigator notes feed with add note form, type selection, mentions
    - Export: audit-ready PDF/CSV export (full report, evidence log, timeline, notes)
  - Status workflow buttons with state transitions that add timeline events
  - Shared cached mock data via getCachedMockData() for consistent case IDs across pages
  - "Open Full Investigation" button on Cases page navigates to investigation workspace
- 2026-02-20: Built comprehensive visual Rule Engine Builder
  - Expanded Rule types: RuleCondition trees, RuleConditionGroup (recursive AND/OR), RuleAction, RuleVersion, RuleAuditEntry, SeverityLevel
  - Updated mock data with rich sample rules including nested condition groups, versions, and audit logs
  - Rebuilt Rules page as full visual builder with split layout (rule list + builder panel)
  - Builder tab: condition tree editor with AND/OR toggle, field/operator/value dropdowns, nested groups, drag-and-drop reordering, actions section
  - Simulation tab: evaluates rules against 500 mock transactions with hit rate, progress bar, and matched transaction table
  - History tab: version history with restore capability + timeline audit log
  - Create new rule flow with blank builder and save functionality
- 2026-02-20: Added Azure OpenAI support for AI Assistant chat
  - Backend now supports both Azure OpenAI and standard OpenAI providers
  - Azure OpenAI is preferred when all three env vars are set (key, endpoint, deployment)
  - Falls back to standard OpenAI if Azure is not configured
- 2026-02-20: Fixed Cases page - cases now persist when created via New Case dialog
  - Added fallback in generateCases to always produce at least 5 cases with deterministic data
  - Converted Cases page from useMemo to useState so new cases are added to the list
  - Wired onCaseCreated callback from NewCaseDialog to Cases page state
  - Fixed CasePriority type mismatch (aligned 'urgent' → 'critical' to match RiskLevel)
- 2026-02-17: Added clickable rows + details drawer across Transactions, Live Monitoring, and Alerts pages
  - Created reusable DetailsDrawer component (Sheet on desktop >=1024px, Dialog on mobile)
  - Created TransactionDetailsPanel with full transaction detail layout (summary, customer, merchant, risk, geo/device, raw payload)
  - Created AlertDetailsPanel with full alert detail layout (summary, description, linked entities, contributing factors, investigation timeline, actions)
  - Created useDetailsSelection hook for URL state management (?selected=ID query param)
  - Updated Transactions page: clickable rows, chevron button with rotate animation, keyboard accessibility
  - Updated Live Monitoring page: clickable rows with selection persistence across auto-refresh data updates
  - Updated Alerts page: replaced dropdown actions with clickable rows + drawer
  - All rows have tabIndex, Enter/Space keyboard support, aria-selected/aria-expanded attributes
  - Chevron buttons use stopPropagation to prevent double-trigger
- 2026-02-16: Migrated from Lovable/Supabase to Replit environment
  - Removed Supabase client and dependencies
  - Moved AI chat from Supabase Edge Function to Express API route
  - Updated Vite config for port 5000 with allowedHosts
  - Switched AI provider from Lovable gateway to OpenAI API
  - Removed lovable-tagger dev dependency

## User Preferences
- (None recorded yet)
