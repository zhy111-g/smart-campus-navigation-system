<template>
  <div
    class="map-page"
    :class="{
      'is-mobile-open': mobilePanelOpen,
      'is-mobile-expanded': mobileExpanded
    }"
  >
    <div class="map-area">
      <campus-map
        ref="campusMap"
        :campus-id="campusId"
        :campus-name="currentCampus.name"
        :nodes="nodes"
        :edges="edges"
        :pois="pois"
        :path-node-ids="pathResult.pathNodeIds || []"
        :segments="pathResult.segments || []"
        :start-node-id="startPoi ? startPoi.nodeId : null"
        :end-node-id="endPoi ? endPoi.nodeId : null"
        :jinyang-y="jinyangY"
        :compact="isMobile"
        @poi-click="onPoiClick"
      />
    </div>

    <aside class="side-panel">
      <button type="button" class="sheet-handle" @click="toggleMobilePanel" aria-label="展开或收起面板">
        <span class="sheet-bar"></span>
        <div class="sheet-summary">
          <span class="sheet-title">{{ mobilePanelOpen ? '收起规划面板' : '路径规划' }}</span>
          <span v-if="!mobilePanelOpen" class="sheet-sub">{{ collapsedHint }}</span>
        </div>
        <i class="sheet-chevron" :class="mobilePanelOpen ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
      </button>

      <div class="panel-body">
        <div class="panel-card">
          <div class="card-head">
            <span class="head-bar"></span>
            <span>路径规划</span>
          </div>
          <el-form label-width="52px" size="small" class="plan-form">
            <el-form-item label="校区">
              <el-select v-model="campusId" style="width:100%" placeholder="选择校区" @change="onCampusChange">
                <el-option
                  v-for="c in campuses"
                  :key="c.id"
                  :label="c.name"
                  :value="Number(c.id)"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="起点">
              <el-select v-model="startPoiId" filterable placeholder="选择或点击地图" style="width:100%">
                <el-option v-for="p in pois" :key="'s'+p.id" :label="p.name" :value="p.id"/>
              </el-select>
            </el-form-item>
            <div class="swap-row">
              <button type="button" class="swap-btn" title="交换起终点" @click="swapEnds">
                <i class="el-icon-sort"></i>
              </button>
            </div>
            <el-form-item label="终点">
              <el-select v-model="endPoiId" filterable placeholder="选择或点击地图" style="width:100%">
                <el-option v-for="p in pois" :key="'e'+p.id" :label="p.name" :value="p.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="算法">
              <el-radio-group v-model="algorithm" class="algo-group">
                <el-radio-button label="DIJKSTRA">Dijkstra</el-radio-button>
                <el-radio-button label="ASTAR">A*</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="plan-btn" :loading="loading" @click="planPath">
                规划路径
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-if="pathResult.totalDistance" class="panel-card result-card">
          <div class="card-head">
            <span class="head-bar"></span>
            <span>规划结果</span>
          </div>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">{{ pathResult.totalDistance }}<small>m</small></div>
              <div class="stat-label">总距离</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">~{{ pathResult.walkMinutes }}<small>min</small></div>
              <div class="stat-label">预计步行</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ pathResult.computeTimeMs }}<small>ms</small></div>
              <div class="stat-label">计算耗时</div>
            </div>
          </div>
          <div class="algo-badge">{{ algorithmLabel }}</div>
          <div v-if="hasOverpass" class="overpass-tip">
            路径途经晋阳街人行天桥（已规避车行道）
          </div>
          <div class="path-steps">
            <div class="steps-title">途经节点</div>
            <div class="steps-flow">
              <span v-for="(n, i) in pathResult.pathNodes" :key="n.id" class="step-node">
                <span class="step-dot" :class="{ first: i === 0, last: i === pathResult.pathNodes.length - 1 }"></span>
                {{ n.name }}
                <i v-if="i < pathResult.pathNodes.length - 1" class="el-icon-arrow-right step-arrow"></i>
              </span>
            </div>
          </div>
        </div>

        <div class="panel-card poi-card">
          <div class="card-head">
            <span class="head-bar"></span>
            <span>地点列表</span>
            <span class="poi-count">{{ filteredPois.length }}</span>
            <button
              v-if="isMobile"
              type="button"
              class="poi-toggle"
              @click.stop="mobileExpanded = !mobileExpanded; $nextTick(() => resizeMap())"
            >
              {{ mobileExpanded ? '收起列表' : '展开列表' }}
            </button>
          </div>
          <el-input
            v-model="keyword" placeholder="搜索地点" size="small" clearable
            prefix-icon="el-icon-search" @input="searchPoi" class="search-input"
          />
          <div class="poi-list">
            <div
              v-for="p in filteredPois" :key="p.id" class="poi-item"
              :class="{ 'is-start': p.id === startPoiId, 'is-end': p.id === endPoiId }"
              @click="onPoiClick(p)"
            >
              <span class="cat-dot" :style="{ background: catColor(p.category) }"></span>
              <div class="poi-info">
                <div class="poi-name">{{ p.name }}</div>
                <div class="poi-cat">{{ p.category }}</div>
              </div>
              <span v-if="p.id === startPoiId" class="poi-tag start">起</span>
              <span v-else-if="p.id === endPoiId" class="poi-tag end">终</span>
            </div>
          </div>
          <div class="click-tip">点击列表项或地图建筑可设置起终点</div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script>
