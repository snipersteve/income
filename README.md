# 收入统计日历

一个简洁美观的收入记录日历应用，支持按日记录收入并实时统计数据。现在支持真正的数据持久化！

## 功能特性

- 📅 **月历视图** - 清晰显示当前月份的日历
- 💰 **收入记录** - 点击日期可录入当日收入金额
- 📊 **实时统计** - 自动计算本月、本年和总收入
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 💾 **数据持久化** - 支持服务器存储和本地备份
- 📤 **导入导出** - 可导出数据文件，支持数据备份和迁移
- 🎨 **现代UI** - 简洁美观的界面设计

## 数据存储方案

### 🌐 服务器模式（推荐）
应用会自动检测服务器是否可用：
- **数据安全**：数据保存在服务器端JSON文件中
- **自动备份**：每次保存时自动创建日期备份
- **跨设备同步**：多设备访问同一数据

### 📱 本地模式（备选）
当服务器不可用时：
- **本地存储**：数据保存在浏览器localStorage中
- **导入导出**：手动备份和恢复数据
- **离线使用**：无需网络连接

## 部署说明

### 快速开始（仅前端）
```bash
# 直接打开 index.html 即可使用（本地模式）
```

### 完整部署（推荐）
```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 开发模式（自动重启）
npm run dev
```

服务器将运行在 `http://localhost:3000`

## 使用方法

1. **浏览日历**
   - 使用左右箭头按钮切换月份
   - 点击"今天"按钮快速回到当前月份

2. **记录收入**
   - 点击任意日期方块
   - 在弹出窗口中输入收入金额
   - 点击"保存"确认记录

3. **修改记录**
   - 点击已有收入记录的日期
   - 修改金额后点击"保存"
   - 或点击"删除"移除记录

4. **数据管理**
   - **导出数据**：下载包含所有数据的JSON文件
   - **导入数据**：从文件恢复数据（会覆盖现有数据）

5. **查看统计**
   - 本月收入：当前查看月份的总收入
   - 本年收入：当前年份的总收入
   - 总收入：所有记录的收入总和

## 数据安全

### 🔒 服务器模式安全特性
- **每日备份**：自动创建 `backup_YYYY-MM-DD.json` 文件
- **数据验证**：导入时验证数据格式
- **错误恢复**：服务器故障时自动切换到本地模式

### 💾 备份建议
1. **定期导出**：建议定期使用"导出数据"功能
2. **文件备份**：服务器模式下备份 `income_data.json` 文件
3. **多重保护**：重要数据建议同时使用多种备份方式

## 技术特点

- **双模式运行**：自动检测并切换服务器/本地模式
- **渐进增强**：即使没有服务器也能完整使用
- **数据格式**：使用标准JSON格式，易于迁移
- **响应式设计**：完美适配各种设备屏幕
- **现代技术栈**：HTML5、CSS3、ES6+、Node.js、Express

## API接口

服务器模式提供以下API：
- `GET /api/income` - 获取所有收入数据
- `POST /api/income` - 保存收入数据
- `GET /api/backups` - 获取备份文件列表
- `POST /api/restore/:filename` - 恢复指定备份

## 开始使用

### 简单使用
直接在浏览器中打开 `index.html` 即可开始使用！

### 完整功能
1. 确保已安装 Node.js
2. 运行 `npm install` 安装依赖
3. 运行 `npm start` 启动服务器
4. 访问 `http://localhost:3000` 