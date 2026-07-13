/**
 * 纯前端数据与路径服务（替代原 Spring Boot API）
 */
import { findPath } from './pathfinding'

const HISTORY_KEY = 'campus-nav-history-v1'
let cache = null

async function loadData() {
  if (cache) return cache
  const base = process.env.BASE_URL || '/'
  const res = await fetch(`${base}data/campus-data.json`)
  if (!res.ok) throw new Error('加载校区数据失败')
  cache = await res.json()
  return cache
}

function ok(data) {
  return Promise.resolve({ code: '200', msg: '成功', data })
}

function fail(msg) {
  return Promise.resolve({ code: '500', msg, data: null })
}

export async function listCampuses() {
  const data = await loadData()
  return ok(data.campuses)
}

export async function getMapData(campusId) {
  const data = await loadData()
  const id = Number(campusId)
  return ok({
    nodes: data.nodes.filter(n => n.campusId === id),
    edges: data.edges.filter(e => e.campusId === id),
    pois: data.pois.filter(p => p.campusId === id)
  })
}

export async function planPath(body) {
  try {
    const data = await loadData()
    const campusId = Number(body.campusId)
    const startPoi = data.pois.find(p => p.id === body.startPoiId)
    const endPoi = data.pois.find(p => p.id === body.endPoiId)
    if (!startPoi || !endPoi) return fail('起点或终点不存在')
    if (startPoi.campusId !== campusId || endPoi.campusId !== campusId) {
      return fail('起点和终点必须在同一校区')
    }
    const nodes = data.nodes.filter(n => n.campusId === campusId)
    const edges = data.edges.filter(e => e.campusId === campusId)
    const result = findPath(nodes, edges, startPoi.nodeId, endPoi.nodeId, body.algorithm || 'DIJKSTRA')
    const payload = {
      ...result,
      startPoi,
      endPoi
    }
    saveHistory({
      userId: 1,
      campusId,
      startPoiId: startPoi.id,
      endPoiId: endPoi.id,
      startName: startPoi.name,
      endName: endPoi.name,
      algorithm: payload.algorithm,
      totalDistance: payload.totalDistance,
      computeTimeMs: payload.computeTimeMs,
      pathNodes: JSON.stringify(payload.pathNodeIds),
      createTime: formatNow()
    })
    return ok(payload)
  } catch (e) {
    return fail(e.message || '规划失败')
  }
}

export async function getHistory() {
  const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  return ok(list)
}

function saveHistory(item) {
  const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  list.unshift(item)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)))
}

function formatNow() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
