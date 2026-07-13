/**
 * 山西财经大学视觉规范
 * 校徽：官方圆形徽志（布币造型 + 1951），标准色中国红
 * 参考：https://www.sxufe.edu.cn/gywm/xxgk/xxbs.htm
 */
export const SXUFE = {
  red: '#B31B1B',
  redDark: '#8E1414',
  redLight: '#C92525',
  text: '#2C1810',
  textMuted: '#6B5B54'
}

/** 地点类别 — 柔和配色，贴近校园平面图 */
export const CATEGORY = {
  '出入口': { color: '#C27803', bg: '#FFF4E0', label: '出入口' },
  '教学':   { color: '#2B6CB0', bg: '#E8F1FB', label: '教学' },
  '宿舍':   { color: '#2F855A', bg: '#E6F6EE', label: '宿舍' },
  '餐饮':   { color: '#C53030', bg: '#FDECEC', label: '餐饮' },
  '运动':   { color: '#6B46C1', bg: '#F0EAFB', label: '运动' },
  '服务':   { color: '#4A5568', bg: '#EEF1F4', label: '服务' },
  '交通':   { color: '#B7791F', bg: '#FFF8E8', label: '交通' },
  '办公':   { color: '#2C7A7B', bg: '#E6FFFB', label: '办公' }
}

export function getCategory(cat) {
  return CATEGORY[cat] || CATEGORY['服务']
}
