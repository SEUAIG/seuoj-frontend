# --- 第一阶段：编译阶段 ---
FROM node:18.20.2-alpine AS build-stage

# 设置容器内的工作目录
WORKDIR /app

# 利用 Docker 缓存：只要 package.json 不变，就不会重新执行 npm install
COPY package*.json ./

# 安装依赖（如果是生产环境构建，可以考虑使用 npm ci）
RUN npm install

# 复制项目所有源代码
COPY . .

# 执行打包命令（产物通常在 /app/dist）
RUN npm run build

# --- 第二阶段：生产运行阶段 ---
FROM nginx AS production-stage

# 从 build-stage 阶段拷贝编译后的静态文件到 nginx 目录
# 如果你的项目打包产物目录不是 dist（比如是 build），请修改下方路径
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 暴露 Nginx 默认的 80 端口
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
