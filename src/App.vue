<template>
  <div class="app-container">
    <el-container class="full-container">
      <!-- 侧边栏 -->
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <span>📊</span>
          <span>埋点数据查看系统</span>
        </div>
        <el-menu
          :default-active="currentRoute"
          router
          class="menu"
          background-color="#1e1e2e"
          text-color="#a6accd"
          active-text-color="#60a5fa"
        >
          <el-menu-item index="/dashboard">
            <span>📈</span>
            <span>数据看板</span>
          </el-menu-item>
          <el-menu-item index="/projects">
            <span>📁</span>
            <span>项目管理</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <span>⚙️</span>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="main-content">
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb>
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute !== '/'">{{ breadcrumbName }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-tag v-if="currentProject" type="primary" effect="dark">
              当前项目: {{ currentProject.name }}
            </el-tag>
          </div>
        </el-header>
        <el-main class="content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from './stores/projectStore'

const route = useRoute()
const projectStore = useProjectStore()

const currentRoute = computed(() => route.path)
const currentProject = computed(() => projectStore.currentProject)

const breadcrumbName = computed(() => {
  const names = {
    '/dashboard': '数据看板',
    '/projects': '项目管理',
    '/settings': '系统设置'
  }
  return names[currentRoute.value] || ''
})
</script>

<style lang="scss" scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.full-container {
  width: 100%;
  height: 100%;
}

.sidebar {
  background: #1e1e2e;
  border-right: 1px solid #2d2d3f;
  height: 100%;
  overflow-y: auto;

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    border-bottom: 1px solid #2d2d3f;

    span:first-child {
      font-size: 28px;
    }
  }

  .menu {
    border: none;
  }
}

.main-content {
  background: #f5f7fa;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  height: 60px;
  flex-shrink: 0;

  .header-left {
    flex: 1;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}
</style>
