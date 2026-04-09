<template>
  <el-dialog
    title="客户详情"
    :visible.sync="isVisible"
    width="600px"
    @close="handleClose"
  >
    <div v-loading="loading" class="detail-container">
      <div class="detail-item">
        <span class="detail-label">客户名称：</span>
        <span class="detail-value">{{ detail.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">手机号：</span>
        <span class="detail-value">{{ detail.phone || '无' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">状态：</span>
        <span class="detail-value">
          <el-tag :type="detail.status === 1 ? 'success' : 'danger'" size="small">
            {{ detail.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">客户等级：</span>
        <span class="detail-value">{{ getLevelName(detail.levelId) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">联系地址：</span>
        <span class="detail-value">{{ detail.address || '无' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">创建时间：</span>
        <span class="detail-value">{{ detail.createTime }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">备注：</span>
        <span class="detail-value">{{ detail.remark || '无' }}</span>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'

export default {
  props: {
    customerId: { type: String, required: true }
  },
  data() {
    return {
      isVisible: true,
      loading: false,
      detail: {},
      customerLevels: []
    }
  },
  computed: {

  },
  created() {
    this.customerLevels = this.$store.getters['dict/getCustomerLevels']
    this.fetchDetail()
  },
  methods: {
    getLevelName(levelId) {
      if (!levelId && levelId !== 0) return '未设置'
      const level = this.customerLevels.find(item => String(item.dictValue) === String(levelId))
      return level ? level.dictName : '未知等级'
    },
    async fetchDetail() {
      this.loading = true
      try {
        const res = await request({ url: `/erp-service/customer/get/${this.customerId}`, method: 'get' })
        if (res.code === 200) {
          this.detail = res.data
        }
      } finally {
        this.loading = false
      }
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.detail-container {
  padding: 10px 20px;
}
.detail-item {
  display: flex;
  margin-bottom: 15px;
  line-height: 1.5;
  font-size: 14px;
}
.detail-label {
  width: 90px;
  color: #909399;
  flex-shrink: 0;
}
.detail-value {
  color: #303133;
  word-break: break-all;
}
</style>
