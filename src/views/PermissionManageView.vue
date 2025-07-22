<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import api from '../utils/api';

interface Role { 
  id: number; 
  name: string; 
  description: string;
  permissions: string[];
}
interface Route { 
  id: number;
  name: string; 
  path: string; 
  component: string;
  meta: { 
    icon: string;
  };
  roles: string[];
}
interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
}
interface HierarchicalRoute extends Route {
  children?: HierarchicalRoute[];
}


// 所有角色选项
const allRoles = ref<Role[]>([]);

// 模拟路由权限数据
const routes = ref<HierarchicalRoute[]>([]);

// 所有可用权限选项
const allPermissions = ref<Permission[]>([]);

// 当前选中的用户
const roleFormRef = ref<FormInstance>();
const roleForm = reactive({
  id: null as number | null,
  name: '',
  permissions: [] as string[]
});

// 当前选中的路由
const selectedRoute = ref<any>(null);
const routeFormRef = ref<FormInstance>();
const routeForm = reactive({
  path: '',
  name: '',
  roles: [] as string[]
});

// 表单验证规则
const rules = reactive<FormRules>({
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
  roles: [{ type: 'array', required: true, message: '请至少选择一个角色', trigger: 'change' }]
});

// 选择路由
const selectRoute = (route: any) => {
  selectedRoute.value = route;
  Object.assign(routeForm, {
    path: route.path,
    name: route.name,
    roles: [...route.roles]
  });
};
watch(() => roleForm.id, (newRoleId) => {
  if (newRoleId) {
    const selectedRole = allRoles.value.find(role => role.id === newRoleId);
    if (selectedRole) {
      roleForm.name = selectedRole.name;
      roleForm.permissions = [...selectedRole.permissions];
    }
  } else {
    roleForm.name = '';
    roleForm.permissions = [];
  }
});

const flattenRoutes = (routes: HierarchicalRoute[]): Route[] => {
  return routes.reduce((acc: Route[], route) => {
    acc.push({
      id: route.id,
      name: route.name,
      path: route.path,
      component: route.component,
      meta: route.meta,
      roles: route.roles
    });
    if (route.children) {
      acc.push(...flattenRoutes(route.children));
    }
    return acc;
  }, []);
};
// 保存用户权限
const saveRolePermissions = async () => {
  if (!roleForm.id) {
    ElMessage.warning('请选择角色');
    return;
  }
  
  try {
    await api.put(`/permission/roles/${roleForm.id}`, {
      permissions: roleForm.permissions
    });
    ElMessage.success('角色权限更新成功');
  } catch (error) {
    ElMessage.error('角色权限更新失败');
  }
};
// 保存路由权限
const saveRoutePermissions = async () => {
  if (!selectedRoute.value) {
    ElMessage.warning('请选择路由');
    return;
  }
  
  try {
    await api.put(`/permission/routes/${selectedRoute.value.id}`, {
      roles: routeForm.roles
    });
    ElMessage.success('路由权限更新成功');
    
    // Update the local state to reflect changes
    const route = routes.value.find(r => r.id === selectedRoute.value.id);
    if (route) {
      route.roles = [...routeForm.roles];
    }
  } catch (error) {
    ElMessage.error('路由权限更新失败');
  }
};

// 重置表单
const resetForm = () => {
  roleForm.id = null;
  roleForm.name = '';
  roleForm.permissions = [];
  routeForm.path = '';
  routeForm.name = '';
  routeForm.roles = [];
  selectedRoute.value = null;
};

const loading = ref(false);

