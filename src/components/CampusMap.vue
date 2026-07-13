<template>
  <div class="map-wrap" @mousemove="onMove" @mouseleave="onLeave">
    <canvas
      ref="canvas"
      class="campus-canvas"
      @click="onClick"
    />
    <div
      v-if="hoverPoi"
      class="hover-tip"
      :style="{ left: tipX + 'px', top: tipY + 'px' }"
    >
      <span class="tip-dot" :style="{ background: tipColor }"></span>
      <div class="tip-body">
        <div class="tip-name">{{ hoverPoi.name }}</div>
        <div class="tip-cat">{{ hoverPoi.category }} · 点击设为起/终点</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCategory, SXUFE } from '@/utils/theme'

export default {
  name: 'CampusMap',
  props: {
    campusId: { type: Number, default: 1 },
    campusName: { type: String, default: '' },
    nodes: { type: Array, default: () => [] },
    edges: { type: Array, default: () => [] },
    pois: { type: Array, default: () => [] },
    pathNodeIds: { type: Array, default: () => [] },
    segments: { type: Array, default: () => [] },
    startNodeId: Number,
    endNodeId: Number,
    jinyangY: Number
  },
  data() {
    return {
      width: 1000,
      height: 1000,
      dpr: 1,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      viewW: 0,
      viewH: 0,
      hoverPoi: null,
      tipX: 0,
      tipY: 0,
      animOffset: 0,
      animId: null
    }
  },
  computed: {
    tipColor() {
      return this.hoverPoi ? getCategory(this.hoverPoi.category).color : SXUFE.red
    },
    hasPath() {
      return (this.segments || []).length > 0
    }
  },
  watch: {
    campusId: 'draw',
    nodes: { handler: 'draw', deep: true },
    edges: { handler: 'draw', deep: true },
    pois: { handler: 'draw', deep: true },
    pathNodeIds: { handler: 'draw', deep: true },
    segments: {
      handler() {
        this.draw()
        this.syncAnim()
      },
      deep: true
    },
    startNodeId: 'draw',
    endNodeId: 'draw'
  },
  mounted() {
    this.$nextTick(() => {
      this.resize()
      this.syncAnim()
    })
    window.addEventListener('resize', this.resize)
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.resize())
      this.$nextTick(() => {
        if (this.$el.parentElement) this._ro.observe(this.$el.parentElement)
      })
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    if (this._ro) this._ro.disconnect()
    this.stopAnim()
  },
  methods: {
    syncAnim() {
      if (this.hasPath) this.startAnim()
      else this.stopAnim()
    },
    startAnim() {
      if (this.animId) return
      const tick = () => {
        this.animOffset = (this.animOffset + 0.6) % 24
        this.draw()
        this.animId = requestAnimationFrame(tick)
      }
      this.animId = requestAnimationFrame(tick)
    },
    stopAnim() {
      if (this.animId) {
        cancelAnimationFrame(this.animId)
        this.animId = null
      }
    },

    resize() {
      const parent = this.$el.parentElement
      if (!parent) return
      const canvas = this.$refs.canvas
      const availW = Math.max(320, parent.clientWidth || 800)
      const availH = Math.max(320, parent.clientHeight || 800)
      this.dpr = Math.min(window.devicePixelRatio || 1, 2)

      // 画布铺满地图区
      this.viewW = availW
      this.viewH = availH
      canvas.style.width = availW + 'px'
      canvas.style.height = availH + 'px'
      canvas.width = Math.round(availW * this.dpr)
      canvas.height = Math.round(availH * this.dpr)
      this.$el.style.width = '100%'
      this.$el.style.height = '100%'
      this.$el.style.margin = '0'

      // 1:1 等比缩放，完整放入视野（不拉伸）
      const margin = 12
      this.scale = Math.min(
        (availW - margin * 2) / this.width,
        (availH - margin * 2) / this.height
      )
      this.offsetX = (availW - this.width * this.scale) / 2
      this.offsetY = (availH - this.height * this.scale) / 2
      this.draw()
    },

    // 地图坐标 → 屏幕坐标（统一比例，X/Y 相同）
    toCanvas(x, y) {
      return [this.offsetX + x * this.scale, this.offsetY + y * this.scale]
    },
    sx(v) { return v * this.scale },
    sy(v) { return v * this.scale },
    cssW() { return this.viewW },
    cssH() { return this.viewH },

    draw() {
      const canvas = this.$refs.canvas
      if (!canvas || !this.scale) return
      const ctx = canvas.getContext('2d')
      const w = this.viewW, h = this.viewH
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // 外侧衬底：柔和深灰，突出校园图面
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7)
      bg.addColorStop(0, '#3F3A36')
      bg.addColorStop(1, '#292524')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // 裁剪到地图内容区，保证比例正确
      const [x0, y0] = this.toCanvas(0, 0)
      const mw = this.sx(this.width)
      const mh = this.sy(this.height)
      ctx.save()
      this.roundRect(ctx, x0, y0, mw, mh, this.sx(8))
      ctx.clip()

      this.drawTerrain(ctx)
      this.drawZones(ctx)
      this.drawCampusBorder(ctx)
      if (this.jinyangY) this.drawJinyangStreet(ctx)
      this.drawRoads(ctx)
      this.drawTrees(ctx)
      this.drawBuildings(ctx)
      this.drawJunctions(ctx)
      this.drawPathOverlay(ctx)
      this.drawMarkers(ctx)
      ctx.restore()

      // 细边框
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1
      this.roundRect(ctx, x0, y0, mw, mh, this.sx(8))
      ctx.stroke()

      this.drawChrome(ctx, w, h)
    },

    drawTerrain(ctx) {
      const [x0, y0] = this.toCanvas(0, 0)
      const mw = this.sx(this.width)
      const mh = this.sy(this.height)

      // 草坪外环
      const grass = ctx.createLinearGradient(x0, y0, x0, y0 + mh)
      grass.addColorStop(0, '#C5D9A8')
      grass.addColorStop(0.5, '#B4CB96')
      grass.addColorStop(1, '#A3BE84')
      ctx.fillStyle = grass
      ctx.fillRect(x0, y0, mw, mh)

      // 轻微纹理
      ctx.save()
      ctx.strokeStyle = 'rgba(90, 120, 70, 0.07)'
      ctx.lineWidth = 1
      for (let i = 0; i < mw + mh; i += this.sx(22)) {
        ctx.beginPath()
        ctx.moveTo(x0 + i, y0)
        ctx.lineTo(x0 + i - mh, y0 + mh)
        ctx.stroke()
      }
      ctx.restore()

      // 校园铺装区
      const [ix, iy] = this.toCanvas(50, 50)
      const iw = this.sx(900), ih = this.sy(900)
      ctx.fillStyle = '#F3EEE4'
      this.roundRect(ctx, ix, iy, iw, ih, this.sx(12))
      ctx.fill()
      ctx.strokeStyle = 'rgba(160, 145, 120, 0.25)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 安静的绿化块（低对比）
      ctx.save()
      ctx.globalAlpha = 0.28
      ;[
        [140, 160, 100, 55], [700, 200, 110, 60], [200, 780, 120, 55],
        [760, 740, 90, 50], [450, 470, 80, 45]
      ].forEach(([px, py, pw, ph]) => {
        const [cx, cy] = this.toCanvas(px, py)
        ctx.fillStyle = '#8FB57A'
        this.roundRect(ctx, cx, cy, this.sx(pw), this.sy(ph), this.sx(14))
        ctx.fill()
      })
      ctx.restore()
    },

    drawZones(ctx) {
      const zones = this.campusId === 2
        ? [
          { x: 80, y: 50, w: 220, h: 280, color: 'rgba(143, 181, 122, 0.28)', label: '北区运动' },
          { x: 320, y: 40, w: 280, h: 140, color: 'rgba(43, 108, 176, 0.12)', label: '北区教学' },
          { x: 420, y: 300, w: 160, h: 280, color: 'rgba(47, 133, 90, 0.14)', label: '1-4号宿舍' },
          { x: 580, y: 160, w: 80, h: 320, color: 'rgba(47, 133, 90, 0.12)', label: '行字宿舍' },
          { x: 740, y: 120, w: 120, h: 260, color: 'rgba(47, 133, 90, 0.12)', label: '东区宿舍' },
          { x: 70, y: 660, w: 200, h: 240, color: 'rgba(47, 133, 90, 0.14)', label: '南区宿舍' },
          { x: 280, y: 850, w: 260, h: 120, color: 'rgba(43, 108, 176, 0.12)', label: '南区教学' },
          { x: 640, y: 680, w: 300, h: 280, color: 'rgba(143, 181, 122, 0.22)', label: '晋阳街公园' }
        ]
        : [
          { x: 60, y: 120, w: 240, h: 520, color: 'rgba(47, 133, 90, 0.14)', label: '宿舍区' },
          { x: 320, y: 360, w: 320, h: 360, color: 'rgba(43, 108, 176, 0.12)', label: '教学区' },
          { x: 780, y: 280, w: 180, h: 220, color: 'rgba(143, 181, 122, 0.28)', label: '运动区' },
          { x: 700, y: 80, w: 220, h: 140, color: 'rgba(197, 48, 48, 0.08)', label: '餐饮区' }
        ]

      ctx.save()
      zones.forEach(z => {
        const [x, y] = this.toCanvas(z.x, z.y)
        this.roundRect(ctx, x, y, this.sx(z.w), this.sy(z.h), this.sx(16))
        ctx.fillStyle = z.color
        ctx.fill()
        ctx.fillStyle = 'rgba(60, 55, 50, 0.35)'
        ctx.font = `500 ${this.fontPx(11)}px "Microsoft YaHei"`
        ctx.fillText(z.label, x + this.sx(12), y + this.sy(22))
      })
      ctx.restore()
    },

    drawCampusBorder(ctx) {
      const [x0, y0] = this.toCanvas(32, 32)
      const bw = this.sx(936), bh = this.sy(936)
      ctx.save()
      ctx.strokeStyle = 'rgba(179, 27, 27, 0.35)'
      ctx.lineWidth = 2
      ctx.setLineDash([this.sx(10), this.sx(6)])
      this.roundRect(ctx, x0, y0, bw, bh, this.sx(12))
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },

    drawJinyangStreet(ctx) {
      const [x0] = this.toCanvas(0, 0)
      const [, jy] = this.toCanvas(0, this.jinyangY)
      const streetW = this.sx(this.width)
      const streetH = this.sy(22)
      ctx.save()
      const sg = ctx.createLinearGradient(0, jy - streetH / 2, 0, jy + streetH / 2)
      sg.addColorStop(0, '#9CA3AF')
      sg.addColorStop(0.5, '#6B7280')
      sg.addColorStop(1, '#9CA3AF')
      ctx.fillStyle = sg
      ctx.fillRect(x0, jy - streetH / 2, streetW, streetH)

      ctx.fillStyle = '#4B5563'
      ctx.fillRect(x0, jy - streetH / 2, streetW, this.sy(2.5))
      ctx.fillRect(x0, jy + streetH / 2 - this.sy(2.5), streetW, this.sy(2.5))

      ctx.strokeStyle = 'rgba(255,255,255,0.85)'
      ctx.lineWidth = 1.2
      ctx.setLineDash([this.sx(16), this.sx(12)])
      ctx.beginPath()
      ctx.moveTo(x0, jy)
      ctx.lineTo(x0 + streetW, jy)
      ctx.stroke()
      ctx.setLineDash([])

      this.drawLabelChip(ctx, x0 + this.sx(18), jy - streetH / 2 - this.sy(22), '晋阳街（机动车道 · 禁止通行）', '#374151', false)
      this.drawOverpass(ctx, jy)
      ctx.restore()
    },

    drawOverpass(ctx, jy) {
      // 天桥位于颖萱餐厅左侧附近（节点约 x=380）
      const overpassNode = this.nodes.find(n => n.type === 'OVERPASS') ||
        this.nodes.find(n => /天桥/.test(n.name))
      const mapX = overpassNode ? overpassNode.x : 380
      const [bx] = this.toCanvas(mapX, 0)
      const bw = this.sx(64), bh = this.sy(34)
      ctx.save()
      ctx.fillStyle = '#9CA3AF'
      ctx.fillRect(bx - bw / 2 - this.sx(6), jy - bh / 2 - this.sy(8), bw + this.sx(12), this.sy(5))
      ctx.fillRect(bx - bw / 2 - this.sx(6), jy + bh / 2 + this.sy(3), bw + this.sx(12), this.sy(5))

      const g = ctx.createLinearGradient(bx - bw / 2, jy, bx + bw / 2, jy)
      g.addColorStop(0, '#D6D3D1')
      g.addColorStop(0.5, '#E7E5E4')
      g.addColorStop(1, '#D6D3D1')
      this.roundRect(ctx, bx - bw / 2, jy - bh / 2, bw, bh, this.sx(4))
      ctx.fillStyle = g
      ctx.fill()
      ctx.strokeStyle = '#78716C'
      ctx.lineWidth = 1.2
      ctx.stroke()

      ctx.strokeStyle = '#57534E'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(bx - bw / 2 + this.sx(4), jy - bh / 2 + this.sy(6))
      ctx.lineTo(bx + bw / 2 - this.sx(4), jy - bh / 2 + this.sy(6))
      ctx.moveTo(bx - bw / 2 + this.sx(4), jy + bh / 2 - this.sy(6))
      ctx.lineTo(bx + bw / 2 - this.sx(4), jy + bh / 2 - this.sy(6))
      ctx.stroke()

      ctx.fillStyle = '#44403C'
      ctx.font = `500 ${this.fontPx(12)}px "Microsoft YaHei"`
      ctx.textAlign = 'center'
      ctx.fillText('人行天桥', bx, jy + this.sy(4))
      ctx.textAlign = 'left'
      ctx.restore()
    },

    isMainRoad(edge) {
      if ((edge.distance || 0) >= 200) return true
      const from = this.nodes.find(n => n.id === edge.fromNodeId)
      const to = this.nodes.find(n => n.id === edge.toNodeId)
      if (!from || !to) return false
      const span = Math.hypot(from.x - to.x, from.y - to.y)
      return span >= 180
    },

    drawRoads(ctx) {
      const edges = this.edges.slice().sort((a, b) => (this.isMainRoad(a) ? 1 : 0) - (this.isMainRoad(b) ? 1 : 0))
      // 先画支路，再画主路，保证主路在上层
      edges.forEach(edge => {
        const pts = this.edgePoints(edge)
        if (!pts) return
        if (this.isEdgeInPath(edge.fromNodeId, edge.toNodeId)) return
        const main = this.isMainRoad(edge)

        // 圆角端点的双层道路
        ctx.beginPath()
        ctx.moveTo(pts[0], pts[1])
        ctx.lineTo(pts[2], pts[3])
        ctx.strokeStyle = main ? '#FFFDF9' : '#F7F3EA'
        ctx.lineWidth = this.sx(main ? 14 : 8)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(pts[0], pts[1])
        ctx.lineTo(pts[2], pts[3])
        ctx.strokeStyle = main ? '#C8BBA8' : '#D9CFC0'
        ctx.lineWidth = this.sx(main ? 7 : 4)
        ctx.lineCap = 'round'
        ctx.stroke()

        if (main) {
          // 主路中线
          ctx.beginPath()
          ctx.moveTo(pts[0], pts[1])
          ctx.lineTo(pts[2], pts[3])
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'
          ctx.lineWidth = 1
          ctx.setLineDash([this.sx(8), this.sx(8)])
          ctx.stroke()
          ctx.setLineDash([])
        }
      })
    },

    drawPathOverlay(ctx) {
      if (!this.hasPath) return
      this.edges.forEach(edge => {
        if (!this.isEdgeInPath(edge.fromNodeId, edge.toNodeId)) return
        const pts = this.edgePoints(edge)
        if (!pts) return
        const isOverpass = edge.isOverpass === 1

        // glow
        ctx.beginPath()
        ctx.moveTo(pts[0], pts[1])
        ctx.lineTo(pts[2], pts[3])
        ctx.strokeStyle = 'rgba(179, 27, 27, 0.18)'
        ctx.lineWidth = this.sx(12)
        ctx.lineCap = 'round'
        ctx.stroke()

        // solid path
        ctx.beginPath()
        ctx.moveTo(pts[0], pts[1])
        ctx.lineTo(pts[2], pts[3])
        ctx.strokeStyle = SXUFE.red
        ctx.lineWidth = this.sx(5)
        if (isOverpass) ctx.setLineDash([this.sx(7), this.sx(5)])
        ctx.stroke()
        ctx.setLineDash([])

        // moving dashes
        ctx.beginPath()
        ctx.moveTo(pts[0], pts[1])
        ctx.lineTo(pts[2], pts[3])
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'
        ctx.lineWidth = this.sx(2)
        ctx.setLineDash([this.sx(8), this.sx(10)])
        ctx.lineDashOffset = -this.animOffset
        ctx.stroke()
        ctx.setLineDash([])
        ctx.lineDashOffset = 0
      })
    },

    edgePoints(edge) {
      const from = this.nodes.find(n => n.id === edge.fromNodeId)
      const to = this.nodes.find(n => n.id === edge.toNodeId)
      if (!from || !to) return null
      const [x1, y1] = this.toCanvas(from.x, from.y)
      const [x2, y2] = this.toCanvas(to.x, to.y)
      return [x1, y1, x2, y2]
    },

    drawTrees(ctx) {
      const seed = this.campusId * 137
      for (let i = 0; i < 26; i++) {
        const x = ((seed + i * 73) % 820) + 80
        const y = ((seed + i * 47) % 820) + 80
        const blocked = this.pois.some(p => {
          const n = this.nodes.find(nd => nd.id === p.nodeId)
          return n && Math.hypot(n.x - x, n.y - y) < 58
        })
        if (blocked) continue
        if (this.jinyangY && Math.abs(y - this.jinyangY) < 30) continue
        const [cx, cy] = this.toCanvas(x, y)
        const r = this.sx(4.5 + (i % 3))
        ctx.beginPath()
        ctx.arc(cx + this.sx(1), cy + this.sy(1.5), r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(60, 80, 50, 0.12)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = i % 2 === 0 ? '#6B8F5E' : '#5A7F4E'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.fill()
      }
    },

    buildingSize(category) {
      const map = {
        '教学': [44, 28],
        '宿舍': [40, 26],
        '餐饮': [38, 24],
        '运动': [58, 34],
        '办公': [42, 26],
        '服务': [36, 22],
        '出入口': [34, 22],
        '交通': [36, 22]
      }
      return map[category] || [38, 24]
    },

    drawBuildings(ctx) {
      // 悬停时：先画淡化建筑，再画高亮建筑
      const list = this.pois.slice().sort((a, b) => {
        const ah = this.hoverPoi && this.hoverPoi.id === a.id ? 1 : 0
        const bh = this.hoverPoi && this.hoverPoi.id === b.id ? 1 : 0
        return ah - bh
      })

      list.forEach(poi => {
        const node = this.nodes.find(n => n.id === poi.nodeId)
        if (!node) return
        const [x, y] = this.toCanvas(node.x, node.y)
        const cat = getCategory(poi.category)
        const isStart = node.id === this.startNodeId
        const isEnd = node.id === this.endNodeId
        const isHover = this.hoverPoi && this.hoverPoi.id === poi.id
        const faded = this.hoverPoi && !isHover && !isStart && !isEnd

        ctx.save()
        if (faded) ctx.globalAlpha = 0.32

        if (poi.category === '出入口') {
          this.drawGate(ctx, x, y, poi, cat, isHover || isStart || isEnd)
        } else if (/操场|田径/.test(poi.name)) {
          this.drawTrackField(ctx, x, y, isHover || isStart || isEnd)
        } else if (/游泳/.test(poi.name)) {
          this.drawSwimPool(ctx, x, y, cat, isHover || isStart || isEnd)
        } else if (/体育馆|球馆/.test(poi.name)) {
          this.drawGymnasium(ctx, x, y, cat, isHover || isStart || isEnd)
        } else {
          this.drawNormalBuilding(ctx, x, y, poi, cat, isStart, isEnd, isHover)
        }

        const label = poi.name.length > 7 ? poi.name.slice(0, 7) + '…' : poi.name
        const offsetY = /操场|田径/.test(poi.name)
          ? this.sy(28)
          : this.sy(this.buildingSize(poi.category)[1] / 2 + 4)
        this.drawLabelChip(ctx, x, y + offsetY, label, '#292524', true, cat.color)
        ctx.restore()
      })
    },

    drawNormalBuilding(ctx, x, y, poi, cat, isStart, isEnd, isHover) {
      const [rawW, rawH] = this.buildingSize(poi.category)
      const bw = this.sx(rawW), bh = this.sy(rawH)
      const bx = x - bw / 2, by = y - bh / 2

      ctx.fillStyle = 'rgba(50, 40, 30, 0.12)'
      this.roundRect(ctx, bx + 1.5, by + 2, bw, bh, this.sx(4))
      ctx.fill()

      const body = ctx.createLinearGradient(bx, by, bx, by + bh)
      body.addColorStop(0, '#FFFFFF')
      body.addColorStop(1, cat.bg)
      this.roundRect(ctx, bx, by, bw, bh, this.sx(4))
      ctx.fillStyle = body
      ctx.fill()

      ctx.fillStyle = cat.color
      ctx.fillRect(bx, by, bw, this.sy(4))
      ctx.beginPath()
      ctx.moveTo(bx, by + this.sy(4))
      ctx.lineTo(bx, by + this.sx(4))
      ctx.quadraticCurveTo(bx, by, bx + this.sx(4), by)
      ctx.lineTo(bx + bw - this.sx(4), by)
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + this.sx(4))
      ctx.lineTo(bx + bw, by + this.sy(4))
      ctx.closePath()
      ctx.fill()

      if (['教学', '办公', '宿舍'].includes(poi.category)) {
        ctx.fillStyle = 'rgba(80, 95, 115, 0.18)'
        for (let c = 0; c < 3; c++) {
          const wx = bx + this.sx(8) + c * ((bw - this.sx(14)) / 3)
          this.roundRect(ctx, wx, by + this.sy(9), this.sx(6), this.sy(8), 1)
          ctx.fill()
        }
      }

      ctx.strokeStyle = isStart ? '#15803D' : isEnd ? '#B91C1C' : (isHover ? SXUFE.red : this.shadeHex(cat.color, 20))
      ctx.lineWidth = isStart || isEnd || isHover ? 2 : 1.2
      this.roundRect(ctx, bx, by, bw, bh, this.sx(4))
      ctx.stroke()

      if (isHover) {
        ctx.strokeStyle = 'rgba(179, 27, 27, 0.22)'
        ctx.lineWidth = 5
        this.roundRect(ctx, bx - 3, by - 3, bw + 6, bh + 6, this.sx(6))
        ctx.stroke()
      }
    },

    // 田径操场：跑道椭圆
    drawTrackField(ctx, x, y, active) {
      const rw = this.sx(70), rh = this.sy(42)
      ctx.fillStyle = '#D97757'
      this.ellipsePath(ctx, x, y, rw, rh)
      ctx.fill()
      ctx.fillStyle = '#7CB342'
      this.ellipsePath(ctx, x, y, rw * 0.72, rh * 0.62)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'
      ctx.lineWidth = 1
      for (let i = 0; i < 3; i++) {
        const t = 0.82 - i * 0.08
        this.ellipsePath(ctx, x, y, rw * t, rh * t)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(x, y, this.sx(6), 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'
      ctx.stroke()
      ctx.strokeStyle = active ? SXUFE.red : '#B85C3C'
      ctx.lineWidth = active ? 2.2 : 1.4
      this.ellipsePath(ctx, x, y, rw, rh)
      ctx.stroke()
    },

    // 体育馆：室内场馆建筑 + 球场示意
    drawGymnasium(ctx, x, y, cat, active) {
      const bw = this.sx(52), bh = this.sy(34)
      const bx = x - bw / 2, by = y - bh / 2
      ctx.fillStyle = 'rgba(50, 40, 30, 0.12)'
      this.roundRect(ctx, bx + 1.5, by + 2, bw, bh, this.sx(4))
      ctx.fill()
      const body = ctx.createLinearGradient(bx, by, bx, by + bh)
      body.addColorStop(0, '#F5F0FF')
      body.addColorStop(1, cat.bg)
      this.roundRect(ctx, bx, by, bw, bh, this.sx(4))
      ctx.fillStyle = body
      ctx.fill()
      // 屋顶弧线示意
      ctx.fillStyle = cat.color
      ctx.beginPath()
      ctx.moveTo(bx, by + this.sy(8))
      ctx.quadraticCurveTo(x, by - this.sy(4), bx + bw, by + this.sy(8))
      ctx.lineTo(bx + bw, by + this.sy(8))
      ctx.lineTo(bx, by + this.sy(8))
      ctx.fill()
      // 内部球场
      ctx.strokeStyle = 'rgba(107, 70, 193, 0.45)'
      ctx.lineWidth = 1
      this.roundRect(ctx, bx + this.sx(8), by + this.sy(12), bw - this.sx(16), bh - this.sy(16), 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y + this.sy(4), this.sx(5), 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = active ? SXUFE.red : cat.color
      ctx.lineWidth = active ? 2 : 1.2
      this.roundRect(ctx, bx, by, bw, bh, this.sx(4))
      ctx.stroke()
    },

    // 游泳馆：蓝色泳道池
    drawSwimPool(ctx, x, y, cat, active) {
      const bw = this.sx(48), bh = this.sy(30)
      const bx = x - bw / 2, by = y - bh / 2
      ctx.fillStyle = 'rgba(50, 40, 30, 0.1)'
      this.roundRect(ctx, bx + 1.5, by + 2, bw, bh, this.sx(4))
      ctx.fill()
      // 池体
      ctx.fillStyle = '#BAE6FD'
      this.roundRect(ctx, bx, by, bw, bh, this.sx(4))
      ctx.fill()
      ctx.fillStyle = '#38BDF8'
      this.roundRect(ctx, bx + this.sx(4), by + this.sy(5), bw - this.sx(8), bh - this.sy(9), 2)
      ctx.fill()
      // 泳道线
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'
      ctx.lineWidth = 1
      for (let i = 1; i <= 3; i++) {
        const ly = by + this.sy(5) + i * ((bh - this.sy(9)) / 4)
        ctx.beginPath()
        ctx.moveTo(bx + this.sx(5), ly)
        ctx.lineTo(bx + bw - this.sx(5), ly)
        ctx.stroke()
      }
      ctx.strokeStyle = active ? SXUFE.red : '#0284C7'
      ctx.lineWidth = active ? 2 : 1.2
      this.roundRect(ctx, bx, by, bw, bh, this.sx(4))
      ctx.stroke()
    },

    drawGate(ctx, x, y, poi, cat, active) {
      const w = this.sx(42), h = this.sy(26)
      const bx = x - w / 2, by = y - h / 2
      ctx.fillStyle = 'rgba(194, 120, 3, 0.12)'
      this.roundRect(ctx, bx - this.sx(6), by - this.sy(4), w + this.sx(12), h + this.sy(8), this.sx(6))
      ctx.fill()
      const pillarW = this.sx(6), pillarH = this.sy(22)
      ctx.fillStyle = cat.color
      this.roundRect(ctx, bx, y - pillarH / 2, pillarW, pillarH, 2)
      ctx.fill()
      this.roundRect(ctx, bx + w - pillarW, y - pillarH / 2, pillarW, pillarH, 2)
      ctx.fill()
      ctx.fillStyle = this.shadeHex(cat.color, -20)
      this.roundRect(ctx, bx, by, w, this.sy(6), 2)
      ctx.fill()
      ctx.fillStyle = '#F3EEE4'
      ctx.fillRect(bx + pillarW + 1, by + this.sy(7), w - pillarW * 2 - 2, h - this.sy(8))
      ctx.strokeStyle = active ? SXUFE.red : cat.color
      ctx.lineWidth = active ? 2 : 1.2
      this.roundRect(ctx, bx - this.sx(4), by - this.sy(3), w + this.sx(8), h + this.sy(6), this.sx(5))
      ctx.stroke()
    },

    ellipsePath(ctx, x, y, rx, ry) {
      ctx.beginPath()
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    },

    shadeHex(hex, amount) {
      const h = String(hex || '#cccccc').replace('#', '')
      if (h.length !== 6) return hex
      const num = parseInt(h, 16)
      const r = Math.min(255, Math.max(0, (num >> 16) + amount))
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount))
      const b = Math.min(255, Math.max(0, (num & 0xFF) + amount))
      return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)
    },

    // 适中偏大字号：约 13px
    fontPx(base = 13) {
      const n = Math.round(base + (this.scale - 0.75) * 2)
      return Math.max(12, Math.min(14, n))
    },

    drawLabelChip(ctx, x, y, text, color, centered, accent) {
      ctx.save()
      const fs = this.fontPx(13)
      ctx.font = `500 ${fs}px "Microsoft YaHei"`
      const tw = ctx.measureText(text).width
      const padX = 8
      const chipH = fs + 9
      const chipW = tw + padX * 2 + (accent ? 8 : 0)
      const chipX = centered ? x - chipW / 2 : x
      const chipY = y

      ctx.fillStyle = 'rgba(255,255,255,0.94)'
      this.roundRect(ctx, chipX, chipY, chipW, chipH, 4)
      ctx.fill()
      ctx.strokeStyle = 'rgba(40, 30, 20, 0.1)'
      ctx.lineWidth = 1
      ctx.stroke()

      if (accent) {
        ctx.fillStyle = accent
        ctx.beginPath()
        ctx.arc(chipX + 8, chipY + chipH / 2, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = color
      ctx.textAlign = 'left'
      ctx.fillText(text, chipX + padX + (accent ? 6 : 0), chipY + chipH / 2 + fs * 0.34)
      ctx.restore()
    },

    drawJunctions(ctx) {
      this.nodes.filter(n => n.type === 'JUNCTION').forEach(node => {
        const [x, y] = this.toCanvas(node.x, node.y)
        const onPath = this.pathNodeIds.includes(node.id)
        ctx.save()
        if (this.hoverPoi && !onPath) ctx.globalAlpha = 0.45
        ctx.beginPath()
        ctx.arc(x, y, this.sx(onPath ? 3.8 : 2.6), 0, Math.PI * 2)
        ctx.fillStyle = onPath ? SXUFE.red : '#A8A29E'
        ctx.fill()
        if (onPath) {
          ctx.beginPath()
          ctx.arc(x, y, this.sx(6), 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(179, 27, 27, 0.28)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
        ctx.restore()
      })
    },

    drawMarkers(ctx) {
      const drawMarker = (nodeId, fill, label) => {
        if (!nodeId) return
        const node = this.nodes.find(n => n.id === nodeId)
        if (!node) return
        const [x, y] = this.toCanvas(node.x, node.y)
        const my = y - this.sy(42)
        const r = Math.max(10, this.sx(11))
        ctx.save()
        ctx.beginPath()
        ctx.ellipse(x, y - this.sy(5), this.sx(6), this.sy(2.5), 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,0,0,0.14)'
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(x, y - this.sy(8))
        ctx.lineTo(x - this.sx(6), my + r * 0.4)
        ctx.lineTo(x + this.sx(6), my + r * 0.4)
        ctx.closePath()
        ctx.fillStyle = fill
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, my, r, 0, Math.PI * 2)
        ctx.fillStyle = fill
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = '#fff'
        ctx.font = `bold ${this.fontPx(12)}px "Microsoft YaHei"`
        ctx.textAlign = 'center'
        ctx.fillText(label, x, my + 4)
        ctx.textAlign = 'left'
        ctx.restore()
      }
      drawMarker(this.startNodeId, '#15803D', '起')
      drawMarker(this.endNodeId, '#B91C1C', '终')
    },

    drawChrome(ctx, w, h) {
      this.drawTitleBar(ctx)
      this.drawLegend(ctx, w, h)
      this.drawCompass(ctx, w - 50, 52)
      this.drawScaleBar(ctx, w - 148, h - 36)
    },

    drawTitleBar(ctx) {
      const name = this.campusName || '校园地图'
      ctx.save()
      ctx.font = '600 16px "Microsoft YaHei"'
      const tw = ctx.measureText(name).width
      const barW = tw + 30
      const barH = 36
      const x = 16, y = 14
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      this.roundRect(ctx, x, y, barW, barH, 6)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = SXUFE.red
      ctx.fillRect(x, y, 4, barH)
      ctx.fillStyle = '#1C1917'
      ctx.fillText(name, x + 14, y + 24)
      ctx.restore()
    },

    drawLegend(ctx, w, h) {
      const items = [
        getCategory('教学'),
        getCategory('宿舍'),
        getCategory('餐饮'),
        getCategory('出入口'),
        getCategory('运动'),
        { color: '#C8BBA8', label: '主路', line: true },
        { color: SXUFE.red, label: '规划路径', line: true }
      ]
      const lw = 124
      const rowH = 19
      const lh = 26 + items.length * rowH
      const lx = 16, ly = h - lh - 16
      ctx.save()
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      this.roundRect(ctx, lx, ly, lw, lh, 6)
      ctx.fill()
      ctx.strokeStyle = '#E7E5E4'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = '#57534E'
      ctx.font = '600 13px "Microsoft YaHei"'
      ctx.fillText('图例', lx + 12, ly + 18)
      items.forEach((item, i) => {
        const y = ly + 34 + i * rowH
        if (item.line) {
          ctx.strokeStyle = item.color
          ctx.lineWidth = item.label === '主路' ? 4 : 3
          ctx.beginPath()
          ctx.moveTo(lx + 12, y - 3)
          ctx.lineTo(lx + 28, y - 3)
          ctx.stroke()
        } else {
          ctx.fillStyle = item.color
          this.roundRect(ctx, lx + 12, y - 9, 12, 9, 2)
          ctx.fill()
        }
        ctx.fillStyle = '#292524'
        ctx.font = '13px "Microsoft YaHei"'
        ctx.fillText(item.label, lx + 32, y)
      })
      ctx.restore()
    },

    drawCompass(ctx, x, y) {
      ctx.save()
      const r = 20
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#D6D3D1'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = SXUFE.red
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('N', x, y - 5)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 5, y + 10)
      ctx.lineTo(x + 5, y + 10)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#A8A29E'
      ctx.beginPath()
      ctx.moveTo(x, y + 12)
      ctx.lineTo(x - 4, y + 2)
      ctx.lineTo(x + 4, y + 2)
      ctx.closePath()
      ctx.fill()
      ctx.textAlign = 'left'
      ctx.restore()
    },

    drawScaleBar(ctx, x, y) {
      const len = this.sx(100)
      ctx.save()
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      this.roundRect(ctx, x - 10, y - 10, len + 20, 36, 6)
      ctx.fill()
      ctx.strokeStyle = '#1C1917'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + len, y)
      ctx.moveTo(x, y - 4)
      ctx.lineTo(x, y + 4)
      ctx.moveTo(x + len / 2, y - 3)
      ctx.lineTo(x + len / 2, y + 3)
      ctx.moveTo(x + len, y - 4)
      ctx.lineTo(x + len, y + 4)
      ctx.stroke()
      ctx.fillStyle = '#44403C'
      ctx.font = '500 13px "Microsoft YaHei"'
      ctx.textAlign = 'center'
      ctx.fillText('100 m', x + len / 2, y + 16)
      ctx.textAlign = 'left'
      ctx.restore()
    },

    roundRect(ctx, x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2)
      ctx.beginPath()
      ctx.moveTo(x + rr, y)
      ctx.lineTo(x + w - rr, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
      ctx.lineTo(x + w, y + h - rr)
      ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
      ctx.lineTo(x + rr, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
      ctx.lineTo(x, y + rr)
      ctx.quadraticCurveTo(x, y, x + rr, y)
      ctx.closePath()
    },

    isEdgeInPath(fromId, toId) {
      return this.segments.some(s =>
        (s.fromNodeId === fromId && s.toNodeId === toId) ||
        (s.fromNodeId === toId && s.toNodeId === fromId)
      )
    },

    eventToMap(e) {
      const rect = this.$refs.canvas.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      return {
        cx: (px - this.offsetX) / this.scale,
        cy: (py - this.offsetY) / this.scale,
        px,
        py
      }
    },

    findNearestPoi(cx, cy, maxDist = 36) {
      let nearest = null, minDist = maxDist
      this.pois.forEach(poi => {
        const node = this.nodes.find(n => n.id === poi.nodeId)
        if (!node) return
        const d = Math.hypot(node.x - cx, node.y - cy)
        if (d < minDist) { minDist = d; nearest = poi }
      })
      return nearest
    },

    onMove(e) {
      const { cx, cy, px, py } = this.eventToMap(e)
      const poi = this.findNearestPoi(cx, cy)
      const changed = (poi && (!this.hoverPoi || this.hoverPoi.id !== poi.id)) || (!poi && this.hoverPoi)
      this.hoverPoi = poi
      this.tipX = px + 14
      this.tipY = py + 14
      this.$el.style.cursor = poi ? 'pointer' : 'crosshair'
      if (changed && !this.hasPath) this.draw()
      else if (changed) this.draw()
    },

    onLeave() {
      if (this.hoverPoi) {
        this.hoverPoi = null
        this.draw()
      }
      this.$el.style.cursor = 'crosshair'
    },

    onClick(e) {
      const { cx, cy } = this.eventToMap(e)
      const nearest = this.findNearestPoi(cx, cy, 50)
      if (nearest) this.$emit('poi-click', nearest)
    }
  }
}
</script>

<style scoped>
.map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  line-height: 0;
  background: #1C1917;
  overflow: hidden;
}
.campus-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.hover-tip {
  position: absolute;
  z-index: 5;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 168px;
  max-width: 260px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #E7E5E4;
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(28, 25, 23, 0.2);
  pointer-events: none;
  line-height: 1.4;
}
.tip-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-top: 4px;
  flex-shrink: 0;
}
.tip-name {
  font-size: 13px;
  font-weight: 600;
  color: #1C1917;
}
.tip-cat {
  font-size: 12px;
  color: #78716C;
  margin-top: 2px;
}
</style>
