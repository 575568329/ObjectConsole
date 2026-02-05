<template>
  <div class="event-table">
    <el-table
      :data="events"
      v-loading="loading"
      stripe
      style="width: 100%"
      :default-sort="{ prop: 'timestamp', order: 'descending' }"
    >
      <el-table-column prop="type" label="事件类型" width="180">
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

      <el-table-column prop="timestamp" label="时间" width="180" sortable>
        <template #default="{ row }">
          {{ formatTime(row.timestamp) }}
        </template>
      </el-table-column>

      <el-table-column prop="data" label="事件数据" min-width="300">
        <template #default="{ row }">
          <el-popover
            placement="left"
            :width="400"
            trigger="click"
          >
            <template #reference>
              <el-button text type="primary" size="small">
                查看详情
              </el-button>
            </template>
            <pre class="event-data">{{ JSON.stringify(row.data, null, 2) }}</pre>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
defineProps({
  events: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

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

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.event-table {
  .event-data {
    max-height: 400px;
    overflow-y: auto;
    font-size: 12px;
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    margin: 0;
  }
}
</style>
