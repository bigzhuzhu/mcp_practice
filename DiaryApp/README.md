# 日记 App (Diary App)

一个使用 React Native + Expo 构建的移动端日记应用，支持日历视图、图文视频记录、天气自动获取和搜索功能。

## 功能特性

- 📅 **日历视图**：通过日历浏览和选择日期，直观查看有日记的日期标记
- 📝 **日记编辑**：支持文字、图片、视频多媒体记录
- 🌤️ **自动天气**：自动获取当前位置的天气信息并记录
- 🔍 **快速搜索**：通过关键词搜索日记内容或城市
- 💾 **本地存储**：使用 SQLite 本地数据库，数据持久化

## 项目结构

```
DiaryApp/
├── App.tsx                 # 应用入口
├── src/
│   ├── types.ts           # TypeScript 类型定义
│   ├── storage.ts         # SQLite 数据库操作
│   ├── weatherService.ts  # 天气 API 服务
│   ├── navigation.tsx     # 导航配置
│   └── components/
│       ├── CalendarView.tsx   # 日历主页
│       ├── DiaryEdit.tsx      # 日记编辑页
│       └── SearchScreen.tsx   # 搜索页
├── package.json
└── tsconfig.json
```

## 安装与运行

### 前置要求

- Node.js (推荐 18+)
- npm 或 yarn
- Expo CLI
- iOS 模拟器 (Mac) 或 Android 模拟器/设备

### 安装依赖

```bash
cd DiaryApp
npm install
```

### 配置天气 API

1. 访问 [OpenWeatherMap](https://openweathermap.org/api) 注册并获取免费 API Key
2. 编辑 `src/weatherService.ts`，将 `YOUR_OPENWEATHER_API_KEY` 替换为你的实际 API Key：

```typescript
const OPENWEATHER_API_KEY = '你的API密钥';
```

### 运行应用

```bash
# 启动开发服务器
npm start

# 在 iOS 模拟器运行
npm run ios

# 在 Android 模拟器运行
npm run android

# 在网页运行
npm run web
```

## 使用说明

### 创建日记
1. 在日历视图点击任意日期
2. 点击"新建日记"按钮
3. 应用会自动获取当前位置和天气（需要授权位置权限）
4. 输入日记内容，可添加图片或视频
5. 点击"保存"完成

### 查看/编辑日记
- 在日历视图点击有标记的日期即可查看该日日记
- 编辑内容后点击"保存"更新

### 搜索日记
1. 切换到搜索标签页
2. 输入关键词（支持日记内容或城市名）
3. 点击搜索查看结果

## 技术栈

- **框架**: React Native + Expo 55
- **语言**: TypeScript
- **导航**: React Navigation 6
- **数据库**: SQLite (expo-sqlite)
- **UI组件**: react-native-calendars
- **媒体**: expo-image-picker
- **定位**: expo-location
- **网络请求**: axios

## 注意事项

1. **位置权限**：首次使用需要授权位置权限以获取天气信息
2. **API Key**：必须配置有效的 OpenWeatherMap API Key 才能获取天气
3. **网络连接**：天气获取和图片/视频选择需要网络连接
4. **数据备份**：数据存储在本地，卸载应用会丢失所有日记

## 开发说明

### 数据库结构

日记数据存储在 `diary.db` 文件中，包含以下字段：
- `id`: 自增主键
- `date`: 日期 (YYYY-MM-DD)，唯一约束
- `content`: 日记内容
- `images`: 图片数组 (JSON 字符串)
- `videos`: 视频数组 (JSON 字符串)
- `city`: 城市名称
- `weather_*`: 天气信息（温度、描述、图标）
- `created_at` / `updated_at`: 时间戳

### 扩展建议

- 添加云同步功能
- 支持富文本编辑
- 添加标签分类
- 导出日记为 PDF/图片
- 多语言支持

## License

MIT