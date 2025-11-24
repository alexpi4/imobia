# White Label System Implementation Plan

## Overview
Create a comprehensive White Label system that allows administrators to customize the entire CRM application with their own branding, including company information, logos, colors, and typography. All settings will be stored in Supabase and applied globally across the application.

## Database Schema

### New Table: `white_label_settings`

**Company Information:**
- `company_name` - Nome da empresa
- `company_cnpj` - CNPJ da empresa
- `company_address` - Endereço completo
- `company_phone` - Telefone de contato
- `company_email` - Email de contato
- `company_website` - Website da empresa

**Branding:**
- `logo_url` - URL do logotipo principal
- `logo_metadata` - Metadados do arquivo (nome, tamanho, tipo)
- `favicon_url` - URL do favicon

**Color Customization:**
- `primary_color` - Cor primária do sistema
- `secondary_color` - Cor secundária
- `accent_color` - Cor de destaque
- `chat_background_color` - Cor de fundo do chat (futuro)
- `chat_user_bubble_color` - Cor das mensagens do usuário
- `chat_bot_bubble_color` - Cor das mensagens do bot
- `chat_history_panel_bg_color` - Cor do painel de histórico

**Typography:**
- `font_family` - Família de fonte
- `font_size_base` - Tamanho base da fonte

**Advanced:**
- `custom_css` - CSS personalizado
- `custom_js` - JavaScript personalizado

## Implementation Components

### 1. Backend Integration

#### [20251121_white_label_settings.sql](file:///c:/Users/Alex/imobia/imobia/supabase/migrations/20251121_white_label_settings.sql)
- Create `white_label_settings` table
- RLS policies (admin-only write, public read)
- Default settings inserted
- Trigger for `updated_at`

### 2. Context & Hooks

#### [NEW] [WhiteLabelContext.tsx](file:///c:/Users/Alex/imobia/imobia/src/contexts/WhiteLabelContext.tsx)
- Load settings from Supabase on app init
- Provide settings to entire app
- Update settings function
- Apply branding dynamically (CSS variables, document title, favicon)

#### [NEW] [useWhiteLabel.ts](file:///c:/Users/Alex/imobia/imobia/src/hooks/useWhiteLabel.ts)
- Custom hook for CRUD operations on white_label_settings
- Fetch, update, upload logo functions
- Integration with Supabase Storage for logo uploads

### 3. White Label Page

#### [MODIFY] [WhiteLabelPage.tsx](file:///c:/Users/Alex/imobia/imobia/src/pages/admin/WhiteLabelPage.tsx)
Replace placeholder with full implementation:

**Company Information Section:**
- Company Name input
- CNPJ input (with mask)
- Address textarea
- Phone input (with mask)
- Email input
- Website input

**Branding Section:**
- Logo upload (drag & drop + click to select)
- Logo preview
- Favicon upload
- Remove logo button

**Color Adjustments Section:**
- Primary Color picker
- Secondary Color picker
- Accent Color picker
- Chat Background Color picker
- Chat User Bubble Color picker
- Chat Bot Bubble Color picker
- Chat History Panel Background Color picker
- Recent colors palette
- Hex input for each color

**Font Settings Section:**
- Font family dropdown
- Font size slider
- Preview text

**Preview Panel:**
- Live preview of changes
- Sample UI elements with applied colors
- Chat message bubbles preview

**Actions:**
- Save button (saves to Supabase)
- Reset to defaults button
- Export settings button (JSON download)
- Import settings button (JSON upload)

### 4. Global Application

#### [MODIFY] [App.tsx](file:///c:/Users/Alex/imobia/imobia/src/App.tsx)
- Wrap with `WhiteLabelProvider`
- Load settings on app initialization

#### [MODIFY] [index.html](file:///c:/Users/Alex/imobia/imobia/index.html)
- Dynamic title from white label settings
- Dynamic favicon from white label settings

### 5. Integration with Existing Theme System

#### [MODIFY] [ThemeContext.tsx](file:///c:/Users/Alex/imobia/imobia/src/contexts/ThemeContext.tsx)
- Merge with WhiteLabelContext or coordinate
- White label colors override theme colors
- Ensure compatibility

## Features & Improvements

### Core Features (from reference image):
1. ✅ Logo upload with preview
2. ✅ Color adjustments with color picker
3. ✅ Font settings
4. ✅ Live preview panel
5. ✅ Company information fields

### Additional Improvements:
1. **Supabase Storage Integration**
   - Upload logos to Supabase Storage
   - Generate public URLs
   - Automatic image optimization

2. **CNPJ & Phone Masks**
   - Input masks for Brazilian formats
   - Validation

3. **Advanced Color Management**
   - Color picker with HSL/RGB/Hex support
   - Recent colors history
   - Color palette suggestions
   - Accessibility contrast checker

4. **Live Preview**
   - Real-time preview of all changes
   - Sample components (buttons, cards, chat bubbles)
   - Before/after comparison

5. **Import/Export**
   - Export settings as JSON
   - Import settings from JSON
   - Backup/restore functionality

6. **Multi-tenant Support** (future)
   - Multiple white label configurations
   - Organization-based settings

7. **Custom CSS/JS**
   - Advanced customization for power users
   - Code editor with syntax highlighting

## File Upload Strategy

### Supabase Storage Buckets:
- Create `white-label-assets` bucket
- Public read access
- Admin-only write access
- Automatic URL generation

### Upload Flow:
1. User selects/drops image
2. Validate file (type, size)
3. Upload to Supabase Storage
4. Get public URL
5. Save URL to `white_label_settings` table
6. Update context
7. Apply globally

## Verification Plan

### Manual Testing:
1. Navigate to White Label page
2. Upload logo - verify preview and storage
3. Change company information - verify save
4. Adjust colors - verify live preview
5. Change font - verify global application
6. Save settings - verify Supabase persistence
7. Refresh page - verify settings load correctly
8. Navigate to other pages - verify branding applied
9. Test reset to defaults
10. Test export/import settings

### Database Verification:
```sql
SELECT * FROM white_label_settings;
```

### Storage Verification:
- Check Supabase Storage for uploaded files
- Verify public URLs are accessible

## Migration Path

1. Run migration: `20251121_white_label_settings.sql`
2. Create storage bucket via Supabase Dashboard
3. Deploy code changes
4. Test with admin user
5. Document for end users
