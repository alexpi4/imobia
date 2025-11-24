import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeSettings {
    primaryColor: string;
    borderRadius: number;
    fontFamily: string;
    accessibilityMode: boolean;
}

interface ThemeContextType {
    settings: ThemeSettings;
    updateSettings: (newSettings: Partial<ThemeSettings>) => void;
    resetSettings: () => void;
}

const DEFAULT_SETTINGS: ThemeSettings = {
    primaryColor: '#3882F6',
    borderRadius: 0.5,
    fontFamily: 'system-ui',
    accessibilityMode: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<ThemeSettings>(() => {
        // Load from localStorage
        const saved = localStorage.getItem('theme-settings');
        if (saved) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            } catch {
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    });

    // Apply theme settings to CSS custom properties
    useEffect(() => {
        const root = document.documentElement;

        // Convert hex to HSL for primary color
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

        // Apply primary color
        root.style.setProperty('--primary', hexToHSL(settings.primaryColor));

        // Apply border radius
        root.style.setProperty('--radius', `${settings.borderRadius}rem`);

        // Apply font family
        root.style.setProperty('--font-family', settings.fontFamily);
        document.body.style.fontFamily = settings.fontFamily;

        // Apply accessibility mode
        if (settings.accessibilityMode) {
            root.style.setProperty('--base-font-size', '18px');
            root.classList.add('accessibility-mode');
        } else {
            root.style.setProperty('--base-font-size', '16px');
            root.classList.remove('accessibility-mode');
        }

        // Save to localStorage
        localStorage.setItem('theme-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: Partial<ThemeSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem('theme-settings');
    };

    return (
        <ThemeContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
