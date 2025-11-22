import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DEFAULT_SETTINGS = {
    primaryColor: '#3882F6',
    borderRadius: 0.5,
    fontFamily: 'system-ui',
    accessibilityMode: false,
};

export default function PersonalizacaoPage() {
    const [primaryColor, setPrimaryColor] = useState(DEFAULT_SETTINGS.primaryColor);
    const [borderRadius, setBorderRadius] = useState([DEFAULT_SETTINGS.borderRadius]);
    const [fontFamily, setFontFamily] = useState(DEFAULT_SETTINGS.fontFamily);
    const [accessibilityMode, setAccessibilityMode] = useState(DEFAULT_SETTINGS.accessibilityMode);
    const [showResetDialog, setShowResetDialog] = useState(false);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrimaryColor(e.target.value);
        toast.success('Cor principal atualizada');
    };

    const handleBorderRadiusChange = (value: number[]) => {
        setBorderRadius(value);
    };

    const handleFontChange = (value: string) => {
        setFontFamily(value);
        toast.success('Fonte do sistema atualizada');
    };

    const handleAccessibilityToggle = (checked: boolean) => {
        setAccessibilityMode(checked);
        toast.success(checked ? 'Modo de acessibilidade ativado' : 'Modo de acessibilidade desativado');
    };

    const handleReset = () => {
        setPrimaryColor(DEFAULT_SETTINGS.primaryColor);
        setBorderRadius([DEFAULT_SETTINGS.borderRadius]);
        setFontFamily(DEFAULT_SETTINGS.fontFamily);
        setAccessibilityMode(DEFAULT_SETTINGS.accessibilityMode);
        setShowResetDialog(false);
        toast.success('Todas as configurações foram redefinidas');
    };

    return (
        <div className="p-6 max-w-4xl space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Palette className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Personalização da Interface</h1>
            </div>

            {/* Aparência */}
            <Card>
                <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Cor Principal */}
                    <div className="space-y-2">
                        <Label htmlFor="primary-color">Cor Principal</Label>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="color"
                                    id="primary-color"
                                    value={primaryColor}
                                    onChange={handleColorChange}
                                    className="h-10 w-14 rounded-md border border-input cursor-pointer"
                                />
                            </div>
                            <Input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="flex-1 max-w-[200px] font-mono uppercase"
                                placeholder="#3882F6"
                            />
                        </div>
                    </div>

                    {/* Raio da Borda */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="border-radius">Raio da Borda ({borderRadius[0].toFixed(1)}rem)</Label>
                        </div>
                        <Slider
                            id="border-radius"
                            min={0}
                            max={1}
                            step={0.1}
                            value={borderRadius}
                            onValueChange={handleBorderRadiusChange}
                            className="w-full"
                        />
                    </div>

                    {/* Fonte do Sistema */}
                    <div className="space-y-2">
                        <Label htmlFor="font-family">Fonte do Sistema</Label>
                        <Select value={fontFamily} onValueChange={handleFontChange}>
                            <SelectTrigger id="font-family">
                                <SelectValue placeholder="Selecione a fonte" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="system-ui">system-ui</SelectItem>
                                <SelectItem value="Inter">Inter</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Helvetica">Helvetica</SelectItem>
                                <SelectItem value="Georgia">Georgia</SelectItem>
                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Acessibilidade */}
            <Card>
                <CardHeader>
                    <CardTitle>Acessibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label htmlFor="accessibility-mode" className="text-base font-medium">
                                Modo de Acessibilidade
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Aumenta o tamanho da fonte e melhora o foco para navegação por teclado.
                            </p>
                        </div>
                        <Switch
                            id="accessibility-mode"
                            checked={accessibilityMode}
                            onCheckedChange={handleAccessibilityToggle}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Botão de Reset */}
            <Card>
                <CardContent className="pt-6">
                    <Button
                        variant="destructive"
                        onClick={() => setShowResetDialog(true)}
                        className="w-full"
                    >
                        Redefinir Todas as Configurações
                    </Button>
                </CardContent>
            </Card>

            {/* Dialog de Confirmação de Reset */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Redefinir configurações?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação irá restaurar todas as configurações de personalização para os valores padrão.
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset}>
                            Redefinir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
