<template>
  <el-card class="session-duration-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">⏱️ 游戏会话时长分析</span>
      </div>
    </template>

    <div v-if="!data || data.length === 0" class="empty-state">
      <el-empty description="暂无会话数据" :image-size="60" />
    </div>

    <div v-else ref="chartRef" class="chart-container"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getGameInfo, formatDuration } from '@/config/gamesConfig'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)
let chart = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chart || !props.data) return

  // 转换数据为图表格式
  const chartData = props.data.map(item => {
    const gameInfo = getGameInfo(item.gameId)
    return {
      name: gameInfo.name,
      icon: gameInfo.icon,
      value: Math.round(item.avgDuration / 1000 / 60), // 转换为分钟
      duration: item.avgDuration,
      count: item.count,
      maxDuration: item.maxDuration,
      minDuration: item.minDuration,
      itemStyle: {
        color: gameInfo.color
      }
    }
  }).sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const item = params[0]
        const data = item.data
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${data.icon} ${data.name}</div>
            <div>平均时长: ${formatDuration(data.duration)}</div>
            <div>会话次数: ${data.count} 次</div>
            <div>最长时间: ${formatDuration(data.maxDuration)}</div>
            <div>最短时间: ${formatDuration(data.minDuration)}</div>
          </div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '分钟',
      axisLabel: {
        formatter: '{value} 分钟'
      }
    },
    yAxis: {
      type: 'category',
      data: chartData.map(d => d.icon + ' ' + d.name),
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '平均时长',
        type: 'bar',
        data: chartData,
        itemStyle: {
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c} 分钟',
          fontSize: 11
        },
        barWidth: '60%'
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
  name: 'SessionDurationChart'
}
</script>

<style lang="scss" scoped>
.session-duration-card {
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

  .chart-container {
    width: 100%;
    height: 320px;
  }
}
</style>
