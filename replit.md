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
- Graph Network - Network analysis visualization
- AI Assistant - AI-powered investigation assistant (uses OpenAI)
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
