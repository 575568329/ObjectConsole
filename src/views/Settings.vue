<template>
  <div class="settings-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>

      <el-form label-width="150px" style="max-width: 600px">
        <el-form-item label="自动刷新数据">
          <el-switch v-model="settings.autoRefresh" />
          <span class="form-tip">开启后每分钟自动刷新数据</span>
        </el-form-item>

        <el-form-item label="默认显示行数">
          <el-input-number
            v-model="settings.defaultRows"
            :min="10"
            :max="100"
            :step="10"
          />
          <span class="form-tip">表格默认显示的事件数量</span>
        </el-form-item>

        <el-form-item label="主题模式">
          <el-radio-group v-model="settings.theme">
            <el-radio label="light">浅色</el-radio>
            <el-radio label="dark">深色</el-radio>
            <el-radio label="auto">跟随系统</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="显示调试信息">
          <el-switch v-model="settings.debug" />
          <span class="form-tip">在控制台显示调试日志</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="resetSettings">重置默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 关于信息 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>关于</span>
        </div>
      </template>

      <div class="about-info">
        <h3>埋点数据查看系统</h3>
        <p>版本: 1.0.0</p>
        <p>一个简洁高效的多项目埋点数据分析平台</p>
        <el-divider />
        <p class="tech-stack">
          <el-tag>Vue 3</el-tag>
          <el-tag>Vite</el-tag>
          <el-tag>Element Plus</el-tag>
          <el-tag>ECharts</el-tag>
          <el-tag>Pinia</el-tag>
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 默认设置
const defaultSettings = {
  autoRefresh: false,
  defaultRows: 20,
  theme: 'light',
  debug: false
}

// 当前设置
const settings = ref({ ...defaultSettings })

// 加载设置
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('app_settings')
    if (saved) {
      settings.value = { ...defaultSettings, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 保存设置
const saveSettings = () => {
  try {
    localStorage.setItem('app_settings', JSON.stringify(settings.value))
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

// 重置设置
const resetSettings = () => {
  settings.value = { ...defaultSettings }
  saveSettings()
  ElMessage.success('已重置为默认设置')
}

onMounted(() => {
  loadSettings()
})
</script>

<style lang="scss" scoped>
.settings-page {
  max-width: 800px;

  .card-header {
    font-weight: 600;
    font-size: 16px;
  }

  .form-tip {
    margin-left: 12px;
    font-size: 13px;
    color: #909399;
  }

  .about-info {
    h3 {
      margin: 0 0 16px 0;
      font-size: 20px;
      color: #303133;
    }

    p {
      margin: 8px 0;
      color: #606266;
    }

    .tech-stack {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}
</style>
