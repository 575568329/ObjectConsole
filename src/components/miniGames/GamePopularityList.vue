<template>
  <el-card class="game-popularity-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">🎮 游戏热度排行</span>
      </div>
    </template>

    <div v-if="!data || data.length === 0" class="empty-state">
      <el-empty description="暂无数据" :image-size="60" />
    </div>

    <div v-else class="popularity-list">
      <div
        v-for="(item, index) in data"
        :key="item.gameId"
        class="popularity-item"
        :class="{ 'top-3': index < 3 }"
      >
        <div class="rank-badge" :class="`rank-${index + 1}`">
          {{ index + 1 }}
        </div>
        <div class="game-icon" :style="{ backgroundColor: item.color + '20' }">
          {{ item.icon }}
        </div>
        <div class="game-info">
          <div class="game-name">{{ item.name }}</div>
          <div class="game-meta">
            <span class="category-tag" :style="{ color: item.color }">
              {{ item.categoryName }}
            </span>
          </div>
        </div>
        <div class="game-stats">
          <div class="count-value">{{ formatCount(item.count) }}</div>
          <div class="count-label">{{ item.label }}</div>
        </div>
        <!-- 简单的进度条 -->
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{
              width: (item.count / maxCount * 100) + '%',
              backgroundColor: item.color
            }"
          ></div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { getGameInfo, getCategoryInfo } from '@/config/gamesConfig'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: '次数'
  }
})

// 计算最大值用于进度条
const maxCount = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  return Math.max(...props.data.map(item => item.count))
})

// 格式化数字
const formatCount = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<script>
export default {
  name: 'GamePopularityList'
}
</script>

<style lang="scss" scoped>
.game-popularity-card {
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

  .popularity-list {
    .popularity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;

      &:hover {
        background: #f5f7fa;
      }

      &.top-3 {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
      }
    }

    .rank-badge {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: #909399;
      background: #f5f7fa;
      flex-shrink: 0;

      &.rank-1 {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        color: #8b5a00;
      }

      &.rank-2 {
        background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
        color: #5a5a5a;
      }

      &.rank-3 {
        background: linear-gradient(135deg, #cd7f32 0%, #e8a862 100%);
        color: #5a3a00;
      }
    }

    .game-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .game-info {
      flex: 1;
      min-width: 0;

      .game-name {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .game-meta {
        display: flex;
        align-items: center;
        gap: 8px;

        .category-tag {
          font-size: 12px;
          font-weight: 500;
        }
      }
    }

    .game-stats {
      text-align: right;
      flex-shrink: 0;

      .count-value {
        font-size: 18px;
        font-weight: 700;
        color: #409eff;
        line-height: 1.2;
      }

      .count-label {
        font-size: 11px;
        color: #909399;
      }
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 52px;
      right: 12px;
      height: 3px;
      background: #f0f0f0;
      border-radius: 2px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        transition: width 0.5s ease;
      }
    }
  }
}
</style>