import { listCampuses, getMapData, planPath } from '@/services/api'
import CampusMap from '@/components/CampusMap.vue'
import { getCategory } from '@/utils/theme'

export default {
  name: 'MapView',
  components: { CampusMap },
  data() {
    return {
      campuses: [],
      campusId: 1,
      currentCampus: {},
      nodes: [],
      edges: [],
      pois: [],
      filteredPois: [],
      keyword: '',
      startPoiId: null,
      endPoiId: null,
      algorithm: 'DIJKSTRA',
      loading: false,
      pathResult: {},
      mobilePanelOpen: false,
      mobileExpanded: false,
      isMobile: false
    }
  },
  computed: {
    startPoi() { return this.pois.find(p => p.id === this.startPoiId) },
    endPoi() { return this.pois.find(p => p.id === this.endPoiId) },
    jinyangY() { return this.currentCampus.jinyangY ? parseFloat(this.currentCampus.jinyangY) : null },
    hasOverpass() { return (this.pathResult.segments || []).some(s => s.overpass) },
    algorithmLabel() {
      const a = this.pathResult.algorithm
      if (a === 'DIJKSTRA') return 'Dijkstra 最短路径'
      if (a === 'ASTAR') return 'A* 启发式搜索'
      return a || ''
    },
    collapsedHint() {
      const campus = this.currentCampus.name || '选择校区'
      if (this.pathResult.totalDistance) {
        return `${campus} · ${this.pathResult.totalDistance}m · 点击查看`
      }
      if (this.startPoi && this.endPoi) {
        return `${this.startPoi.name} → ${this.endPoi.name}`
      }
      if (this.startPoi) {
        return `起点：${this.startPoi.name} · 点此选终点`
      }
      return `${campus} · 点击展开`
    }
  },
  mounted() {
    this.checkMobile()
    this.loadCampuses()
    this.$nextTick(() => this.resizeMap())
    window.addEventListener('resize', this.onWinResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWinResize)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
    },
    onWinResize() {
      this.checkMobile()
      this.resizeMap()
    },
    resizeMap() {
      if (this.$refs.campusMap && this.$refs.campusMap.resize) {
        this.$refs.campusMap.resize()
      }
    },
    toggleMobilePanel() {
      if (!this.isMobile) return
      this.mobilePanelOpen = !this.mobilePanelOpen
      if (!this.mobilePanelOpen) this.mobileExpanded = false
      this.$nextTick(() => this.resizeMap())
    },
    openMobilePanel() {
      if (!this.isMobile) return
      this.mobilePanelOpen = true
      this.$nextTick(() => this.resizeMap())
    },
    catColor(cat) { return getCategory(cat).color },
    loadCampuses() {
      listCampuses().then(res => {
        if (res.code === '200') {
          this.campuses = (res.data || []).map(c => ({ ...c, id: Number(c.id) }))
          if (this.campuses.length) {
            this.campusId = Number(this.campuses[0].id)
            this.onCampusChange()
          }
        }
      }).catch(() => {
        this.$message.error('校区数据加载失败，请刷新页面')
      })
    },
    onCampusChange() {
      this.campusId = Number(this.campusId)
      this.currentCampus = this.campuses.find(c => Number(c.id) === this.campusId) || {}
      this.pathResult = {}
      this.startPoiId = null
      this.endPoiId = null
      getMapData(this.campusId).then(res => {
        if (res.code === '200') {
          this.nodes = res.data.nodes
          this.edges = res.data.edges
          this.pois = res.data.pois
          this.filteredPois = this.pois
          this.$nextTick(() => this.resizeMap())
        }
      })
    },
    searchPoi() {
      if (!this.keyword) { this.filteredPois = this.pois; return }
      const kw = this.keyword.toLowerCase()
      this.filteredPois = this.pois.filter(p => p.name.toLowerCase().includes(kw))
    },
    onPoiClick(poi) {
      this.openMobilePanel()
      if (!this.startPoiId || (this.startPoiId && this.endPoiId)) {
        this.startPoiId = poi.id
        this.endPoiId = null
        this.pathResult = {}
        this.$message({ message: '起点：' + poi.name, type: 'success', duration: 1500 })
      } else {
        this.endPoiId = poi.id
        this.$message({ message: '终点：' + poi.name, type: 'success', duration: 1500 })
      }
    },
    swapEnds() {
      if (!this.startPoiId && !this.endPoiId) return
      const s = this.startPoiId
      this.startPoiId = this.endPoiId
      this.endPoiId = s
      this.pathResult = {}
    },
    planPath() {
      if (!this.startPoiId || !this.endPoiId) {
        this.$message.warning('请选择起点和终点')
        return
      }
      if (this.startPoiId === this.endPoiId) {
        this.$message.warning('起点和终点不能相同')
        return
      }
      this.loading = true
      planPath({
        campusId: this.campusId,
        startPoiId: this.startPoiId,
        endPoiId: this.endPoiId,
        algorithm: this.algorithm,
        userId: 1
      }).then(res => {
        this.loading = false
        if (res.code === '200') {
          this.pathResult = res.data
          this.$message.success('路径规划成功')
          if (this.isMobile) {
            this.mobilePanelOpen = false
            this.mobileExpanded = false
            this.$nextTick(() => this.resizeMap())
          }
        } else {
          this.$message.error(res.msg || '规划失败')
        }
      }).catch(() => { this.loading = false })
    }
  }
}
</script>

