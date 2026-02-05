/**
 * Pantry API 客户端
 * 用于获取和上传埋点数据
 */

export class PantryClient {
  constructor() {
    this.baseUrl = 'https://getpantry.cloud/apiv1'
    this.key = null
  }

  /**
   * 初始化客户端
   */
  initialize(key) {
    this.key = key
    return this
  }

  /**
   * 获取 Basket 数据
   * @param {string} basketName - Basket 名称
   * @param {string} customKey - 自定义 Pantry Key（可选）
   */
  async getBasket(basketName, customKey = null) {
    const key = customKey || this.key
    if (!key) {
      throw new Error('Pantry Key 未设置')
    }

    const url = `${this.baseUrl}/pantry/${key}/basket/${basketName}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok && response.status !== 404) {
      throw new Error(`获取 Basket 失败: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * 更新 Basket 数据
   * @param {string} basketName - Basket 名称
   * @param {Object} data - 要存储的数据
   * @param {boolean} merge - 是否合并现有数据
   */
  async updateBasket(basketName, data, merge = true) {
    if (!this.key) {
      throw new Error('Pantry Key 未设置')
    }

    let finalData = data

    // 如果启用合并，先获取现有数据
    if (merge) {
      try {
        const existing = await this.getBasket(basketName)

        if (Array.isArray(existing) && Array.isArray(data)) {
          finalData = [...existing, ...data]
        } else if (existing.events && data.events && Array.isArray(existing.events) && Array.isArray(data.events)) {
          finalData = {
            ...existing,
            events: [...existing.events, ...data.events]
          }
        } else {
          finalData = { ...existing, ...data }
        }
      } catch (error) {
        // Basket 不存在，直接使用新数据
        console.log('Basket 不存在，将创建新的')
      }
    }

    const url = `${this.baseUrl}/pantry/${this.key}/basket/${basketName}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(finalData)
    })

    if (!response.ok) {
      throw new Error(`更新 Basket 失败: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * 清空 Basket
   * @param {string} basketName - Basket 名称
   */
  async clearBasket(basketName) {
    if (!this.key) {
      throw new Error('Pantry Key 未设置')
    }

    const url = `${this.baseUrl}/pantry/${this.key}/basket/${basketName}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (!response.ok) {
      throw new Error(`清空 Basket 失败: ${response.status}`)
    }

    return await response.json()
  }
}

// 创建单例
export const pantryClient = new PantryClient()

export default pantryClient
