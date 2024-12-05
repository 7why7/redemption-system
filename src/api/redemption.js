import request from '@/utils/request'

export function verifyCode(data) {
  // 模拟接口验证
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.code === 'ABCD1234EFGH5678') {
        resolve({
          success: true,
          message: '验证成功',
          code: data.code,
          status: 'VALID',
          verifyTime: new Date().toISOString(),
          giftInfo: {
            name: '新手特权礼包',
            description: '包含游戏初期所需的各种道具',
            items: [
              {
                id: '1',
                name: '金币',
                icon: 'https://s1.aigei.com/src/img/png/4b/4b497c78d7d24e92a18d0390e86f1919.png?e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:RiRw3TLwmsfYKU2o9He-2Hro-Zs=',
                amount: 10000
              },
              {
                id: '2',
                name: '钻石',
                icon: 'https://s1.aigei.com/src/img/png/5c/5ce02db0583640a08453248b36888d24.png?e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:oyu3gZz_QW1tLA7sbZpl4S8w64I=',
                amount: 100
              },
              {
                id: '3',
                name: '体力药水',
                icon: 'https://s1.aigei.com/src/img/png/31/3170d65a6b3d4eb79e18c9b279d97605.png?e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:CDT8nCEvrF1NowI6CK9w51npIew=',
                amount: 5
              },
              {
                id: '4',
                name: '经验加速卡',
                icon: 'https://s1.aigei.com/src/img/png/89/8995d9edb88f41418bf2c72fdb219c26.png?e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:Jlpx_ZdKDL7cehmQUyaFBoHDUEE=',
                amount: 3
              }
            ]
          }
        })
      } else if (data.code === 'AAAA1111BBBB2222') {
        resolve({
          success: false,
          message: '该兑换码已被使用',
          code: data.code,
          status: 'USED',
          verifyTime: new Date().toISOString()
        })
      } else {
        resolve({
          success: false,
          message: '无效的兑换码',
          code: data.code,
          status: 'INVALID',
          verifyTime: new Date().toISOString()
        })
      }
    }, 500)
  })
}

export function redeemGift(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() > 0.3) {
        resolve({
          success: true,
          result: {
            orderNo: 'ORDER' + Date.now(),
            redeemTime: new Date().toISOString()
          }
        })
      } else {
        resolve({
          success: false,
          error: {
            code: 500,
            message: '网络繁忙，请稍后重试'
          }
        })
      }
    }, 1000)
  })
} 