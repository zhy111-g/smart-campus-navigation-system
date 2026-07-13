/**
 * 从原项目 data.sql 生成纯前端 campus-data.json
 * 仅供 campus-navigator-pages 使用，不修改原项目
 */
const fs = require('fs')
const path = require('path')

const sqlPath = path.join(__dirname, '..', '..', 'campus-navigator', 'backend', 'src', 'main', 'resources', 'data.sql')
const outPath = path.join(__dirname, '..', 'public', 'data', 'campus-data.json')

if (!fs.existsSync(sqlPath)) {
  // 云端构建（EdgeOne/GitHub Actions）仓库内无原后端 SQL，沿用已提交的 JSON
  if (fs.existsSync(outPath)) {
    console.log('SKIP convert-data: no data.sql, keep existing campus-data.json')
    process.exit(0)
  }
  console.error('ERROR: missing data.sql and campus-data.json')
  process.exit(1)
}

const text = fs.readFileSync(sqlPath, 'utf8')

const campuses = [
  { id: 1, name: '迎泽校区', mapWidth: 1000, mapHeight: 1000, jinyangY: null },
  { id: 2, name: '坞城校区', mapWidth: 1000, mapHeight: 1000, jinyangY: 620 }
]

const nodes = []
const nodeRe = /\((\d+),\s*(\d+),\s*'([^']+)',\s*([\d.]+),\s*([\d.]+),\s*'([^']+)'\)/g
let m
while ((m = nodeRe.exec(text))) {
  if (['GATE', 'JUNCTION', 'BUILDING', 'OVERPASS'].includes(m[6])) {
    nodes.push({
      id: +m[1],
      campusId: +m[2],
      name: m[3],
      x: +m[4],
      y: +m[5],
      type: m[6]
    })
  }
}

const edges = []
const edgeRe = /\((\d+),(\d+),(\d+),([\d.]+),(\d+),(\d+)\)/g
while ((m = edgeRe.exec(text))) {
  edges.push({
    campusId: +m[1],
    fromNodeId: +m[2],
    toNodeId: +m[3],
    distance: +m[4],
    walkable: +m[5],
    isOverpass: +m[6]
  })
}

const pois = []
let poiId = 1
const poiRe = /\((\d+),'([^']+)','([^']+)',(\d+),'([^']*)'\)/g
while ((m = poiRe.exec(text))) {
  const campusId = +m[1]
  const category = m[3]
  if ((campusId === 1 || campusId === 2) && category !== 'ADMIN' && category !== 'STUDENT') {
    pois.push({
      id: poiId++,
      campusId,
      name: m[2],
      category,
      nodeId: +m[4],
      description: m[5]
    })
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify({ campuses, nodes, edges, pois }, null, 2), 'utf8')
console.log('OK', { campuses: campuses.length, nodes: nodes.length, edges: edges.length, pois: pois.length })
