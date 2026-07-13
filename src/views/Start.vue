<template>
  <div class="start-page">
    <div class="atmosphere" aria-hidden="true">
      <div class="sky"></div>
      <div class="wash wash-a"></div>
      <div class="wash wash-b"></div>
      <div class="vignette"></div>
      <svg class="route-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#B31B1B" stop-opacity="0.15"/>
            <stop offset="50%" stop-color="#B31B1B" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#8E1414" stop-opacity="0.35"/>
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path class="route-halo" d="M70 640 C240 590, 290 430, 430 390 S690 310, 770 230 S990 90, 1130 150"/>
        <path
          id="navPath"
          class="route-line"
          d="M70 640 C240 590, 290 430, 430 390 S690 310, 770 230 S990 90, 1130 150"
          fill="none"
        />
        <circle class="node n1" cx="70" cy="640" r="5"/>
        <circle class="node n2" cx="430" cy="390" r="4.5"/>
        <circle class="node n3" cx="770" cy="230" r="4.5"/>
        <circle class="node n4" cx="1130" cy="150" r="6"/>
        <circle class="traveler" r="5" filter="url(#softGlow)">
          <animateMotion dur="5.5s" repeatCount="indefinite" begin="1.2s" path="M70 640 C240 590, 290 430, 430 390 S690 310, 770 230 S990 90, 1130 150"/>
        </circle>
      </svg>
      <div class="grain"></div>
    </div>

    <header class="topbar">
      <div class="topbar-brand">
        <school-emblem :size="30"/>
        <span>山西财经大学</span>
      </div>
      <span class="topbar-ver">V1.0</span>
    </header>

    <main class="hero">
      <div class="emblem-wrap">
        <span class="ring ring-outer"></span>
        <span class="ring ring-inner"></span>
        <school-emblem :size="120" class="emblem"/>
      </div>

      <p class="brand-name">
        <span class="brand-line">校园智能路径导航</span>
        <span class="brand-line">辅助系统</span>
      </p>

      <div class="tag-row">
        <span class="tag-rule"></span>
        <p class="tagline">走对路，少绕路</p>
        <span class="tag-rule"></span>
      </div>

      <p class="support">迎泽校区 · 坞城校区 · 最短路径规划</p>

      <div class="actions">
        <button type="button" class="btn-primary" @click="enter">
          <span>开始使用</span>
          <i class="el-icon-right"></i>
        </button>
        <button type="button" class="btn-ghost" @click="enterHistory">导航历史</button>
      </div>
    </main>

    <footer class="foot">山西财经大学</footer>
  </div>
</template>

<script>
import SchoolEmblem from '@/components/SchoolEmblem.vue'

export default {
  name: 'Start',
  components: { SchoolEmblem },
  methods: {
    enter() {
      this.$router.push('/map')
    },
    enterHistory() {
      this.$router.push('/history')
    }
  }
}
</script>

<style scoped>
.start-page {
  --red: #B31B1B;
  --red-deep: #8E1414;
  --ink: #2A1710;
  --muted: #7A6A62;
  --paper: #F6F1EC;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--paper);
  color: var(--ink);
  font-family: "Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.atmosphere { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.sky {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 90% 55% at 50% -5%, rgba(255, 248, 242, 0.95), transparent 55%),
    linear-gradient(165deg, #FBF7F3 0%, #F3EBE4 48%, #EDE4DC 100%);
}
.wash {
  position: absolute; border-radius: 50%; filter: blur(70px);
}
.wash-a {
  width: min(78vw, 760px); height: min(78vw, 760px);
  top: -22%; left: 50%; transform: translateX(-50%);
  background: radial-gradient(circle, rgba(179, 27, 27, 0.16), transparent 70%);
  animation: float-a 11s ease-in-out infinite alternate;
}
.wash-b {
  width: min(48vw, 520px); height: min(48vw, 520px);
  right: -10%; bottom: -14%;
  background: radial-gradient(circle, rgba(142, 20, 20, 0.11), transparent 72%);
  animation: float-b 13s ease-in-out infinite alternate;
}
.vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 42%, rgba(42, 23, 16, 0.06) 100%);
}

