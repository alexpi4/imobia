import { useCadastro } from '@/hooks/useCadastros';
import { LogAuditoria } from '@/types/operacional';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export function AuditLogs() {
    const { data: logs, loading } = useCadastro<LogAuditoria>('logs_auditoria', '*, usuario:profiles(nome)');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Logs de Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data/Hora</TableHead>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Ação</TableHead>
                            <TableHead>Entidade</TableHead>
                            <TableHead>Detalhes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5}>Carregando...</TableCell></TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow><TableCell colSpan={5}>Nenhum log encontrado.</TableCell></TableRow>
                        ) : (
                            logs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}</TableCell>
                                    <TableCell>{log.usuario?.nome || 'Sistema'}</TableCell>
                                    <TableCell>{log.acao}</TableCell>
                                    <TableCell>{log.entidade} ({log.entidade_id})</TableCell>
                                    <TableCell className="max-w-[300px] truncate text-xs font-mono">
                                        {JSON.stringify(log.dados_novos || log.dados_anteriores)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
