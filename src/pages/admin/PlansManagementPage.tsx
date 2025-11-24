import { useState, useEffect } from 'react';
import { useCadastro } from '@/hooks/useCadastros';
import { Plan, Module } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function PlansManagementPage() {
    const { data: plans, create, update, remove, refetch } = useCadastro<Plan>('plans');
    const [modules, setModules] = useState<Module[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState<Partial<Plan>>({
        name: '',
        description: '',
        price: 0,
        active: true,
        features: {},
    });
    const [selectedModules, setSelectedModules] = useState<number[]>([]);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        const { data } = await supabase.from('modules').select('*').order('name');
        if (data) setModules(data);
    };

    const fetchPlanModules = async (planId: number) => {
        const { data } = await supabase
            .from('plan_modules')
            .select('module_id')
            .eq('plan_id', planId);

        if (data) {
            setSelectedModules(data.map(pm => pm.module_id));
        } else {
            setSelectedModules([]);
        }
    };

    const handleOpenDialog = async (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                description: plan.description,
                price: plan.price,
                active: plan.active,
                features: plan.features,
            });
            await fetchPlanModules(plan.id);
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                description: '',
                price: 0,
                active: true,
                features: {},
            });
            setSelectedModules([]);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            let planId = editingPlan?.id;

            if (editingPlan) {
                await update(editingPlan.id, formData);
            } else {
                const newPlan = await create(formData);
                if (newPlan) planId = newPlan.id;
            }

            if (planId) {
                // Update modules
                // First delete existing
                await supabase.from('plan_modules').delete().eq('plan_id', planId);

                // Insert new
                if (selectedModules.length > 0) {
                    const modulesToInsert = selectedModules.map(moduleId => ({
                        plan_id: planId,
                        module_id: moduleId
                    }));
                    await supabase.from('plan_modules').insert(modulesToInsert);
                }
            }

            setIsDialogOpen(false);
            refetch();
            toast.success('Plano salvo com sucesso!');
        } catch (error) {
            console.error('Error saving plan:', error);
        }
    };

    const toggleModule = (moduleId: number) => {
        setSelectedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Planos</h1>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Plano
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.name}</TableCell>
                                <TableCell>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={plan.active ? 'default' : 'secondary'}>
                                        {plan.active ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(plan)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(plan.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Preço (R$)</Label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={formData.active}
                                onCheckedChange={checked => setFormData({ ...formData, active: checked })}
                            />
                            <Label>Plano Ativo</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Módulos Incluídos</Label>
                            <div className="grid grid-cols-2 gap-2 border p-4 rounded-md h-48 overflow-y-auto">
                                {modules.map(module => (
                                    <div key={module.id} className="flex items-center space-x-2">
                                        <Switch
                                            checked={selectedModules.includes(module.id)}
                                            onCheckedChange={() => toggleModule(module.id)}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{module.name}</span>
                                            <span className="text-xs text-muted-foreground">{module.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
