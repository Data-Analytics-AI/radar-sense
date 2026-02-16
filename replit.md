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
- `OPENAI_API_KEY` - Required for AI Assistant chat functionality

## Recent Changes
- 2026-02-16: Migrated from Lovable/Supabase to Replit environment
  - Removed Supabase client and dependencies
  - Moved AI chat from Supabase Edge Function to Express API route
  - Updated Vite config for port 5000 with allowedHosts
  - Switched AI provider from Lovable gateway to OpenAI API
  - Removed lovable-tagger dev dependency

## User Preferences
- (None recorded yet)
