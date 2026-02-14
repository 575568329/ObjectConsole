<template>
  <div class="mini-games-dashboard">
    <!-- 页面头部 -->
    <el-card class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="page-title">
            <span class="title-icon">🎮</span>
            <span class="title-text">小游戏数据看板</span>
          </div>
          <p class="page-desc">精选网页小游戏合集数据统计与分析</p>
        </div>
        <div class="header-actions">
          <el-button @click="$router.back()">返回列表</el-button>
          <el-button type="primary" @click="refreshData" :loading="loading">
            <el-icon style="margin-right: 4px"><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            size="small"
            range-separator="-"
            start-placeholder="开始"
            end-placeholder="结束"
            format="MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 200px"
            :clearable="true"
            @change="handleDateRangeChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 加载状态 -->
    <div v-if="loading && !rawEvents.length" class="loading-state">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载数据中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <el-icon :size="40"><CircleClose /></el-icon>
      <p>{{ error }}</p>
      <el-button type="primary" @click="refreshData">重试</el-button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!rawEvents.length" class="empty-state">
      <div class="empty-icon">📊</div>
      <p class="empty-text">暂无数据</p>
    </div>

    <!-- 数据内容 -->
    <div v-else class="dashboard-content">
      <!-- 核心指标卡片 -->
      <el-row :gutter="20" class="stats-cards-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">🎮</div>
              <div class="stat-info">
                <div class="stat-label">总游戏数</div>
                <div class="stat-value">{{ stats.totalGames }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 有游戏会话数据时显示总会话数 -->
        <template v-if="stats.hasSessionData">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">📊</div>
                <div class="stat-info">
                  <div class="stat-label">总会话数</div>
                  <div class="stat-value">{{ stats.totalSessions }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">⏱️</div>
                <div class="stat-info">
                  <div class="stat-label">平均时长</div>
                  <div class="stat-value">{{ stats.avgDuration }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </template>

        <!-- 没有游戏会话数据时显示总事件数和用户操作数 -->
        <template v-else>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">📊</div>
                <div class="stat-info">
                  <div class="stat-label">总事件数</div>
                  <div class="stat-value">{{ stats.totalEvents }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">👆</div>
                <div class="stat-info">
                  <div class="stat-label">用户操作</div>
                  <div class="stat-value">{{ stats.userActions }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </template>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">👥</div>
              <div class="stat-info">
                <div class="stat-label">活跃用户</div>
                <div class="stat-value">{{ stats.activeUsers }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 游戏热度排行 + 分类偏好 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="14">
          <GamePopularityList :data="gamePopularity" label="点击次数" />
        </el-col>
        <el-col :span="10">
          <CategoryPreferenceChart :data="categoryPreference" />
        </el-col>
      </el-row>

      <!-- 会话时长分布 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <SessionDurationChart :data="sessionDuration" />
        </el-col>
      </el-row>

      <!-- 存档操作统计 + 新游戏vs继续 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="14">
          <SaveOperationStats :data="saveOperationStats" />
        </el-col>
        <el-col :span="10">
          <NewVsContinueChart :data="newVsContinue" />
        </el-col>
      </el-row>

      <!-- 最近游戏活动 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <GameActivityTimeline :data="recentActivities" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { Refresh, Loading, CircleClose } from '@element-plus/icons-vue'
import GamePopularityList from '@/components/miniGames/GamePopularityList.vue'
import CategoryPreferenceChart from '@/components/miniGames/CategoryPreferenceChart.vue'
import SessionDurationChart from '@/components/miniGames/SessionDurationChart.vue'
import SaveOperationStats from '@/components/miniGames/SaveOperationStats.vue'
import NewVsContinueChart from '@/components/miniGames/NewVsContinueChart.vue'
import GameActivityTimeline from '@/components/miniGames/GameActivityTimeline.vue'
import { getGameInfo, getCategoryInfo, formatDuration, formatRelativeTime } from '@/config/gamesConfig'
import { GAMES_LIST } from '@/config/gamesConfig'

const route = useRoute()
const projectStore = useProjectStore()

// 状态
const loading = ref(false)
const error = ref(null)
const rawEvents = ref([])
const topLevelUserId = ref(null) // 存储顶层用户ID
const dateRange = ref(null)
const cacheTime = ref(null)

// 根据日期范围过滤的事件
const filteredEventsByDate = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return rawEvents.value
  }

  const [startDate, endDate] = dateRange.value
  const start = new Date(startDate).setHours(0, 0, 0, 0)
  const end = new Date(endDate).setHours(23, 59, 59, 999)

  return filteredEventsByDate.value.filter(event => {
    const eventDate = new Date(event.timestamp).getTime()
    return eventDate >= start && eventDate <= end
  })
})

// 获取当前项目
const currentProject = computed(() => {
  // 从路由参数获取项目ID，如果没有则默认为小游戏项目
  const projectId = route.params.projectId || 'built_in_mini_games'
  return projectStore.projects.find(p => p.id === projectId) || projectStore.projects.find(p => p.id === 'built_in_mini_games')
})

// 核心指标统计
const stats = computed(() => {
  // 使用日期过滤后的事件数据
  const events = filteredEventsByDate.value

  if (!events.length) {
    return {
      totalGames: GAMES_LIST.length,
      totalEvents: 0,
      userActions: 0,
      activeUsers: 0,
      hasSessionData: false
    }
  }

  const gsEvents = events.filter(e => e.type === 'gs')
  const geEvents = events.filter(e => e.type === 'ge')
  const uaEvents = events.filter(e => e.type === 'ua')
  const hasSessionData = gsEvents.length > 0 || geEvents.length > 0

  // 计算平均时长（如果有游戏会话数据）
  let totalDuration = 0
  geEvents.forEach(e => {
    totalDuration += e.data?.d || 0
  })
  const avgDurationMs = geEvents.length > 0 ? totalDuration / geEvents.length : 0

  // 活跃用户
  const userSet = new Set()

  // 从事件中收集用户ID（小游戏数据格式：u 字段在事件层级）
  events.forEach(e => {  // ✅ 使用过滤后的事件
    // 优先使用事件层级的 u 字段（小游戏格式）
    if (e.u) userSet.add(e.u)
    // 备用：检查 data 内的 u 字段
    if (e.data?.u) userSet.add(e.data.u)
    // 备用：检查 user_id 字段
    if (e.data?.user_id) userSet.add(e.data.user_id)
  })

  // 添加顶层用户ID（兜底）
  if (topLevelUserId.value) {
    userSet.add(topLevelUserId.value)
  }

  console.log('活跃用户:', userSet.size, '用户列表:', Array.from(userSet))

  return {
    totalGames: GAMES_LIST.length,
    totalEvents: filteredEventsByDate.value.length,  // ✅ 使用过滤后的事件数
    totalSessions: gsEvents.length,
    avgDuration: formatDuration(avgDurationMs),
    userActions: uaEvents.length,
    activeUsers: userSet.size,
    hasSessionData
  }
})

// 游戏热度排行
const gamePopularity = computed(() => {
  const gameClicks = {}

  // 从 stats 事件读取
  filteredEventsByDate.value
    .filter(e => e.type === 'stats')
    .forEach(e => {
      if (e.data?.gc) {
        Object.entries(e.data.gc).forEach(([gameId, count]) => {
          gameClicks[gameId] = (gameClicks[gameId] || 0) + count
        })
      }
    })

  // 从 game_click 事件统计
  filteredEventsByDate.value
    .filter(e => e.type === 'ua' && e.data?.a === 'game_click')
    .forEach(e => {
      const gameId = e.data?.g
      if (gameId) {
        gameClicks[gameId] = (gameClicks[gameId] || 0) + 1
      }
    })

  // 从 gs 事件统计会话数
  rawEvents.value
    .filter(e => e.type === 'gs')
    .forEach(e => {
      const gameId = e.data?.g
      if (gameId) {
        gameClicks[gameId] = (gameClicks[gameId] || 0) + 1
      }
    })

  // 转换为数组并添加游戏信息
  return Object.entries(gameClicks)
    .map(([gameId, count]) => {
      const gameInfo = getGameInfo(gameId)
      const categoryInfo = getCategoryInfo(gameInfo.category)
      return {
        gameId,
        name: gameInfo.name,
        icon: gameInfo.icon,
        color: gameInfo.color,
        categoryName: categoryInfo.name,
        count
      }
    })
    .sort((a, b) => b.count - a.count)
})

// 分类偏好
const categoryPreference = computed(() => {
  const categoryStats = {
    all: 0,
    puzzle: 0,
    rpg: 0,
    strategy: 0
  }

  // 从 stats 事件读取
  rawEvents.value
    .filter(e => e.type === 'stats')
    .forEach(e => {
      if (e.data?.cc) {
        Object.entries(e.data.cc).forEach(([category, count]) => {
          categoryStats[category] = (categoryStats[category] || 0) + count
        })
      }
    })

  // 从 category_change 事件统计
  rawEvents.value
    .filter(e => e.type === 'ua' && e.data?.a === 'category_change')
    .forEach(e => {
      const toCategory = e.data?.to
      if (toCategory) {
        categoryStats[toCategory] = (categoryStats[toCategory] || 0) + 1
      }
    })

  return categoryStats
})

// 会话时长分析
const sessionDuration = computed(() => {
  const geEvents = filteredEventsByDate.value.filter(e => e.type === 'ge')
  const byGame = {}

  geEvents.forEach(e => {
    const gameId = e.data?.g
    const duration = e.data?.d || 0

    if (!gameId) return

    if (!byGame[gameId]) {
      byGame[gameId] = {
        gameId,
        totalDuration: 0,
        count: 0,
        maxDuration: 0,
        minDuration: Infinity
      }
    }

    byGame[gameId].totalDuration += duration
    byGame[gameId].count++
    byGame[gameId].maxDuration = Math.max(byGame[gameId].maxDuration, duration)
    byGame[gameId].minDuration = Math.min(byGame[gameId].minDuration, duration)
  })

  // 计算平均值并转换为数组
  return Object.values(byGame)
    .map(item => ({
      ...item,
      avgDuration: item.count > 0 ? item.totalDuration / item.count : 0
    }))
    .filter(item => item.count > 0)
})

// 存档操作统计
const saveOperationStats = computed(() => {
  const saveStats = {}
  const operationDetails = {}

  // 从 so 事件统计
  rawEvents.value
    .filter(e => e.type === 'so')
    .forEach(e => {
      const gameId = e.data?.g
      const op = e.data?.op

      if (!gameId) return

      if (!saveStats[gameId]) {
        saveStats[gameId] = 0
        operationDetails[gameId] = {}
      }

      saveStats[gameId]++

      if (op) {
        operationDetails[gameId][op] = (operationDetails[gameId][op] || 0) + 1
      }
    })

  // 从 ge 事件中的 so 字段统计
  rawEvents.value
    .filter(e => e.type === 'ge')
    .forEach(e => {
      const gameId = e.data?.g
      const soCount = e.data?.so || 0

      if (!gameId || soCount === 0) return

      if (!saveStats[gameId]) {
        saveStats[gameId] = 0
        operationDetails[gameId] = {}
      }

      saveStats[gameId] += soCount
    })

  return Object.entries(saveStats)
    .map(([gameId, count]) => {
      const gameInfo = getGameInfo(gameId)
      return {
        gameId,
        name: gameInfo.name,
        icon: gameInfo.icon,
        color: gameInfo.color,
        count,
        operations: operationDetails[gameId] || null
      }
    })
    .sort((a, b) => b.count - a.count)
})

// 新游戏 vs 继续游戏
const newVsContinue = computed(() => {
  let newGame = 0
  let continueGame = 0

  rawEvents.value
    .filter(e => e.type === 'ua')
    .forEach(e => {
      if (e.data?.a === 'game_open_new') {
        newGame++
      } else if (e.data?.a === 'game_open_with_save') {
        continueGame++
      }
    })

  return { newGame, continueGame }
})

// 最近游戏活动
const recentActivities = computed(() => {
  const activities = []

  // 处理 gs 事件 - 游戏开始
  rawEvents.value
    .filter(e => e.type === 'gs')
    .slice(-20)
    .forEach(e => {
      const gameId = e.data?.g
      const gameInfo = getGameInfo(gameId)
      activities.push({
        id: `gs_${e.timestamp}`,
        type: 'game_start',
        title: '开始了游戏',
        game: { icon: gameInfo.icon, name: gameInfo.name },
        time: formatRelativeTime(e.timestamp)
      })
    })

  // 处理 ge 事件 - 游戏结束
  rawEvents.value
    .filter(e => e.type === 'ge')
    .slice(-20)
    .forEach(e => {
      const gameId = e.data?.g
      const gameInfo = getGameInfo(gameId)
      const duration = e.data?.d || 0
      activities.push({
        id: `ge_${e.timestamp}`,
        type: 'game_end',
        title: '完成了游戏',
        game: { icon: gameInfo.icon, name: gameInfo.name },
        extra: `时长 ${formatDuration(duration)}`,
        time: formatRelativeTime(e.timestamp)
      })
    })

  // 处理 so 事件 - 存档操作
  rawEvents.value
    .filter(e => e.type === 'so')
    .slice(-15)
    .forEach(e => {
      const gameId = e.data?.g
      const gameInfo = getGameInfo(gameId)
      const op = e.data?.op
      const opLabels = { del: '删除', cls: '清除', load: '读取', save: '保存' }
      activities.push({
        id: `so_${e.timestamp}`,
        type: 'save_operation',
        title: '存档操作',
        game: { icon: gameInfo.icon, name: gameInfo.name },
        extra: opLabels[op] || op,
        time: formatRelativeTime(e.timestamp)
      })
    })

  // 处理分类切换
  rawEvents.value
    .filter(e => e.type === 'ua' && e.data?.a === 'category_change')
    .slice(-10)
    .forEach(e => {
      const toCategory = e.data?.to
      const categoryInfo = getCategoryInfo(toCategory)
      activities.push({
        id: `cc_${e.timestamp}`,
        type: 'category_change',
        title: '切换到分类',
        extra: `${categoryInfo.icon} ${categoryInfo.name}`,
        time: formatRelativeTime(e.timestamp)
      })
    })

  // 按时间戳排序（最近的在前）
  return activities
    .sort((a, b) => {
      // 从 id 中提取时间戳进行比较
      const aTime = parseInt(a.id.split('_')[1])
      const bTime = parseInt(b.id.split('_')[1])
      return bTime - aTime
    })
    .slice(0, 20) // 只显示最近20条
})

// 加载数据
const loadData = async () => {
  if (!currentProject.value) {
    console.error('当前项目未找到')
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log('正在加载项目数据:', currentProject.value.id)
    const data = await projectStore.fetchProjectData(currentProject.value.id)
    console.log('原始数据:', data)

    // 保存顶层用户ID
    topLevelUserId.value = data?.u || null
    console.log('顶层用户ID:', topLevelUserId.value)

    // 检测并转换小游戏项目的数据格式
    let events = data?.events || []

    console.log('事件数量:', events.length)
    console.log('第一个事件:', events[0])

    // 检测是否为小游戏格式
    if (events.length > 0 && events[0].t) {
      console.log('检测到小游戏格式，正在转换...')
      events = events.map(event => ({
        type: event.t,
        timestamp: event.ts,
        data: event.d,
        u: event.u, // 保留用户ID字段
        priority: event.priority || 'medium'
      }))
      console.log('转换后的事件示例:', events[0])
    }

    // 统计事件类型
    const eventTypeCounts = {}
    events.forEach(e => {
      eventTypeCounts[e.type] = (eventTypeCounts[e.type] || 0) + 1
    })
    console.log('事件类型分布:', eventTypeCounts)

    // 查看stats事件的详细内容
    const statsEvents = events.filter(e => e.type === 'stats')
    console.log('stats事件数量:', statsEvents.length)
    if (statsEvents.length > 0) {
      console.log('第一个stats事件内容:', statsEvents[0])
    }

    // 查看ua事件的详细内容
    const uaEvents = events.filter(e => e.type === 'ua')
    console.log('ua事件数量:', uaEvents.length)
    if (uaEvents.length > 0) {
      console.log('前3个ua事件:', uaEvents.slice(0, 3))
    }

    rawEvents.value = events
    cacheTime.value = Date.now()

    console.log('数据加载完成，总事件数:', rawEvents.value.length)
  } catch (err) {
    error.value = '加载数据失败: ' + err.message
    console.error('加载失败:', err)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  loadData()
}

// 处理日期范围变化
const handleDateRangeChange = (value) => {
  // TODO: 实现日期范围筛选
  console.log('日期范围变化:', value)
}

onMounted(() => {
  console.log('MiniGamesDashboard 挂载')
  console.log('当前项目:', currentProject.value)
  console.log('路由参数:', route.params)
  console.log('项目列表:', projectStore.projects)

  // 确保项目列表已加载
  if (projectStore.projects.length === 0) {
    console.log('项目列表为空，正在加载...')
    projectStore.loadProjects().then(() => {
      console.log('项目列表加载完成:', projectStore.projects)
      loadData()
    })
  } else {
    loadData()
  }
})

// 监听路由参数变化
watch(() => route.params.projectId, (newProjectId) => {
  if (newProjectId) {
    console.log('路由参数变化:', newProjectId)
    loadData()
  }
})
</script>

<script>
export default {
  name: 'MiniGamesDashboard'
}
</script>

<style lang="scss" scoped>
.mini-games-dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;

      .header-left {
        .page-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .title-icon {
            font-size: 32px;
          }

          .title-text {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }
        }

        .page-desc {
          font-size: 14px;
          color: #909399;
          margin: 0;
          padding-left: 44px;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    color: #909399;

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 16px;
      margin: 0 0 20px 0;
    }
  }

  .dashboard-content {
    .stats-cards-row {
      .stat-card {
        :deep(.el-card__body) {
          padding: 20px;
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 16px;

          .stat-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
          }

          .stat-info {
            .stat-label {
              font-size: 13px;
              color: #909399;
              margin-bottom: 8px;
            }

            .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: #303133;
            }
          }
        }
      }
    }
  }
}
</style>
