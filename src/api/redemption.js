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
                icon: 'https://platform-ik.g123.jp/image-converter/h5-g123/game/seirei/20210406020648/icon.gif?format=avif&tr=dpr-2%2Ch-100%2Cq-75%2Cw-100',
                amount: 10000
              },
              {
                id: '2',
                name: '钻石',
                icon: 'https://platform-ik.g123.jp/image-converter/h5-g123/game/queensblade/20241108033116/en/icon.gif?format=avif&tr=dpr-2%2Ch-100%2Cq-75%2Cw-100',
                amount: 100
              },
              {
                id: '3',
                name: '体力药水',
                icon: 'https://platform-ik.g123.jp/image-converter/h5-g123/game/kumo/20241017090958/en/icon.gif?format=avif&tr=dpr-2%2Ch-100%2Cq-75%2Cw-100',
                amount: 5
              },
              {
                id: '4',
                name: '经验加速卡',
                icon: 'https://platform-ik.g123.jp/image-converter/h5-g123/game/monmusu/20240411100853/en/icon.gif?format=avif&tr=dpr-2%2Ch-100%2Cq-75%2Cw-100',
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