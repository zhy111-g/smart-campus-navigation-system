/**
 * 解析 public 目录资源地址，避免 GitHub Pages 无尾斜杠时相对路径跑到站点根目录。
 */
export function publicUrl(path) {
  const clean = String(path || '').replace(/^\//, '')
  const base = process.env.BASE_URL || '/'
  if (typeof window === 'undefined') {
    return base + clean
  }
  try {
    // 以「当前目录」为基准：保证 .../repo 与 .../repo/ 都能解析到仓库目录下
    const page = window.location.href.split('#')[0]
    const dir = page.endsWith('/') ? page : page.replace(/\/[^/]*$/, '/')
    if (base === './' || base === '.' || base === '') {
      return new URL(clean, dir).href
    }
    return new URL(base + clean, window.location.origin).href
  } catch (e) {
    return base + clean
  }
}
