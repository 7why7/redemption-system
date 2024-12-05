<template>
  <div class="gift-package-details">
    <!-- 基本信息部分 -->
    <div class="gift-basic-info">
      <h3 class="gift-title">{{ giftInfo.name }}</h3>
      <p class="gift-description">{{ giftInfo.description }}</p>
      <p class="gift-expire-time">有效期至：{{ formatDate(giftInfo.expireTime) }}</p>
    </div>

    <!-- 物品列表部分 -->
    <div class="gift-items">
      <h4>包含物品</h4>
      <div class="items-grid">
        <div v-for="item in giftInfo.items" :key="item.id" class="item-card">
          <div class="item-icon">
            <img :src="item.icon" :alt="item.name">
          </div>
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-amount">x{{ item.amount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 领取确认部分 -->
    <div class="claim-section" v-if="!claimed">
      <div class="confirm-box" v-if="!confirming">
        <button class="claim-btn" @click="showConfirm">立即领取</button>
      </div>
      <div class="confirm-dialog" v-else>
        <p>确认领取该礼包？</p>
        <div class="confirm-actions">
          <button class="confirm-btn" @click="confirmClaim" :disabled="claiming">{{ claiming ? '领取中...' : '确认' }}</button>
          <button class="cancel-btn" @click="cancelClaim" :disabled="claiming">取消</button>
        </div>
      </div>
    </div>

    <!-- 领取结果反馈 -->
    <div class="claim-result" v-if="claimResult">
      <div v-if="claimResult.success" class="success-result">
        <i class="success-icon">✓</i>
        <h4>领取成功！</h4>
        <p>物品已发放到您的账户</p>
      </div>
      <div v-else class="error-result">
        <i class="error-icon">✗</i>
        <h4>领取失败</h4>
        <p>{{ claimResult.error.message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { claimGift } from '@/api/redemption'

export default {
  name: 'GiftPackageDetails',
  props: {
    giftInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      confirming: false,
      claiming: false,
      claimed: false,
      claimResult: null
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    showConfirm() {
      this.confirming = true
    },
    cancelClaim() {
      this.confirming = false
    },
    async confirmClaim() {
      this.claiming = true
      try {
        const result = await claimGift(this.giftInfo.id)
        this.claimResult = {
          success: true
        }
        this.claimed = true
      } catch (error) {
        this.claimResult = {
          success: false,
          error: {
            message: error.message || '领取失败，请稍后重试'
          }
        }
      } finally {
        this.claiming = false
        this.confirming = false
      }
    }
  }
}
</script>

<style scoped>
.gift-package-details {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.gift-basic-info {
  text-align: center;
  margin-bottom: 24px;
}

.gift-title {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 12px;
}

.gift-description {
  color: #666;
  margin-bottom: 8px;
}

.gift-expire-time {
  color: #999;
  font-size: 14px;
}

.gift-items {
  margin-top: 20px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.item-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
}

.item-icon img {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.item-amount {
  font-size: 12px;
  color: #666;
}

.claim-section {
  margin-top: 24px;
  text-align: center;
}

.claim-btn {
  background: #409EFF;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.claim-btn:hover {
  background: #66b1ff;
}

.confirm-dialog {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  margin-top: 16px;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.confirm-btn, .cancel-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.confirm-btn {
  background: #67c23a;
  color: white;
}

.confirm-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.cancel-btn {
  background: #909399;
  color: white;
}

.claim-result {
  margin-top: 24px;
  text-align: center;
  padding: 20px;
  border-radius: 4px;
}

.success-result {
  background: #f0f9eb;
}

.error-result {
  background: #fef0f0;
}

.success-icon, .error-icon {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.success-icon {
  color: #67c23a;
}

.error-icon {
  color: #f56c6c;
}
</style> 