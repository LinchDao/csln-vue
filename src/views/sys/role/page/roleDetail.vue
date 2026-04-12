<template>
  <el-dialog
    title="角色详情"
    :visible.sync="isVisible"
    width="700px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading" class="detail-container">
      <el-card shadow="hover" class="detail-card">
        <h3 class="card-title">基础信息</h3>
        <div class="detail-row">
          <span class="detail-label">角色编码：</span>
          <span class="detail-value">{{ detailData.roleCode || '无' }}</span>
          <span class="detail-label ml-20">角色名称：</span>
          <span class="detail-value">{{ detailData.roleName || '无' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">备注：</span>
          <span class="detail-value" style="max-width: 500px;">{{ detailData.remark || '无' }}</span>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="detail-card mt-16">
        <h3 class="card-title">分配信息</h3>
        <div class="detail-row">
          <span class="detail-label">已分配菜单：</span>
          <div class="role-list">
            <el-tag
              v-for="id in detailData.menuIds"
              :key="'menu-'+id"
              type="info"
              class="role-tag"
            >
              {{ getMenuTitle(id) || id }}
            </el-tag>
            <span v-if="!detailData.menuIds || detailData.menuIds.length === 0">无</span>
          </div>
        </div>
        <div class="detail-row">
          <span class="detail-label">已分配权限：</span>
          <div class="role-list">
            <el-tag
              v-for="id in detailData.permIds"
              :key="'perm-'+id"
              type="success"
              class="role-tag"
            >
              {{ getPermName(id) || id }}
            </el-tag>
            <span v-if="!detailData.permIds || detailData.permIds.length === 0">无</span>
          </div>
        </div>
      </el-card>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'
export default {
  name: 'RoleDetailModal',
  props: {
    roleId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isVisible: true,
      loading: false,
      menuList: [],
      permList: [],
      detailData: {
        id: '',
        roleCode: '',
        roleName: '',
        remark: '',
        menuIds: [],
        permIds: []
      }
    }
  },
  created() {
    this.fetchDetailData()
  },
  methods: {
    async fetchDetailData() {
      this.loading = true
      try {
        const [detailRes, menuRes, permRes] = await Promise.all([
          request({ url: `/erp-service/role/get/${this.roleId}`, method: 'get' }),
          request({ url: '/erp-service/menu/list', method: 'get' }),
          request({ url: '/erp-service/permission/list', method: 'get' })
        ])
        if (detailRes.code === 200 && detailRes.data) {
          this.detailData = detailRes.data
        } else {
          this.$message.error(detailRes.message || '获取角色详情失败')
          this.handleClose()
        }
        this.menuList = menuRes.data || []
        this.permList = permRes.data || []
      } catch (error) {
        this.$message.error('获取详情失败：' + (error.response?.data?.message || error.message))
        this.handleClose()
        console.error('详情接口异常：', error)
      } finally {
        this.loading = false
      }
    },
    getMenuTitle(id) {
      const menu = this.menuList.find(m => m.id === id)
      return menu ? menu.title : ''
    },
    getPermName(id) {
      const perm = this.permList.find(p => p.id === id)
      return perm ? perm.permName : ''
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.detail-container {
  padding: 10px 0;
}
.detail-card {
  padding: 16px;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1989fa;
}
.detail-row {
  display: flex;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.detail-label {
  font-size: 14px;
  color: #606266;
  width: 100px;
}
.detail-value {
  font-size: 14px;
  color: #303133;
  flex: 1;
}
.ml-20 {
  margin-left: 20px;
}
.mt-16 {
  margin-top: 16px;
}
.role-list {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  gap: 8px;
}
.role-tag {
  height: 24px;
  line-height: 24px;
  padding: 0 8px;
}
</style>
