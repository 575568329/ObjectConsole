<template>
  <div ref="chartRef" class="event-type-chart"></div>
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

// 事件类型中文名称映射
const eventTypeNames = {
  // 摸鱼热搜事件
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
  'performance_warning': '性能警告',
  // 小游戏事件
  'pv': '页面访问',
  'ua': '用户行为',
  'stats': '统计数据',
  'gs': '游戏会话开始',
  'ge': '游戏会话结束',
  'so': '存档操作'
}

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
    .map(([type, count]) => ({
      name: eventTypeNames[type] || type,
      value: count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // 只显示前10个

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '事件类型',
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
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ],
    color: [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#60a5fa'
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
.event-type-chart {
  width: 100%;
  height: 350px;
}
</style>
