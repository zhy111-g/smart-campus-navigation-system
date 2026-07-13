import axios from 'axios'

function resolveBaseURL() {
  const envUrl = process.env.VUE_APP_BASEURL
  if (envUrl && !/localhost|127\.0\.0\.1/i.test(envUrl)) {
    return envUrl
  }
  // 手机/其他电脑访问时，API 跟当前页面主机名走，避免写死 localhost
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `http://${host}:9091`
}

const request = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  responseType: 'json',
  responseEncoding: 'utf8'
})

request.interceptors.request.use(config => {
  config.headers['Content-Type'] = 'application/json;charset=UTF-8'
  config.headers['Accept'] = 'application/json;charset=UTF-8'
  return config
})

request.interceptors.response.use(response => {
  let res = response.data
  if (typeof res === 'string') {
    res = res ? JSON.parse(res) : res
  }
  return res
})

export default request
