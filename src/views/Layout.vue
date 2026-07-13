<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <div class="brand" @click="goHome" title="返回首页">
          <school-emblem :size="30"/>
          <div>
            <div class="brand-title">
              <span class="title-full">校园智能路径导航辅助系统</span>
              <span class="title-short">校园路径导航</span>
            </div>
            <div class="brand-sub">山西财经大学 · V1.0</div>
          </div>
        </div>
        <nav class="nav">
          <router-link to="/map" class="nav-item">
            <i class="el-icon-map-location"></i><span>规划</span>
          </router-link>
          <router-link to="/history" class="nav-item">
            <i class="el-icon-time"></i><span>历史</span>
          </router-link>
        </nav>
        <button type="button" class="home-btn" @click="goHome">首页</button>
      </div>
    </header>
    <main class="main">
      <router-view/>
    </main>
  </div>
</template>

<script>
import SchoolEmblem from '@/components/SchoolEmblem.vue'

export default {
  name: 'Layout',
  components: { SchoolEmblem },
  methods: {
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--paper, #F6F1EC);
}
.header {
  background:
    linear-gradient(105deg, #7A1010 0%, #B31B1B 48%, #C92525 100%);
  box-shadow: 0 8px 24px rgba(142, 20, 20, 0.22);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
}
.header-inner {
  position: relative;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 22px;
  gap: 20px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}
.brand-title {
  color: #fff;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title-short { display: none; }
.brand-sub {
  color: rgba(255,255,255,0.72);
  font-size: 11px;
  margin-top: 2px;
  letter-spacing: 0.08em;
}
.nav {
  display: flex;
  gap: 4px;
}
.nav-item {
  color: rgba(255,255,255,0.88);
  text-decoration: none;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
.nav-item.router-link-active {
  background: rgba(255,255,255,0.18);
  color: #fff;
  font-weight: 600;
}
.home-btn {
  appearance: none;
  border: 1px solid rgba(255,255,255,0.4);
  background: transparent;
  color: #fff;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.home-btn:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.6);
}
.main {
  flex: 1;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

@media (max-width: 768px) {
  .header-inner {
    height: 48px;
    padding: 0 8px;
    gap: 6px;
  }
  .brand { gap: 6px; flex: 1; min-width: 0; }
  .brand-title { font-size: 13px; }
  .brand-sub { display: none; }
  .title-full { display: none; }
  .title-short { display: inline; }
  .nav { gap: 0; flex-shrink: 0; }
  .nav-item {
    padding: 6px 8px;
    font-size: 12px;
    min-height: 32px;
  }
  .nav-item i { margin-right: 0; }
  .home-btn {
    height: 32px;
    padding: 0 8px;
    font-size: 12px;
    flex-shrink: 0;
  }
}

@media (min-width: 769px) {
  .brand-title::after { content: none; }
}
</style>
