# Personalização Page Implementation

Create a comprehensive customization page for the CRM interface based on the provided reference image, allowing users to personalize the application's appearance and accessibility settings.

## User Review Required

> [!IMPORTANT]
> **Enhanced Features Beyond Reference Image**
> While implementing the features shown in the reference image (color picker, border radius slider, font selector, and accessibility toggle), I'm proposing additional improvements:
> - **Theme Persistence**: Save user preferences to localStorage for persistence across sessions
> - **Live Preview**: Real-time preview of changes as users adjust settings
> - **Additional Customization Options**: Include dark/light mode toggle, accent color picker, and font size adjustment
> - **Export/Import Settings**: Allow users to export and import their customization preferences
> 
> Please confirm if you'd like these enhancements or prefer to stick strictly to the reference image.

## Proposed Changes

### Components

#### [NEW] [slider.tsx](file:///c:/Users/Alex/imobia/imobia/src/components/ui/slider.tsx)
Create a new Radix UI slider component for the border radius control. This component will:
- Use `@radix-ui/react-slider` for accessible range input
- Support min/max values and step increments
- Display current value with visual feedback
- Match the existing UI component styling patterns

---

### Pages

#### [MODIFY] [PersonalizacaoPage.tsx](file:///c:/Users/Alex/imobia/imobia/src/pages/admin/PersonalizacaoPage.tsx)
Replace the placeholder page with a fully functional customization interface featuring:

**Aparência (Appearance) Section:**
- Primary color picker with hex input and color swatch
- Border radius slider (0-1rem range) with live value display
- Font system dropdown selector (system-ui, Inter, Roboto, etc.)
- Visual preview of current settings

**Acessibilidade (Accessibility) Section:**
- Accessibility mode toggle switch
- Description explaining the feature (increases font size and improves focus for keyboard navigation)
- Additional accessibility options (optional: high contrast mode, reduced motion)

**Actions:**
- "Redefinir Todas as Configurações" (Reset All Settings) button in destructive variant
- Auto-save functionality with toast notifications
- Confirmation dialog for reset action

**Improvements over reference:**
- Add dark/light mode toggle
- Include accent color customization
- Add font size adjustment slider
- Show live preview panel
- Include export/import configuration buttons

---

### Hooks (Optional Enhancement)

#### [NEW] [useThemeCustomization.ts](file:///c:/Users/Alex/imobia/imobia/src/hooks/useThemeCustomization.ts)
Custom hook to manage theme customization state and persistence:
- Load/save preferences from localStorage
- Apply CSS custom properties dynamically
- Provide reset functionality
- Export/import configuration as JSON

## Verification Plan

### Automated Tests
No existing automated tests for UI customization. Manual testing will be performed.

### Manual Verification
1. **Navigate to Personalização Page**
   - Start the dev server: `npm run dev`
   - Open browser to `http://localhost:8080`
   - Log in with test credentials
   - Navigate to "Administração" → "Configurações Sistema" → "Personalização"

2. **Test Color Picker**
   - Click on the color input
   - Select a new primary color
   - Verify the color updates in real-time (if live preview is implemented)
   - Check that the hex value displays correctly

3. **Test Border Radius Slider**
   - Drag the slider from 0 to 1rem
   - Verify the value label updates
   - Check that UI elements reflect the new border radius (if live preview is implemented)

4. **Test Font Selector**
   - Open the font dropdown
   - Select different font options
   - Verify font changes apply to the interface (if live preview is implemented)

5. **Test Accessibility Toggle**
   - Toggle the accessibility mode switch
   - Verify the switch state changes
   - Check for any visual feedback or changes

6. **Test Reset Button**
   - Make several customization changes
   - Click "Redefinir Todas as Configurações"
   - Confirm the reset action in the dialog
   - Verify all settings return to defaults

7. **Test Persistence** (if implemented)
   - Make customization changes
   - Refresh the page
   - Verify settings are preserved

8. **Responsive Design**
   - Test the page on different screen sizes
   - Verify layout adapts properly to mobile/tablet views
