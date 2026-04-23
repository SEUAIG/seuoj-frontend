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
        "一卡通号",
        "student_id",
        "studentid",
        "账号",
        "card_number",
        "id",
    ],
    nickname: ["姓名", "名字", "name", "昵称", "nickname", "真实姓名"],
    email: ["email", "邮箱", "电子邮箱", "e-mail", "mail", "电子邮件"],
    password: ["password", "密码", "pwd", "口令"],
};

export const FIELD_LABELS: Record<ColumnRole | "ignore", string> = {
    username: "用户名/学号",
    nickname: "昵称/姓名",
    email: "邮箱",
    password: "密码",
    ignore: "忽略",
};

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
        const normalized = mapping.columnHeader.trim().toLowerCase();
        for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
            if (usedFields.has(field as ColumnRole)) continue;
            if (aliases.some((a) => a.toLowerCase() === normalized)) {
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
        const normalized = mapping.columnHeader.trim().toLowerCase();
        if (!normalized) continue;
        for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
            if (usedFields.has(field as ColumnRole)) continue;
            if (
                aliases.some(
                    (a) =>
                        normalized.includes(a.toLowerCase()) ||
                        a.toLowerCase().includes(normalized)
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

export function validateMappings(
    mappings: ColumnMapping[],
    passwordMode: "assigned" | "random"
): string | null {
    const mapped = new Set(
        mappings
            .filter((m) => m.mappedField !== "ignore")
            .map((m) => m.mappedField)
    );
    if (!mapped.has("username")) return "必须映射「用户名/学号」列";
    if (passwordMode === "assigned" && !mapped.has("password"))
        return "指定密码模式下必须映射「密码」列";
    return null;
}
