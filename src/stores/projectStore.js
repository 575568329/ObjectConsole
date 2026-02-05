import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pantryClient } from '@/services/pantryClient'

export const useProjectStore = defineStore('project', () => {
  // 项目列表
  const projects = ref([])

  // 当前选中项目
  const currentProject = ref(null)

  // 加载状态
  const loading = ref(false)

  // 从 localStorage 加载项目列表
  const loadProjects = () => {
    try {
      const saved = localStorage.getItem('analytics_projects')
      if (saved) {
        projects.value = JSON.parse(saved)
      }

      // 加载当前项目
      const currentProjectId = localStorage.getItem('current_project_id')
      if (currentProjectId && projects.value.length > 0) {
        const project = projects.value.find(p => p.id === currentProjectId)
        if (project) {
          currentProject.value = project
        }
      }
    } catch (error) {
      console.error('加载项目列表失败:', error)
    }
  }

  // 保存项目列表到 localStorage
  const saveProjects = () => {
    localStorage.setItem('analytics_projects', JSON.stringify(projects.value))
  }

  // 添加项目
  const addProject = (project) => {
    const newProject = {
      id: Date.now().toString(),
      name: project.name,
      pantryKey: project.pantryKey,
      basketName: project.basketName || 'analytics',
      description: project.description || '',
      createdAt: new Date().toISOString(),
      ...project
    }
    projects.value.push(newProject)
    saveProjects()
    return newProject
  }

  // 更新项目
  const updateProject = (id, data) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...data }
      saveProjects()

      // 如果更新的是当前项目，同步更新
      if (currentProject.value?.id === id) {
        currentProject.value = projects.value[index]
      }
    }
  }

  // 删除项目
  const removeProject = (id) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      saveProjects()

      // 如果删除的是当前项目，清空当前项目
      if (currentProject.value?.id === id) {
        currentProject.value = null
        localStorage.removeItem('current_project_id')
      }
    }
  }

  // 设置当前项目
  const setCurrentProject = (project) => {
    currentProject.value = project
    if (project) {
      localStorage.setItem('current_project_id', project.id)
      // 同时更新 pantryClient 的配置
      pantryClient.key = project.pantryKey
    } else {
      localStorage.removeItem('current_project_id')
    }
  }

  // 获取当前项目的埋点数据
  const fetchProjectData = async (projectId) => {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) {
      throw new Error('项目不存在')
    }

    loading.value = true
    try {
      // 临时切换到该项目的 pantry key
      const originalKey = pantryClient.key
      pantryClient.key = project.pantryKey

      const data = await pantryClient.getBasket(project.basketName)

      // 恢复原 key
      pantryClient.key = originalKey

      return data
    } finally {
      loading.value = false
    }
  }

  // 计算属性：项目数量
  const projectCount = computed(() => projects.value.length)

  return {
    projects,
    currentProject,
    loading,
    projectCount,
    loadProjects,
    addProject,
    updateProject,
    removeProject,
    setCurrentProject,
    fetchProjectData
  }
})
