import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UnitDistributionTableProps {
    data?: {
        unidade: string;
        site: number;
        upp: number;
        whatsapp: number;
        rd: number;
        redes: number;
        indicacao: number;
        outros: number;
        total: number;
        percentage: number;
    }[];
    isLoading: boolean;
}

export function UnitDistributionTable({ data, isLoading }: UnitDistributionTableProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1 md:col-span-2 border-0 shadow-premium">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Distribuição por Unidade</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 md:col-span-2 border-0 shadow-premium hover-lift transition-smooth animate-scale-in">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-lg font-semibold">Distribuição por Unidade</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-border hover:bg-transparent">
                                <TableHead className="font-semibold text-foreground">Unidade</TableHead>
                                <TableHead className="text-center font-semibold text-foreground">Site</TableHead>
                                <TableHead className="text-center font-semibold text-foreground">UPP</TableHead>
                                <TableHead className="text-center font-semibold text-foreground">WhatsApp</TableHead>
                                <TableHead className="text-center font-semibold text-foreground">RD</TableHead>
                                <TableHead className="text-center font-semibold text-foreground">Redes</TableHead>
                                <TableHead className="text-center font-semibold text-foreground">Indic.</TableHead>
                                <TableHead className="text-center font-semibold text-foreground">Outros</TableHead>
                                <TableHead className="text-center font-bold text-foreground">Total</TableHead>
                                <TableHead className="text-right font-semibold text-foreground">%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.map((row, index) => (
                                <TableRow
                                    key={index}
                                    className={`transition-smooth hover:bg-primary/5 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'
                                        }`}
                                >
                                    <TableCell className="font-semibold">{row.unidade}</TableCell>
                                    <TableCell className="text-center">{row.site}</TableCell>
                                    <TableCell className="text-center">{row.upp}</TableCell>
                                    <TableCell className="text-center">{row.whatsapp}</TableCell>
                                    <TableCell className="text-center">{row.rd}</TableCell>
                                    <TableCell className="text-center">{row.redes}</TableCell>
                                    <TableCell className="text-center">{row.indicacao}</TableCell>
                                    <TableCell className="text-center">{row.outros}</TableCell>
                                    <TableCell className="text-center font-bold text-primary">{row.total}</TableCell>
                                    <TableCell className="text-right font-semibold">{row.percentage}%</TableCell>
                                </TableRow>
                            ))}
                            {(!data || data.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                                        Nenhum dado encontrado para o período selecionado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
