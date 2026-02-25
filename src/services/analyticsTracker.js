/**
 * 轻量级埋点追踪器
 * 核心功能：事件收集 + 定时同步
 * 
 * 事件类型缩写：
 * - gs: game_start 游戏开始
 * - ge: game_end 游戏结束
 * - pv: page_view 页面访问
 * - ua: user_action 用户行为
 * - so: save_operation 存档操作
 * - stats: 统计汇总
 * 
 * 使用方式：
 * import { analyticsTracker } from '@/services/analyticsTracker.js'
 * 
 * // 初始化（在 App.vue 的 onMounted 中调用）
 * analyticsTracker.init()
 * 
 * // 页面访问
 * analyticsTracker.trackPageView('page_name')
 * 
 * // 用户行为
 * analyticsTracker.trackUserAction('click', { button: 'submit' })
 */

const API_URL = 'https://getpantry.cloud/apiv1/pantry/9eafe9e6-8ff7-41ab-b111-ecabbc1685a7/basket/GAME'

class AnalyticsTracker {
  constructor() {
    this.enabled = !import.meta.env.DEV
    this.events = []
    this.userId = this.getUserId()
    this.syncTimer = null
    this.currentGame = null
  }

  getUserId() {
    let id = localStorage.getItem('game_user_id')
    if (!id) {
      id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
      localStorage.setItem('game_user_id', id)
    }
    return id
  }

  // 记录事件
  track(type, data = {}) {
    if (!this.enabled) return
    this.events.push({
      t: type,
      u: this.userId,
      ts: Date.now(),
      d: data
    })

    if (this.events.length > 100) {
      this.sync()
    }
  }

  // 游戏会话开始
  startGameSession(game) {
    this.track('gs', { g: game.id, n: game.name })
    this.currentGame = game
  }

  // 游戏会话结束
  endGameSession() {
    if (this.currentGame) {
      this.track('ge', { g: this.currentGame.id })
      this.currentGame = null
    }
  }

  // 页面访问
  trackPageView(page) {
    this.track('pv', { p: page })
  }

  // 用户行为
  trackUserAction(action, data = {}) {
    this.track('ua', { a: action, ...data })
  }

  // 存档操作
  trackSaveOperation(op, gameId) {
    this.track('so', { op, g: gameId })
  }

  // 同步到服务器
  async sync() {
    if (!this.enabled || this.events.length === 0) return

    const eventsToSend = [...this.events]
    this.events = []

    try {
      const res = await fetch(API_URL)
      const existing = res.ok ? await res.json() : { events: [] }

      const updated = {
        v: '3.0',
        u: this.userId,
        ls: Date.now(),
        events: [...(existing.events || []), ...eventsToSend].slice(-500)
      }

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })

      console.log('[埋点] 同步成功', eventsToSend.length, '个事件')
    } catch (e) {
      console.error('[埋点] 同步失败:', e)
      this.events = [...eventsToSend, ...this.events]
    }
  }

  // 初始化
  init() {
    if (!this.enabled) {
      console.log('[埋点] 开发环境已禁用')
      return
    }

    console.log('[埋点] 初始化完成，用户ID:', this.userId)

    this.syncTimer = setInterval(() => this.sync(), 300000)

    window.addEventListener('beforeunload', () => {
      this.endGameSession()
      
      if (navigator.sendBeacon && this.events.length > 0) {
        const blob = new Blob([JSON.stringify({
          v: '3.0',
          u: this.userId,
          ls: Date.now(),
          events: this.events
        })], { type: 'application/json' })
        
        navigator.sendBeacon(API_URL, blob)
      }
    })

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sync()
      }
    })
  }

  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  getStats() {
    return {
      enabled: this.enabled,
      userId: this.userId,
      pendingEvents: this.events.length,
      currentGame: this.currentGame
    }
  }
}

export const analyticsTracker = new AnalyticsTracker()
export default analyticsTracker
