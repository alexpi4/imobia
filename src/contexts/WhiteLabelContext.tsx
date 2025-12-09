import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWhiteLabel, WhiteLabelSettings } from '@/hooks/useWhiteLabel';
import { useAuth } from '@/contexts/AuthContext';

interface WhiteLabelContextType {
    settings: WhiteLabelSettings | null | undefined;
    isLoading: boolean;
    updateSettings: (settings: Partial<WhiteLabelSettings>) => Promise<any>;
    uploadLogo: (file: File) => Promise<any>;
    deleteLogo: () => Promise<any>;
    isUpdating: boolean;
    isUploading: boolean;
}

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined);

export function WhiteLabelProvider({ children }: { children: ReactNode }) {
    const whiteLabelHook = useWhiteLabel();
    const { settings } = whiteLabelHook;
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Refetch settings when user changes (e.g. login)
    useEffect(() => {
        if (user?.id) {
            queryClient.invalidateQueries({ queryKey: ['white-label-settings'] });
        }
    }, [user?.id, queryClient]);

    // Apply white label settings to the document
    useEffect(() => {
        if (!settings) return;

        const root = document.documentElement;

        // Apply company name to document title
        if (settings.company_name) {
            document.title = settings.company_name;
        }

        // Apply favicon
        if (settings.favicon_url) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = settings.favicon_url;
        }

        // Apply colors as CSS custom properties
        if (settings.primary_color) {
            // Convert hex to HSL for primary color (to work with existing theme system)
            const hexToHSL = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                if (!result) return '221.2 83.2% 53.3%';

                const r = parseInt(result[1], 16) / 255;
                const g = parseInt(result[2], 16) / 255;
                const b = parseInt(result[3], 16) / 255;

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                let h = 0, s = 0, l = (max + min) / 2;

                if (max !== min) {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                    switch (max) {
                        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                        case g: h = ((b - r) / d + 2) / 6; break;
                        case b: h = ((r - g) / d + 4) / 6; break;
                    }
                }

                return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
            };

            root.style.setProperty('--primary', hexToHSL(settings.primary_color));
            root.style.setProperty('--wl-primary-color', settings.primary_color);
        }

        if (settings.secondary_color) {
            root.style.setProperty('--wl-secondary-color', settings.secondary_color);
        }

        if (settings.accent_color) {
            root.style.setProperty('--wl-accent-color', settings.accent_color);
        }

        // Chat colors (for future use)
        if (settings.chat_background_color) {
            root.style.setProperty('--wl-chat-bg', settings.chat_background_color);
        }

        if (settings.chat_user_bubble_color) {
            root.style.setProperty('--wl-chat-user-bubble', settings.chat_user_bubble_color);
        }

        if (settings.chat_bot_bubble_color) {
            root.style.setProperty('--wl-chat-bot-bubble', settings.chat_bot_bubble_color);
        }

        if (settings.chat_history_panel_bg_color) {
            root.style.setProperty('--wl-chat-history-bg', settings.chat_history_panel_bg_color);
        }

        // Apply font family
        if (settings.font_family) {
            root.style.setProperty('--wl-font-family', settings.font_family);
            // Also update the Tailwind font variable if possible, or force on body
            root.style.setProperty('--font-sans', settings.font_family);
            document.body.style.setProperty('font-family', settings.font_family, 'important');
        }

        // Apply font size
        if (settings.font_size_base) {
            root.style.setProperty('--wl-font-size-base', settings.font_size_base);
        }

        // Apply custom CSS
        if (settings.custom_css) {
            let styleEl = document.getElementById('wl-custom-css');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'wl-custom-css';
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = settings.custom_css;
        }

        // Apply custom JS (with caution)
        if (settings.custom_js) {
            try {
                const scriptEl = document.getElementById('wl-custom-js');
                if (scriptEl) {
                    scriptEl.remove();
                }
                const newScript = document.createElement('script');
                newScript.id = 'wl-custom-js';
                newScript.textContent = settings.custom_js;
                document.body.appendChild(newScript);
            } catch (error) {
                console.error('Error executing custom JS:', error);
            }
        }
    }, [settings]);

    return (
        <WhiteLabelContext.Provider value={whiteLabelHook}>
            {children}
        </WhiteLabelContext.Provider>
    );
}

export function useWhiteLabelContext() {
    const context = useContext(WhiteLabelContext);
    if (!context) {
        throw new Error('useWhiteLabelContext must be used within WhiteLabelProvider');
    }
    return context;
}
