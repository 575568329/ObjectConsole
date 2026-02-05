<template>
  <div class="projects-page">
    <!-- 顶部操作栏 -->
    <el-card class="action-bar">
      <div class="actions">
        <el-button type="primary" @click="showAddDialog = true">
          ➕ 添加项目
        </el-button>
        <el-button @click="projectStore.loadProjects()">
          🔄 刷新
        </el-button>
      </div>
    </el-card>

    <!-- 项目列表 -->
    <el-row :gutter="20" class="projects-list" v-if="projectStore.projects.length > 0">
      <el-col :span="8" v-for="project in projectStore.projects" :key="project.id">
        <el-card class="project-card hover" @click="selectProject(project)">
          <div class="project-header">
            <div class="project-icon">
              📂
            </div>
            <div class="project-info">
              <h3 class="project-name">{{ project.name }}</h3>
              <p class="project-desc">{{ project.description || '暂无描述' }}</p>
            </div>
          </div>
          <div class="project-meta">
            <el-tag size="small" type="info">{{ project.basketName }}</el-tag>
            <span class="project-date">{{ formatDate(project.createdAt) }}</span>
          </div>
          <div class="project-actions" @click.stop>
            <el-button
              :type="projectStore.currentProject?.id === project.id ? 'primary' : 'default'"
              size="small"
              @click="setProject(project)"
            >
              {{ projectStore.currentProject?.id === project.id ? '当前项目' : '设为当前' }}
            </el-button>
            <el-button size="small" @click="editProject(project)">
              ✏️ 编辑
            </el-button>
            <el-button size="small" type="danger" @click="confirmDelete(project)">
              🗑️ 删除
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📁</div>
      <p class="empty-text">暂无项目</p>
      <el-button type="primary" @click="showAddDialog = true">添加第一个项目</el-button>
    </div>

    <!-- 添加项目对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加项目"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="projectForm" :rules="formRules" ref="projectFormRef" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="Pantry Key" prop="pantryKey">
          <el-input
            v-model="projectForm.pantryKey"
            placeholder="请输入 Pantry Key"
            type="password"
            show-password
          />
          <div class="form-tip">
            <a href="https://getpantry.cloud/" target="_blank">
              前往获取免费的 Pantry Key
            </a>
          </div>
        </el-form-item>
        <el-form-item label="Basket 名称" prop="basketName">
          <el-input v-model="projectForm.basketName" placeholder="默认: analytics" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="projectForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddProject" :loading="submitting">
          添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑项目对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑项目"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="Pantry Key" prop="pantryKey">
          <el-input
            v-model="editForm.pantryKey"
            placeholder="请输入 Pantry Key"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="Basket 名称" prop="basketName">
          <el-input v-model="editForm.basketName" placeholder="默认: analytics" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEditProject" :loading="submitting">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const projectStore = useProjectStore()

// 对话框状态
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const submitting = ref(false)

// 表单引用
const projectFormRef = ref(null)
const editFormRef = ref(null)

// 项目表单
const projectForm = ref({
  name: '',
  pantryKey: '',
  basketName: 'analytics',
  description: ''
})

// 编辑表单
const editForm = ref({
  id: '',
  name: '',
  pantryKey: '',
  basketName: 'analytics',
  description: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  pantryKey: [
    { required: true, message: '请输入 Pantry Key', trigger: 'blur' }
  ],
  basketName: [
    { required: true, message: '请输入 Basket 名称', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 选择项目（查看数据）
const selectProject = (project) => {
  projectStore.setCurrentProject(project)
  ElMessage.success(`已切换到项目: ${project.name}`)
  // 跳转到数据看板
  setTimeout(() => {
    window.location.href = '#/dashboard'
  }, 500)
}

// 设置当前项目
const setProject = (project) => {
  projectStore.setCurrentProject(project)
  ElMessage.success(`已设置当前项目: ${project.name}`)
}

// 编辑项目
const editProject = (project) => {
  editForm.value = {
    id: project.id,
    name: project.name,
    pantryKey: project.pantryKey,
    basketName: project.basketName,
    description: project.description
  }
  showEditDialog.value = true
}

// 确认删除
const confirmDelete = (project) => {
  ElMessageBox.confirm(
    `确定要删除项目 "${project.name}" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    projectStore.removeProject(project.id)
    ElMessage.success('项目已删除')
  }).catch(() => {
    // 取消删除
  })
}

// 添加项目
const handleAddProject = async () => {
  if (!projectFormRef.value) return

  await projectFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        projectStore.addProject(projectForm.value)
        ElMessage.success('项目添加成功')
        showAddDialog.value = false
        projectFormRef.value.resetFields()
      } finally {
        submitting.value = false
      }
    }
  })
}

// 编辑项目
const handleEditProject = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const { id, ...data } = editForm.value
        projectStore.updateProject(id, data)
        ElMessage.success('项目更新成功')
        showEditDialog.value = false
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  projectStore.loadProjects()
})
</script>

<style lang="scss" scoped>
.projects-page {
  .action-bar {
    margin-bottom: 20px;

    .actions {
      display: flex;
      gap: 12px;
    }
  }

  .projects-list {
    .project-card {
      margin-bottom: 20px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
      }

      .project-header {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;

        .project-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 24px;
        }

        .project-info {
          flex: 1;

          .project-name {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #303133;
          }

          .project-desc {
            font-size: 14px;
            color: #909399;
            margin: 0;
          }
        }
      }

      .project-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;

        .project-date {
          font-size: 13px;
          color: #909399;
        }
      }

      .project-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;

    a {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
