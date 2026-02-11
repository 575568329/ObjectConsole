<template>
  <el-card class="save-operation-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">💾 存档操作统计</span>
      </div>
    </template>

    <div v-if="!data || data.length === 0" class="empty-state">
      <el-empty description="暂无存档数据" :image-size="60" />
    </div>

    <div v-else class="save-stats-list">
      <div
        v-for="item in data"
        :key="item.gameId"
        class="save-stat-item"
      >
        <div class="game-header">
          <span class="game-icon">{{ item.icon }}</span>
          <span class="game-name">{{ item.name }}</span>
        </div>

        <div class="save-count">
          <span class="count-number">{{ item.count }}</span>
          <span class="count-label">次操作</span>
        </div>

        <!-- 存档操作详情 -->
        <div v-if="item.operations" class="operations-breakdown">
          <div
            v-for="(op, opKey) in item.operations"
            :key="opKey"
            class="operation-item"
          >
            <span class="op-label">{{ getOperationLabel(opKey) }}</span>
            <span class="op-count">{{ op }}</span>
          </div>
        </div>

        <!-- 进度条 -->
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
import { getGameInfo } from '@/config/gamesConfig'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

// 操作类型标签映射
const operationLabels = {
  del: '删除存档',
  cls: '清除存档',
  load: '读取存档',
  save: '保存存档'
}

const getOperationLabel = (key) => {
  return operationLabels[key] || key
}

// 计算最大值
const maxCount = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  return Math.max(...props.data.map(item => item.count))
})
</script>

<script>
export default {
  name: 'SaveOperationStats'
}
</script>

<style lang="scss" scoped>
.save-operation-card {
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

  .save-stats-list {
    .save-stat-item {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      background: #fafafa;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;

      &:hover {
        background: #f5f7fa;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .game-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;

      .game-icon {
        font-size: 20px;
      }

      .game-name {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .save-count {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 8px;

      .count-number {
        font-size: 24px;
        font-weight: 700;
        color: #67c23a;
      }

      .count-label {
        font-size: 12px;
        color: #909399;
      }
    }

    .operations-breakdown {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;

      .operation-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background: white;
        border-radius: 6px;

        .op-label {
          font-size: 11px;
          color: #909399;
        }

        .op-count {
          font-size: 14px;
          font-weight: 600;
          color: #409eff;
        }
      }
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #e8e8e8;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        transition: width 0.5s ease;
      }
    }
  }
}
</style>
