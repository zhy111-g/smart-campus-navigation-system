const { defineConfig } = require('@vue/cli-service')

// Default: site root (EdgeOne / Cloudflare / local).
// For GitHub project Pages only: PUBLIC_PATH=/smart-campus-navigation-system/
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
