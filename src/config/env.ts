// 注意这里用于读取环境变量
// Vite 使用 import.meta.env 获取环境变量，变量名必须以 VITE_ 开头
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
  AI_PLATFORM_URL: import.meta.env.VITE_AI_PLATFORM_URL || "",
  IMAGE_URL_PREFIX: import.meta.env.VITE_IMAGE_URL_PREFIX || "",
};
