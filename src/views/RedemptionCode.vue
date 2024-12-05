<template>
  <div class="redemption-code">
    <div class="header">
      <h2>礼包兑换</h2>
      <button 
        class="scan-btn" 
        @click="startScan"
        :disabled="verifying"
      >
        <i class="scan-icon"></i>
        <span class="scan-text">扫码输入</span>
      </button>
    </div>
    <p class="current-tip">提示： ABCD1234EFGH5678 为正确的验证码
    </p>
    <p class="current-tip">提示： AAAA1111BBBB2222 为已使用的验证码</p>

    <div class="code-input-container" :class="{ 'disabled': verifying }">
      <div class="input-wrapper">
        <div v-for="(_, index) in 4" :key="`group-${index}`" class="input-group">
          <input
            type="text"
            maxlength="4"
            pattern="[A-Za-z0-9]*"
            autocomplete="off"
            spellcheck="false"
            v-model="codeSegments[index]"
            @input="handleInput($event, index)"
            @keydown="handleKeydown($event, index)"
            @paste="handlePaste"
            ref="codeInputs"
            class="code-input"
            :disabled="verifying"
            placeholder="****"
          />
          <span v-if="index < 3" class="separator">-</span>
        </div>
        <button 
          v-if="hasInput" 
          class="clear-btn" 
          @click="clearAll"
          :disabled="verifying"
        >
          <span class="clear-icon">×</span>
        </button>
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
                  <span class="item-amount">{{ item.amount }}</span>
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
          <div v-if="redeemResult.success" class="success-animation">
            <div class="success-icon">
              <div class="success-icon-circle"></div>
              <div class="success-icon-line"></div>
            </div>
            <p class="success-text">礼包已发放到您的账户</p>
            <p class="order-info">订单号：{{ redeemResult.result.orderNo }}</p>
            <p class="time-info">领取时间：{{ formatDate(redeemResult.result.redeemTime) }}</p>
          </div>
          <div v-else>
            <p class="error-text">{{ redeemResult.error.message }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <div class="modal-actions">
            <button 
              v-if="redeemResult.success" 
              class="clear-input-btn" 
              @click="clearAndClose"
            >
              清除并继续
            </button>
            <button 
              class="confirm-btn" 
              @click="closeModal"
            >
              {{ redeemResult.success ? '关闭' : '确定' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <redemption-history ref="history" @clear="handleHistoryClear" />

    <div class="scan-modal" v-if="showScanner" @click="closeScanner">
      <div class="scan-content" @click.stop>
        <div class="scan-header">
          <h3>扫描兑换码</h3>
          <button class="close-btn" @click="closeScanner">×</button>
        </div>
        <div class="scan-area">
          <video 
            ref="video" 
            class="scan-video"
            :class="{ 'scanning': isScanning }"
          ></video>
          <canvas ref="canvas" style="display: none;"></canvas>
          <div class="scan-overlay">
            <div class="scan-frame"></div>
          </div>
        </div>
        <div class="scan-tip">
          将兑换码对准扫描框
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { verifyCode, redeemGift } from '@/api/redemption'
import RedemptionHistory from '@/components/common/RedemptionHistory.vue'
import jsQR from 'jsqr'

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
      redeemResult: null,
      showScanner: false,
      isScanning: false,
      stream: null
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
    },
    hasInput() {
      return this.codeSegments.some(segment => segment.length > 0)
    }
  },
  methods: {
    handleInput (event, index) {
      const value = event.target.value
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
      
      this.$nextTick(() => {
        this.codeSegments[index] = value
        event.target.value = value
      })

      if (value.length === 4 && index < 3) {
        this.$refs.codeInputs[index + 1].focus()
      }

      if (this.fullCode.length === 16) {
        this.verify()
      }
    },

    handleKeydown (event, index) {
      if (event.key === ' ') {
        event.preventDefault()
        return
      }

      if (event.key === 'Backspace' && !this.codeSegments[index] && index > 0) {
        this.$refs.codeInputs[index - 1].focus()
      }
    },

    handlePaste (event) {
      event.preventDefault()
      const pastedText = event.clipboardData.getData('text')
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
      
      if (pastedText.length > 0) {
        for (let i = 0; i < 4; i++) {
          this.codeSegments[i] = pastedText.substr(i * 4, 4)
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
    },

    clearAndClose() {
      this.resetForm()
      this.closeModal()
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
      
      const historyRecord = {
        ...record,
        giftName: this.verifyResult.giftInfo.name,
        redeemTime: new Date().toISOString(),
        status: '领取成功',
        orderNo: record.orderNo,
        items: this.verifyResult.giftInfo.items.map(item => ({
          name: item.name,
          amount: item.amount
        }))
      }
      
      records.unshift(historyRecord)
      
      records = records.slice(0, 5)
      
      localStorage.setItem('redemptionHistory', JSON.stringify(records))
      
      this.$refs.history.loadHistory()
    },

    handleHistoryClear() {
      console.log('历史记录已清除')
    },

    clearAll() {
      this.codeSegments = ['', '', '', '']
      this.verifyResult = null
      this.$refs.codeInputs[0].focus()
    },

    async startScan() {
      this.showScanner = true
      this.$nextTick(async () => {
        try {
          const constraints = {
            video: {
              facingMode: 'environment'
            }
          }
          this.stream = await navigator.mediaDevices.getUserMedia(constraints)
          this.$refs.video.srcObject = this.stream
          this.$refs.video.play()
          this.isScanning = true
          this.scanCode()
        } catch (error) {
          console.error('Camera error:', error)
          alert('无法访问摄像头，请确保已授予摄像头权限')
          this.closeScanner()
        }
      })
    },

    closeScanner() {
      this.showScanner = false
      this.isScanning = false
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }
    },

    scanCode() {
      if (!this.isScanning) return

      const video = this.$refs.video
      const canvas = this.$refs.canvas
      const context = canvas.getContext('2d')

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight
        canvas.width = video.videoWidth
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          // 检查是否符合兑换码格式（16位字母数字）
          const validCode = /^[A-Za-z0-9]{16}$/.test(code.data)
          if (validCode) {
            this.closeScanner()
            // 将扫描到的码填入输入框
            for (let i = 0; i < 4; i++) {
              this.codeSegments[i] = code.data.substr(i * 4, 4).toUpperCase()
            }
            this.verify()
          }
        }
      }

      if (this.isScanning) {
        requestAnimationFrame(() => this.scanCode())
      }
    }
  }
}
</script>

