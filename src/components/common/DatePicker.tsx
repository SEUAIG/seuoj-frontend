import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import type { DateRange } from "react-day-picker";

type DatePickerProps = {
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
};

export default function DatePicker({ range, onRangeChange }: DatePickerProps) {
  const hasRange = Boolean(range?.from);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!hasRange}
          className="data-[empty=true]:text-muted-foreground w-full min-w-[280px] max-w-[360px] justify-between text-left font-normal"
        >
          {range?.from
            ? range.to
              ? `${format(range.from, "yyyy年MM月dd日")} - ${format(
                  range.to,
                  "yyyy年MM月dd日"
                )}`
              : format(range.from, "yyyy年MM月dd日")
            : "请选择一个日期范围"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[60]" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={onRangeChange}
          defaultMonth={range?.from}
        />
      </PopoverContent>
    </Popover>
  );
}
