import type { ParticipantInput } from "@/services/Contest/members";
export const rosterColumns = [
  ["display_name", "姓名"], ["student_no", "学号"], ["college", "学院"], ["class_name", "班级"],
  ["contact_email", "邮箱"], ["is_starred", "打星"], ["notes", "备注"], ["username", "已有账号"],
] as const;
export type RosterField = typeof rosterColumns[number][0];
export type ColumnMap = (RosterField | "")[];
export interface CellError { row: number; field: RosterField; message: string }
export interface MemberImportPreview { participants: ParticipantInput[]; errors: string[]; cellErrors: CellError[]; rowIndexes: number[] }
export function readMemberText(text: string): string[][] {
  const delimiter = text.includes("\t") ? "\t" : ",";
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted || cell.length === 0) quoted = !quoted;
      else cell += ch;
    } else if (!quoted && (ch === delimiter || ch === "\n")) {
      row.push(cell); cell = "";
      if (ch === "\n") { rows.push(row); row = []; }
    } else cell += ch;
  }
  if (quoted) throw new Error("引号未闭合");
  row.push(cell); rows.push(row); return rows.filter(r => r.some(c => c.trim()));
}
export function guessColumns(row: unknown[]): ColumnMap {
  const aliases: Record<string, RosterField> = { 真名: "display_name", 榜单真名: "display_name", 是否打星: "is_starred", 账号: "username", 用户名: "username", 联系邮箱: "contact_email" };
  rosterColumns.forEach(([key, label]) => { aliases[key] = key; aliases[label] = key; });
  return row.map(c => aliases[String(c ?? "").trim().toLowerCase()] ?? "");
}
export function parseMappedRows(rows: unknown[][], mapping: ColumnMap, header = true): MemberImportPreview {
  const result: MemberImportPreview = { participants: [], errors: [], cellErrors: [], rowIndexes: [] };
  const used = mapping.filter(Boolean);
  if (!used.includes("display_name")) result.errors.push("请选择姓名列");
  if (new Set(used).size !== used.length) result.errors.push("同一字段只能对应一列");
  const seen = { username: new Set<string>(), student_no: new Set<string>() };
  rows.forEach((raw, index) => {
    if (header && index === 0 || raw.every(v => !String(v ?? "").trim())) return;
    const values: Partial<Record<RosterField, string>> = {};
    mapping.forEach((field, col) => { if (field) values[field] = String(raw[col] ?? "").trim(); });
    const p: ParticipantInput = { display_name: values.display_name || "" };
    const error = (field: RosterField, message: string) => result.cellErrors.push({ row: index, field, message });
    if (!p.display_name) error("display_name", "必填");
    for (const [field] of rosterColumns) {
      const value = values[field]; if (!value) continue;
      if (field === "is_starred") {
        const flag = value.toLowerCase();
        if (["是", "1", "true", "*", "打星"].includes(flag)) p.is_starred = true;
        else if (["否", "0", "false", "正式"].includes(flag)) p.is_starred = false;
        else error(field, "填写是/否或1/0");
      } else {
        p[field] = value;
        const limit = field === "notes" ? 1000 : field === "contact_email" ? 254 : field === "username" ? 64 : 100;
        if (value.length > limit) error(field, `最多 ${limit} 字`);
        if (field === "contact_email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error(field, "邮箱格式不正确");
        if (field === "username" || field === "student_no") {
          const key = value.toLowerCase(); if (seen[field].has(key)) error(field, "本批次重复"); seen[field].add(key);
        }
      }
    }
    result.participants.push(p); result.rowIndexes.push(index);
  });
  if (result.participants.length > 1000) result.errors.push("每次最多导入 1000 人");
  if (!result.participants.length) result.errors.push("名单为空");
  return result;
}
export function parseMemberRows(rows: unknown[][]) { return parseMappedRows(rows, guessColumns(rows[0] ?? [])); }
export function parseMemberText(text: string) { return parseMemberRows(readMemberText(text)); }
export async function downloadMemberSheet(name: string, rows: (string | number)[][]) {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.aoa_to_sheet(rows); // Strings stay string cells, including leading zeroes and formula-like text.
  sheet["!cols"] = rows[0]?.map(() => ({ wch: 20 }));
  const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, "名单"); XLSX.writeFile(book, name);
}