<style scoped>
.map-page {
  display: flex;
  height: calc(100vh - 56px);
  min-height: 0;
  background: #1C1917;
}
.map-area {
  flex: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
  overflow: hidden;
}
.side-panel {
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background:
    linear-gradient(180deg, #FBF8F5 0%, #F3EBE4 100%);
  border-left: 1px solid #E8E0D8;
  box-shadow: -12px 0 32px rgba(42, 23, 16, 0.06);
}

.panel-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 14px;
  padding: 15px 16px;
  box-shadow: 0 2px 10px rgba(42, 23, 16, 0.04);
  border: 1px solid rgba(232, 224, 216, 0.95);
  backdrop-filter: blur(6px);
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 650;
  color: #2A1710;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #F0E9E2;
}
.head-bar {
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #C92525, #8E1414);
  border-radius: 2px;
}
.poi-count {
  margin-left: auto;
  font-size: 11px;
  color: #7A6A62;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  background: #F6F1EC;
}

.swap-row {
  display: flex;
  justify-content: center;
  margin: -4px 0 6px;
}
.swap-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #E8E0D8;
  background: #fff;
  color: #B31B1B;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
}
.swap-btn:hover {
  background: #FFF5F5;
  border-color: rgba(179, 27, 27, 0.35);
  transform: rotate(180deg);
}

.algo-group { width: 100%; display: flex; }
.algo-group .el-radio-button { flex: 1; }
.algo-group >>> .el-radio-button__inner {
  width: 100%;
  border-radius: 0 !important;
}
.algo-group >>> .el-radio-button:first-child .el-radio-button__inner {
  border-radius: 8px 0 0 8px !important;
}
.algo-group >>> .el-radio-button:last-child .el-radio-button__inner {
  border-radius: 0 8px 8px 0 !important;
}
.plan-btn {
  width: 100%;
  height: 42px;
  font-size: 14px;
  letter-spacing: 0.08em;
  border-radius: 10px !important;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}
