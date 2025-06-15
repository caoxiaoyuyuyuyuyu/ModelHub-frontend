<script setup lang="ts">
defineProps<{
  currentPage: number;
  pageSize: number;
  total: number;
}>();

const emit = defineEmits(['page-change']);

const handlePageChange = (newPage: number) => {
  emit('page-change', newPage);
};
</script>

<template>
  <div class="pagination-container">
    <ElPagination
      :size="'large'"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next, jumper"
      background
      @current-change="handlePageChange"
    />
  </div>
</template>

<style scoped>
.pagination-container {
  margin-top: 4rem;
  display: flex;
  justify-content: center;
}
</style>