<template>
  <el-dialog
    title="用户详情"
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
          <span class="detail-label">用户账号：</span>
          <span class="detail-value">{{ detailData.username || '无' }}</span>
          <span class="detail-label ml-20">真实姓名：</span>
          <span class="detail-value">{{ detailData.realName || '无' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">手机号：</span>
          <span class="detail-value">{{ detailData.phone || '无' }}</span>
          <span class="detail-label ml-20">用户状态：</span>
          <el-tag :type="detailData.status === 1 ? 'success' : 'danger'" class="detail-tag">
            {{ detailData.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </div>
        <div class="detail-row">
          <span class="detail-label">创建时间：</span>
          <span class="detail-value">{{ detailData.createTime || '无' }}</span>
        </div>
      </el-card>
      <!-- 权限信息卡片 -->
      <el-card shadow="hover" class="detail-card mt-16">
        <h3 class="card-title">权限信息</h3>
        <div class="detail-row">
          <span class="detail-label">所属门店：</span>
          <span class="detail-value">{{ detailData.shopName || '无' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">所属仓库：</span>
          <span class="detail-value">{{ detailData.warehouseName || '无' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">分配角色：</span>
          <div class="role-list">
            <el-tag
              v-for="(role, index) in detailData.roleNames"
              :key="index"
              type="info"
              class="role-tag"
            >
              {{ role }}
            </el-tag>
            <span v-if="!detailData.roleNames || detailData.roleNames.length === 0">无</span>
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
  name: 'UserDetailModal',
  props: {
    // 仅接收用户ID，移除visible prop
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isVisible: true, // 内部默认显示，由父组件v-if控制整体显隐
      loading: false,
      detailData: {
        id: '',
        username: '',
        realName: '',
        phone: '',
        shopId: '',
        shopName: '',
        warehouseId: '',
        warehouseName: '',
        roleIds: [],
        roleNames: [],
        status: 1,
        createTime: ''
      }
    }
  },
  // 核心：created中处理加载逻辑，移除watch监听
  created() {
    this.fetchDetailData()
  },
  methods: {
    /**
     * 调用详情接口拉取数据（created中直接执行）
     */
    async fetchDetailData() {
      this.loading = true
      try {
        const res = await request({
          url: `/api/user/get/${this.userId}`,
          method: 'get'
        })
        if (res.code === 200 && res.data) {
          this.detailData = res.data
        } else {
          this.$message.error(res.message || '获取用户详情失败')
          this.handleClose()
        }
      } catch (error) {
        this.$message.error('获取详情失败：' + (error.response?.data?.message || error.message))
        this.handleClose()
        console.error('详情接口异常：', error)
      } finally {
        this.loading = false
      }
    },
    /**
     * 关闭弹窗，通知父组件隐藏
     */
    handleClose() {
      this.$emit('close') // 父组件接收后设置detailVisible=false
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
  align-items: center;
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
  max-width: 200px;
}
.ml-20 {
  margin-left: 20px;
}
.mt-16 {
  margin-top: 16px;
}
.detail-tag {
  height: 24px;
  line-height: 24px;
  padding: 0 8px;
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
