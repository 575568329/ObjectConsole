/**
 * 小游戏信息配置
 * 用于小游戏数据看板
 */

// 游戏信息映射
export const GAMES_INFO = {
  tetris: {
    id: 'tetris',
    name: '俄罗斯方块',
    englishName: 'Tetris',
    icon: '🧩',
    category: 'puzzle',
    color: '#667eea'
  },
  hextris: {
    id: 'hextris',
    name: '六边形俄罗斯方块',
    englishName: 'Hextris',
    icon: '⬢',
    category: 'puzzle',
    color: '#3498db'
  },
  adarkroom: {
    id: 'adarkroom',
    name: '小黑屋',
    englishName: 'A Dark Room',
    icon: '🏚️',
    category: 'rpg',
    color: '#2d3748'
  },
  candybox2: {
    id: 'candybox2',
    name: '糖果盒子2',
    englishName: 'Candy Box 2',
    icon: '🍬',
    category: 'rpg',
    color: '#ff6b9d'
  },
  liferestart: {
    id: 'liferestart',
    name: '人生重开模拟器',
    englishName: 'Life Restart',
    icon: '🔄',
    category: 'rpg',
    color: '#48bb78'
  }
}

// 分类信息映射
export const CATEGORIES_INFO = {
  all: { name: '全部', icon: '🎮', color: '#999' },
  puzzle: { name: '益智', icon: '🧩', color: '#667eea' },
  rpg: { name: '角色扮演', icon: '⚔️', color: '#ff6b9d' },
  strategy: { name: '策略', icon: '🎯', color: '#48bb78' }
}

// 游戏列表
export const GAMES_LIST = Object.values(GAMES_INFO)

// 分类列表
export const CATEGORIES_LIST = Object.entries(CATEGORIES_INFO)
  .filter(([key]) => key !== 'all')
  .map(([key, value]) => ({ id: key, ...value }))

/**
 * 根据游戏ID获取游戏信息
 */
export function getGameInfo(gameId) {
  return GAMES_INFO[gameId] || { name: gameId, icon: '❓', color: '#999' }
}

/**
 * 根据分类ID获取分类信息
 */
export function getCategoryInfo(categoryId) {
  return CATEGORIES_INFO[categoryId] || { name: categoryId, icon: '❓', color: '#999' }
}

/**
 * 格式化时长（毫秒转为可读格式）
 */
export function formatDuration(ms) {
  if (!ms || ms < 0) return '0秒'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return ''

  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}
