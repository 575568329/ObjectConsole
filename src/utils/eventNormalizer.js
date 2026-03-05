/**
 * 埋点事件格式化工具
 * 兼容两种事件格式：
 * 
 * 新格式（缩写）：
 * { t: 'gs', u: 'userId', ts: 1234567890, d: { g: 'tetris', n: '俄罗斯方块' } }
 * 
 * 旧格式（完整名）：
 * { type: 'game_start', timestamp: 1234567890, data: { id: 'tetris', name: '俄罗斯方块' } }
 */

// 事件类型映射：旧格式 -> 新格式（缩写）
const EVENT_TYPE_MAP = {
  'game_start': 'gs',
  'game_end': 'ge',
  'page': 'pv',
  'page_view': 'pv',
  'action': 'ua',
  'user_action': 'ua',
  'save': 'so',
  'save_operation': 'so',
  'stats': 'stats'
}

// 数据字段映射：旧格式字段 -> 新格式字段
const DATA_FIELD_MAP = {
  // 游戏相关
  'id': 'g',      // gameId
  'game_id': 'g',
  'name': 'n',    // gameName
  'game_name': 'n',
  
  // 页面相关
  'page': 'p',
  'page_name': 'p',
  
  // 操作相关
  'action': 'a',
  'action_name': 'a',
  
  // 存档相关
  'operation': 'op',
  'op_type': 'op',
  'game': 'g',    // 存档操作中的游戏ID
  
  // 时长
  'duration': 'd',
  'duration_ms': 'd',
  
  // 其他
  'user_id': 'u'
}

/**
 * 标准化单个事件
 * @param {Object} event - 原始事件
 * @returns {Object} - 标准化后的事件
 */
export function normalizeEvent(event) {
  if (!event) return null

  // 检测事件格式
  const isNewFormat = event.t !== undefined
  const isOldFormat = event.type !== undefined

  if (isNewFormat && !isOldFormat) {
    // 已经是新格式，直接返回
    return {
      type: event.t,
      userId: event.u,
      timestamp: event.ts,
      data: normalizeData(event.d)
    }
  }

  if (isOldFormat) {
    // 旧格式，转换为新格式
    return {
      type: EVENT_TYPE_MAP[event.type] || event.type,
      userId: event.u || event.data?.u || event.data?.user_id,
      timestamp: event.timestamp || event.ts,
      data: normalizeData(event.data, event.type)
    }
  }

  // 未知格式，尝试兼容
  return {
    type: event.t || event.type || 'unknown',
    userId: event.u || event.userId,
    timestamp: event.ts || event.timestamp || Date.now(),
    data: event.d || event.data || {}
  }
}

/**
 * 标准化事件数据
 * @param {Object} data - 原始数据
 * @param {string} eventType - 事件类型（用于特殊处理）
 * @returns {Object} - 标准化后的数据
 */
function normalizeData(data, eventType) {
  if (!data) return {}

  const normalized = {}

  for (const [key, value] of Object.entries(data)) {
    // 检查是否需要映射字段名
    const mappedKey = DATA_FIELD_MAP[key] || key
    normalized[mappedKey] = value
  }

  // 特殊处理：game_start/game_end 事件中的游戏ID
  if (eventType === 'game_start' || eventType === 'gs') {
    if (normalized.id && !normalized.g) {
      normalized.g = normalized.id
    }
    if (normalized.name && !normalized.n) {
      normalized.n = normalized.name
    }
  }

  return normalized
}

/**
 * 批量标准化事件
 * @param {Array} events - 原始事件数组
 * @returns {Array} - 标准化后的事件数组
 */
export function normalizeEvents(events) {
  if (!Array.isArray(events)) return []
  return events.map(normalizeEvent).filter(Boolean)
}

/**
 * 获取事件类型（统一返回缩写）
 */
export function getEventType(event) {
  const normalized = normalizeEvent(event)
  return normalized?.type
}

/**
 * 获取游戏ID（兼容各种格式）
 */
export function getGameId(event) {
  const normalized = normalizeEvent(event)
  return normalized?.data?.g || normalized?.data?.id
}

/**
 * 获取用户ID（兼容各种格式）
 */
export function getUserId(event) {
  return event?.u || event?.userId || event?.data?.u || event?.data?.user_id
}

/**
 * 获取时间戳（兼容各种格式）
 */
export function getTimestamp(event) {
  return event?.ts || event?.timestamp || Date.now()
}

export default {
  normalizeEvent,
  normalizeEvents,
  getEventType,
  getGameId,
  getUserId,
  getTimestamp
}
