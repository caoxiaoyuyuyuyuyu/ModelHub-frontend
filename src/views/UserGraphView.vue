<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElNotification } from 'element-plus'
import { getUserInfo, uploadAvatar } from '../api/user'
import { getModelInfos } from '../api/model'
import { ModelConfig, ModelInfo } from '../types/model_config';
import { document } from '../types/document'
import { useRouter } from 'vue-router';

import { useUserStore } from '../stores/user';
// 引入echarts
import * as echarts from 'echarts';
import { nextTick, watch, onUnmounted } from 'vue';
// 添加图表实例引用
const relationGraph = ref<HTMLElement | null>(null);
const chartInstance = ref<echarts.ECharts | null>(null);

// 定义类型
interface UserInfo {
  id: number
  name: string
  email: string
  type: string
  avatar: string
  describe: string | null
  create_at: string
  update_at: string
}
interface VectorDb {
  id: number
  name: string
  describe: string
  embedding_id: number
  document_similarity: number
  created_at: string
  updated_at: string
  model_configs: ModelConfig[]
  documents: document[]
}
// 响应式数据
const userInfo = ref<UserInfo | null>(null)
const userStore = useUserStore()
const modelConfigs = ref<ModelConfig[]>([])
const vectorDBs = ref<VectorDb[]>([])
const modelInfos = ref<ModelInfo[]>([])
const activeTab = ref('connections')

// 计算属性
const baseModelMap = computed(() => {
  const map = new Map<number, string>()
  modelInfos.value.forEach(model => {
    map.set(model.id, model.model_name)
  })
  return map
})

// 获取向量数据库名称
const getVectorDBName = (id: number | null) => {
  if (id === null) return '无'
  const vdb = vectorDBs.value.find(db => db.id === id)
  return vdb ? vdb.name : '未知'
}

// 获取向量数据库提示
const getVectorDBTips = (id: number | null) => {
  if (id === null) return '未关联向量数据库'
  const vdb = vectorDBs.value.find(db => db.id === id)
  return vdb ? '点击查看数据库详情' : '未知数据库'
}

const router = useRouter();
const toVectorDB = (id: number | null) => { 
  if (id === null) return
  router.push(`/database/${id}`);
}
const handleViewConfig = (config: ModelConfig) => { 
  router.push({
    name: 'configDetail',
    params: { id: config.id },
    state: { 
      config: JSON.parse(JSON.stringify(config)) 
    } // Pass the config data via state
  });
}
const navigateToDetail = (id: number) => {
  router.push(`/database/${id}`);
};

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    // 获取用户信息
    const res = await getUserInfo()
    console.log(res)
    userInfo.value = res.user_info
    // 更新用户头像地址
    if (userInfo.value) {
      userStore.updateUserAvatar(userInfo.value.avatar);
      userInfo.value.avatar = userStore.user?.avatar ?? userInfo.value.avatar;
    }
    modelConfigs.value = res.model_configs
    vectorDBs.value = res.vector_dbs
    
    // 获取模型信息
    const modelRes = await getModelInfos()
    modelInfos.value = modelRes
    
    console.log('数据加载完成')
    if (activeTab.value === 'connections') {
      nextTick(drawRelationGraph);
    }
    
  } catch (error: any) {
    ElNotification({
      title: '错误',
      message: error.message || '获取数据失败',
      type: 'error',
      duration: 5000
    })
  }
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
});

