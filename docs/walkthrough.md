# Walkthrough - New Análise Venda / Locação Dashboard

I have successfully implemented the new "Análise Venda / Locação" dashboard as per the PRD, replacing the previous implementation.

## Changes

### Dashboard Implementation
*   **Page**: `AnaliseVLPage.tsx` fully updated with the new layout.
*   **Components**:
    *   **Header**: Title and Period Filter (7, 15, 30, 90, 180 days).
    *   **KPIs**: Leads de Venda and Leads de Locação cards.
    *   **Charts**:
        *   Pie Chart: Distribuição Venda vs Locação vs Indefinido.
        *   Vertical Bar Chart: Venda e Locação por Unidade.
        *   Horizontal Bar Chart: Venda e Locação por Cidade (Top 10).
        *   Horizontal Bar Chart: Venda e Locação por Canal de Origem.
    *   **Table**: Resumo Detalhado by Unidade.
*   **Data Fetching**: Uses new Supabase RPC functions for server-side aggregation.

### Database (Supabase)
*   **New RPC Functions**:
    *   `rpc_get_kpis(periodo_dias)`
    *   `rpc_get_distribuicao_intencao(periodo_dias)`
    *   `rpc_get_unidades(periodo_dias)`
    *   `rpc_get_cidades(periodo_dias)`
    *   `rpc_get_origens(periodo_dias)`
    *   `rpc_get_tabela_resumo(periodo_dias)`
*   **Schema Usage**: Functions use existing `leads` table text columns (`origem`, `unidade`, `intencao`) mapped to the requested logic.

## Verification Results

### Automated Checks
*   **Build**: `npm run build` passed successfully.

### Manual Verification Steps
1.  **Access**: Go to "Análise V/L" in the sidebar.
2.  **Layout**: Verify it matches the provided image (Header, KPIs, 4 Charts, Table).
3.  **Interactivity**: Change the period filter (e.g., to 7 days) and verify all charts and numbers update.
4.  **Data Accuracy**: Check if "Venda" and "Locação" counts match across charts and KPIs.
