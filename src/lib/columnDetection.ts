export type ColumnRole = "username" | "nickname" | "email" | "password";

export interface ColumnMapping {
    columnIndex: number;
    columnHeader: string;
    mappedField: ColumnRole | "ignore";
    confidence: "high" | "medium" | "none";
}

const COLUMN_ALIASES: Record<ColumnRole, string[]> = {
    username: [
        "username",
        "用户名",
        "学号",
        "学工号",
        "学员号",
        "一卡通号",
        "一卡通",
        "student_id",
        "studentid",
        "student id",
        "student no",
        "student number",
        "account",
        "account id",
        "账号",
        "card_number",
        "card number",
        "user id",
        "login id",
        "id",
    ],
    nickname: [
        "姓名",
        "名字",
        "name",
        "full name",
        "student name",
        "昵称",
        "nickname",
        "真实姓名",
        "name_cn",
    ],
    email: [
        "email",
        "e-mail",
        "mail",
        "邮箱",
        "电子邮箱",
        "电子邮件",
        "邮件地址",
        "email address",
    ],
    password: [
        "password",
        "pwd",
        "passcode",
        "密码",
        "初始密码",
        "登录密码",
        "口令",
    ],
};

export const FIELD_LABELS: Record<ColumnRole | "ignore", string> = {
    username: "用户名/学号",
    nickname: "昵称/姓名",
    email: "邮箱",
    password: "密码",
    ignore: "忽略",
};

const HEADER_NOISE_RE = /[\s_\-.:/\\|()[\]{}（）【】<>《》'"`~!@#$%^&*+=，。；：？！、]/g;

function normalizeHeader(input: string): string {
    return input
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
        .replace(HEADER_NOISE_RE, "");
}

export function detectColumnMappings(headers: string[]): ColumnMapping[] {
    const mappings: ColumnMapping[] = headers.map((h, i) => ({
        columnIndex: i,
        columnHeader: h,
        mappedField: "ignore" as const,
        confidence: "none" as const,
    }));

    const usedFields = new Set<ColumnRole>();

    // Pass 1: exact match (high confidence)
    for (const mapping of mappings) {
        const normalized = normalizeHeader(mapping.columnHeader);
        for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
            if (usedFields.has(field as ColumnRole)) continue;
            if (aliases.some((a) => normalizeHeader(a) === normalized)) {
                mapping.mappedField = field as ColumnRole;
                mapping.confidence = "high";
                usedFields.add(field as ColumnRole);
                break;
            }
        }
    }

    // Pass 2: contains match for remaining (medium confidence)
    for (const mapping of mappings) {
        if (mapping.mappedField !== "ignore") continue;
        const normalized = normalizeHeader(mapping.columnHeader);
        if (!normalized) continue;
        for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
            if (usedFields.has(field as ColumnRole)) continue;
            if (
                aliases.some(
                    (a) =>
                        normalized.includes(normalizeHeader(a)) ||
                        normalizeHeader(a).includes(normalized)
                )
            ) {
                mapping.mappedField = field as ColumnRole;
                mapping.confidence = "medium";
                usedFields.add(field as ColumnRole);
                break;
            }
        }
    }

    return mappings;
}

const MAX_SCAN_ROWS = 10;

export function findHeaderRow(
    rows: string[][]
): { headerRowIndex: number; mappings: ColumnMapping[] } {
    let bestIndex = 0;
    let bestScore = -1;
    let bestMappings: ColumnMapping[] = [];

    const limit = Math.min(rows.length, MAX_SCAN_ROWS);
    for (let i = 0; i < limit; i++) {
        const row = rows[i];
        if (!row || row.every((cell) => !String(cell ?? "").trim())) continue;

        const headers = row.map((h) =>
            String(h ?? "")
                .replace(/^﻿/, "")
                .trim()
        );
        const mappings = detectColumnMappings(headers);

        const hasUsername = mappings.some(
            (m) => m.mappedField === "username" && m.confidence !== "none"
        );
        if (!hasUsername) continue;

        let score = 0;
        for (const m of mappings) {
            if (m.confidence === "high") score += 2;
            else if (m.confidence === "medium") score += 1;
        }

        if (score > bestScore) {
            bestScore = score;
            bestIndex = i;
            bestMappings = mappings;
        }
    }

    if (bestScore <= 0) {
        const fallbackHeaders = (rows[0] || []).map((h) =>
            String(h ?? "")
                .replace(/^﻿/, "")
                .trim()
        );
        return { headerRowIndex: 0, mappings: detectColumnMappings(fallbackHeaders) };
    }

    return { headerRowIndex: bestIndex, mappings: bestMappings };
}

export function validateMappings(
    mappings: ColumnMapping[],
    passwordMode: "assigned" | "random",
    options?: { requirePasswordMapping?: boolean }
): string | null {
    const mapped = new Set(
        mappings
            .filter((m) => m.mappedField !== "ignore")
            .map((m) => m.mappedField)
    );
    const requirePasswordMapping =
        options?.requirePasswordMapping ?? passwordMode === "assigned";
    if (!mapped.has("username")) return "必须映射「用户名/学号」列";
    if (requirePasswordMapping && !mapped.has("password"))
        return "指定密码模式下必须映射「密码」列";
    return null;
}