.stat-item {
  text-align: center;
  padding: 12px 6px;
  background: linear-gradient(180deg, #FFFCF9, #F7F2ED);
  border-radius: 10px;
  border: 1px solid #F0E9E2;
}
.stat-value { font-size: 18px; font-weight: 700; color: #B31B1B; }
.stat-value small { font-size: 11px; font-weight: 400; color: #7A6A62; margin-left: 1px; }
.stat-label { font-size: 11px; color: #7A6A62; margin-top: 3px; letter-spacing: 0.04em; }

.algo-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(179, 27, 27, 0.06);
  color: #8E1414;
  font-size: 12px;
  border: 1px solid rgba(179, 27, 27, 0.14);
  margin-bottom: 8px;
}
.overpass-tip {
  padding: 9px 11px;
  background: linear-gradient(90deg, #FFFBEB, #FFF8E8);
  color: #92400E;
  border-radius: 10px;
  font-size: 12px;
  border: 1px solid #F5E0A8;
  line-height: 1.55;
}

.path-steps { margin-top: 10px; }
.steps-title { font-size: 12px; color: #7A6A62; margin-bottom: 6px; }
.steps-flow { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.step-node {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #2A1710;
  background: #FAF7F4;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #EDE6DF;
}
.step-dot { width: 6px; height: 6px; border-radius: 50%; background: #B31B1B; }
.step-dot.first { background: #15803D; }
.step-dot.last { background: #B91C1C; }
.step-arrow { color: #D0C8C0; font-size: 10px; }

.search-input { margin-bottom: 8px; }
.poi-card { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.poi-list {
  flex: 1;
  max-height: calc(100vh - 460px);
  min-height: 150px;
  overflow-y: auto;
  padding-right: 2px;
}
.poi-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.12s, transform 0.12s;
  margin-bottom: 2px;
}
.poi-item:hover { background: #F7F2ED; }
.poi-item.is-start { background: #F0FDF4; }
.poi-item.is-end { background: #FEF2F2; }
.cat-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.poi-info { flex: 1; min-width: 0; }
.poi-name {
  font-size: 13px;
  color: #2A1710;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.poi-cat { font-size: 11px; color: #7A6A62; margin-top: 1px; }
.poi-tag {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 999px;
  flex-shrink: 0;
}
.poi-tag.start { background: #15803D; color: #fff; }
.poi-tag.end { background: #B91C1C; color: #fff; }
.click-tip {
  margin-top: 10px;
  text-align: center;
  font-size: 11px;
  color: #A39890;
  letter-spacing: 0.02em;
}

.sheet-handle {
  display: none;
}
.poi-toggle {
  display: none;
}

@media (max-width: 900px) {
  .side-panel { width: 280px; }
}

@media (max-width: 768px) {
  .map-page {
    flex-direction: column;
    height: calc(100vh - 48px);
    height: calc(100dvh - 48px);
  }
  .map-area {
    flex: 1 1 auto;
    min-height: 0;
    order: 1;
  }
  .side-panel {
    order: 2;
    width: 100%;
    height: auto;
    max-height: none;
    flex-shrink: 0;
    border-left: none;
    border-top: 1px solid #E8E0D8;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -8px 28px rgba(42, 23, 16, 0.12);
    padding: 0 10px 8px;
    gap: 8px;
    overflow: hidden;
  }
  .map-page.is-mobile-open .side-panel {
    max-height: 52vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 10px;
  }
  .map-page.is-mobile-open.is-mobile-expanded .side-panel {
    max-height: 72vh;
  }

  .sheet-handle {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: 8px;
    width: 100%;
    padding: 10px 4px 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #7A6A62;
    font-family: inherit;
    text-align: left;
  }
  .sheet-bar {
    grid-column: 1 / -1;
    justify-self: center;
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: #D4CBC3;
    margin-bottom: 6px;
  }
  .sheet-summary {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .sheet-title {
    font-size: 14px;
    font-weight: 650;
    color: #2A1710;
  }
  .sheet-sub {
    font-size: 12px;
    color: #7A6A62;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sheet-chevron {
    font-size: 16px;
    color: #B31B1B;
  }

  /* 默认折叠：只留底部条 */
  .panel-body {
    display: none;
  }
  .map-page.is-mobile-open .panel-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .panel-card {
    border-radius: 12px;
    padding: 10px 12px;
  }
  .card-head { margin-bottom: 8px; padding-bottom: 6px; font-size: 13px; }
  .plan-form >>> .el-form-item {
    margin-bottom: 8px;
  }
  .plan-form >>> .el-form-item__label {
    padding: 0;
    line-height: 32px;
    font-size: 12px;
  }
  .plan-btn { height: 40px; font-size: 14px; }
  .swap-btn { width: 32px; height: 32px; }
  .swap-row { margin: -2px 0 2px; }
  .poi-item { padding: 10px; min-height: 40px; }
  .poi-list {
    max-height: none;
    min-height: 0;
  }
  .poi-card { display: none; }
  .map-page.is-mobile-open.is-mobile-expanded .poi-card {
    display: flex;
  }
  .poi-toggle {
    display: inline-flex;
    margin-left: auto;
    border: none;
    background: #F6F1EC;
    color: #8E1414;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 999px;
    cursor: pointer;
    font-family: inherit;
  }
  .result-card .path-steps { max-height: 72px; overflow: auto; }
  .stat-value { font-size: 16px; }
}
</style>