// 构建关系图数据的方法
const buildGraphData = () => {
  if (!userInfo.value || !modelConfigs.value || !vectorDBs.value) return { nodes: [], links: [] };

  const nodes: any[] = [];
  const links: any[] = [];

  // 定义列的位置和间距
  const columnPositions = {
    // '用户': 0,
    '模型配置': 200,
    '基础模型': 400,
    '向量数据库': 600,
    '文档': 800
  };

  // 存储每列节点的数量（用于垂直定位）
  const columnCounts = {
    // '用户': 0,
    '模型配置': 0,
    '基础模型': 0,
    '向量数据库': 0,
    '文档': 0
  };

  // 添加用户节点
//   nodes.push({
//     id: 'user',
//     name: userInfo.value.name,
//     symbolSize: 70,
//     itemStyle: { color: '#5470c6' },
//     category: '用户',
//     tooltip: {
//       formatter: `用户: ${userInfo.value.name}<br/>邮箱: ${userInfo.value.email}<br/>类型: ${userInfo.value.type}`
//     },
//     // 固定位置在第一列
//     x: columnPositions['用户'],
//     y: 300
//   });
//   columnCounts['用户']++;

  // 添加模型配置节点
  modelConfigs.value.forEach(config => {
    // 模型配置在第二列
    const col = '模型配置';
    const count = columnCounts[col]++;
    const y = 100 + count * 100;
    
    nodes.push({
      id: `config_${config.id}`,
      name: config.name,
      symbolSize: 40,
      itemStyle: { 
        color: config.is_private ? '#ee6666' : '#91cc75' 
      },
      category: col,
      tooltip: {
        formatter: `配置: ${config.name}<br/>描述: ${config.describe || '无描述'}<br/>创建: ${formatDate(config.created_at)}`
      },
      x: columnPositions[col],
      y: y
    });
    
    // 用户 -> 模型配置
    // links.push({
    //   source: 'user',
    //   target: `config_${config.id}`,
    //   label: {
    //     show: true,
    //     formatter: '创建'
    //   }
    // });
    
    // 模型配置 -> 基础模型
    if (config.base_model_id) {
      const modelName = baseModelMap.value.get(config.base_model_id) || `模型${config.base_model_id}`;
      
      // 检查是否已添加该模型节点
      if (!nodes.some(n => n.id === `model_${config.base_model_id}`)) {
        const col = '基础模型';
        const count = columnCounts[col]++;
        const y = 100 + count * 100;
        
        nodes.push({
          id: `model_${config.base_model_id}`,
          name: modelName,
          symbolSize: 35,
          itemStyle: { color: '#73c0de' },
          category: col,
          tooltip: {
            formatter: `基础模型: ${modelName}`
          },
          x: columnPositions[col],
          y: y
        });
      }
      
      links.push({
        source: `config_${config.id}`,
        target: `model_${config.base_model_id}`,
        label: {
          show: true,
          formatter: '基于'
        }
      });
    }
    
    // 模型配置 -> 向量数据库
    if (config.vector_db_id) {
      links.push({
        source: `config_${config.id}`,
        target: `db_${config.vector_db_id}`,
        label: {
          show: true,
          formatter: '使用'
        }
      });
    }
  });

  console.log(columnCounts['模型配置'])
  var count = 1
  // 添加向量数据库节点
  vectorDBs.value.forEach(db => {
    const col = '向量数据库';
    const y = columnCounts['模型配置'] * 100 - count * 100;
    console.log(y)
    count += 1;
    nodes.push({
      id: `db_${db.id}`,
      name: db.name,
      symbolSize: 50,
      itemStyle: { color: '#fac858' },
      category: col,
      tooltip: {
        formatter: `数据库: ${db.name}<br/>描述: ${db.describe || '无描述'}<br/>文档数: ${db.documents?.length || 0}`
      },
      x: columnPositions[col],
      y: y
    });
    
    // 用户 -> 向量数据库
    // links.push({
    //   source: 'user',
    //   target: `db_${db.id}`,
    //   label: {
    //     show: true,
    //     formatter: '创建'
    //   }
    // });
    
    // 向量数据库 -> 文档
    db.documents?.forEach((doc, docIndex) => {
      const col = '文档';
      const y = 50 + docIndex * 50;
      
      nodes.push({
        id: `doc_${doc.id}`,
        name: doc.original_name,
        symbolSize: 25,
        itemStyle: { color: '#3ba272' },
        category: col,
        tooltip: {
          formatter: `文档: ${doc.original_name}<br/>类型: ${doc.type}<br/>大小: ${(doc.size / 1024).toFixed(2)} KB`
        },
        x: columnPositions[col],
        y: y
      });
      
      links.push({
        source: `db_${db.id}`,
        target: `doc_${doc.id}`,
        label: {
          show: true,
          formatter: '包含'
        }
      });
    });
  });

  return { nodes, links };
};

