import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { searchContestAccounts, type AccountOption } from "@/services/Contest/members";

export function ContestAccountPicker({ id, contestId, value, onChange, disabled, placeholder = "搜索 UID / 账号名" }: {
  id: string; contestId: number; value: AccountOption | null; onChange: (account: AccountOption | null) => void; disabled?: boolean; placeholder?: string;
}) {
  const [query, setQuery] = useState(""), [keyword, setKeyword] = useState(""), [open, setOpen] = useState(false), [active, setActive] = useState(0);
  const listId = useId();
  useEffect(() => { const timer = setTimeout(() => setKeyword(query.trim()), 250); return () => clearTimeout(timer); }, [query]);
  const result = useQuery({ queryKey: ["contestAccountSearch", contestId, keyword], queryFn: ({ signal }) => searchContestAccounts(contestId, keyword, signal), enabled: open && !!keyword && !disabled });
  const waiting = query.trim() !== keyword || result.isFetching;
  const options = waiting ? [] : result.data ?? [];
  function select(account: AccountOption) { onChange(account); setOpen(false); setQuery(""); setKeyword(""); }
  if (value) return <div className={`flex items-center gap-2 rounded-md border px-3 min-h-10 ${disabled ? "opacity-60" : ""}`}>
    <Check className="size-4 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1 py-1"><span className="text-sm break-all">{value.username}</span><span className="ml-2 text-xs text-muted-foreground">UID {value.user_id}</span>{value.nickname && value.nickname !== value.username && <div className="text-xs text-muted-foreground truncate">{value.nickname}</div>}</div>
    {!disabled && <Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" aria-label="清除所选账号" onClick={() => { onChange(null); setActive(0); }}><X className="size-3.5" /></Button>}
  </div>;
  return <Popover open={open && !disabled} onOpenChange={setOpen}><PopoverAnchor asChild><div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground pointer-events-none" /><Input id={id} role="combobox" aria-label={placeholder} autoComplete="off" aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined} className="pl-9" maxLength={100} disabled={disabled} placeholder={placeholder} value={query} onFocus={() => setOpen(true)} onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }} onKeyDown={e => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive(i => Math.max(0, Math.min(options.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))); }
    if (e.key === "Enter" && open) { e.preventDefault(); if (options[active]) select(options[active]); }
    if (e.key === "Escape" && open) { e.preventDefault(); e.stopPropagation(); setOpen(false); }
  }} /></div></PopoverAnchor><PopoverContent align="start" side="bottom" className="w-[var(--radix-popover-trigger-width)] min-w-64 p-1" onOpenAutoFocus={e => e.preventDefault()} onCloseAutoFocus={e => e.preventDefault()} onInteractOutside={e => { if ((e.target as HTMLElement)?.id === id) e.preventDefault(); }}>
    <div role="listbox" id={listId} aria-label="账号搜索结果" className="max-h-60 overflow-y-auto">
      {!query.trim() ? <p className="px-3 py-4 text-sm text-muted-foreground">输入 UID 或账号名</p> : waiting ? <div role="status" className="px-3 py-4 text-sm text-muted-foreground flex gap-2 items-center"><Loader2 className="size-4 animate-spin" />搜索中</div> : result.isError ? <div role="alert" className="px-3 py-3 text-sm text-destructive">搜索失败<Button type="button" variant="link" size="sm" onClick={() => void result.refetch()}>重试</Button></div> : !options.length ? <p className="px-3 py-4 text-sm text-muted-foreground">未找到账号</p> : options.map((account, index) => <button type="button" id={`${listId}-${index}`} role="option" aria-selected={active === index} key={account.user_id} className={`w-full rounded-sm text-left px-3 py-2 focus:outline-none focus:bg-accent ${active === index ? "bg-accent" : "hover:bg-accent"}`} onMouseEnter={() => setActive(index)} onMouseDown={e => e.preventDefault()} onClick={() => select(account)}><div className="flex justify-between gap-3"><span className="text-sm font-medium break-all">{account.username}</span><span className="text-xs text-muted-foreground whitespace-nowrap">UID {account.user_id}</span></div>{account.nickname && <div className="text-xs text-muted-foreground mt-1 truncate">{account.nickname}</div>}{!account.is_enabled && <span className="text-xs text-destructive">已停用</span>}</button>)}
    </div>{options.length === 20 && <p className="px-3 py-2 text-xs text-muted-foreground border-t">显示前 20 项，可继续输入缩小范围</p>}
  </PopoverContent></Popover>;
}
