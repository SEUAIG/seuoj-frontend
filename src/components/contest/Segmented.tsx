import { cn } from "@/lib/utils";

/** 分段选择：一组互斥的筛选项 */
export default function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; title?: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <span role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-lg bg-slate-200/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1 text-[13px] text-slate-500 hover:text-slate-900",
            value === o.value && "bg-white text-slate-900 shadow-sm"
          )}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}
