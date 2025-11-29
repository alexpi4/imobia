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
            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>Distribuição por Unidade</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Distribuição por Unidade</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Unidade</TableHead>
                                <TableHead className="text-center">Site</TableHead>
                                <TableHead className="text-center">UPP</TableHead>
                                <TableHead className="text-center">WhatsApp</TableHead>
                                <TableHead className="text-center">RD</TableHead>
                                <TableHead className="text-center">Redes</TableHead>
                                <TableHead className="text-center">Indic.</TableHead>
                                <TableHead className="text-center">Outros</TableHead>
                                <TableHead className="text-center font-bold">Total</TableHead>
                                <TableHead className="text-right">%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.map((row, index) => (
                                <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                                    <TableCell className="font-medium">{row.unidade}</TableCell>
                                    <TableCell className="text-center">{row.site}</TableCell>
                                    <TableCell className="text-center">{row.upp}</TableCell>
                                    <TableCell className="text-center">{row.whatsapp}</TableCell>
                                    <TableCell className="text-center">{row.rd}</TableCell>
                                    <TableCell className="text-center">{row.redes}</TableCell>
                                    <TableCell className="text-center">{row.indicacao}</TableCell>
                                    <TableCell className="text-center">{row.outros}</TableCell>
                                    <TableCell className="text-center font-bold">{row.total}</TableCell>
                                    <TableCell className="text-right">{row.percentage}%</TableCell>
                                </TableRow>
                            ))}
                            {(!data || data.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
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
