import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
    startDate: Date | undefined
    endDate: Date | undefined
    onStartDateChange: (date: Date | undefined) => void
    onEndDateChange: (date: Date | undefined) => void
    className?: string
}

export function DateRangePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    className,
}: DateRangePickerProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !startDate && !endDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                            endDate ? (
                                <>
                                    {format(startDate, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                                    {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
                                </>
                            ) : (
                                format(startDate, "dd/MM/yyyy", { locale: ptBR })
                            )
                        ) : (
                            <span>Selecione uma data</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start-date">Data Início</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : undefined;
                                    // Adjust for timezone offset to keep the selected date
                                    if (date) {
                                        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                                        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
                                        onStartDateChange(adjustedDate);
                                    } else {
                                        onStartDateChange(undefined);
                                    }
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end-date">Data Fim</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : undefined;
                                    if (date) {
                                        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                                        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
                                        onEndDateChange(adjustedDate);
                                    } else {
                                        onEndDateChange(undefined);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
