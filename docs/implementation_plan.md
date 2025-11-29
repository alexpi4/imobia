# Implementation Plan - New Analytical Dashboard

## Goal Description
Replace the current Dashboard with a new analytical panel that displays metrics for leads, intentions, units, and performance. The dashboard will be powered by Supabase RPC functions for efficient data aggregation and will feature a modern UI with charts and tables.

## User Review Required
> [!IMPORTANT]
> This change will completely replace the existing Dashboard page. Ensure all critical information from the old dashboard is covered or deemed unnecessary.

## Proposed Changes

### Database (Supabase)

#### [NEW] RPC Functions
We will create a new migration file `20251129_dashboard_rpc.sql` containing the following functions:

1.  `get_dashboard_kpis(start_date timestamptz, end_date timestamptz)`
    *   Returns: `{ total_leads, intencao_counts, top_unidade, avg_interval }`
2.  `get_leads_by_day(start_date timestamptz, end_date timestamptz)`
    *   Returns: `[{ date, compra, locacao, indefinido }]`
3.  `get_leads_by_origin(start_date timestamptz, end_date timestamptz)`
    *   Returns: `[{ origin, count }]`
4.  `get_leads_by_unit(start_date timestamptz, end_date timestamptz)`
    *   Returns: `[{ unit, count }]`
5.  `get_leads_by_urgency(start_date timestamptz, end_date timestamptz)`
    *   Returns: `[{ urgency, count }]`
6.  `get_unit_distribution(start_date timestamptz, end_date timestamptz)`
    *   Returns: `[{ unit, site, upp, whatsapp, rd, redes, indicacao, outros, total, percentage }]`

### Frontend (React)

#### [NEW] Components
*   `src/pages/DashboardPage.tsx`: Main container.
*   `src/components/dashboard/DashboardHeader.tsx`: Title and Date Filter.
*   `src/components/dashboard/KPICards.tsx`: Displays the 4 top cards.
*   `src/components/dashboard/LeadsByDayChart.tsx`: Line chart using Recharts.
*   `src/components/dashboard/LeadsByOriginChart.tsx`: Bar chart.
*   `src/components/dashboard/LeadsByUnitChart.tsx`: Pie chart.
*   `src/components/dashboard/LeadsByUrgencyChart.tsx`: Bar chart.
*   `src/components/dashboard/UnitDistributionTable.tsx`: Detailed data table.
*   `src/hooks/useDashboard.ts`: Hook to fetch data from RPCs.

#### [MODIFY] Routing
*   `src/App.tsx`: Update route for `/` or `/dashboard` to point to the new `DashboardPage`.

## Verification Plan

### Automated Tests
*   Verify RPC functions return correct data using SQL editor.

### Manual Verification
*   Check if KPI numbers match the sum of data in the database.
*   Verify date filters update all charts and KPIs.
*   Check responsiveness on different screen sizes.
*   Validate "Unidade Destaque" logic.
*   Validate "Intervalo Médio" calculation.
