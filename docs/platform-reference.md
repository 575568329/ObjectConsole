# 摸鱼热搜平台信息参考

> 本文档记录了摸鱼热搜项目中所有支持的平台信息，方便埋点数据查看系统扩展和参考。

## 完整平台列表

### 视频/社交
| 平台ID | 平台名称 | 分类 | 图标类名 |
|--------|---------|------|----------|
| bilibili | B站 | 视频 | ri-bilibili-line |
| acfun | AcFun | 视频 | ri-movie-line |
| weibo | 微博 | 社交 | ri-weibo-line |
| zhihu | 知乎 | 社交 | ri-zhihu-line |
| zhihu-daily | 知乎日报 | 社交 | ri-newspaper-line |
| douyin | 抖音 | 视频 | ri-music-2-line |
| kuaishou | 快手 | 视频 | ri-camera-lens-line |
| douban-movie | 豆瓣电影 | 娱乐 | ri-movie-2-line |
| movie-box | 电影票房榜 | 娱乐 | ri-film-line |
| douban-group | 豆瓣小组 | 娱乐 | ri-team-line |
| tieba | 贴吧 | 社交 | ri-group-line |
| hupu | 虎扑 | 生活 | ri-basketball-line |
| ngabbs | NGA | 游戏 | ri-gamepad-line |

### 科技/技术
| 平台ID | 平台名称 | 分类 | 图标类名 |
|--------|---------|------|----------|
| v2ex | V2EX | 科技 | ri-chat-smile-2-line |
| 52pojie | 吾爱破解 | 科技 | ri-lock-2-line |
| hostloc | 主机交流 | 科技 | ri-server-line |
| coolapk | 酷安 | 科技 | ri-android-line |
| sspai | 少数派 | 科技 | ri-tools-line |
| ithome | IT之家 | 科技 | ri-computer-line |
| ithome-xijiayi | IT之家·喜加一 | 科技 | ri-gamepad-line |
| juejin | 掘金 | 科技 | ri-code-s-slash-line |
| jianshu | 简书 | 综合 | ri-quill-pen-line |
| guokr | 果壳 | 科技 | ri-flask-line |
| 36kr | 36氪 | 科技 | ri-money-dollar-circle-line |
| 51cto | 51CTO | 科技 | ri-terminal-line |
| csdn | CSDN | 科技 | ri-code-box-line |
| nodeseek | NodeSeek | 科技 | ri-nodejs-line |
| github-trending | GitHub热榜 | 科技 | ri-github-fill |
| hacker-news | Hacker News | 科技 | ri-hacker-news-line |
| product-hunt | Product Hunt | 科技 | ri-lightbulb-flash-line |

### 新闻/资讯
| 平台ID | 平台名称 | 分类 | 图标类名 |
|--------|---------|------|----------|
| baidu | 百度 | 综合 | ri-search-2-line |
| 60s-news | 60秒早报 | 资讯 | ri-newspaper-line |
| thepaper | 澎湃新闻 | 资讯 | ri-article-line |
| toutiao | 今日头条 | 资讯 | ri-fire-line |
| qq-news | 腾讯新闻 | 资讯 | ri-qq-line |
| sina | 新浪热搜 | 资讯 | ri-rss-line |
| sina-news | 新浪新闻 | 资讯 | ri-rss-line |
| netease-news | 网易新闻 | 资讯 | ri-news-line |
| huxiu | 虎嗅 | 资讯 | ri-lightbulb-line |
| ifanr | 爱范儿 | 资讯 | ri-magic-line |

### 游戏
| 平台ID | 平台名称 | 分类 | 图标类名 |
|--------|---------|------|----------|
| lol | 英雄联盟 | 游戏 | ri-sword-line |
| epic-free | Epic免费游戏 | 游戏 | ri-gamepad-line |
| genshin | 原神 | 游戏 | ri-star-smile-line |
| honkai | 崩坏3 | 游戏 | ri-planet-line |
| starrail | 星穹铁道 | 游戏 | ri-rocket-line |

### 金融/股票
| 平台ID | 平台名称 | 分类 | 图标类名 |
|--------|---------|------|----------|
| stock-hot | 热门股票 | 金融 | ri-stock-line |
| stock-sh | 上证指数 | 金融 | ri-funds-line |
| stock-tech | 科技股 | 金融 | ri-cpu-line |

### 阅读/艺术
| 平台ID | 平台名称 | 分类 | 图标类名 |
|--------|---------|------|----------|
| weread | 微信读书 | 阅读 | ri-book-read-line |
| hellogithub | HelloGitHub | 科技 | ri-github-line |
| zhuishu | 追书排行 | 阅读 | ri-bookmark-line |
| artic | 芝加哥艺术学院 | 艺术 | ri-building-2-line |
| metmuseum | 大都会博物馆 | 艺术 | ri-gallery-line |

## 埋点数据字段参考

### platform_switch 事件（平台切换）
```json
{
  "type": "platform_switch",
  "timestamp": 1706942400000,
  "priority": "medium",
  "data": {
    "from_platform": "weibo",        // 来源平台ID
    "to_platform": "baidu",          // 目标平台ID
    "user_id": "user_1234567890",    // 用户ID
    "session_id": "session_abc"      // 会话ID
  }
}
```

### open_link 事件（打开链接）
```json
{
  "type": "open_link",
  "timestamp": 1706942410000,
  "priority": "medium",
  "data": {
    "platform": "baidu",            // 平台ID
    "platformName": "百度",          // 平台中文名（可选）
    "category": "综合",              // 平台分类（可选）
    "url": "https://example.com"     // 链接地址
  }
}
```

## 数据分析注意事项

### 平台统计逻辑
1. **平台切换统计**：优先读取 `to_platform` 字段，降级到 `platform` 字段
2. **链接点击统计**：读取 `platform` 字段，配合 `platformName` 和 `category`
3. **未知平台处理**：当平台ID不在映射表中时，显示"未知平台"

### 平台映射表
在埋点数据查看系统中，需要维护完整的平台映射表：

```javascript
const PLATFORM_INFO_MAP = {
  'bilibili': { name: 'B站', category: '视频' },
  'weibo': { name: '微博', category: '社交' },
  'zhihu': { name: '知乎', category: '社交' },
  // ... 更多平台映射
}
```

### 扩展建议
1. 新增平台时，同步更新此文档
2. 保持平台ID与摸鱼热搜项目一致
3. 平台分类用于数据分组统计
4. 图标类名可选，用于UI美化

## 相关文件
- 摸鱼热搜项目：`D:\cursorObject\摸鱼热搜\摸鱼热搜\src\services\hotSearchApi.js`
- 埋点数据查看：`src/views/Dashboard.vue`
- 平台切换图表：`src/components/charts/PlatformSwitchChart.vue`

## 更新记录
- 2025-02-09：初始版本，同步摸鱼热搜 v1.0 平台列表