// 绘制关系图
const drawRelationGraph = () => {
  console.log('drawRelationGraph', relationGraph.value);
  if (!relationGraph.value) return;
  
  // 销毁之前的图表实例
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
  
  chartInstance.value = echarts.init(relationGraph.value);
  const graphData = buildGraphData();
  
  const option: echarts.EChartsOption = {
    title: {
      text: '配置关系图',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return params.data.tooltip?.formatter || `${params.name} (${params.data.category})`;
        }
        return `${params.data.label?.formatter || '关联'}：${params.source} → ${params.target}`;
      }
    },
    // legend: {
    //   data: ['模型配置', '向量数据库', '文档', '基础模型'],
    //   bottom: 10,
    //   textStyle: {
    //     fontSize: 12
    //   }
    // },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      name: '关系图',
      type: 'graph',
      layout: 'none', // 使用固定布局
      data: graphData.nodes,
      links: graphData.links,
      categories: [
        // { name: '用户' },
        { name: '模型配置' },
        { name: '向量数据库' },
        { name: '文档' },
        { name: '基础模型' }
      ],
      roam: true,
      zoom: 1.2,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}',
        fontSize: 12
      },
      lineStyle: {
        color: 'source',
        curveness: 0.2,
        width: 2
      },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 10],
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 4
        }
      },
      edgeLabel: {
        show: true,
        formatter: '{c}',
        fontSize: 12
      }
    }]
  };
  chartInstance.value.setOption(option);
  
  // 响应窗口大小变化
  const resizeHandler = () => {
    chartInstance.value?.resize();
  };
  
  window.addEventListener('resize', resizeHandler);
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
  });
};
// 监听标签切换
watch(activeTab, (newVal) => {
  if (newVal === 'connections') {
    nextTick(() => {
      drawRelationGraph();
    });
  }
});

const avatarInput = ref<HTMLInputElement | null>(null);

// 处理头像上传
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    // 假设有一个上传头像的 API 函数 uploadAvatar
    const formData = new FormData();
    formData.append('file', file);

    const response = await uploadAvatar(formData); // 替换为你的 API 调用
    
    userStore.updateUserAvatar(response);
    // 更新用户头像地址
    if (userInfo.value) {
      userInfo.value.avatar = userStore.user?.avatar ?? userInfo.value.avatar;
    }

    ElNotification({
      title: '成功',
      message: '头像上传成功',
      type: 'success'
    });
  } catch (error) {
    console.error('头像上传失败：', error)
    if (userInfo.value) {
      userInfo.value.avatar = userStore.user?.avatar ?? userInfo.value.avatar;
    }
    ElNotification({
      title: '错误',
      message: '头像上传失败，请重试',
      type: 'error'
    });
  }
};
// 更换头像按钮点击
const changeAvatar = () => {
  if (avatarInput.value) {
    avatarInput.value.click();
  }
};


