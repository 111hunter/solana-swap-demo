# Solana Swap Prototype 部署指南

## 开发环境运行

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- 现代浏览器（支持 Web3）

### 本地开发
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
# 浏览器打开 http://localhost:5173
```

## 生产环境部署

### 构建应用
```bash
npm run build
```

### 静态部署
构建完成后，`dist` 目录包含所有静态文件，可以部署到：
- Vercel
- Netlify  
- GitHub Pages
- AWS S3 + CloudFront
- 或任何静态网站托管服务

### Vercel 部署（推荐）
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 或直接从 GitHub 连接 Vercel 自动部署
```

### 环境变量
如需自定义 RPC 端点或其他配置，可添加环境变量：
```bash
# .env.local
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_CLUSTER=devnet
```

## 生产注意事项

⚠️ **重要**：
1. 当前配置使用 Solana Devnet，生产环境需切换到 Mainnet
2. 需要配置适当的 RPC 端点
3. 考虑添加错误监控和分析
4. 建议添加更多安全检查

## 网络配置

### 切换到 Mainnet
在 `src/main.tsx` 中修改：
```typescript
const network = WalletAdapterNetwork.Mainnet
```

### 自定义 RPC 端点
```typescript
const endpoint = process.env.VITE_SOLANA_RPC_URL || clusterApiUrl(network)
```

## 性能优化

### 代码分割
可以考虑懒加载组件：
```typescript
const SwapComponent = lazy(() => import('./components/Swap'))
```

### CDN 优化
- 使用 CDN 加速静态资源
- 启用 gzip 压缩
- 配置适当的缓存策略

## 监控与分析

建议添加：
- Google Analytics 或其他分析工具
- 错误监控（如 Sentry）
- 性能监控
- 用户行为追踪

## 安全考虑

- 使用 HTTPS
- 配置适当的 CSP 头
- 定期更新依赖包
- 审计第三方依赖 