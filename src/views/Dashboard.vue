<template>
  <div class="dashboard">
    <!-- 页面头部 -->
    <el-card class="page-header">
      <div class="header-content">
        <h1 class="page-title">📊 数据看板</h1>
        <p class="page-desc">选择项目查看详细的埋点数据分析</p>
      </div>
    </el-card>

    <!-- 项目列表 -->
    <el-row :gutter="20" class="projects-list" v-if="projectStore.projects.length > 0">
      <el-col :span="8" v-for="project in projectStore.projects" :key="project.id">
        <el-card class="project-card hover" @click="goToProject(project)">
          <div class="project-header">
            <div class="project-icon">
              {{ project.builtIn ? '🔥' : '📂' }}
            </div>
            <div class="project-info">
              <h3 class="project-name">
                {{ project.name }}
                <el-tag v-if="project.builtIn" type="danger" size="small" style="margin-left: 8px">
                  官方
                </el-tag>
              </h3>
              <p class="project-desc">{{ project.description || '暂无描述' }}</p>
            </div>
          </div>
          <div class="project-meta">
            <el-tag size="small" type="info">{{ project.basketName }}</el-tag>
            <span class="project-action">
              点击查看数据 <el-icon style="margin-left: 4px"><ArrowRight /></el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📁</div>
      <p class="empty-text">暂无项目，请先在项目管理中添加项目</p>
      <el-button type="primary" @click="$router.push('/projects')">
        前往添加项目
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const projectStore = useProjectStore()

// 跳转到项目详情页
const goToProject = (project) => {
  router.push(`/dashboard/${project.id}`)
}

onMounted(() => {
  projectStore.loadProjects()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .page-header {
    margin-bottom: 24px;

    .header-content {
      .page-title {
        font-size: 28px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: #303133;
      }

      .page-desc {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }
  }

  .projects-list {
    .project-card {
      margin-bottom: 20px;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;

      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .project-header {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;

        .project-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 28px;
        }

        .project-info {
          flex: 1;

          .project-name {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #303133;
            display: flex;
            align-items: center;
          }

          .project-desc {
            font-size: 14px;
            color: #909399;
            margin: 0;
            line-height: 1.5;
          }
        }
      }

      .project-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;

        .project-action {
          font-size: 13px;
          color: #409eff;
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 16px;
      color: #606266;
      margin: 0 0 20px 0;
    }
  }
}
</style>