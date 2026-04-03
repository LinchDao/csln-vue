<template>
  <div class="template-form-container">
    <!-- 顶部操作栏：返回按钮居右，新增配货完成+发货按钮 -->
    <sticky :z-index="10" class-name="sub-navbar">
      <div style="display: flex; justify-content: flex-end;">
        <!-- 分配按钮：仅子单状态为1（待分配）时显示 -->
        <el-button
          v-if="Number(formData.status) === 1"
          type="success"
          style="margin-right: 10px;"
          @click="handleAssign"
        >
          分配配货员
        </el-button>
        <!-- 配货完成按钮：仅子单状态为2时显示 -->
        <el-button
          v-if="Number(formData.status) === 2"
          type="primary"
          style="margin-right: 10px;"
          @click="handlePickingComplete"
        >
          配货完成
        </el-button>
        <!-- 发货按钮：仅子单状态为2、3时显示 -->
        <el-button
          v-if="[2, 3].includes(Number(formData.status))"
          type="warning"
          style="margin-right: 10px;"
          @click="handleShip"
        >
          发货
        </el-button>
        <!-- 返回按钮：固定在最右侧 -->
        <el-button type="primary" @click="goBack">返回子订单列表</el-button>
      </div>
    </sticky>

    <!-- 子订单核心信息 + 合计卡片（无改动） -->
    <el-row :gutter="20" style="margin-bottom: 16px;">
      <el-col :span="16">
        <el-card shadow="never" class="template-section">
          <div class="template-section__title">子订单基础信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">主订单号</span>
                <span class="template-info-item__value">{{ formData.orderNo || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">子订单号</span>
                <span class="template-info-item__value">{{ formData.subOrderNo || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 12px;">
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">客户名称</span>
                <span class="template-info-item__value">{{ formData.customerName || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">发货仓库</span>
                <span class="template-info-item__value">{{ formData.warehouseName || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 12px;">
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">配送方式</span>
                <span class="template-info-item__value">{{ formData.deliveryTypeName || '未知' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">子单状态</span>
                <el-tag :type="getStatusTagType(formData.status)">{{ formData.statusName || '未知' }}</el-tag>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 12px;">
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">预计发货日期</span>
                <span class="template-info-item__value">{{ formData.expectSendDate || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">实际发货日期</span>
                <span class="template-info-item__value">{{ formData.actualSendDate || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 12px;">
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">配货员</span>
                <span class="template-info-item__value">{{ formData.pickerUserName || '未分配' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="template-info-item">
                <span class="template-info-item__label">快递单号</span>
                <span class="template-info-item__value">{{ formData.expressNo || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 12px;">
            <el-col :span="24">
              <div class="template-info-item template-info-item--top">
                <span class="template-info-item__label">配送备注</span>
                <span class="template-info-item__value template-info-item__value--multiline">{{ formData.deliveryRemark || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 12px;">
            <el-col :span="24">
              <div class="template-info-item template-info-item--top">
                <span class="template-info-item__label">子单备注</span>
                <span class="template-info-item__value template-info-item__value--multiline">{{ formData.remark || '-' }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <!-- 子订单合计卡片（无改动） -->
      <el-col :span="8">
        <el-card shadow="never" class="template-section total-card">
          <div class="template-section__title">子订单合计</div>
          <div class="total-item">
            <span class="total-label">子单编号：</span>
            <span class="total-value">{{ formData.subOrderNo || '-' }}</span>
          </div>
          <div class="total-item">
            <span class="total-label">商品总数量：</span>
            <span class="total-value">{{ formData.totalQty || 0 }} 件</span>
          </div>
          <div class="total-item">
            <span class="total-label">子单总金额：</span>
            <span class="total-value">¥{{ (formData.amount || 0).toFixed(2) }}</span>
          </div>
          <div class="total-item">
            <span class="total-label">配货状态：</span>
            <span class="total-value">
              <el-tag :type="getStatusTagType(formData.status)">{{ formData.statusName || '未知' }}</el-tag>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 子订单商品明细（无改动） -->
    <el-card shadow="never" class="template-section template-section--mt16">
      <div class="template-section__title">商品明细</div>
      <el-table
        :data="formData.items"
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

    <!-- 原有人员选择弹窗（无改动） -->
    <user-select-dialog
      v-if="userSelectVisible"
      @confirm="handleUserSelectConfirm"
      @close="handleDialogClose"
    />

    <!-- 新增：发货弹窗 -->
    <order-sub-ship-dialog
      v-if="shipDialogVisible"
      :order-sub-id="currentSubOrderId"
      @confirm="handleShipConfirm"
      @close="handleShipClose"
    />
  </div>
</template>

<script>
import Sticky from '@/components/Sticky'
import request from '@/utils/request'
import UserSelectDialog from '@/components/UserSelect'
import OrderSubShipDialog from './../page/orderShipDialog.vue'

export default {
  name: 'OrderSubDetail',
  components: {
    Sticky,
    UserSelectDialog,
    OrderSubShipDialog // 新增：注册发货弹窗
  },
  data() {
    return {
      loading: false,
      // 子订单核心数据模型（无改动）
      formData: {
        id: '',
        orderNo: '', // 主订单号
        subOrderNo: '', // 子订单号
        customerName: '', // 客户名称
        warehouseName: '', // 发货仓库名称
        deliveryType: 0, // 配送方式编码
        deliveryTypeName: '', // 配送方式名称
        status: 0, // 子单状态编码
        statusName: '', // 子单状态名称
        expectSendDate: '', // 预计发货日期
        actualSendDate: '', // 实际发货日期
        pickerUserName: '', // 配货员姓名
        expressNo: '', // 快递单号
        deliveryRemark: '', // 配送备注
        remark: '', // 子单备注
        amount: 0, // 子单总金额
        totalQty: 0, // 商品总数量
        isDelete: 0, // 是否删除 0-未删 1-已删
        items: [] // 商品明细列表
      },
      // 人员选择弹窗控制（无改动）
      userSelectVisible: false,
      // 存储当前子订单ID（用于分配/配货完成/发货）
      currentSubOrderId: '',
      // 新增：发货弹窗控制
      shipDialogVisible: false
    }
  },
  computed: {
    // 子订单状态字典（从Vuex获取）
    subOrderStatusOptions() {
      return this.$store.getters['dict/getSubOrderStatus'] || []
    },
    // 配送方式字典（从Vuex获取，与主单复用）
    deliveryTypes() {
      return this.$store.getters['dict/getDeliveryTypes'] || []
    }
  },
  created() {
    // 获取路由传参的子订单ID
    const subOrderId = this.$route.params.id
    this.currentSubOrderId = subOrderId
    // 加载子订单详情
    this.loadSubDetail(subOrderId)
  },
  methods: {
    /**
     * 加载子订单详情数据（无改动）
     * @param {String} id 子订单ID
     */
    async loadSubDetail(id) {
      try {
        this.loading = true
        const { data } = await request({
          url: `/api/order/sub/${id}/detail`,
          method: 'get'
        })
        // 格式化数据后赋值
        this.formData = this.formatData(data)
      } catch (e) {
        console.error('加载子订单详情失败：', e)
        this.$message.error('加载子订单详情失败，请重试')
      } finally {
        this.loading = false
      }
    },
    /**
     * 格式化子订单数据（无改动）
     */
    formatData(data) {
      // 配送方式字典转义
      const deliveryType = this.deliveryTypes.find(item => item.dictValue === data.deliveryType)
      data.deliveryTypeName = deliveryType ? deliveryType.dictName : '未知'
      // 子订单状态字典转义
      const subStatus = this.subOrderStatusOptions.find(item => item.dictValue === data.status)
      data.statusName = subStatus ? subStatus.dictName : '未知'
      // 补全默认值，防止空值报错
      data.items = data.items || []
      data.totalQty = data.items.reduce((total, row) => total + Number(row.qty || 0), 0)
      return data
    },
    /**
     * 子订单状态标签类型（无改动）
     */
    getStatusTagType(status) {
      if (status === 1) return 'warning' // 待分配-黄色
      if (status === 2) return 'primary' // 已分配-蓝色
      if (status === 3) return 'success' // 已发货-绿色
      if (status === 4) return 'danger' // 已取消-红色
      return '' // 默认-灰色
    },
    /**
     * 商品明细表格合计方法（无改动）
     */
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
    /**
     * 返回上一页（无改动）
     */
    goBack() {
      this.$router.back()
    },
    /**
     * 打开配货员分配弹窗（无改动）
     */
    handleAssign() {
      this.userSelectVisible = true
    },
    /**
     * 接收分配弹窗返回的人员ID（无改动）
     */
    handleUserSelectConfirm(selectedUserId) {
      this.userSelectVisible = false
      // 调用后端子订单分配接口
      request({
        url: '/api/order/sub/assign',
        method: 'post',
        data: {
          orderSubId: this.currentSubOrderId,
          userId: selectedUserId
        }
      }).then(res => {
        this.$message.success('配货员分配成功')
        // 刷新详情页数据
        this.loadSubDetail(this.currentSubOrderId)
      }).catch(error => {
        console.error('配货员分配失败：', error)
        this.$message.error('配货员分配失败，请重试')
      })
    },
    /**
     * 关闭人员选择弹窗（无改动）
     */
    handleDialogClose() {
      this.userSelectVisible = false
    },

    // ---------------------- 新增方法 ----------------------
    /**
     * 配货完成：调用接口+刷新详情
     */
    handlePickingComplete() {
      this.$confirm('确定要标记该子订单为配货完成吗？', '提示', {
        type: 'info'
      }).then(() => {
        request({
          url: '/api/order/sub/picking/complete',
          method: 'post',
          data: { orderSubId: this.currentSubOrderId }
        }).then(() => {
          this.$message.success('配货完成标记成功')
          this.loadSubDetail(this.currentSubOrderId) // 刷新详情数据
        }).catch(error => {
          console.error('配货完成失败：', error)
          this.$message.error('配货完成失败，请重试')
        })
      })
    },

    /**
     * 打开发货弹窗
     */
    handleShip() {
      this.shipDialogVisible = true
    },

    /**
     * 发货成功回调：关闭弹窗+刷新详情
     */
    handleShipConfirm() {
      this.shipDialogVisible = false
      this.loadSubDetail(this.currentSubOrderId)
    },

    /**
     * 关闭发货弹窗
     */
    handleShipClose() {
      this.shipDialogVisible = false
    }
    // ---------------------- 新增方法结束 ----------------------
  }
}
</script>

<style lang="scss" scoped>
// 完全复用主订单详情页的样式，无额外新增
.template-form-container {
  background: #f5f7fa;
  padding: 20px;
  min-height: calc(100vh - 60px);
}
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
.template-info-item--top {
  align-items: flex-start;
}
.template-info-item__value--multiline {
  white-space: pre-wrap;
  word-break: break-all;
}
.template-section__title--sub {
  font-size: 14px;
  margin-top: 20px;
  margin-bottom: 10px;
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
// 新增：顶部操作栏按钮布局适配
.sub-navbar {
  ::v-deep .el-button {
    margin-bottom: 10px;
  }
}
</style>