onMounted(() => {
  loading.value = true;
  Promise.all([
    api.get('/permission/roles'),
    api.get('/permission/routes'),
    api.get('/permission')
  ]).then(([rolesRes, routesRes, permRes]) => {
    allRoles.value = rolesRes.data;
    routes.value = routesRes.data.data;
    allPermissions.value = permRes.data;
  }).catch(err => {
    ElMessage.error('加载数据失败');
  }).finally(() => {
    loading.value = false;
  });
});
</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <h2>权限管理</h2>
      <p class="subtitle">管理系统用户和路由的访问权限</p>
      <el-skeleton :rows="5" animated v-if="loading" />

      <div v-else class="permission-container">
        <!-- 角色权限管理 -->
        <div class="permission-section" style="flex: 0.3;">
          <h3>角色权限管理</h3>
          
          <el-form 
            ref="roleFormRef" 
            :model="roleForm" 
            :rules="rules" 
            label-width="100px"
            class="permission-form"
          >
            
            <el-form-item label="角色" prop="name">
              <el-select v-model="roleForm.id" placeholder="请选择角色">
              <el-option 
                v-for="role in allRoles" 
                :key="role.id" 
                :label="role.name" 
                :value="role.id"
              />
            </el-select>
            </el-form-item>
            
            <el-form-item label="权限">
              <el-checkbox-group class="permission-checkbox" v-model="roleForm.permissions">
                <el-checkbox
                  v-for="perm in allPermissions" 
                  :key="perm.id" 
                  :label="perm.code"
                >
                  {{ perm.description }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveRolePermissions">
                保存
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 路由权限管理 -->
        <div class="permission-section">
          <h3>路由权限管理</h3>
          
          <div class="route-management-container">
            <!-- Route Tree Navigation -->
            <div class="route-tree">
              <el-tree
                :data="routes"
                node-key="path"
                :props="{
                  children: 'children',
                  label: 'name'
                }"
                :expand-on-click-node="false"
                @node-click="selectRoute"
                :highlight-current="true"
              >
                <template #default="{ node, data }">
                  <span class="route-tree-node">
                    <span>{{ node.label }}</span>
                    <span class="path-tag">{{ data.path }}</span>
                    <span class="method-tag">{{ data.method || 'GET' }}</span>
                  </span>
                </template>
              </el-tree>
            </div>
            
            <!-- Route Details Form -->
            <div class="route-form-container">
              <el-form 
                v-if="selectedRoute" 
                ref="routeFormRef" 
                :model="routeForm" 
                :rules="rules" 
                label-width="120px"
                class="permission-form"
              >
                <el-form-item label="路由路径" prop="path">
                  <el-input v-model="routeForm.path" disabled />
                </el-form-item>
                
                <el-form-item label="HTTP方法" prop="method">
                  <el-select v-model="selectedRoute.method" disabled>
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="路由名称" prop="name">
                  <el-input v-model="routeForm.name" />
                </el-form-item>
                
                <!-- <el-form-item label="图标" prop="icon">
                  <el-input v-model="routeForm.meta.icon" placeholder="输入Element Plus图标类名" />
                </el-form-item> -->
                
                <el-form-item label="允许角色" prop="roles">
                  <el-checkbox-group v-model="routeForm.roles" class="role-checkboxes">
                    <el-checkbox 
                      v-for="role in allRoles" 
                      :key="role.id" 
                      :label="role.name"
                      class="role-checkbox"
                    >
                      {{ role.name }}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="saveRoutePermissions">
                    保存
                  </el-button>
                  <el-button @click="resetForm">重置</el-button>
                </el-form-item>
              </el-form>
              
              <div v-else class="empty-selection">
                <el-empty description="请从左侧选择路由进行权限配置" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.permission-container {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}

.permission-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.route-management-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.route-tree {
  /* flex: 0 0 300px; */
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
  max-height: 600px;
}

.route-form-container {
  flex: 1;
  min-width: 0;
}

.route-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
}

.path-tag {
  margin-left: 10px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #666;
}

.method-tag {
  margin-left: 10px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: bold;
}

.role-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.role-checkbox {
  margin-right: 0;
  margin-left: 0;
}

.empty-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}
.permission-container {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}

.permission-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.permission-section h3 {
  margin-top: 0;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.selection-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.selection-item {
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-item:last-child {
  border-bottom: none;
}

.selection-item:hover {
  background-color: #f5f7fa;
}

.selection-item.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.role-tag, .path-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #666;
}

.permission-form {
  margin-top: 20px;
}

.permission-checkbox { 
  display: flex;
  flex-direction: column;
}
</style>