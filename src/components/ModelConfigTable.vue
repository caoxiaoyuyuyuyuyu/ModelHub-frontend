<script setup lang="ts">
import { Edit, Delete } from '@element-plus/icons-vue';
import type { ModelConfig, ModelInfo } from '../types/model_config';
import type { VectorDbBase } from '../types/vectorDb';

defineProps<{
  modelConfigs: ModelConfig[];
  baseModels: ModelInfo[];
  vectorDbs: VectorDbBase[];
  loading: boolean;
}>();

const emit = defineEmits(['edit', 'delete']);

const handleEdit = (config: ModelConfig) => {
  emit('edit', config);
};

const handleDelete = (id: number) => {
  emit('delete', id);
};
</script>

<template>
  <ElTable
    :data="modelConfigs"
    v-loading="loading"
    border
    fit="true"
    stripe
    table-layout="auto"
    style="font-size: 1.1rem"
  >
    <ElTableColumn prop="name" label="配置名称" show-overflow-tooltip />
    <ElTableColumn prop="describe" label="描述" show-overflow-tooltip />
    <ElTableColumn prop="base_model_id" label="基础模型" show-overflow-tooltip>
      <template #default="{ row }">
        {{ baseModels.find(model => model.id === row.base_model_id)?.model_name }}
      </template>
    </ElTableColumn>
    <ElTableColumn label="参数设置">
      <template #default="{ row }">
        <div class="params">
          <span>温度: {{ row.temperature }}</span>
          <span>Top P: {{ row.top_p }}</span>
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="vector_db_id" label="向量数据库" show-overflow-tooltip>
      <template #default="{ row }">
        {{ vectorDbs.find(vectorDb => vectorDb.id === row.vector_db_id)?.name }}
      </template>
    </ElTableColumn>
    <ElTableColumn prop="is_private" label="可见性">
      <template #default="{ row }">
        <ElTag :type="row.is_private ? 'danger' : 'success'">
          {{ row.is_private ? '私有' : '公開' }}
        </ElTag>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="share_id" label="分享ID" show-overflow-tooltip />
    <ElTableColumn prop="updated_at" label="更新时间" show-overflow-tooltip />
    <ElTableColumn label="操作" fixed="right" width="120">
      <template #default="{ row }">
        <ElButton
          type="primary"
          :icon="Edit"
          size="small"
          circle
          @click="handleEdit(row)"
        />
        <ElButton
          type="danger"
          :icon="Delete"
          size="small"
          circle
          @click="handleDelete(row.id)"
        />
      </template>
    </ElTableColumn>
  </ElTable>
</template>
<style scoped>
.params {
display: flex;
flex-direction: column;
gap: 4px;
}

.params span {
font-size: 0.9em;
color: #666;
}

:deep(.el-table .cell) {
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
display: block;
}

:deep(.el-table__body) {
table-layout: fixed;
}

.params {
display: flex;
flex-direction: column;
gap: 4px;
white-space: normal;
}
</style>