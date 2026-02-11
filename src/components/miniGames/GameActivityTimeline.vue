<template>
  <el-card class="activity-timeline-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">📜 最近游戏活动</span>
      </div>
    </template>

    <div v-if="!data || data.length === 0" class="empty-state">
      <el-empty description="暂无活动记录" :image-size="60" />
    </div>

    <div v-else class="timeline-list">
      <div
        v-for="item in data"
        :key="item.id"
        class="timeline-item"
      >
        <div class="timeline-icon" :class="`type-${item.type}`">
          {{ getActivityIcon(item.type) }}
        </div>

        <div class="timeline-content">
          <div class="activity-header">
            <span class="activity-title">{{ item.title }}</span>
            <span class="activity-time">{{ item.time }}</span>
          </div>

          <div class="activity-detail">
            <span v-if="item.game" class="game-badge">
              {{ item.game.icon }} {{ item.game.name }}
            </span>
            <span v-if="item.extra" class="extra-info">{{ item.extra }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { getGameInfo, getCategoryInfo, formatDuration, formatRelativeTime } from '@/config/gamesConfig'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

// 获取活动图标
const getActivityIcon = (type) => {
  const icons = {
    'game_start': '🎮',
    'game_end': '🏁',
    'save_operation': '💾',
    'category_change': '📂',
    'search': '🔍'
  }
  return icons[type] || '📌'
}
</script>

<script>
export default {
  name: 'GameActivityTimeline'
}
</script>

<style lang="scss" scoped>
.activity-timeline-card {
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

  .timeline-list {
    .timeline-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }
    }

    .timeline-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      background: #f5f7fa;

      &.type-game_start {
        background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
      }

      &.type-game_end {
        background: linear-gradient(135deg, #f093fb20 0%, #f5576c20 100%);
      }

      &.type-save_operation {
        background: linear-gradient(135deg, #4facfe20 0%, #00f2fe20 100%);
      }

      &.type-category_change {
        background: linear-gradient(135deg, #43e97b20 0%, #38f9d720 100%);
      }

      &.type-search {
        background: linear-gradient(135deg, #fa709a20 0%, #fee14020 100%);
      }
    }

    .timeline-content {
      flex: 1;
      min-width: 0;

      .activity-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;

        .activity-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .activity-time {
          font-size: 12px;
          color: #909399;
          flex-shrink: 0;
        }
      }

      .activity-detail {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        .game-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #f5f7fa;
          border-radius: 6px;
          font-size: 12px;
          color: #606266;
        }

        .extra-info {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
