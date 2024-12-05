<template>
  <div class="redemption-code">
    <h2>礼包兑换</h2>
    <div class="verify-status" v-if="verifying">
      <div class="loading-spinner"></div>
      <span>正在验证...</span>
    </div>

    <div class="code-input-container" :class="{ 'disabled': verifying }">
      <div v-for="(_, index) in 4" :key="`group-${index}`" class="input-group">
        <input
          type="text"
          maxlength="4"
          v-model="codeSegments[index]"
          @input="handleInput($event, index)"
          @keydown="handleKeydown($event, index)"
          @paste="handlePaste"
          ref="codeInputs"
          class="code-input"
          :disabled="verifying"
        />
        <span v-if="index < 3" class="separator">-</span>
      </div>
    </div>

    <div class="result-container" v-if="verifyResult">
      <div :class="getResultClass">
        <div class="result-icon">
          <i :class="getIconClass"></i>
        </div>
        <div class="result-content">
          <h3>{{ getResultTitle }}</h3>
          <p class="result-message">{{ verifyResult.message }}</p>
          <p class="result-code">兑换码：{{ verifyResult.code }}</p>
          <p class="result-time">验证时间：{{ formatDate(verifyResult.verifyTime) }}</p>
          <div v-if="verifyResult.success && verifyResult.giftInfo" class="gift-content">
            <h4 class="gift-title">{{ verifyResult.giftInfo.name }}</h4>
            <p class="gift-desc">{{ verifyResult.giftInfo.description }}</p>
            <div class="gift-items">
              <div v-for="item in verifyResult.giftInfo.items" 
                   :key="item.id" 
                   class="gift-item">
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
        </div>
        <div class="result-actions" v-if="verifyResult.success">
          <button 
            class="next-btn" 
            @click="handleRedeem" 
            :disabled="redeeming"
          >
            {{ redeeming ? '领取中...' : '立即领取' }}
          </button>
        </div>
        <div class="result-actions" v-else>
          <button class="retry-btn" @click="resetForm">重新输入</button>
        </div>
      </div>
    </div>

    <div class="modal" v-if="redeemResult" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ redeemResult.success ? '领取成功' : '领取失败' }}</h3>
        </div>
        <div class="modal-body">
          <div v-if="redeemResult.success">
            <p class="success-text">礼包已发放到您的账户</p>
            <p class="order-info">订单号：{{ redeemResult.result.orderNo }}</p>
            <p class="time-info">领取时间：{{ formatDate(redeemResult.result.redeemTime) }}</p>
          </div>
          <div v-else>
            <p class="error-text">{{ redeemResult.error.message }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="closeModal">确定</button>
        </div>
      </div>
    </div>

    <redemption-history ref="history" @clear="handleHistoryClear" />
  </div>
</template>

<script>
import { verifyCode, redeemGift } from '@/api/redemption'
import RedemptionHistory from '@/components/common/RedemptionHistory.vue'

export default {
  name: 'RedemptionCode',
  components: {
    RedemptionHistory
  },
  data () {
    return {
      codeSegments: ['', '', '', ''],
      verifyResult: null,
      verifying: false,
      redeeming: false,
      redeemResult: null
    }
  },
  computed: {
    fullCode () {
      return this.codeSegments.join('')
    },
    getResultClass () {
      const status = this.verifyResult && this.verifyResult.status ? this.verifyResult.status : 'INVALID'
      return {
        'result-box': true,
        'success-result': status === 'VALID',
        'used-result': status === 'USED',
        'error-result': status === 'INVALID'
      }
    },
    getIconClass () {
      const status = this.verifyResult && this.verifyResult.status ? this.verifyResult.status : 'INVALID'
      return {
        'result-icon': true,
        'success-icon': status === 'VALID',
        'used-icon': status === 'USED',
        'error-icon': status === 'INVALID'
      }
    },
    getResultTitle () {
      const status = this.verifyResult && this.verifyResult.status ? this.verifyResult.status : null
      switch (status) {
        case 'VALID':
          return '验证成功'
        case 'USED':
          return '已被使用'
        default:
          return '验证失败'
      }
    }
  },
  methods: {
    handleInput (event, index) {
      const value = event.target.value.toUpperCase()
      this.codeSegments[index] = value

      if (value.length === 4 && index < 3) {
        this.$refs.codeInputs[index + 1].focus()
      }

      if (this.fullCode.length === 16) {
        this.verify()
      }
    },

    handleKeydown (event, index) {
      if (event.key === 'Backspace' && !this.codeSegments[index] && index > 0) {
        this.$refs.codeInputs[index - 1].focus()
      }
    },

    handlePaste (event) {
      event.preventDefault()
      const pastedText = event.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '')
      
      if (pastedText.length > 0) {
        for (let i = 0; i < 4; i++) {
          this.codeSegments[i] = pastedText.substr(i * 4, 4).toUpperCase()
        }

        if (this.fullCode.length === 16) {
          this.verify()
        }
      }
    },

    async verify () {
      this.verifying = true
      try {
        const response = await verifyCode({ code: this.fullCode })
        this.verifyResult = response
      } catch (error) {
        this.verifyResult = {
          success: false,
          message: '验证失败，请稍后重试',
          status: 'INVALID',
          code: this.fullCode,
          verifyTime: new Date().toISOString()
        }
      } finally {
        this.verifying = false
      }
    },

    resetForm () {
      this.codeSegments = ['', '', '', '']
      this.verifyResult = null
      this.$refs.codeInputs[0].focus()
    },

    async handleRedeem () {
      if (this.redeeming) return
      
      this.redeeming = true
      try {
        const response = await redeemGift({
          code: this.verifyResult.code,
          giftId: this.verifyResult.giftInfo.id
        })
        this.redeemResult = response
        
        if (response.success) {
          this.saveRedemptionHistory({
            orderNo: response.result.orderNo,
            redeemTime: response.result.redeemTime,
            giftName: this.verifyResult.giftInfo.name,
            status: '领取成功'
          })
        }
      } catch (error) {
        this.redeemResult = {
          success: false,
          error: {
            code: 500,
            message: error.message || '领取失败，请稍后重试'
          }
        }
      } finally {
        this.redeeming = false
      }
    },

    closeModal () {
      this.redeemResult = null
      if (this.redeemResult && this.redeemResult.success) {
        this.resetForm()
      }
    },

    formatDate (dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    saveRedemptionHistory(record) {
      const history = localStorage.getItem('redemptionHistory')
      let records = history ? JSON.parse(history) : []
      
      records.unshift(record)
      
      records = records.slice(0, 5)
      
      localStorage.setItem('redemptionHistory', JSON.stringify(records))
      
      this.$refs.history.loadHistory()
    },

    handleHistoryClear() {
      console.log('历史记录已清除')
    }
  }
}
</script>

<style scoped>
.redemption-code {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.verify-status {
  text-align: center;
  margin: 20px 0;
  color: #409EFF;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #409EFF;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.code-input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
}

.code-input-container.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.input-group {
  display: flex;
  align-items: center;
}

.code-input {
  width: 80px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 8px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
}

.code-input:focus {
  border-color: #409EFF;
  outline: none;
}

.code-input:disabled {
  background-color: #f5f7fa;
}

.separator {
  margin: 0 10px;
  font-size: 24px;
  color: #666;
}

.result-container {
  margin-top: 20px;
}

.result-box {
  padding: 24px;
  border-radius: 8px;
  text-align: center;
}

.success-result {
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.used-result {
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
}

.error-result {
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-icon {
  color: #67c23a;
}

.used-icon {
  color: #e6a23c;
}

.error-icon {
  color: #f56c6c;
}

.result-content {
  margin-bottom: 20px;
}

.result-message {
  color: #666;
  margin: 8px 0;
}

.result-code {
  color: #409EFF;
  font-family: monospace;
  margin: 8px 0;
}

.result-time {
  color: #999;
  font-size: 14px;
}

.result-actions {
  margin-top: 20px;
}

.next-btn, .retry-btn {
  padding: 12px 24px;
  border-radius: 4px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.next-btn {
  background-color: #409EFF;
  color: white;
}

.next-btn:hover {
  background-color: #66b1ff;
}

.retry-btn {
  background-color: #909399;
  color: white;
}

.retry-btn:hover {
  background-color: #a6a9ad;
}

.gift-content {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e1f3d8;
}

.gift-title {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.gift-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.gift-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.gift-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.gift-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.item-icon {
  width: 48px;
  height: 48px;
  margin-right: 12px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: -webkit-optimize-contrast;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
  font-weight: 500;
}

.item-amount {
  font-size: 12px;
  color: #f56c6c;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.item-amount::before {
  content: '×';
  margin-right: 2px;
  font-weight: normal;
  color: #909399;
}

@media screen and (max-width: 480px) {
  .gift-items {
    grid-template-columns: 1fr;
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-body {
  text-align: center;
  margin-bottom: 24px;
}

.success-text {
  color: #67c23a;
  font-size: 16px;
  margin-bottom: 16px;
}

.error-text {
  color: #f56c6c;
  font-size: 16px;
}

.order-info,
.time-info {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
}

.modal-footer {
  text-align: center;
}

.confirm-btn {
  background: #409EFF;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn:hover {
  background: #66b1ff;
}

.next-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style> 