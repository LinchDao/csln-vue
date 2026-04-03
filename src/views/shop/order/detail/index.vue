<template>
  <div class="template-form-container template-form-layout">
    <sticky :z-index="10" class-name="sub-navbar">
      <el-button type="primary" @click="goBack">返回列表</el-button>
      <el-button
        v-if="[0, 1, 4].includes(Number(formData.status))"
        type="success"
        class="template-btn-gap"
        @click="handleEdit"
      >
        编辑订单
      </el-button>
    </sticky>

    <el-row :gutter="20" style="margin-bottom: 16px;">
      <el-col :span="16">
        <el-card shadow="never" class="template-section">
          <div class="template-section__title">主订单信息</div>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">客户名称</span>
                <span class="template-info-item__value">{{ formData.customerName || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">客户电话</span>
                <span class="template-info-item__value">{{ formData.customerPhone || '-' }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 12px;">
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">订单类型</span>
                <span class="template-info-item__value">{{ formData.orderTypeName || '未知' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">订单状态</span>
                <el-tag :type="getStatusTagType(formData.status)">{{ formData.statusName || '未知' }}</el-tag>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 12px;">
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">开单时间</span>
                <span class="template-info-item__value">{{ formData.createTime || '-' }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 12px;">
            <el-col :span="24">
              <div class="template-info-item template-info-item--top">
                <span class="template-info-item__label">订单备注</span>
                <span class="template-info-item__value template-info-item__value--multiline">{{ formData.remark || '-' }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never" class="template-section total-card">
          <div class="template-section__title">订单合计</div>
          <div class="total-item">
            <span class="total-label">订单编号：</span>
            <span class="total-value">{{ formData.orderNo || '-' }}</span>
          </div>
          <div class="total-item">
            <span class="total-label">总子订单数：</span>
            <span class="total-value">{{ formData.subOrders.length }} 个</span>
          </div>
          <div class="total-item">
            <span class="total-label">商品总数量：</span>
            <span class="total-value">{{ formData.totalQty || 0 }} 件</span>
          </div>
          <div class="total-item total-amount">
            <span class="total-label">订单总金额：</span>
            <span class="total-value">¥{{ (formData.totalAmount || 0).toFixed(2) }}</span>
          </div>
          <div class="total-item">
            <span class="total-label">状态：</span>
            <span class="total-value">
              <el-tag :type="getStatusTagType(formData.status)">{{ formData.statusName || '未知' }}</el-tag>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card
      v-for="(sub, subIndex) in formData.subOrders"
      :key="sub.id || subIndex"
      shadow="never"
      class="template-section template-section--mt16"
    >
      <div class="template-section__title">子订单信息 {{ subIndex + 1 }}</div>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="template-info-item">
            <span class="template-info-item__label">仓库名称</span>
            <span class="template-info-item__value">{{ sub.warehouseName || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="template-info-item">
            <span class="template-info-item__label">配送方式</span>
            <span class="template-info-item__value">{{ sub.deliveryTypeName || '未知' }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="template-info-item">
            <span class="template-info-item__label">发货日期</span>
            <span class="template-info-item__value">{{ sub.expectSendDate || '-' }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 12px;">
        <el-col :span="24">
          <div class="template-info-item template-info-item--top">
            <span class="template-info-item__label">配送备注</span>
            <span class="template-info-item__value template-info-item__value--multiline">{{ sub.deliveryRemark || '-' }}</span>
          </div>
        </el-col>
      </el-row>

      <div class="template-section__title template-section__title--sub">商品明细</div>
      <el-table
        :data="sub.items"
        border
        style="width: 100%;"
        show-summary
        :summary-method="getSummary"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column label="款号" prop="productNo" align="center" />
        <el-table-column label="商品名称" prop="productName" align="center" />
        <el-table-column label="颜色" prop="colorName" align="center" />
        <el-table-column label="尺码" prop="sizeName" align="center" />
        <el-table-column label="数量" prop="qty" align="center" />
        <el-table-column label="单价" align="center">
          <template slot-scope="{ row }">¥{{ (row.price || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="金额" align="center">
          <template slot-scope="{ row }">¥{{ (row.amount || 0).toFixed(2) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky'
import request from '@/utils/request'

export default {
  name: 'OrderDetail',
  components: { Sticky },
  data() {
    return {
      loading: false,
      formData: {
        id: '',
        orderNo: '',
        customerName: '',
        customerPhone: '',
        orderType: 0,
        orderTypeName: '',
        status: 0,
        statusName: '',
        isDraft: 0,
        isDraftName: '',
        isAr: 0,
        isArName: '',
        allowReplace: 0,
        allowReplaceName: '',
        totalQty: 0,
        totalAmount: 0,
        remark: '',
        createTime: '',
        subOrders: []
      }
    }
  },
  computed: {
    masterOrderTypes() {
      return this.$store.getters['dict/getMasterOrderTypes'] || []
    },
    masterOrderStatus() {
      return this.$store.getters['dict/getMasterOrderStatus'] || []
    },
    deliveryTypes() {
      return this.$store.getters['dict/getDeliveryTypes'] || []
    }
  },
  created() {
    const id = this.$route.params.id
    this.loadDetail(id)
  },
  methods: {
    async loadDetail(id) {
      try {
        const { data } = await request({
          url: `/api/order/master/${id}/detail`,
          method: 'get'
        })
        this.formData = this.formatData(data)
      } catch (e) {
        this.$message.error('加载失败')
      }
    },
    formatData(data) {
      const orderType = this.masterOrderTypes.find(item => item.dictValue === data.orderType)
      data.orderTypeName = orderType ? orderType.dictName : '未知'

      const status = this.masterOrderStatus.find(item => item.dictValue === data.status)
      data.statusName = status ? status.dictName : '未知'

      data.isDraftName = data.isDraft === 1 ? '是' : '否'
      data.isArName = data.isAr === 1 ? '是' : '否'
      data.allowReplaceName = data.allowReplace === 1 ? '允许' : '不允许'

      data.subOrders = (data.subOrders || []).map(sub => {
        const deliveryType = this.deliveryTypes.find(item => item.dictValue === sub.deliveryType)
        return {
          ...sub,
          deliveryTypeName: deliveryType ? deliveryType.dictName : '未知'
        }
      })

      return data
    },
    getStatusTagType(status) {
      if (status === 0) return 'info'
      if (status === 1) return ''
      if (status === 2) return 'success'
      if (status === 3) return 'danger'
      if (status === 4) return 'warning'
      return ''
    },
    getSummary(param) {
      const { columns, data } = param
      const sums = []

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }

        if (column.label === '数量') {
          sums[index] = data.reduce((total, row) => total + Number(row.qty || 0), 0)
          return
        }

        if (column.label === '金额') {
          const amount = data.reduce((total, row) => total + Number(row.amount || 0), 0)
          sums[index] = `¥${amount.toFixed(2)}`
          return
        }

        sums[index] = ''
      })

      return sums
    },
    goBack() {
      this.$router.back()
    },
    handleEdit() {
      this.$router.push(`/shop/order/edit/${this.formData.id}`)
    }
  }
}
</script>

<style lang="scss" scoped>

.total-card {
  height: 100%;

  .total-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: 0;
    }

    .total-label {
      font-size: 14px;
      color: #666;
    }

    .total-value {
      font-size: 14px;
      color: #333;
    }
  }

  .total-amount {
    .total-value {
      font-size: 18px;
      color: #e6a23c;
      font-weight: bold;
    }
  }
}

::v-deep .el-table__summary {
  background-color: #fafafa !important;

  .el-table__cell {
    font-weight: 600 !important;
    color: #333 !important;
  }
}

::v-deep .el-tag {
  height: 24px;
  line-height: 22px;
  padding: 0 8px;
  font-size: 14px;
}
</style>
