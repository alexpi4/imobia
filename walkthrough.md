# Walkthrough

## Recent Changes

### 1. Codebase Cleanup and Refactoring
- **Organization**: Moved CRM pages to `src/pages/crm/`.
- **Cleanup**: Removed unused files and fixed lint errors.

### 2. Feature Implementation: Drag & Drop for Pipeline Stages
- **Component**: Updated `PipelineFormPage.tsx`.
- **Library**: Integrated `@dnd-kit/core` and `@dnd-kit/sortable`.
# Walkthrough

## Recent Changes

### 1. Codebase Cleanup and Refactoring
- **Organization**: Moved CRM pages to `src/pages/crm/`.
- **Cleanup**: Removed unused files and fixed lint errors.

### 2. Feature Implementation: Drag & Drop for Pipeline Stages
- **Component**: Updated `PipelineFormPage.tsx`.
- **Library**: Integrated `@dnd-kit/core` and `@dnd-kit/sortable`.
- **Functionality**:
    - Users can now drag and drop stages to reorder them in the "Edit Pipeline" page.
    - The new order is automatically reflected in the form state and saved to the backend.
    - Visual feedback is provided during dragging.
- **Verification**:
    - `npm run build` passed.
    - `npx eslint` passed (with minor warning for dnd-kit compatibility).

    - `npx eslint` passed.

### 4. Bug Fix: Pipeline Form Data Loading & Saving
- **Issue**: "Unidade" and "Tipo" fields were not loading correctly.
- **Fix**:
    - **Refactor to Standard Pattern**: Refactored `PipelineFormPage` to use `FormField` and `Controller` components from `react-hook-form` (via `shadcn/ui` Form components). This aligns with the implementation in other pages like `TimeDeVendasDialog` and ensures proper state management for controlled inputs like `Select`.
    - **Data Type Safety**: Maintained explicit type conversion for `unidade_id` and `tipo`.
- **Verification**:
    - `npx eslint` passed.

### 5. Bug Fix: Pipeline Creation (created_by)
- **Issue**: Pipelines created were having `created_by` as NULL or invalid.
- **Fix**: Updated `PipelineFormPage.tsx` to use `profile.id` (integer) instead of `user.id` (UUID string) for the `created_by` field.
- **Verification**:
    - `npm run build` passed.
    - `npx eslint` passed.
