const { defineConfig } = require('@vue/cli-service')

// 默认挂在站点根路径（EdgeOne / Cloudflare / 本地均适用）
 // GitHub Pages 项目站构建时设置：PUBLIC_PATH=/smart-campus-navigation-system/
const isServe = process.argv.some(a => a === 'serve')
const publicPath = process.env.PUBLIC_PATH || '/'

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: isServe ? '/' : publicPath,
  productionSourceMap: false,
  devServer: {
    host: '0.0.0.0',
    port: 8088,
    historyApiFallback: true,
    allowedHosts: 'all'
  }
})
