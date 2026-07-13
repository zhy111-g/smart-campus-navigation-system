<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default { name: 'App' }
</script>

<style>
:root {
  --sxufe-red: #B31B1B;
  --sxufe-red-dark: #8E1414;
  --sxufe-red-light: #C92525;
  --ink: #2A1710;
  --muted: #7A6A62;
  --paper: #F6F1EC;
  --paper-deep: #EDE4DC;
  --line: #E8E0D8;
  --card: #FFFFFF;
  --bg-page: #F6F1EC;
  --text-primary: #2A1710;
  --text-secondary: #7A6A62;
  --card-radius: 14px;
  --shadow-sm: 0 1px 3px rgba(42, 23, 16, 0.05);
  --shadow-md: 0 8px 24px rgba(42, 23, 16, 0.07);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  font-family: "Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}
#app { min-height: 100vh; }

.el-button--primary {
  background: linear-gradient(135deg, #C92525, var(--sxufe-red) 55%, var(--sxufe-red-dark)) !important;
  border-color: transparent !important;
}
.el-button--primary:hover,
.el-button--primary:focus {
  background: linear-gradient(135deg, #D12B2B, #B31B1B 55%, #8E1414) !important;
  border-color: transparent !important;
  filter: brightness(1.03);
}
.el-input__inner:focus,
.el-textarea__inner:focus {
  border-color: rgba(179, 27, 27, 0.45) !important;
}
.el-select .el-input.is-focus .el-input__inner {
  border-color: rgba(179, 27, 27, 0.45) !important;
}
.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background-color: var(--sxufe-red) !important;
  border-color: var(--sxufe-red) !important;
  box-shadow: -1px 0 0 0 var(--sxufe-red) !important;
}
.el-table th {
  background: #FAF7F4 !important;
  color: var(--ink) !important;
  font-weight: 600 !important;
}
.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #FBF9F7 !important;
}
.el-tag--plain {
  border-color: rgba(179, 27, 27, 0.25) !important;
  color: var(--sxufe-red) !important;
  background: rgba(179, 27, 27, 0.05) !important;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb {
  background: rgba(42, 23, 16, 0.18);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover { background: rgba(179, 27, 27, 0.35); }
</style>
