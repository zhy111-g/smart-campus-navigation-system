const { defineConfig } = require('@vue/cli-service')

// GitHub Pages 部署时设置环境变量：
//   set PUBLIC_PATH=/你的仓库名/
// 本地开发保持默认 ./
const publicPath = process.env.PUBLIC_PATH || './'

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath,
  productionSourceMap: false,
  devServer: {
    host: '0.0.0.0',
    port: 8088,
    historyApiFallback: true,
    allowedHosts: 'all'
  }
})
