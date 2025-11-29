import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WhiteLabelSettings {
    id: number;
    company_name: string;
    company_cnpj?: string;
    company_address?: string;
    company_phone?: string;
    company_email?: string;
    company_website?: string;
    logo_url?: string;
    logo_metadata?: Record<string, any>;
    favicon_url?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    chat_background_color: string;
    chat_user_bubble_color: string;
    chat_bot_bubble_color: string;
    chat_history_panel_bg_color: string;
    font_family: string;
    font_size_base: string;
    custom_css?: string;
    custom_js?: string;
    created_at: string;
    updated_at: string;
}

export function useWhiteLabel() {
    const queryClient = useQueryClient();

    // Fetch white label settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['white-label-settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('white_label_settings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                // If no settings exist, return defaults
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }

            return data as WhiteLabelSettings;
        },
        staleTime: 0,
        gcTime: 0,
    });

    // Update white label settings
    const updateSettings = useMutation({
        mutationFn: async (newSettings: Partial<WhiteLabelSettings>) => {
            // Remove id, created_at, and updated_at from the update payload
            const { id, created_at, updated_at, ...updateData } = newSettings;

            // Check if a record already exists
            const { data: existingRecord } = await supabase
                .from('white_label_settings')
                .select('id')
                .limit(1)
                .maybeSingle();

            if (existingRecord?.id) {
                const { data, error } = await supabase
                    .from('white_label_settings')
                    .update(updateData)
                    .eq('id', existingRecord.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabase
                    .from('white_label_settings')
                    .insert([updateData])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['white-label-settings'] });
            toast.success('Configurações salvas com sucesso!');
        },
        onError: (error: Error) => {
            toast.error('Erro ao salvar configurações: ' + error.message);
        },
    });

    // Upload logo to Supabase Storage
    const uploadLogo = useMutation({
        mutationFn: async (file: File) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('white-label-assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('white-label-assets')
                .getPublicUrl(filePath);

            return {
                url: urlData.publicUrl,
                metadata: {
                    originalName: file.name,
                    size: file.size,
                    type: file.type,
                },
            };
        },
        onSuccess: async (data) => {
            // Update settings with new logo URL
            await updateSettings.mutateAsync({
                logo_url: data.url,
                logo_metadata: data.metadata,
            });
            toast.success('Logo enviado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error('Erro ao enviar logo: ' + error.message);
        },
    });

    // Delete logo
    const deleteLogo = useMutation({
        mutationFn: async () => {
            if (!settings?.logo_url) return;

            // Extract file path from URL
            const url = new URL(settings.logo_url);
            const filePath = url.pathname.split('/').slice(-2).join('/');

            // Delete from storage
            const { error } = await supabase.storage
                .from('white-label-assets')
                .remove([filePath]);

            if (error) throw error;

            // Update settings
            await updateSettings.mutateAsync({
                logo_url: undefined,
                logo_metadata: undefined,
            });
        },
        onSuccess: () => {
            toast.success('Logo removido com sucesso!');
        },
        onError: (error: Error) => {
            toast.error('Erro ao remover logo: ' + error.message);
        },
    });

    return {
        settings,
        isLoading,
        updateSettings: updateSettings.mutateAsync,
        uploadLogo: uploadLogo.mutateAsync,
        deleteLogo: deleteLogo.mutateAsync,
        isUpdating: updateSettings.isPending,
        isUploading: uploadLogo.isPending,
    };
}
