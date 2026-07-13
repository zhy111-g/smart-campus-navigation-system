<template>
  <div class="history-page">
    <div class="page-bg" aria-hidden="true"></div>

    <div class="page-inner">
      <div class="page-header">
        <div class="header-left">
          <div class="title-mark"></div>
          <div>
            <h2>导航历史</h2>
            <p>回顾过往校园路径规划记录</p>
          </div>
        </div>
        <button type="button" class="refresh-btn" @click="load">
          <i class="el-icon-refresh"></i>
          刷新
        </button>
      </div>

      <div v-if="list.length" class="summary-bar">
        <div class="summary-item" v-for="item in summaryItems" :key="item.label">
          <span class="summary-num">{{ item.value }}</span>
          <span class="summary-label">{{ item.label }}</span>
        </div>
      </div>

      <div class="table-card">
        <el-table
          v-if="list.length"
          :data="list"
          stripe
          size="medium"
          class="history-table"
          :header-cell-style="{ background: '#FAF7F4', color: '#2A1710', fontWeight: 600 }"
        >
          <el-table-column label="起点" min-width="140">
            <template slot-scope="{ row }">
              <span class="cell-with-dot"><span class="dot start"></span>{{ row.startName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="终点" min-width="140">
            <template slot-scope="{ row }">
              <span class="cell-with-dot"><span class="dot end"></span>{{ row.endName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="距离" width="110" align="center">
            <template slot-scope="{ row }">
              <span class="dist-badge">{{ row.totalDistance }} m</span>
            </template>
          </el-table-column>
          <el-table-column label="算法" width="120" align="center">
            <template slot-scope="{ row }">
              <el-tag size="small" effect="plain">{{ algoLabel(row.algorithm) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="耗时" width="100" align="center">
            <template slot-scope="{ row }">
              <span class="time-text">{{ row.computeTimeMs }} ms</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="规划时间" min-width="170"/>
        </el-table>

        <div v-else class="empty-state">
          <div class="empty-ring">
            <i class="el-icon-map-location"></i>
          </div>
          <h3>暂无导航记录</h3>
          <p>先去路径规划页选好起点和终点，完成一次规划即可在此查看</p>
          <el-button type="primary" round @click="$router.push('/map')">前往路径规划</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getHistory } from '@/services/api'

export default {
  name: 'History',
  data() {
    return { list: [] }
  },
  computed: {
    totalDistance() {
      return this.list.reduce((s, r) => s + (r.totalDistance || 0), 0)
    },
    avgTime() {
      if (!this.list.length) return 0
      return Math.round(this.list.reduce((s, r) => s + (r.computeTimeMs || 0), 0) / this.list.length)
    },
    summaryItems() {
      return [
        { label: '总记录', value: this.list.length },
        { label: '累计距离 (m)', value: this.totalDistance },
        { label: '平均耗时 (ms)', value: this.avgTime }
      ]
    }
  },
  created() { this.load() },
  methods: {
    algoLabel(a) {
      if (a === 'DIJKSTRA') return 'Dijkstra'
      if (a === 'ASTAR') return 'A*'
      return a
    },
    load() {
      getHistory().then(res => {
        if (res.code === '200') this.list = res.data
      })
    }
  }
}
</script>

<style scoped>
.history-page {
  position: relative;
  min-height: calc(100vh - 56px);
  overflow: hidden;
}
.page-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 45% at 15% 0%, rgba(179, 27, 27, 0.08), transparent 55%),
    radial-gradient(ellipse 55% 40% at 90% 100%, rgba(142, 20, 20, 0.06), transparent 50%),
    linear-gradient(180deg, #FBF8F5 0%, #F3EBE4 100%);
}
.page-inner {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px 24px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-left {
  display: flex;
  gap: 12px;
  align-items: center;
}
.title-mark {
  width: 4px;
  height: 34px;
  border-radius: 4px;
  background: linear-gradient(180deg, #C92525, #8E1414);
}
.page-header h2 {
  font-size: 22px;
  color: #2A1710;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.page-header p {
  font-size: 13px;
  color: #7A6A62;
  letter-spacing: 0.04em;
}
.refresh-btn {
  appearance: none;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #E8E0D8;
  background: rgba(255,255,255,0.75);
  color: #2A1710;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.refresh-btn:hover {
  border-color: rgba(179, 27, 27, 0.35);
  color: #B31B1B;
  background: #fff;
}

.summary-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.summary-item {
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid #E8E0D8;
  text-align: center;
  box-shadow: 0 2px 10px rgba(42, 23, 16, 0.04);
}
.summary-num {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #B31B1B;
  letter-spacing: 0.02em;
}
.summary-label {
  display: block;
  font-size: 12px;
  color: #7A6A62;
  margin-top: 4px;
}

.table-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  padding: 8px;
  border: 1px solid #E8E0D8;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(42, 23, 16, 0.05);
}
.history-table { width: 100%; }
.cell-with-dot { display: inline-flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot.start { background: #15803D; }
.dot.end { background: #B91C1C; }
.dist-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(179, 27, 27, 0.06);
  color: #B31B1B;
  font-weight: 650;
  font-size: 13px;
  border: 1px solid rgba(179, 27, 27, 0.12);
}
.time-text { color: #7A6A62; font-size: 13px; }

.empty-state { text-align: center; padding: 64px 20px; }
.empty-ring {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(179, 27, 27, 0.06);
  border: 1px solid rgba(179, 27, 27, 0.12);
  color: #B31B1B;
  font-size: 28px;
}
.empty-state h3 { font-size: 17px; color: #2A1710; margin-bottom: 8px; }
.empty-state p {
  font-size: 13px;
  color: #7A6A62;
  margin-bottom: 22px;
  max-width: 28em;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

@media (max-width: 720px) {
  .summary-bar { grid-template-columns: 1fr; }
  .page-inner { padding: 20px 16px 32px; }
}
</style>