.route-art {
  position: absolute; inset: 0; width: 100%; height: 100%;
  opacity: 0.85;
}
.route-halo {
  fill: none;
  stroke: rgba(179, 27, 27, 0.07);
  stroke-width: 36;
  stroke-linecap: round;
}
.route-line {
  stroke: url(#routeGrad);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-dasharray: 1600;
  stroke-dashoffset: 1600;
  animation: draw 2.6s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.25s;
}
.node {
  fill: var(--red);
  opacity: 0;
  animation: node-in 0.5s ease forwards;
}
.n1 { animation-delay: 0.45s; }
.n2 { animation-delay: 1.05s; }
.n3 { animation-delay: 1.55s; }
.n4 { animation-delay: 2.1s; fill: var(--red-deep); }
.traveler {
  fill: #fff;
  stroke: var(--red);
  stroke-width: 2.5;
  opacity: 0;
  animation: traveler-show 0.4s ease forwards 1.2s;
}

.grain {
  position: absolute; inset: 0; opacity: 0.4;
  background-image: radial-gradient(rgba(42, 23, 16, 0.035) 0.55px, transparent 0.55px);
  background-size: 3px 3px;
}

.topbar {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 36px;
  animation: rise 0.75s ease both;
}
.topbar-brand {
  display: flex; align-items: center; gap: 12px;
  font-size: 13px; font-weight: 600; letter-spacing: 0.18em;
}
.topbar-ver {
  font-size: 11px; letter-spacing: 0.28em; color: var(--muted);
}

.hero {
  position: relative; z-index: 2;
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 8px 24px 36px;
}

.emblem-wrap {
  position: relative;
  width: 176px; height: 176px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 30px;
  animation: rise 0.85s ease 0.06s both;
}
.ring {
  position: absolute; border-radius: 50%; pointer-events: none;
}
.ring-outer {
  inset: 0;
  border: 1px solid rgba(179, 27, 27, 0.22);
  animation: spin-slow 28s linear infinite;
  background:
    conic-gradient(from 0deg, transparent 0 86deg, rgba(179, 27, 27, 0.35) 90deg, transparent 94deg 100%);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.2px), #000 calc(100% - 1.2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 1.2px), #000 calc(100% - 1.2px));
}
.ring-inner {
  inset: 14px;
  border: 1px dashed rgba(179, 27, 27, 0.18);
  animation: spin-slow 40s linear infinite reverse;
}
.emblem {
  position: relative; z-index: 1;
  filter: drop-shadow(0 12px 28px rgba(142, 20, 20, 0.2));
  animation: float-emblem 5.5s ease-in-out infinite;
}

.brand-name {
  margin: 0 0 18px;
  display: flex; flex-direction: column; gap: 4px;
  font-size: clamp(28px, 4.5vw, 44px);
  font-weight: 700;
  line-height: 1.28;
  letter-spacing: 0.06em;
  animation: rise 0.85s ease 0.14s both;
}
.brand-line { display: block; }

.tag-row {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 16px;
  animation: rise 0.85s ease 0.22s both;
}
.tag-rule {
  width: 42px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(179, 27, 27, 0.55), transparent);
}
.tagline {
  margin: 0;
  font-size: clamp(16px, 2.1vw, 19px);
  letter-spacing: 0.28em;
  color: var(--red);
  font-weight: 500;
}

.support {
  margin: 0 0 42px;
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--muted);
  animation: rise 0.85s ease 0.3s both;
}

.actions {
  display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;
  animation: rise 0.85s ease 0.38s both;
}

.btn-primary,
.btn-ghost {
  appearance: none; border: none; cursor: pointer;
  height: 50px; padding: 0 28px; border-radius: 999px;
  font-size: 15px; letter-spacing: 0.1em; font-family: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}
.btn-primary {
  position: relative; overflow: hidden;
  min-width: 180px;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #D12B2B 0%, var(--red) 45%, var(--red-deep) 100%);
  color: #fff;
  box-shadow: 0 12px 30px rgba(179, 27, 27, 0.3);
}
.btn-primary::after {
  content: "";
  position: absolute; top: 0; left: -40%;
  width: 40%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
  transform: skewX(-18deg);
  animation: shimmer 3.8s ease-in-out infinite;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(179, 27, 27, 0.38);
}
.btn-primary:active { transform: translateY(0); }
.btn-primary span, .btn-primary i { position: relative; z-index: 1; }

.btn-ghost {
  background: rgba(255, 255, 255, 0.58);
  color: var(--ink);
  border: 1px solid rgba(42, 23, 16, 0.1);
  backdrop-filter: blur(8px);
}
.btn-ghost:hover {
  transform: translateY(-2px);
  color: var(--red);
  border-color: rgba(179, 27, 27, 0.35);
  background: rgba(255, 255, 255, 0.82);
}

.foot {
  position: relative; z-index: 2;
  text-align: center;
  padding: 16px 16px 30px;
  font-size: 12px; letter-spacing: 0.16em;
  color: rgba(122, 106, 98, 0.8);
  animation: rise 0.85s ease 0.46s both;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes float-a {
  from { transform: translateX(-50%) scale(1); }
  to { transform: translateX(-50%) scale(1.07) translateY(10px); }
}
@keyframes float-b {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-16px, -10px) scale(1.08); }
}
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes node-in {
  from { opacity: 0; r: 1; }
  to { opacity: 0.9; }
}
@keyframes traveler-show { to { opacity: 1; } }
@keyframes float-emblem {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes spin-slow { to { transform: rotate(360deg); } }
@keyframes shimmer {
  0%, 55% { left: -40%; }
  80%, 100% { left: 140%; }
}

@media (max-width: 640px) {
  .topbar { padding: 14px 16px; }
  .emblem-wrap { width: 112px; height: 112px; margin-bottom: 16px; }
  .tag-rule { width: 24px; }
  .actions { width: 100%; max-width: 300px; flex-direction: column; margin-top: 8px; }
  .btn-primary, .btn-ghost { width: 100%; }
  .route-art { opacity: 0.5; }
  .brand-name { letter-spacing: 0.04em; font-size: 1.35rem; }
  .tagline { letter-spacing: 0.16em; }
  .hero { padding: 12px 20px 24px; }
  .foot { padding-bottom: 16px; }
}
</style>
