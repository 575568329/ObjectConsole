<template>
  <div ref="chartRef" class="platform-switch-chart"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

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
  if (!chart || !props.data || props.data.length === 0) {
    chart?.clear()
    return
  }

  // 转换数据为图表格式
  const chartData = props.data.map(item => ({
    name: item.platformName,
    value: item.count,
    percentage: item.percentage
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}<br/>切换次数: ${params.value}<br/>占比: ${params.data.percentage}%`
      }
    },
    legend: {
      bottom: '0%',
      left: 'center',
      type: 'scroll',
      maxRows: 2
    },
    series: [
      {
        name: '平台切换',
        type: 'pie',
        radius: ['45%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: true
        },
        data: chartData
      }
    ],
    color: [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#60a5fa',
      '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee'
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
.platform-switch-chart {
  width: 100%;
  height: 400px;
}
</style>
