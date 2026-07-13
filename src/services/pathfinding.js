/**
 * 浏览器端最短路径：Dijkstra / A*
 * 与后端 Java 算法逻辑对齐（无向路网）
 */

function buildGraph(nodes, edges) {
  const nodeMap = new Map()
  const adj = new Map()
  nodes.forEach(n => {
    nodeMap.set(n.id, n)
    adj.set(n.id, [])
  })
  edges.forEach(e => {
    if (e.walkable === 0) return
    const overpass = e.isOverpass === 1
    if (!adj.has(e.fromNodeId)) adj.set(e.fromNodeId, [])
    if (!adj.has(e.toNodeId)) adj.set(e.toNodeId, [])
    adj.get(e.fromNodeId).push({ to: e.toNodeId, distance: e.distance, overpass })
    adj.get(e.toNodeId).push({ to: e.fromNodeId, distance: e.distance, overpass })
  })
  return { nodeMap, adj }
}

function rebuildPath(predecessor, startId, endId) {
  if (predecessor.get(endId) === undefined && startId !== endId) return []
  if (predecessor.get(endId) === -1 && startId !== endId) return []
  const path = []
  let current = endId
  while (current !== undefined && current !== -1) {
    path.push(current)
    if (current === startId) break
    current = predecessor.get(current)
  }
  if (!path.length || path[path.length - 1] !== startId) return []
  return path.reverse()
}

function dijkstra(graph, startId, endId) {
  const t0 = performance.now()
  const dist = new Map()
  const predecessor = new Map()
  const visited = new Set()
  graph.nodeMap.forEach((_, id) => {
    dist.set(id, Infinity)
    predecessor.set(id, -1)
  })
  dist.set(startId, 0)
  const pq = [[0, startId]]
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0])
    const [du, u] = pq.shift()
    if (visited.has(u)) continue
    visited.add(u)
    if (u === endId) break
    const neighbors = graph.adj.get(u) || []
    for (const edge of neighbors) {
      const alt = du + edge.distance
      if (alt < dist.get(edge.to)) {
        dist.set(edge.to, alt)
        predecessor.set(edge.to, u)
        pq.push([alt, edge.to])
      }
    }
  }
  const path = rebuildPath(predecessor, startId, endId)
  return {
    algorithm: 'DIJKSTRA',
    pathNodeIds: path,
    totalDistance: path.length ? dist.get(endId) : 0,
    computeTimeMs: Math.max(0, Math.round(performance.now() - t0)),
    reachable: path.length > 0
  }
}

function euclidean(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function astar(graph, startId, endId) {
  const t0 = performance.now()
  const endNode = graph.nodeMap.get(endId)
  const gScore = new Map()
  const predecessor = new Map()
  const closed = new Set()
  graph.nodeMap.forEach((_, id) => {
    gScore.set(id, Infinity)
    predecessor.set(id, -1)
  })
  gScore.set(startId, 0)
  const startNode = graph.nodeMap.get(startId)
  const open = [[euclidean(startNode, endNode), startId]]
  while (open.length) {
    open.sort((a, b) => a[0] - b[0])
    const [, u] = open.shift()
    if (closed.has(u)) continue
    closed.add(u)
    if (u === endId) break
    const uNode = graph.nodeMap.get(u)
    for (const edge of graph.adj.get(u) || []) {
      if (closed.has(edge.to)) continue
      const tentative = gScore.get(u) + edge.distance
      if (tentative < gScore.get(edge.to)) {
        gScore.set(edge.to, tentative)
        predecessor.set(edge.to, u)
        const vNode = graph.nodeMap.get(edge.to)
        open.push([tentative + euclidean(vNode, endNode), edge.to])
      }
    }
  }
  const path = rebuildPath(predecessor, startId, endId)
  return {
    algorithm: 'ASTAR',
    pathNodeIds: path,
    totalDistance: path.length ? gScore.get(endId) : 0,
    computeTimeMs: Math.max(0, Math.round(performance.now() - t0)),
    reachable: path.length > 0
  }
}

function buildSegments(path, edges) {
  const segments = []
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i]
    const to = path[i + 1]
    let overpass = false
    for (const e of edges) {
      if ((e.fromNodeId === from && e.toNodeId === to) || (e.fromNodeId === to && e.toNodeId === from)) {
        overpass = e.isOverpass === 1
        break
      }
    }
    segments.push({ fromNodeId: from, toNodeId: to, overpass })
  }
  return segments
}

export function findPath(nodes, edges, startNodeId, endNodeId, algorithm) {
  const graph = buildGraph(nodes, edges)
  const raw = algorithm === 'ASTAR'
    ? astar(graph, startNodeId, endNodeId)
    : dijkstra(graph, startNodeId, endNodeId)
  if (!raw.reachable) {
    throw new Error('无法规划路径，请检查路网连接')
  }
  const pathNodes = raw.pathNodeIds.map(id => graph.nodeMap.get(id)).filter(Boolean)
  return {
    algorithm: raw.algorithm,
    totalDistance: Math.round(raw.totalDistance * 10) / 10,
    computeTimeMs: raw.computeTimeMs,
    pathNodeIds: raw.pathNodeIds,
    pathNodes,
    segments: buildSegments(raw.pathNodeIds, edges),
    walkMinutes: Math.ceil(raw.totalDistance / 80)
  }
}
