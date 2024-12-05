<template>
  <div class="redemption-history">
    <div class="history-header">
      <h3>兑换记录</h3>
      <button v-if="records.length" class="clear-btn" @click="handleClear">清除记录</button>
    </div>
    <div v-if="records.length" class="history-list">
      <div v-for="record in records" :key="record.orderNo" class="history-item">
        <div class="history-main">
          <div class="history-header-info">
            <span class="history-time">{{ formatDate(record.redeemTime) }}</span>
            <span class="history-status" :class="getStatusClass(record.status)">
              {{ record.status }}
            </span>
          </div>
          <div class="history-content">
            <span class="history-name">{{ record.giftName }}</span>
            <div class="history-items">
              <span v-for="item in record.items" :key="item.name" class="history-item-info">
                {{ item.name }} x{{ item.amount }}
              </span>
            </div>
            <span class="history-order">订单号：{{ record.orderNo }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-history">
      暂无兑换记录
    </div>
  </div>
</template>

<script>
export default {
  name: 'RedemptionHistory',
  data() {
    return {
      records: []
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    loadHistory() {
      const history = localStorage.getItem('redemptionHistory')
      this.records = history ? JSON.parse(history) : []
    },
    handleClear() {
      if (confirm('确定要清除所有兑换记录吗？')) {
        localStorage.removeItem('redemptionHistory')
        this.records = []
        this.$emit('clear')
      }
    },
    getStatusClass(status) {
      return {
        'status-success': status === '领取成功',
        'status-failed': status === '领取失败'
      }
    }
  },
  created() {
    this.loadHistory()
  }
}
</script>

<style scoped>
.redemption-history {
  margin-top: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h3 {
  margin: 0;
  color: #2c3e50;
}

.clear-btn {
  padding: 6px 12px;
  border: none;
  background: #f56c6c;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover {
  background: #f78989;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.history-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-name {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 8px;
}

.history-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.history-item-info {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.history-order {
  font-size: 12px;
  color: #909399;
}

.history-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-success {
  color: #67c23a;
  background: #f0f9eb;
}

.status-failed {
  color: #f56c6c;
  background: #fef0f0;
}

.empty-history {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}

/* 深色主题支持 */
:root[theme-mode="dark"] .redemption-history {
  background: #1a1a1a;
  color: #fff;
}

:root[theme-mode="dark"] .history-item {
  background: #2c2c2c;
}

:root[theme-mode="dark"] .history-item-info {
  background: #363636;
  color: #909399;
}

:root[theme-mode="dark"] .history-time {
  color: #909399;
}

:root[theme-mode="dark"] .history-name {
  color: #e0e0e0;
}

:root[theme-mode="dark"] .empty-history {
  color: #909399;
}
</style> 