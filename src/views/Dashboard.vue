<template>
  <div class="dashboard">
    <!-- 项目选择 -->
    <el-card class="project-selector" v-if="projectStore.projects.length > 0">
      <div class="selector-section">
        <div class="selector-group">
          <div class="selector-item">
            <label class="selector-label">选择项目</label>
            <el-select
              v-model="selectedProjectId"
              placeholder="选择项目查看数据"
              size="large"
              style="width: 280px"
              @change="handleProjectChange"
            >
              <el-option
                v-for="project in projectStore.projects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>
          </div>

          <div class="selector-item">
            <label class="selector-label">日期范围</label>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              size="large"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 280px"
              :clearable="true"
              @change="handleDateRangeChange"
            />
          </div>
        </div>

        <div class="action-group">
          <el-button type="primary" @click="loadData(true)" :loading="loading" size="large">
            <el-icon style="margin-right: 4px"><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-tag v-if="cacheTime" type="info" class="cache-tag" size="large">
            <el-icon style="margin-right: 4px"><Clock /></el-icon>
            缓存于 {{ formatCacheTime(cacheTime) }}
          </el-tag>
        </div>
      </div>

      <!-- 日期范围统计提示 -->
      <div v-if="dateRange && dateRange.length === 2" class="date-range-info">
        <el-icon><Calendar /></el-icon>
        <span>当前展示：{{ dateRange[0] }} 至 {{ dateRange[1] }}</span>
        <el-tag type="success" size="small" style="margin-left: 8px">
          共 {{ filteredEventsByDate.length }} 条事件
        </el-tag>
        <el-button text type="primary" size="small" @click="clearDateRange" style="margin-left: 8px">
          清除日期筛选
        </el-button>
      </div>
    </el-card>

    <!-- 空状态 -->
    <div v-if="projectStore.projects.length === 0" class="empty-state">
      <div class="empty-icon">📁</div>
      <p class="empty-text">暂无项目，请先在项目管理中添加项目</p>
      <el-button type="primary" @click="$router.push('/projects')">
        前往添加项目
      </el-button>
    </div>

    <!-- 数据内容 -->
    <template v-else>
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row" v-if="displayAnalytics">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon primary">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">总事件数</div>
              <div class="stat-value">{{ displayAnalytics.totalEvents || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">活跃用户</div>
              <div class="stat-value">{{ displayAnalytics.activeUsers || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon warning">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">统计天数</div>
              <div class="stat-value">{{ displayAnalytics.days || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon danger">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">日均事件</div>
              <div class="stat-value">{{ displayAnalytics.avgEventsPerDay || 0 }}</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-row" v-if="displayAnalytics">
        <!-- 事件类型分布 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>事件类型分布</span>
              </div>
            </template>
            <EventTypeChart :data="displayAnalytics.eventTypeStats" />
          </el-card>
        </el-col>

        <!-- 每日趋势 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>每日事件趋势</span>
              </div>
            </template>
            <DailyTrendChart :data="displayAnalytics.dailyStats" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 平台切换统计 -->
      <el-row :gutter="20" class="charts-row" v-if="displayAnalytics?.platformSwitches && displayAnalytics.platformSwitches.length > 0">
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>🔄 平台切换统计 (共 {{ displayAnalytics.totalSwitches || 0 }} 次切换)</span>
              </div>
            </template>
            <PlatformSwitchChart :data="displayAnalytics.platformSwitches" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 链接点击统计 -->
      <el-row :gutter="20" class="table-row" v-if="displayAnalytics?.linkClicks && displayAnalytics.linkClicks.length > 0">
        <el-col :span="24">
          <el-card class="table-card">
            <template #header>
              <div class="card-header">
                <span>🔗 链接点击统计 (Top 20)</span>
                <div style="display: flex; gap: 12px; align-items: center;">
                  <el-tag type="info">共 {{ displayAnalytics.linkClicks.length }} 个链接</el-tag>
                  <el-button text type="primary" @click="showLinkStats = !showLinkStats">
                    {{ showLinkStats ? '收起' : '展开' }}
                  </el-button>
                </div>
              </div>
            </template>
            <div v-show="showLinkStats">
              <el-table :data="displayAnalytics.linkClicks" stripe style="width: 100%">
                <el-table-column type="index" label="排名" width="80" />
                <el-table-column prop="platformName" label="分类" width="140">
                  <template #default="{ row }">
                    <el-tag type="primary" size="small">{{ row.platformName || '未知' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="url" label="链接地址" min-width="300">
                  <template #default="{ row }">
                    <el-link :href="row.url" target="_blank" type="primary" :underline="false">
                      {{ row.url }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column prop="count" label="点击次数" width="120" sortable>
                  <template #default="{ row }">
                    <el-tag type="primary">{{ row.count }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="最近点击" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.lastClick) }}
                  </template>
                </el-table-column>
                <el-table-column label="首次点击" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.firstClick) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 事件列表 -->
      <el-row :gutter="20" class="table-row" v-if="rawEvents && rawEvents.length > 0">
        <el-col :span="24">
          <el-card class="table-card">
            <template #header>
              <div class="card-header">
                <span>📋 最近事件记录 (共 {{ rawEvents.length }} 条)</span>
                <el-button text type="primary" @click="showEventList = !showEventList">
                  {{ showEventList ? '收起' : '展开' }}
                </el-button>
              </div>
            </template>
            <div v-show="showEventList">

            <!-- 筛选工具栏 -->
            <div class="filter-toolbar">
              <el-input
                v-model="filterKeyword"
                placeholder="搜索事件类型或数据"
                clearable
                style="width: 250px"
                @input="handleFilter"
              >
                <template #prefix>
                  🔍
                </template>
              </el-input>

              <el-select
                v-model="filterEventType"
                placeholder="事件类型"
                clearable
                style="width: 180px"
                @change="handleFilter"
              >
                <el-option label="全部类型" value="" />
                <el-option
                  v-for="[type, count] in Object.entries(displayAnalytics.eventTypeStats || {})"
                  :key="type"
                  :label="`${getEventTypeName(type)} (${count})`"
                  :value="type"
                />
              </el-select>

              <el-select
                v-model="filterPriority"
                placeholder="优先级"
                clearable
                style="width: 120px"
                @change="handleFilter"
              >
                <el-option label="全部优先级" value="" />
                <el-option label="高优先级" value="high" />
                <el-option label="中优先级" value="medium" />
                <el-option label="低优先级" value="low" />
              </el-select>

              <el-button @click="resetFilters">
                🔄 重置筛选
              </el-button>
            </div>

            <!-- 事件表格 -->
            <el-table
              :data="paginatedEvents"
              v-loading="loading"
              stripe
              style="width: 100%; margin-top: 16px"
              :default-sort="{ prop: 'timestamp', order: 'descending' }"
            >
              <el-table-column prop="type" label="事件类型" min-width="140">
                <template #default="{ row }">
                  <el-tag :type="getEventTypeColor(row.type)" size="small">
                    {{ getEventTypeName(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="priority" label="优先级" width="100" align="center">
                <template #default="{ row }">
                  <el-tag
                    :type="getPriorityType(row.priority)"
                    size="small"
                    effect="plain"
                  >
                    {{ row.priority }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="timestamp" label="时间" min-width="165" sortable>
                <template #default="{ row }">
                  {{ formatDateTime(row.timestamp) }}
                </template>
              </el-table-column>

              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                  <el-popover
                    placement="left"
                    :width="450"
                    trigger="click"
                  >
                    <template #reference>
                      <el-button text type="primary" size="small">
                        📄 查看详情
                      </el-button>
                    </template>
                    <pre class="event-data">{{ JSON.stringify(row.data, null, 2) }}</pre>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="filteredEvents.length"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import EventTypeChart from '@/components/charts/EventTypeChart.vue'
import DailyTrendChart from '@/components/charts/DailyTrendChart.vue'
import PlatformSwitchChart from '@/components/charts/PlatformSwitchChart.vue'
import { ElMessage } from 'element-plus'
import { Refresh, Clock, Calendar } from '@element-plus/icons-vue'

// 平台信息映射 (来自 hotSearchApi.js 的 PLATFORMS 数据)
const PLATFORM_INFO_MAP = {
  'bilibili': { name: 'B站', category: '视频' },
  'acfun': { name: 'AcFun', category: '视频' },
  'weibo': { name: '微博', category: '社交' },
  'zhihu': { name: '知乎', category: '社交' },
  'zhihu-daily': { name: '知乎日报', category: '社交' },
  'douyin': { name: '抖音', category: '视频' },
  'kuaishou': { name: '快手', category: '视频' },
  'douban-movie': { name: '豆瓣电影', category: '娱乐' },
  'movie-box': { name: '电影票房榜', category: '娱乐' },
  'douban-group': { name: '豆瓣小组', category: '娱乐' },
  'tieba': { name: '贴吧', category: '社交' },
  'hupu': { name: '虎扑', category: '生活' },
  'ngabbs': { name: 'NGA', category: '游戏' },
  'v2ex': { name: 'V2EX', category: '科技' },
  '52pojie': { name: '吾爱破解', category: '科技' },
  'hostloc': { name: '主机交流', category: '科技' },
  'coolapk': { name: '酷安', category: '科技' },
  'baidu': { name: '百度', category: '综合' },
  '60s-news': { name: '60秒早报', category: '资讯' },
  'thepaper': { name: '澎湃新闻', category: '资讯' },
  'toutiao': { name: '今日头条', category: '资讯' },
  'qq-news': { name: '腾讯新闻', category: '资讯' },
  'sina': { name: '新浪热搜', category: '资讯' },
  'sina-news': { name: '新浪新闻', category: '资讯' },
  'netease-news': { name: '网易新闻', category: '资讯' },
  'huxiu': { name: '虎嗅', category: '资讯' },
  'ifanr': { name: '爱范儿', category: '资讯' },
  'sspai': { name: '少数派', category: '科技' },
  'ithome': { name: 'IT之家', category: '科技' },
  'ithome-xijiayi': { name: 'IT之家·喜加一', category: '科技' },
  'juejin': { name: '掘金', category: '科技' },
  'jianshu': { name: '简书', category: '综合' },
  'guokr': { name: '果壳', category: '科技' },
  '36kr': { name: '36氪', category: '科技' },
  '51cto': { name: '51CTO', category: '科技' },
  'csdn': { name: 'CSDN', category: '科技' },
  'nodeseek': { name: 'NodeSeek', category: '科技' },
  'lol': { name: '英雄联盟', category: '游戏' },
  'genshin': { name: '原神', category: '游戏' },
  'honkai': { name: '崩坏3', category: '游戏' },
  'starrail': { name: '星穹铁道', category: '游戏' },
  'weread': { name: '微信读书', category: '阅读' },
  'hellogithub': { name: 'HelloGitHub', category: '科技' },
  'zhuishu': { name: '追书排行', category: '阅读' },
  'artic': { name: '芝加哥艺术学院', category: '艺术' },
  'metmuseum': { name: '大都会博物馆', category: '艺术' }
}

// 获取平台信息
const getPlatformInfo = (platformId) => {
  return PLATFORM_INFO_MAP[platformId] || { name: '未知平台', category: '未知' }
}

const projectStore = useProjectStore()
const selectedProjectId = ref(null)
const loading = ref(false)
const rawEvents = ref([])
const analytics = ref(null)
const cacheTime = ref(null)
const CACHE_DURATION = 5 * 60 * 1000 // 缓存5分钟

// 日期范围选择
const dateRange = ref(null)

// 展开状态
const showLinkStats = ref(true)
const showEventList = ref(true)

// 分页和筛选
const currentPage = ref(1)
const pageSize = ref(20)
const filterKeyword = ref('')
const filterEventType = ref('')
const filterPriority = ref('')
const filteredEvents = ref([])

// 根据日期范围过滤的事件
const filteredEventsByDate = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return rawEvents.value
  }

  const [startDate, endDate] = dateRange.value
  const start = new Date(startDate).setHours(0, 0, 0, 0)
  const end = new Date(endDate).setHours(23, 59, 59, 999)

  return rawEvents.value.filter(event => {
    const eventDate = new Date(event.timestamp).getTime()
    return eventDate >= start && eventDate <= end
  })
})

// 当前展示的分析数据（基于日期筛选）
const displayAnalytics = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return analytics.value
  }
  return analyzeData(filteredEventsByDate.value)
})

// 处理日期范围变化
const handleDateRangeChange = () => {
  // 日期范围变化时，重新筛选事件数据
  handleFilter()
}

// 清除日期范围
const clearDateRange = () => {
  dateRange.value = null
  handleFilter()
}

// 生成缓存 key
const getCacheKey = (projectId) => {
  return `dashboard_data_${projectId}`
}

// 从缓存获取数据
const getCachedData = (projectId) => {
  try {
    const cacheKey = getCacheKey(projectId)
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()

      // 检查缓存是否过期
      if (now - timestamp < CACHE_DURATION) {
        // 返回数据和时间戳，用于设置 cacheTime
        return {
          ...data,
          timestamp
        }
      }
    }
    return null
  } catch (error) {
    console.error('读取缓存失败:', error)
    return null
  }
}

// 保存数据到缓存
const saveCachedData = (projectId, data) => {
  try {
    const cacheKey = getCacheKey(projectId)
    const cache = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cache))
    cacheTime.value = new Date()
  } catch (error) {
    console.error('保存缓存失败:', error)
  }
}

// 处理项目切换
const handleProjectChange = (projectId) => {
  const project = projectStore.projects.find(p => p.id === projectId)
  if (project) {
    projectStore.setCurrentProject(project)
    loadData(false) // 切换项目时不强制刷新，优先使用缓存
  }
}

// 加载数据
const loadData = async (forceRefresh = true) => {
  if (!selectedProjectId.value) {
    ElMessage.warning('请先选择项目')
    return
  }

  // 如果不强制刷新，先尝试从缓存加载
  if (!forceRefresh) {
    const cachedData = getCachedData(selectedProjectId.value)
    if (cachedData) {
      rawEvents.value = cachedData.rawEvents || []
      analytics.value = cachedData.analytics || null
      // 设置缓存时间（如果有 timestamp）
      if (cachedData.timestamp) {
        cacheTime.value = new Date(cachedData.timestamp)
      } else {
        cacheTime.value = null
      }
      // 初始化筛选数据并按时间戳降序排序
      filteredEvents.value = [...rawEvents.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      currentPage.value = 1
      ElMessage.info('已加载缓存数据')
      return
    }
  }

  // 如果没有缓存或强制刷新，清空 cacheTime
  cacheTime.value = null

  loading.value = true
  try {
    const data = await projectStore.fetchProjectData(selectedProjectId.value)
    rawEvents.value = data?.events || []
    analytics.value = analyzeData(rawEvents.value)

    // 初始化筛选数据并按时间戳降序排序
    filteredEvents.value = [...rawEvents.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    currentPage.value = 1

    // 保存到缓存
    saveCachedData(selectedProjectId.value, {
      rawEvents: rawEvents.value,
      analytics: analytics.value
    })

    if (forceRefresh) {
      ElMessage.success('数据加载成功')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 分析数据
const analyzeData = (events) => {
  if (!events || events.length === 0) {
    return null
  }

  const eventTypeStats = {}
  const dailyStats = {}
  const userSet = new Set()
  const linkClicks = new Map() // 使用 Map 存储链接点击信息
  const platformSwitches = new Map() // 使用 Map 存储平台切换信息

  events.forEach(event => {
    // 事件类型统计
    const type = event.type || 'unknown'
    eventTypeStats[type] = (eventTypeStats[type] || 0) + 1

    // 用户统计
    if (event.data?.user_id) {
      userSet.add(event.data.user_id)
    }

    // 每日统计
    const date = new Date(event.timestamp).toLocaleDateString()
    dailyStats[date] = (dailyStats[date] || 0) + 1

    // 链接点击统计
    if (event.type === 'open_link' && event.data?.url) {
      const url = event.data.url
      // 提取平台和分类信息
      let platformId = event.data?.platform || ''
      let platformName = event.data?.platformName || ''
      let category = event.data?.category || ''

      // 如果没有平台名称，通过 platformId 查找
      if (!platformName && platformId) {
        const platformInfo = getPlatformInfo(platformId)
        platformName = platformInfo.name
        category = category || platformInfo.category
      }

      if (!linkClicks.has(url)) {
        linkClicks.set(url, {
          url,
          count: 0,
          firstClick: event.timestamp,
          lastClick: event.timestamp,
          platformId,
          platformName,
          category,
          dates: []
        })
      }
      const linkData = linkClicks.get(url)
      linkData.count++
      linkData.lastClick = event.timestamp
      linkData.dates.push(new Date(event.timestamp))
    }

    // 平台切换统计
    if (event.type === 'platform_switch') {
      // platform_switch 事件使用 to_platform 字段
      const platformId = event.data?.to_platform || event.data?.platform || 'unknown'
      const platformInfo = getPlatformInfo(platformId)
      const platformName = platformInfo.name

      if (!platformSwitches.has(platformId)) {
        platformSwitches.set(platformId, {
          platformId,
          platformName,
          count: 0,
          category: platformInfo.category
        })
      }
      const switchData = platformSwitches.get(platformId)
      switchData.count++
    }
  })

  // 计算日均事件
  const days = Object.keys(dailyStats).length
  const avgEventsPerDay = days > 0 ? Math.round(events.length / days) : 0

  // 转换 Map 为数组并排序
  const linkClicksList = Array.from(linkClicks.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20) // 只显示前20个

  // 转换平台切换数据为数组并排序
  const platformSwitchList = Array.from(platformSwitches.values())
    .sort((a, b) => b.count - a.count)

  // 计算总切换次数
  const totalSwitches = platformSwitchList.reduce((sum, item) => sum + item.count, 0)

  // 添加占比信息
  platformSwitchList.forEach(item => {
    item.percentage = totalSwitches > 0 ? ((item.count / totalSwitches) * 100).toFixed(1) : 0
  })

  return {
    totalEvents: events.length,
    activeUsers: userSet.size,
    days,
    avgEventsPerDay,
    eventTypeStats,
    dailyStats,
    linkClicks: linkClicksList,
    platformSwitches: platformSwitchList,
    totalSwitches
  }
}

// 格式化缓存时间
const formatCacheTime = (time) => {
  if (!time) return ''

  const date = new Date(time)

  // 检查是否是有效日期
  if (isNaN(date.getTime())) {
    return ''
  }

  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 格式化日期时间
const formatDateTime = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 分页后的事件列表
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEvents.value.slice(start, end)
})

// 处理筛选
const handleFilter = () => {
  // 先应用日期过滤
  let filtered = [...filteredEventsByDate.value]

  // 关键词筛选
  if (filterKeyword.value) {
    const keyword = filterKeyword.value.toLowerCase()
    filtered = filtered.filter(event => {
      const typeMatch = event.type?.toLowerCase().includes(keyword)
      const typeCnMatch = getEventTypeName(event.type).toLowerCase().includes(keyword)
      const dataMatch = JSON.stringify(event.data).toLowerCase().includes(keyword)
      return typeMatch || typeCnMatch || dataMatch
    })
  }

  // 事件类型筛选
  if (filterEventType.value) {
    filtered = filtered.filter(event => event.type === filterEventType.value)
  }

  // 优先级筛选
  if (filterPriority.value) {
    filtered = filtered.filter(event => event.priority === filterPriority.value)
  }

  // 按时间戳降序排序（最新的在最前面）
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  filteredEvents.value = filtered
  currentPage.value = 1 // 重置到第一页
}

// 重置筛选
const resetFilters = () => {
  filterKeyword.value = ''
  filterEventType.value = ''
  filterPriority.value = ''
  dateRange.value = null
  handleFilter()
}

// 页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 事件类型中文名称
const eventTypeNames = {
  'platform_switch': '平台切换',
  'platform_load_start': '平台加载开始',
  'platform_load_success': '平台加载成功',
  'platform_load_error': '平台加载错误',
  'load_more': '加载更多',
  'refresh': '刷新',
  'scroll_to_bottom': '滚动到底部',
  'item_click': '项目点击',
  'favorite_toggle': '收藏切换',
  'copy_content': '复制内容',
  'open_link': '打开链接',
  'search': '搜索',
  'search_result_click': '搜索结果点击',
  'category_switch': '分类切换',
  'filter_change': '筛选器变更',
  'settings_open': '打开设置',
  'settings_change': '设置变更',
  'theme_switch': '主题切换',
  'app_start': '应用启动',
  'app_foreground': '应用前台',
  'app_background': '应用后台',
  'app_close': '应用关闭',
  'error': '错误',
  'performance_warning': '性能警告'
}

// 获取事件类型中文名
const getEventTypeName = (type) => {
  return eventTypeNames[type] || type
}

// 获取事件类型颜色
const getEventTypeColor = (type) => {
  const colorMap = {
    'app_start': 'success',
    'platform_switch': 'primary',
    'platform_load_start': 'info',
    'platform_load_success': 'success',
    'platform_load_error': 'danger',
    'item_click': 'warning',
    'error': 'danger'
  }
  return colorMap[type] || ''
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const typeMap = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return typeMap[priority] || 'info'
}

onMounted(() => {
  projectStore.loadProjects()

  // 如果有当前项目，自动选中
  if (projectStore.currentProject) {
    selectedProjectId.value = projectStore.currentProject.id
    loadData(false) // 优先使用缓存
  } else if (projectStore.projects.length > 0) {
    selectedProjectId.value = projectStore.projects[0].id
    loadData(false) // 优先使用缓存
  }
})
</script>

<style lang="scss" scoped>
.dashboard {
  .project-selector {
    margin-bottom: 24px;

    .selector-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 16px;

      .selector-group {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        align-items: flex-end;

        .selector-item {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .selector-label {
            font-size: 14px;
            font-weight: 500;
            color: #606266;
          }
        }
      }

      .action-group {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
    }

    .date-range-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 6px;
      font-size: 14px;
      color: #606266;

      .el-icon {
        color: #409eff;
      }
    }

    .cache-tag {
      display: inline-flex;
      align-items: center;
      font-size: 13px;
      opacity: 0.9;

      :deep(.el-tag__content) {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .el-icon {
        vertical-align: middle;
      }
    }
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    // 筛选工具栏
    .filter-toolbar {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;
    }

    // 分页容器
    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }

    // 事件数据预览样式
    .event-data {
      max-height: 400px;
      overflow-y: auto;
      font-size: 12px;
      background: #f5f7fa;
      padding: 12px;
      border-radius: 4px;
      margin: 0;
    }

    // 链接表格样式优化
    :deep(.el-table) {
      .el-table__cell {
        padding: 12px 0;
      }
    }

    // 链接地址样式
    .el-link {
      font-size: 13px;
      word-break: break-all;
      line-height: 1.5;
    }
  }
}
</style>