</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <!-- 用户信息区域 -->
      <div class="user-info-section">
        <div class="user-card">
          <div class="avatar-container">
            <!-- <div class="avatar-placeholder">
              <span>{{ userInfo?.name?.charAt(0) || 'U' }}</span>
            </div> -->
            <img :src="userInfo?.avatar" class="avatar-placeholder" :alt="userInfo?.name?.charAt(0) || 'U'"></img>
            <button class="change-avatar-btn" @click="changeAvatar">更换头像</button>
            <input type="file" accept="image/*" @change="handleAvatarUpload" hidden ref="avatarInput" />
          </div>
          <div class="user-details">
            <h2>{{ userInfo?.name || '未命名用户' }}</h2>
            <p class="email">{{ userInfo?.email || '未设置邮箱' }}</p>
            <div class="user-meta">
              <span class="badge">{{ userInfo?.type || '未知类型' }}</span>
              <span class="join-date">加入时间: {{ userInfo?.create_at ? formatDate(userInfo.create_at) : '未知' }}</span>
            </div>
            <p class="description">{{ userInfo?.describe?userInfo?.describe:'该用户暂无描述信息' }}</p>
          </div>
        </div>
      </div>
      
      <!-- 标签页区域 -->
      <div class="tabs-container">
        <div class="tabs">
          <button 
            :class="['tab', { 'active': activeTab === 'models' }]"
            @click="activeTab = 'models'"
          >
            <i class="el-icon-cpu"></i> 模型配置
            <span class="count-badge">{{ modelConfigs.length }}</span>
          </button>
          <button 
            :class="['tab', { 'active': activeTab === 'vector' }]"
            @click="activeTab = 'vector'"
          >
            <i class="el-icon-data-analysis"></i> 向量数据库
            <span class="count-badge">{{ vectorDBs.length }}</span>
          </button>
          <button 
            :class="['tab', { 'active': activeTab === 'connections' }]"
            @click="activeTab = 'connections'"
          >
            <i class="el-icon-link"></i> 配置关系图
          </button>
        </div>
        
        <!-- 模型配置区域 -->
        <div class="tab-content" v-if="activeTab === 'models'">
          <div class="models-grid">
            <div 
              v-for="config in modelConfigs" 
              :key="config.id"
              class="model-card"
              :class="{ 'private': config.is_private }"
            >
              <div class="model-header">
                <h3>{{ config.name }}</h3>
                <span class="privacy-tag" v-if="config.is_private">私有</span>
                <span class="privacy-tag public" v-else>公开</span>
              </div>
              <div class="model-desc"> 
                <p>{{ config.describe || '暂无描述' }}</p>
              </div>
              
              <div class="model-meta">
                <div class="meta-item">
                  <span class="label">基础模型:</span>
                  <span class="value">
                    {{ baseModelMap.get(config.base_model_id) || '未知模型' }}
                  </span>
                </div>
                <div class="meta-item">
                  <span class="label">向量数据库:</span>
                  <el-tooltip 
                    :content="getVectorDBTips(config.vector_db_id)" 
                    placement="top"
                  >
                  <span :class="config.vector_db_id === null?'value':'vector-link'" @click="toVectorDB(config.vector_db_id)" >
                    {{ getVectorDBName(config.vector_db_id) }}
                  </span>
                  </el-tooltip>
                </div>
                <div class="meta-item">
                  <span class="label">温度:</span>
                  <span class="value">{{ config.temperature }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">Top P:</span>
                  <span class="value">{{ config.top_p }}</span>
                </div>
              </div>
              
              <div class="model-footer">
                <span class="update-date">更新: {{ formatDate(config.updated_at) }}</span>
                <button class="action-button" @click="handleViewConfig(config)" >查看详情</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 向量数据库区域 -->
        <div class="tab-content" v-if="activeTab === 'vector'">
          <div class="vector-db-container">
            <div 
              v-for="db in vectorDBs" 
              :key="db.id"
              class="vector-card"
            >
              <div class="vector-header">
                <i class="el-icon-database"></i>
                <h3>{{ db.name }}</h3>
              </div>
              <div class="vector-body">
                <div class="vector-desc"> 
                  <p>{{ db.describe || '暂无描述' }}</p>
                </div>
                <div class="db-meta">
                  <span>创建: {{ formatDate(db.created_at) }}</span>
                  <span>更新: {{ formatDate(db.updated_at) }}</span>
                </div>
              </div>
              <div class="vector-footer">
                <span class="used-by">
                  <i class="el-icon-connection"></i>
                  被 {{ modelConfigs.filter(c => c.vector_db_id === db.id).length }} 个模型使用
                </span>
                <button class="action-button" @click="navigateToDetail(db.id)">管理</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 关系图区域 -->
        <div class="tab-content" v-if="activeTab === 'connections'">
          <div class="connections-container">
            <div ref="relationGraph" style="width: 100%;height: 100%;"></div>"
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-section {
    display: flex;
    flex-direction: column;
    min-height: -webkit-fill-available;
}
.change-avatar-btn {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.change-avatar-btn:hover {
  background-color: #2980b9;
}
.page-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 600;
  position: relative;
  padding-bottom: 15px;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #9b59b6);
  border-radius: 2px;
}

/* 用户信息区域 */
.user-info-section {
  /* background: linear-gradient(135deg, #f8f9fa, #e9ecef); */
  /* border-radius: 12px; */
  padding: 20px;
  margin-bottom: 30px;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); */
}

