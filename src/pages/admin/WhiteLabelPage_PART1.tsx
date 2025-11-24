import { useState, useCallback } from 'react';
import { Building2, Upload, X, Save, RotateCcw, Download, FileUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useWhiteLabelContext } from '@/contexts/WhiteLabelContext';
import { WhiteLabelSettings } from '@/hooks/useWhiteLabel';

export default function WhiteLabelPage() {
    const { settings, isLoading, updateSettings, uploadLogo, deleteLogo, isUpdating, isUploading } = useWhiteLabelContext();

    // Local state for form
    const [formData, setFormData] = useState<Partial<WhiteLabelSettings>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Initialize form data when settings load
    useState(() => {
        if (settings) {
            setFormData(settings);
            if (settings.logo_url) {
                setLogoPreview(settings.logo_url);
            }
        }
    });

    const handleInputChange = (field: keyof WhiteLabelSettings, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem válida');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase
        try {
            await uploadLogo(file);
        } catch (error) {
            setLogoPreview(settings?.logo_url || null);
        }
    }, [uploadLogo, settings]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleLogoUpload(file);
        }
    }, [handleLogoUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleLogoUpload(file);
        }
    }, [handleLogoUpload]);

    const handleDeleteLogo = async () => {
        try {
            await deleteLogo();
            setLogoPreview(null);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleSave = async () => {
        try {
            await updateSettings(formData);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleReset = () => {
        const defaults: Partial<WhiteLabelSettings> = {
            company_name: 'iMóbia CRM',
            company_cnpj: '',
            company_address: '',
            company_phone: '',
            company_email: '',
            company_website: '',
            primary_color: '#3882F6',
            secondary_color: '#10b981',
            accent_color: '#8b5cf6',
            chat_background_color: '#FFFFFF',
            chat_user_bubble_color: '#3882F6',
            chat_bot_bubble_color: '#F3F4F6',
            chat_history_panel_bg_color: '#FFFFFF',
            font_family: 'system-ui',
            font_size_base: '16px',
        };
        setFormData(defaults);
        toast.info('Formulário resetado. Clique em Salvar para aplicar.');
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(formData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'white-label-settings.json';
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Configurações exportadas!');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                setFormData(imported);
                toast.success('Configurações importadas! Clique em Salvar para aplicar.');
            } catch (error) {
                toast.error('Erro ao importar arquivo JSON');
            }
        };
        reader.readAsText(file);
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando configurações...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">White Label - Configurações de Marca</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                    <label>
                        <Button variant="outline" size="sm" asChild>
                            <span>
                                <FileUp className="h-4 w-4 mr-2" />
                                Importar
                            </span>
                        </Button>
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImport}
                        />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Empresa</CardTitle>
                            <CardDescription>
                                Dados da sua empresa que aparecerão no sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="company_name">Nome da Empresa *</Label>
                                    <Input
                                        id="company_name"
                                        value={formData.company_name || ''}
                                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                                        placeholder="iMóbia CRM"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="company_cnpj">CNPJ</Label>
                                    <Input
                                        id="company_cnpj"
                                        value={formData.company_cnpj || ''}
                                        onChange={(e) => handleInputChange('company_cnpj', e.target.value)}
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="company_phone">Telefone</Label>
                                    <Input
                                        id="company_phone"
                                        value={formData.company_phone || ''}
                                        onChange={(e) => handleInputChange('company_phone', e.target.value)}
                                        placeholder="(00) 0000-0000"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="company_email">Email</Label>
                                    <Input
                                        id="company_email"
                                        type="email"
                                        value={formData.company_email || ''}
                                        onChange={(e) => handleInputChange('company_email', e.target.value)}
                                        placeholder="contato@empresa.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="company_website">Website</Label>
                                    <Input
                                        id="company_website"
                                        value={formData.company_website || ''}
                                        onChange={(e) => handleInputChange('company_website', e.target.value)}
                                        placeholder="https://www.empresa.com"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="company_address">Endereço</Label>
                                    <Textarea
                                        id="company_address"
                                        value={formData.company_address || ''}
                                        onChange={(e) => handleInputChange('company_address', e.target.value)}
                                        placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Branding */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Logotipo</CardTitle>
                            <CardDescription>
                                Faça upload do logotipo da sua empresa
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                {logoPreview ? (
                                    <div className="space-y-4">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="max-h-32 mx-auto object-contain"
                                        />
                                        <div className="flex gap-2 justify-center">
                                            <label>
                                                <Button variant="outline" size="sm" asChild disabled={isUploading}>
                                                    <span>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Trocar Logo
                                                    </span>
                                                </Button>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileSelect}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleDeleteLogo}
                                                disabled={isUploading}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Remover
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium mb-1">
                                                Clique para selecionar ou arraste e solte
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                SVG, PNG, JPG ou WEBP (máx. 5MB)
                                            </p>
                                        </div>
                                        <label>
                                            <Button variant="outline" asChild disabled={isUploading}>
                                                <span>
                                                    {isUploading ? 'Enviando...' : 'Selecionar Arquivo'}
                                                </span>
                                            </Button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                            {formData.logo_metadata && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Arquivo: {(formData.logo_metadata as any).originalName} (
                                    {((formData.logo_metadata as any).size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Color Adjustments - Part 1 will continue in next file */}
                </div>

                {/* Right Column - Preview */}
                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                            <CardDescription>Visualização das mudanças</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Company Info Preview */}
                            <div className="space-y-2">
                                {logoPreview && (
                                    <img
                                        src={logoPreview}
                                        alt="Logo"
                                        className="h-12 object-contain mb-4"
                                    />
                                )}
                                <h3 className="font-semibold text-lg" style={{ color: formData.primary_color }}>
                                    {formData.company_name || 'Nome da Empresa'}
                                </h3>
                                {formData.company_cnpj && (
                                    <p className="text-sm text-muted-foreground">CNPJ: {formData.company_cnpj}</p>
                                )}
                                {formData.company_phone && (
                                    <p className="text-sm text-muted-foreground">Tel: {formData.company_phone}</p>
                                )}
                                {formData.company_email && (
                                    <p className="text-sm text-muted-foreground">{formData.company_email}</p>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-xs text-muted-foreground mb-3">Elementos do Sistema:</p>
                                <div className="space-y-2">
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        style={{ backgroundColor: formData.primary_color }}
                                    >
                                        Botão Primário
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full"
                                        style={{ borderColor: formData.primary_color, color: formData.primary_color }}
                                    >
                                        Botão Secundário
                                    </Button>
                                </div>
                            </div>

                            {/* Chat Preview */}
                            <div className="border-t pt-4">
                                <p className="text-xs text-muted-foreground mb-3">Preview do Chat:</p>
                                <div
                                    className="rounded-lg p-3 space-y-2"
                                    style={{ backgroundColor: formData.chat_background_color }}
                                >
                                    <div
                                        className="rounded-lg p-2 text-sm max-w-[80%]"
                                        style={{ backgroundColor: formData.chat_user_bubble_color, color: 'white' }}
                                    >
                                        Mensagem do usuário
                                    </div>
                                    <div
                                        className="rounded-lg p-2 text-sm max-w-[80%] ml-auto"
                                        style={{ backgroundColor: formData.chat_bot_bubble_color }}
                                    >
                                        Resposta do bot
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* This will be continued in part 2... */}
        </div>
    );
}
