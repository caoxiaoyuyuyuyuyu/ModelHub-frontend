<script setup lang="ts">
// 组件逻辑
</script>

<template>
  <div class="page-container">
    <h1>About ModelHub</h1>
    
    <section class="content-section">
      <h2>Our Story</h2>
      <p>ModelHub was founded in 2025 with the vision to...</p>
    </section>
    
    <section class="content-section">
      <h2>Our Team</h2>
      <div class="team-grid">
        <!-- 团队成员展示 -->
      </div>
    </section>
  </div>
</template>

<style scoped>

.content-section {
  margin: 2rem 0;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
</style>