<style scoped>
.redemption-code {
  max-width: 600px;
  margin: 0 auto;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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
  border: 2px solid var(--theme-border);
  border-radius: 8px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
  background-color: var(--theme-bg);
  color: var(--theme-text);
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
  border-radius: 25px;
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
  text-align: left;
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

/* 取成功动画 */
.success-animation {
  position: relative;
  padding: 20px 0;
}

.success-icon {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
}

.success-icon-circle {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 3px solid #67c23a;
  border-radius: 50%;
  animation: circle-animation 0.3s ease-in;
}

.success-icon-line {
  position: absolute;
  top: 28px;
  left: 16px;
  width: 28px;
  height: 14px;
  border-bottom: 3px solid #67c23a;
  border-left: 3px solid #67c23a;
  transform: rotate(-45deg);
  animation: line-animation 0.15s ease-in 0.3s forwards;
  opacity: 0;
}

@keyframes circle-animation {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes line-animation {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式布局优化 */
@media screen and (max-width: 768px) {
  .redemption-code {
    padding: 10px;
  }

  .code-input {
    width: 60px;
    height: 40px;
    font-size: 20px;
  }

  .separator {
    margin: 0 5px;
    font-size: 20px;
  }

  .modal-content {
    width: 95%;
    padding: 15px;
  }

  .clear-btn {
    right: -35px;
    width: 25px;
    height: 25px;
  }

  .clear-icon {
    font-size: 16px;
  }
}

@media screen and (max-width: 480px) {
  .code-input {
    width: 50px;
    height: 35px;
    font-size: 18px;
  }

  .gift-items {
    grid-template-columns: 1fr;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .history-status {
    align-self: flex-end;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.clear-btn {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: var(--theme-border);
  color: var(--theme-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
}

.clear-btn:hover {
  background: #f56c6c;
  color: white;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-icon {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

.scan-btn {
  width: auto;
  height: 32px;
  border: none;
  border-radius: 16px;
  background: var(--theme-border);
  color: var(--theme-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0 12px;
  font-size: 14px;
  background: #4b6682;
  color: white;
}

.scan-icon::before {
  content: '📷';
  font-size: 16px;
  margin-right: 4px;
}

.scan-text {
  font-size: 14px;
}

.scan-btn:hover {
  background: #66b1ff;
  color: white;
}

.scan-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #a0cfff;
}

.scan-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.scan-content {
  width: 90%;
  max-width: 400px;
  background: var(--theme-bg);
  border-radius: 8px;
  overflow: hidden;
}

.scan-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--theme-border);
}

.scan-header h3 {
  margin: 0;
  color: var(--theme-text);
}

.close-btn {
  border: none;
  background: none;
  font-size: 24px;
  color: var(--theme-text);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-area {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  background: #000;
  overflow: hidden;
}

.scan-video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-frame {
  width: 70%;
  height: 70%;
  border: 2px solid #fff;
  border-radius: 8px;
  position: relative;
}

.scan-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #409EFF;
  animation: scanning 2s linear infinite;
}

@keyframes scanning {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}

.scan-tip {
  padding: 15px;
  text-align: center;
  color: var(--theme-text);
}

@media screen and (max-width: 768px) {
  .scan-btn {
    height: 28px;
    padding: 0 10px;
    font-size: 12px;
  }

  .scan-icon::before {
    font-size: 14px;
  }
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.clear-input-btn {
  background: #67c23a;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.clear-input-btn:hover {
  background: #85ce61;
}

.confirm-btn {
  min-width: 80px;
}

@media screen and (max-width: 480px) {
  .modal-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }
  
  .clear-input-btn,
  .confirm-btn {
    width: 100%;
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
.current-tip{
    font-size: 12px;
    color: #909399;
    margin: 0;
    padding: 0;
}
</style> 