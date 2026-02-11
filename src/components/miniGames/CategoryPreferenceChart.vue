<template>
  <el-card class="category-preference-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">📊 游戏分类偏好</span>
      </div>
    </template>

    <div v-if="!data || data.length === 0" class="empty-state">
      <el-empty description="暂无数据" :image-size="60" />
    </div>

    <div v-else ref="chartRef" class="chart-container"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { CATEGORIES_INFO } from '@/config/gamesConfig'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
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
  const chartData = Object.entries(props.data)
    .filter(([key]) => key !== 'all' && props.data[key] > 0)
    .map(([categoryId, count]) => {
      const categoryInfo = CATEGORIES_INFO[categoryId] || CATEGORIES_INFO.all
      return {
        name: categoryInfo.name,
        value: count,
        itemStyle: {
          color: categoryInfo.color
        }
      }
    })
    .sort((a, b) => b.value - a.value)

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
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '分类偏好',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            formatter: '{b}\n{d}%'
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
  name: 'CategoryPreferenceChart'
}
</script>

<style lang="scss" scoped>
.category-preference-card {
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
    height: 300px;
  }
}
</style>
