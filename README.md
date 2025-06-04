# Solana Swap Prototype

这是一个基于 Solana 区块链的去中心化交易（DEX）原型应用，使用 Jupiter SDK 实现代币交换功能。

## 功能特性

### ✅ 已实现的功能

1. **钱包连接**
   - 支持主流钱包（Phantom、Solflare 等）
   - 本地钱包创建功能
   - 钱包状态显示

2. **代币交换**
   - 支持 SOL、USDC、BONK 三种代币
   - 实时报价获取
   - 滑点保护（0.5%）

3. **交易执行**
   - Jupiter SDK 集成
   - 交易签名
   - 交易状态实时显示
   - Solana Explorer 链接

4. **用户体验**
   - 实时报价更新
   - 交易状态反馈
   - 错误处理

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **区块链**: Solana Devnet
- **DEX SDK**: Jupiter API v6
- **钱包**: Solana Wallet Adapter

## 快速开始

### 1. 安装依赖
```bash
npm install
# 或
yarn install
```

### 2. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

### 3. 访问应用
打开浏览器访问 `http://localhost:5173`

## 使用指南

### 连接钱包
1. 点击 "Select Wallet" 按钮连接外部钱包（Phantom 等）
2. 或点击 "Create Local Wallet" 创建本地测试钱包

### 进行交换
1. 选择输入代币和数量
2. 选择输出代币
3. 系统自动获取最优报价
4. 点击 "Swap" 按钮执行交易
5. 确认钱包签名
6. 等待交易完成

### 查看交易
- 交易成功后可点击交易哈希链接查看详情
- 所有交易在 Solana Devnet 上执行

## 代币列表

当前支持的代币（Devnet）：
- **SOL**: Solana 原生代币
- **USDC**: USD Coin
- **BONK**: Bonk 代币

## 注意事项

⚠️ **重要提醒**：
- 此应用运行在 Solana **Devnet** 上，使用的是测试代币
- 本地钱包的私钥会在控制台显示，请妥善保存
- 这是一个原型应用，请勿在生产环境使用真实资金

## 项目结构

```
src/
├── App.tsx          # 主应用组件
├── main.tsx         # 应用入口点，包含钱包适配器配置
├── App.css          # 样式文件
└── index.css        # 全局样式
```

## 核心功能实现

### 钱包集成
- 使用 `@solana/wallet-adapter-react` 支持多种钱包
- 本地 Keypair 生成用于测试

### 报价获取
- Jupiter API 实时获取最优交换路径
- 自动计算价格影响和滑点

### 交易执行
- 使用 Jupiter SDK 生成交易
- 支持 VersionedTransaction
- 完整的交易状态管理

## 开发说明

### 环境配置
- Node.js 18+
- 现代浏览器支持 ES2020+

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 扩展计划

未来可以添加的功能：
- [ ] 更多代币支持
- [ ] 交易历史记录
- [ ] 价格图表
- [ ] 流动性挖矿
- [ ] 移动端适配

## 许可证

MIT License
