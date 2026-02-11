<template>
  <el-card class="new-vs-continue-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">🆕 新游戏 vs 继续</span>
      </div>
    </template>

    <div v-if="!data || (data.newGame === 0 && data.continueGame === 0)" class="empty-state">
      <el-empty description="暂无数据" :image-size="60" />
    </div>

    <div v-else class="content">
      <div ref="chartRef" class="chart-container"></div>

      <div class="stats-summary">
        <div class="stat-item new-game">
          <div class="stat-icon">🆕</div>
          <div class="stat-info">
            <div class="stat-label">新游戏</div>
            <div class="stat-value">{{ data.newGame }}</div>
            <div class="stat-percent">{{ getNewGamePercent }}%</div>
          </div>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-item continue-game">
          <div class="stat-icon">▶️</div>
          <div class="stat-info">
            <div class="stat-label">继续游戏</div>
            <div class="stat-value">{{ data.continueGame }}</div>
            <div class="stat-percent">{{ getContinueGamePercent }}%</div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ newGame: 0, continueGame: 0 })
  }
})

const chartRef = ref(null)
let chart = null

// 计算百分比
const total = computed(() => props.data.newGame + props.data.continueGame)
const getNewGamePercent = computed(() => {
  if (total.value === 0) return 0
  return Math.round(props.data.newGame / total.value * 100)
})
const getContinueGamePercent = computed(() => {
  if (total.value === 0) return 0
  return Math.round(props.data.continueGame / total.value * 100)
})

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chart || !props.data) return

  const chartData = [
    {
      name: '新游戏',
      value: props.data.newGame,
      itemStyle: { color: '#67c23a' }
    },
    {
      name: '继续游戏',
      value: props.data.continueGame,
      itemStyle: { color: '#409eff' }
    }
  ]

  if (total.value === 0) {
    chart.showLoading({
      text: '暂无数据',
      color: '#409eff',
      textColor: '#909399',
      maskColor: 'rgba(255, 255, 255, 0.8)'
    })
    return
  }

  chart.hideLoading()

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      show: false
    },
    series: [
      {
        name: '游戏启动方式',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'center',
          formatter: () => {
            return total.value > 0
              ? `${total.value}\n总启动`
              : '暂无数据'
          },
          fontSize: 16,
          fontWeight: 'bold',
          color: '#303133'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  }

  chart.setOption(option)
}

// 监听数据变化
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  initChart()

  // 响应式调整
  window.addEventListener('resize', () => {
    chart?.resize()
  })
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<script>
export default {
  name: 'NewVsContinueChart'
}
</script>

<style lang="scss" scoped>
.new-vs-continue-card {
  height: 100%;

  :deep(.el-card__body) {
    padding: 16px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .empty-state {
    padding: 40px 0;
  }

  .content {
    .chart-container {
      width: 100%;
      height: 200px;
    }

    .stats-summary {
      display: flex;
      align-items: center;
      justify-content: space-around;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .stat-icon {
          font-size: 32px;
        }

        .stat-info {
          .stat-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #303133;
          }

          .stat-percent {
            font-size: 11px;
            color: #67c23a;
            font-weight: 600;
          }
        }

        &.continue-game {
          .stat-percent {
            color: #409eff;
          }
        }
      }

      .stat-divider {
        width: 1px;
        height: 40px;
        background: #e8e8e8;
      }
    }
  }
}
</style>