.user-card {
  display: flex;
  align-items: flex-end;
  gap: 25px;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  /* background: linear-gradient(135deg, #3498db, #9b59b6); */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  font-weight: bold;
  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); */
}

.user-details {
  flex: 1;
}

.user-details h2 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
}

.email {
  color: #7f8c8d;
  margin: 5px 0 15px;
  font-size: 16px;
}

.user-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
}

.badge {
  background: #3498db;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.join-date {
  color: #7f8c8d;
  font-size: 14px;
}

.description {
  color: #34495e;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.7);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

/* 标签页区域 */
.tabs-container {
  /* background: white; */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  flex-grow: 1;
display: flex;
flex-direction: column;
}

.tabs {
  display: flex;
  /* background: #f8f9fa; */
  /* border-bottom: 1px solid #eaeaea; */
}

.tab {
  flex: 1;
  padding: 18px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.tab:hover {
  background: #edf2f7;
  color: #3498db;
}

.tab.active {
  background: white;
  color: #3498db;
  border-bottom: 3px solid #3498db;
}

.tab.active .count-badge {
  background: #3498db;
  color: white;
}

.count-badge {
  background: #e0e6ed;
  color: #5a6268;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 13px;
}

.tab-content {
  padding: 25px;
  flex-grow: 1;
}

/* 模型配置区域 */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.model-card {
  border: 1px solid #eaeaea;
  border-radius: 10px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
  position: relative;
  overflow: hidden;
}

.model-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border-color: #3498db;
}

.model-card.private {
  border-left: 4px solid #e74c3c;
}

.model-card:not(.private) {
  border-left: 4px solid #2ecc71;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}

.model-header h3 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.privacy-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.privacy-tag.public {
  background: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.privacy-tag:not(.public) {
  background: rgba(231, 76, 60, 0.15);
  color: #c0392b;
}
.vector-desc {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 172px;
}

.vector-desc > p { 
  color: #7f8c8d;
  line-height: 1.6;
}
.model-desc {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 172px;
}

.model-desc > p { 
  color: #7f8c8d;
  line-height: 1.6;
}

.model-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 13px;
  color: #95a5a6;
  margin-bottom: 3px;
}

.value {
  font-weight: 500;
  color: #2c3e50;
}

.vector-link {
  font-weight: 500;
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(52, 152, 219, 0.3);
  transition: all 0.2s;
}

.vector-link:hover {
  color: #2980b9;
  text-decoration-color: #3498db;
}

.model-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f1f1;
  padding-top: 15px;
  margin-top: 10px;
}

.update-date {
  font-size: 13px;
  color: #95a5a6;
}

.action-button {
  background: #f8f9fa;
  border: 1px solid #eaeaea;
  padding: 8px 16px;
  border-radius: 6px;
  color: #3498db;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.action-button:hover {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

/* 向量数据库区域 */
.vector-db-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.vector-card {
  border: 1px solid #eaeaea;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
}

.vector-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.vector-header {
  background: linear-gradient(135deg, #3498db, #9b59b6);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.vector-header i {
  font-size: 24px;
}

.vector-header h3 {
  margin: 0;
  font-size: 20px;
}

.vector-body {
  padding: 20px;
}

.db-desc {
  color: #7f8c8d;
  line-height: 1.6;
  min-height: 100px;
}

.db-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #95a5a6;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #eee;
}

.vector-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.used-by {
  font-size: 14px;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 添加样式优化 */
.connections-container {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 确保图表容器有高度 */
#relation-graph {
  height: 100%;
}
@keyframes flow {
  0% {
    stroke-dashoffset: 10;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

</style>