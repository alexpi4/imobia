# Implementation Plan - Drag & Drop for Pipeline Stages

## Goal
Enable drag-and-drop reordering of pipeline stages in the "Edit Pipeline" page (`PipelineFormPage.tsx`).

## Proposed Changes

### 1. `src/pages/cadastros/PipelineFormPage.tsx`
- **Imports**: Add `@dnd-kit/core` and `@dnd-kit/sortable` imports.
- **Component Structure**:
    - Create a sub-component `SortableStageItem` to wrap the stage row. This component will use `useSortable`.
    - Wrap the list of stages in `DndContext` and `SortableContext`.
- **Logic**:
    - Initialize sensors (`PointerSensor`, `KeyboardSensor`).
    - Implement `handleDragEnd` function.
    - Use `move` function from `useFieldArray` to update the order in the form state.
    - Ensure `DragOverlay` is used for smooth visual feedback (optional but recommended for better UX).

## Verification Plan
- **Manual Verification**:
    - Go to "Cadastros" > "Pipelines" > "Novo" or "Editar".
    - Add multiple stages.
    - Drag and drop stages to reorder.
    - Save the pipeline.
    - Reload the page to verify the order is persisted.

## Dependencies
- `@dnd-kit/core` (Already installed)
- `@dnd-kit/sortable` (Already installed)
- `lucide-react` (Already installed)
