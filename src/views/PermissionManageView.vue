<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import api from '../utils/api';

// 模拟用户数据
const users = ref([
  { id: 1, username: 'admin', role: 'admin', permissions: ['all'] },
  { id: 2, username: 'editor', role: 'editor', permissions: ['config', 'database'] },
  { id: 3, username: 'viewer', role: 'viewer', permissions: ['database'] }
]);

// 模拟路由权限数据
const routes = ref([
  { path: '/config', name: '模型配置管理', roles: ['admin', 'editor'] },
  { path: '/database', name: '数据库管理', roles: ['admin', 'editor', 'viewer'] },
  { path: '/model', name: '微调管理', roles: ['admin'] },
  { path: '/local-model', name: '模型管理', roles: ['admin'] },
  { path: '/permission', name: '权限管理', roles: ['admin'] }
]);

// 当前选中的用户
const selectedUser = ref<any>(null);
const userFormRef = ref<FormInstance>();
const userForm = reactive({
  username: '',
  role: '',
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
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
  name: [{ required: true, message: '请输入路由名称', trigger: 'blur' }]
});

// 所有可用权限选项
const allPermissions = ref([
  { label: '模型配置管理', value: 'config' },
  { label: '数据库管理', value: 'database' },
  { label: '微调管理', value: 'model' },
  { label: '模型管理', value: 'local-model' },
  { label: '权限管理', value: 'permission' }
]);

// 所有角色选项
const allRoles = ref(['admin', 'editor', 'viewer']);

// 选择用户
const selectUser = (user: any) => {
  selectedUser.value = user;
  Object.assign(userForm, {
    username: user.username,
    role: user.role,
    permissions: [...user.permissions]
  });
  selectedRoute.value = null;
};

// 选择路由
const selectRoute = (route: any) => {
  selectedRoute.value = route;
  Object.assign(routeForm, {
    path: route.path,
    name: route.name,
    roles: [...route.roles]
  });
  selectedUser.value = null;
};

// 保存用户权限
const saveUserPermissions = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  await formEl.validate((valid) => {
    if (valid) {
      const user = users.value.find(u => u.id === selectedUser.value.id);
      if (user) {
        user.role = userForm.role;
        user.permissions = userForm.permissions;
        ElMessage.success('用户权限更新成功');
      }
    }
  });
};

// 保存路由权限
const saveRoutePermissions = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  await formEl.validate((valid) => {
    if (valid) {
      const route = routes.value.find(r => r.path === selectedRoute.value.path);
      if (route) {
        route.roles = routeForm.roles;
        ElMessage.success('路由权限更新成功');
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (selectedUser.value) {
    selectUser(selectedUser.value);
  } else if (selectedRoute.value) {
    selectRoute(selectedRoute.value);
  }
};

onMounted(() => { 
    api.get('/user/test').then(res => { 
        console.log(res)
        ElMessage.success('测试成功')
    }).catch(err => { 
        ElMessage.error('测试失败')
    })
});
</script>

<template>
  <div class="page-container">
    <div class="content-section">
      <h2>权限管理</h2>
      <p class="subtitle">管理系统用户和路由的访问权限</p>
      
      <div class="permission-container">
        <!-- 用户权限管理 -->
        <div class="permission-section">
          <h3>用户权限管理</h3>
          <div class="selection-list">
            <div 
              v-for="user in users" 
              :key="user.id" 
              class="selection-item" 
              :class="{ active: selectedUser?.id === user.id }"
              @click="selectUser(user)"
            >
              <span>{{ user.username }}</span>
              <span class="role-tag">{{ user.role }}</span>
            </div>
          </div>
          
          <el-form 
            v-if="selectedUser" 
            ref="userFormRef" 
            :model="userForm" 
            :rules="rules" 
            label-width="100px"
            class="permission-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" disabled />
            </el-form-item>
            
            <el-form-item label="角色" prop="role">
              <el-select v-model="userForm.role" placeholder="请选择角色">
                <el-option 
                  v-for="role in allRoles" 
                  :key="role" 
                  :label="role" 
                  :value="role"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="权限">
              <el-checkbox-group v-model="userForm.permissions">
                <el-checkbox 
                  v-for="perm in allPermissions" 
                  :key="perm.value" 
                  :label="perm.value"
                >
                  {{ perm.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveUserPermissions(userFormRef)">
                保存
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 路由权限管理 -->
        <div class="permission-section">
          <h3>路由权限管理</h3>
          <div class="selection-list">
            <div 
              v-for="route in routes" 
              :key="route.path" 
              class="selection-item" 
              :class="{ active: selectedRoute?.path === route.path }"
              @click="selectRoute(route)"
            >
              <span>{{ route.name }}</span>
              <span class="path-tag">{{ route.path }}</span>
            </div>
          </div>
          
          <el-form 
            v-if="selectedRoute" 
            ref="routeFormRef" 
            :model="routeForm" 
            :rules="rules" 
            label-width="100px"
            class="permission-form"
          >
            <el-form-item label="路由路径" prop="path">
              <el-input v-model="routeForm.path" disabled />
            </el-form-item>
            
            <el-form-item label="路由名称" prop="name">
              <el-input v-model="routeForm.name" />
            </el-form-item>
            
            <el-form-item label="允许角色">
              <el-checkbox-group v-model="routeForm.roles">
                <el-checkbox 
                  v-for="role in allRoles" 
                  :key="role" 
                  :label="role"
                >
                  {{ role }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveRoutePermissions(routeFormRef)">
                保存
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
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
</style>