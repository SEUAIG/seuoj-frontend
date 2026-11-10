import { api } from "@/services/api/axios";
import { problemEndpoints } from "@/services/endpoints";

export interface ImportProblemPackResponse {
  code: number;
  message: string;
  data: {
    pid: string;
    data_file_count: number;
    testcase_count: number;
    checker_compiled: boolean;
    warnings?: string[];
  };
}

export interface ImportProblemPackParams {
  /** 题目包压缩文件（problem.yaml / problem_zh.md / testdata/） */
  file: File;
  /** 题号，题目包内不含题号，需由表单指定 */
  pid: string;
  /** 是否立即公开 */
  isPublic: boolean;
  /** 压缩格式，留空时由后端按文件名与文件头判断 */
  format?: string;
}

/**
 * 通过 Hydro 结构的题目包一键导入题目
 */
export const importProblemPack = async ({
  file,
  pid,
  isPublic,
  format,
}: ImportProblemPackParams): Promise<ImportProblemPackResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pid", pid);
  formData.append("is_public", String(isPublic));
  if (format) {
    formData.append("format", format);
  }
  const res = await api.post<ImportProblemPackResponse>(problemEndpoints.import, formData);
  return res.data;
};
