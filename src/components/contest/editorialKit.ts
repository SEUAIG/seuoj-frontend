/** 官方题解正文的排版：比答疑宽松，代码块交给 MarkdownCodeBlock 自己画底色 */
export const EDITORIAL_PROSE =
  "prose prose-slate max-w-none prose-headings:font-semibold prose-pre:my-3 prose-pre:bg-transparent prose-pre:p-0 " +
  "prose-code:font-normal prose-code:before:content-none prose-code:after:content-none " +
  "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-slate-100 [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5";

export const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
