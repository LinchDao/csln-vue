<template>
  <div class="app-container template-detail-container template-detail-layout">
    <div class="template-operate-bar template-action-group">
      <el-button type="primary" icon="el-icon-edit" @click="handleEdit">
        编辑
      </el-button>
      <el-button icon="el-icon-arrow-left" @click="handleBack">
        返回
      </el-button>
    </div>

    <el-card shadow="never" class="template-section">
      <div class="template-section__title">基础信息</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="template-info-item">
            <span class="template-info-item__label">单据编号</span>
            <span class="template-info-item__value">{{ detailData.code || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="template-info-item">
            <span class="template-info-item__label">单据名称</span>
            <span class="template-info-item__value">{{ detailData.name || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="template-info-item">
            <span class="template-info-item__label">状态</span>
            <el-tag :type="detailData.status === 1 ? 'success' : 'info'">
              {{ detailData.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 12px;">
        <el-col :span="8">
          <div class="template-info-item">
            <span class="template-info-item__label">创建人</span>
            <span class="template-info-item__value">{{ detailData.createUserName || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="template-info-item">
            <span class="template-info-item__label">创建时间</span>
            <span class="template-info-item__value">{{ detailData.createTime || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="template-info-item">
            <span class="template-info-item__label">备注</span>
            <span class="template-info-item__value">{{ detailData.remark || '-' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="template-section template-section--mt16">
      <div class="template-section__title">明细列表</div>
      <el-table
        v-loading="loading"
        :data="detailData.items"
        border
        style="width: 100%;"
      >
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column label="明细编码" prop="itemCode" min-width="140" />
        <el-table-column label="明细名称" prop="itemName" min-width="180" />
        <el-table-column label="数量" prop="qty" width="120" align="center" />
        <el-table-column label="单价" prop="price" width="120" align="center" />
        <el-table-column label="金额" prop="amount" width="120" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'TemplateDetail',
  data() {
    return {
      loading: false,
      detailData: {
        id: undefined,
        code: '',
        name: '',
        status: 1,
        createUserName: '',
        createTime: '',
        remark: '',
        items: []
      }
    }
  },
  created() {
    this.fetchDetail(this.$route.params.id)
  },
  methods: {
    async fetchDetail(id) {
      this.loading = true
      try {
        // request placeholder
        // const { data } = await request({
        //   url: `/erp-service/xxx/${id}`,
        //   method: 'get'
        // })
        // this.detailData = data
        this.detailData = {
          id: id || 1,
          code: 'TMP-DTL-001',
          name: '详情模板数据',
          status: 1,
          createUserName: 'admin',
          createTime: '2026-04-01 11:00:00',
          remark: '用于统一详情页结构',
          items: [
            { itemCode: 'I-001', itemName: '明细A', qty: 2, price: 100, amount: 200 },
            { itemCode: 'I-002', itemName: '明细B', qty: 1, price: 80, amount: 80 }
          ]
        }
      } finally {
        this.loading = false
      }
    },
    handleBack() {
      this.$router.back()
    },
    handleEdit() {
      this.$message.info('模板占位：跳转编辑页')
    }
  }
}
</script>

<style lang="scss" scoped>
.template-operate-bar {
  justify-content: flex-end;
}
</style>
