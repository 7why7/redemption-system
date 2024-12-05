<template>
  <div class="redemption-history">
    <div class="history-header">
      <h3>兑换记录</h3>
      <button v-if="records.length" class="clear-btn" @click="handleClear">清除记录</button>
    </div>
    <div v-if="records.length" class="history-list">
      <div v-for="record in records" :key="record.orderNo" class="history-item">
        <div class="history-info">
          <span class="history-time">{{ formatDate(record.redeemTime) }}</span>
          <span class="history-name">{{ record.giftName }}</span>
        </div>
        <span class="history-status">{{ record.status }}</span>
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
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-name {
  font-size: 14px;
  color: #2c3e50;
}

.history-status {
  font-size: 12px;
  color: #67c23a;
}

.empty-history {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}
</style> 