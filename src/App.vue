<template>
  <div id="app">
    <nav>
      <div class="nav-links">
        <router-link to="/">首页</router-link> |
        <router-link to="/redemption">礼包兑换</router-link> |
        <router-link to="/about">关于</router-link>
      </div>
      <div class="theme-switch">
        <button class="theme-btn" @click="toggleTheme">
          <i :class="['theme-icon', currentTheme === 'dark' ? 'icon-sun' : 'icon-moon']"></i>
          {{ currentTheme === 'dark' ? '日间模式' : '夜间模式' }}
        </button>
      </div>
    </nav>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      currentTheme: document.documentElement.getAttribute('theme-mode') || 'light'
    }
  },
  methods: {
    toggleTheme() {
      this.$toggleTheme()
      this.currentTheme = document.documentElement.getAttribute('theme-mode')
    }
  }
}
</script>

<style>
:root {
  --theme-bg: #fff;
  --theme-text: #2c3e50;
  --theme-border: #ddd;
  --nav-bg: #fff;
  --nav-text: #2c3e50;
  --nav-active: #42b983;
  --card-bg: #fff;
  --success-bg: #f0f9eb;
  --success-border: #e1f3d8;
  --error-bg: #fef0f0;
  --error-border: #fde2e2;
  --used-bg: #fdf6ec;
  --used-border: #faecd8;
}

:root[theme-mode="dark"] {
  --theme-bg: #1a1a1a;
  --theme-text: #fff;
  --theme-border: #444;
  --nav-bg: #2c2c2c;
  --nav-text: #fff;
  --nav-active: #67c23a;
  --card-bg: #2c2c2c;
  --success-bg: #283c34;
  --success-border: #3c523d;
  --error-bg: #3c2829;
  --error-border: #523c3d;
  --used-bg: #3c3429;
  --used-border: #524c3d;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--theme-bg);
  color: var(--theme-text);
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

nav {
  padding: 20px 30px;
  background-color: var(--nav-bg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  text-align: center;
}

nav a {
  font-weight: bold;
  color: var(--nav-text);
  text-decoration: none;
  margin: 0 10px;
  transition: color 0.3s;
}

nav a.router-link-exact-active {
  color: var(--nav-active);
}

.main-content {
  flex: 1;
  padding: 20px;
}

.theme-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: var(--nav-bg);
  color: var(--nav-text);
  border: 1px solid var(--theme-border);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-icon {
  margin-right: 8px;
  font-size: 16px;
}

.icon-sun::before {
  content: '☀️';
}

.icon-moon::before {
  content: '🌙';
}

.theme-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media screen and (max-width: 768px) {
  nav {
    padding: 15px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .nav-links {
    flex: 1;
    text-align: center;
  }

  .theme-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
