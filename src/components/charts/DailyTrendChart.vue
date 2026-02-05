<template>
  <div ref="chartRef" class="daily-trend-chart"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

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

  // 转换数据并按日期排序
  const sortedData = Object.entries(props.data)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-7) // 最近7天

  const dates = sortedData.map(([date]) => date.slice(5)) // 只显示月-日
  const counts = sortedData.map(([, count]) => count)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '事件数量',
        type: 'line',
        smooth: true,
        data: counts,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(96, 165, 250, 0.5)' },
            { offset: 1, color: 'rgba(96, 165, 250, 0.1)' }
          ])
        },
        lineStyle: {
          width: 3,
          color: '#60a5fa'
        },
        itemStyle: {
          color: '#60a5fa'
        },
        emphasis: {
          focus: 'series'
        }
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

<style lang="scss" scoped>
.daily-trend-chart {
  width: 100%;
  height: 350px;
}
</style>
