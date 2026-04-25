export type BatchImportPasswordSource = "provided" | "generated";

export interface ResolvedBatchImportPassword {
  password: string;
  source: BatchImportPasswordSource;
}

const DEFAULT_PASSWORD_PREFIX = "321";

export function resolveBatchImportPassword(
  identifier: string,
  providedPassword?: string,
  prefix: string = DEFAULT_PASSWORD_PREFIX
): ResolvedBatchImportPassword {
  const provided = String(providedPassword ?? "").trim();
  if (provided) {
    return {
      password: provided,
      source: "provided",
    };
  }

  return {
    password: `${prefix}${identifier.trim()}`,
    source: "generated",
  };
}

export function getBatchImportPreviewPassword(
  password: string,
  source: BatchImportPasswordSource
): string {
  return source === "provided" ? "••••（文件已提供）" : password;
}

