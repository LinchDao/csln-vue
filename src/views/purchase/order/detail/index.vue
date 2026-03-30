<template>
  <div class="purchase-detail-container">
    <!-- 面包屑/标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item><a href="/purchase/order">采购单管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>采购单详情</el-breadcrumb-item>
      </el-breadcrumb>
      <h3 class="page-title">采购单详情</h3>
    </div>

    <!-- 操作按钮 -->
    <div class="operate-bar">
      <el-button type="primary" icon="el-icon-edit" @click="handleEdit">
        编辑采购单
      </el-button>
      <el-button icon="el-icon-arrow-left" @click="handleBack">
        返回列表
      </el-button>
    </div>

    <!-- 主单信息卡片 -->
    <el-card shadow="hover" class="main-info-card">
      <div class="card-title">采购单主信息</div>
      <el-row class="info-row" :gutter="20">
        <el-col :span="6">
          <div class="info-item">
            <label class="info-label">采购单号：</label>
            <span class="info-value">{{ purchaseDetail.purchaseNo || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <label class="info-label">供应商：</label>
            <span class="info-value">{{ purchaseDetail.supplierName || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <label class="info-label">订单状态：</label>
            <el-tag :type="getStatusTagType">{{ getStatusName }}</el-tag>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <label class="info-label">制单人：</label>
            <span class="info-value">{{ purchaseDetail.createUserName || '-' }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row class="info-row" :gutter="20" style="margin-top: 15px;">
        <el-col :span="6">
          <div class="info-item">
            <label class="info-label">下单时间：</label>
            <span class="info-value">{{ purchaseDetail.orderTime || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <label class="info-label">到货时间：</label>
            <span class="info-value">{{ purchaseDetail.arrivalTime || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <label class="info-label">总数量：</label>
            <span class="info-value">{{ purchaseDetail.totalQty || 0 }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <label class="info-label">总金额：</label>
            <span class="info-value">¥{{ (purchaseDetail.totalAmount || 0).toFixed(2) }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row class="info-row" style="margin-top: 15px;">
        <el-col :span="24">
          <div class="info-item full-width">
            <label class="info-label">备注：</label>
            <span class="info-value">{{ purchaseDetail.remark || '无' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 商品明细卡片 -->
    <el-card shadow="hover" class="item-info-card" style="margin-top: 20px;">
      <div class="card-title">采购商品明细</div>
      <el-table
        v-loading="loading"
        :data="purchaseDetail.purchaseOrderItem || []"
        border
        style="width:100%;"
        row-key="skuId"
        :empty-text="loading ? '加载中...' : '暂无采购明细'"
      >
        <el-table-column label="行号" type="index" align="center" width="80" />
        <el-table-column label="款号" prop="productNo" align="center" min-width="120" />
        <el-table-column label="商品名称" prop="productName" align="center" min-width="180" />
        <el-table-column label="颜色" prop="colorName" align="center" width="100" />
        <el-table-column label="尺码" prop="sizeName" align="center" width="100" />
        <el-table-column label="单价(元)" prop="price" align="center" width="120">
          <template slot-scope="scope">
            {{ (scope.row.price || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="采购数量" prop="qty" align="center" width="120" />
        <el-table-column label="金额(元)" prop="amount" align="center" width="120">
          <template slot-scope="scope">
            {{ (scope.row.amount || 0).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'PurchaseOrderDetail',
  data() {
    return {
      loading: false,
      purchaseId: this.$route.params.id, // 从路由获取采购单ID
      purchaseDetail: {
        purchaseOrderItem: [] // 初始化明细数组，避免空指针
      },
      purchaseOrderStatusOptions: [] // 采购单状态字典
    }
  },
  computed: {
    getStatusName() {
      if (this.purchaseDetail.status === null) return '未知状态'
      const targetStatus = parseInt(this.purchaseDetail.status)
      console.log(this.purchaseOrderStatusOptions)
      const statusItem = this.purchaseOrderStatusOptions.find(item => parseInt(item.dictValue) === targetStatus)
      return statusItem?.dictName || '未知状态'
    },
    getStatusTagType() {
      if (!this.purchaseDetail.status) return 'info'
      const status = parseInt(this.purchaseDetail.status)
      switch (status) {
        case 0: return 'primary' // 待入库
        case 1: return 'warning' // 部分入库
        case 2: return 'success' // 已完成
        case 3: return 'danger' // 取消
        default: return 'info'
      }
    }
  },
  created() {
    // 初始化字典 + 获取详情
    this.initDict()
    if (!this.purchaseId) {
      this.$message.error('采购单ID不能为空')
      this.$router.back()
      return
    }
    this.fetchPurchaseDetail()
  },
  methods: {
    // 初始化状态字典：和列表页完全一致的写法
    async initDict() {
      this.purchaseOrderStatusOptions = this.$store.getters['dict/getPurchaseOrderStatus']
    },
    // 获取采购单详情（复用现有详情接口）
    async fetchPurchaseDetail() {
      this.loading = true
      try {
        const res = await request({
          url: `/api/purchase/order/${this.purchaseId}`,
          method: 'get'
        })
        this.purchaseDetail = res.data || { purchaseOrderItem: [] }
      } catch (e) {
        this.$message.error('采购单详情加载失败')
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    // 编辑采购单（跳转到编辑页，携带ID）
    handleEdit() {
      this.$router.push({
        path: `/purchase/order/edit/${this.purchaseId}`
      })
    },
    // 返回采购单列表页
    handleBack() {
      this.$router.push('/purchase/order/page')
    }
  }
}
</script>

<style lang="scss" scoped>
.purchase-detail-container {
  background: #f5f7fa;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
}

.operate-bar {
  margin-bottom: 20px;
  text-align: right;
}

.main-info-card, .item-info-card {
  .card-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .info-row {
    width: 100%;
  }

  .info-item {
    display: flex;
    align-items: center;
    height: 36px;

    &.full-width {
      height: auto;
      align-items: flex-start;
    }

    .info-label {
      color: #666;
      font-weight: 500;
      width: 80px;
      flex-shrink: 0;
    }

    .info-value {
      color: #333;
      flex: 1;
      word-break: break-all;
    }
  }
}

:deep(.el-tag) {
  margin: 0;
}

:deep(.el-table) {
  --el-table-header-text-color: #666;
  --el-table-row-hover-bg-color: #f8f9fa;
}

:deep(.el-table__empty-text) {
  color: #999;
}
</style>
