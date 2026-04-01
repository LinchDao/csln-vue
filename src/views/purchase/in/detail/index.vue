<template>
  <div class="purchaseInForm-container template-detail-container">
    <el-form
      :model="purchaseDetail"
      class="form-container"
      label-width="120px"
    >
      <!-- 顶部固定操作按钮：仅待审核状态显示通过/驳回 -->
      <sticky :z-index="10" class-name="sub-navbar">
        <!-- 已审核状态隐藏通过、驳回按钮 -->
        <el-button
          v-if="purchaseDetail.status === 0"
          type="success"
          icon="el-icon-check"
          style="margin-right:10px;"
          @click="handleAuditPass"
        >
          通过
        </el-button>
        <el-button
          v-if="purchaseDetail.status === 0"
          type="danger"
          icon="el-icon-close"
          style="margin-right:10px;"
          @click="handleAuditReject"
        >
          驳回
        </el-button>
        <el-button type="default" icon="el-icon-arrow-left" @click="handleBack">
          返回列表
        </el-button>
      </sticky>
      <!-- 主体内容：分段式 el-form 布局 -->
      <div class="purchaseInForm-main-container">
        <!-- 入库单基础信息段 -->
        <div class="detail-section template-section">
          <div class="section-title template-section__title">入库单基础信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="入库单号">
                <span class="detail-text">{{ purchaseDetail.inNo || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="来源采购单号">
                <span class="detail-text">{{ purchaseDetail.purchaseNo || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="入库仓库">
                <span class="detail-text">{{ purchaseDetail.warehouseName || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="入库人">
                <span class="detail-text">{{ purchaseDetail.createUserName || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="审核人">
                <span class="detail-text">{{ purchaseDetail.auditUserName || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="入库状态">
                <el-tag :type="getStatusTagType">{{ getStatusName }}</el-tag>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- 入库单统计信息段 -->
        <div class="detail-section template-section template-section--mt16">
          <div class="section-title template-section__title">入库单统计信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="入库总数量">
                <span class="detail-text">{{ purchaseDetail.totalQty || 0 }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="入库时间">
                <span class="detail-text">{{ purchaseDetail.createTime || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="入库备注">
                <span class="detail-text">{{ purchaseDetail.remark || '无' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- 入库商品明细段 -->
        <div class="detail-section template-section template-section--mt16">
          <div class="section-title template-section__title">入库商品明细</div>
          <el-table
            v-loading="loading"
            :data="purchaseDetail.purchaseInItem || []"
            border
            style="width:100%;"
            row-key="skuId"
            :empty-text="loading ? '加载中...' : '暂无入库明细'"
          >
            <el-table-column label="序号" align="center" width="80">
              <template slot-scope="{ $index }">{{ $index + 1 }}</template>
            </el-table-column>
            <el-table-column label="款号" prop="productNo" align="center" min-width="120" />
            <el-table-column label="商品名称" prop="productName" align="center" min-width="180" />
            <el-table-column label="颜色" prop="colorName" align="center" width="100" />
            <el-table-column label="尺码" prop="sizeName" align="center" width="100" />
            <!-- 采购数量列 -->
            <el-table-column label="采购数量" prop="purchaseQty" align="center" width="120">
              <template slot-scope="scope">{{ scope.row.purchaseQty || 0 }}</template>
            </el-table-column>
            <!-- 已入库数量列：从指定接口获取 -->
            <el-table-column label="已入库数量" prop="totalInstockQty" align="center" width="120">
              <template slot-scope="scope">{{ scope.row.totalInstockQty || 0 }}</template>
            </el-table-column>
            <el-table-column label="本次入库数量" prop="qty" align="center" width="120" />
          </el-table>
        </div>
      </div>
    </el-form>
  </div>
</template>
<script>
import request from '@/utils/request'
import Sticky from '@/components/Sticky' // 复用产品页的吸顶组件
export default {
  name: 'PurchaseInDetail',
  components: { Sticky }, // 注册吸顶组件
  data() {
    return {
      loading: false,
      inId: this.$route.params.id, // 从路由获取入库单ID
      purchaseDetail: {
        purchaseInItem: [] // 初始化入库明细数组，避免空指针
      },
      purchaseInStatusOptions: [] // 入库单状态字典
    }
  },
  computed: {
    // 入库状态名称格式化
    getStatusName() {
      if (this.purchaseDetail.status === null || this.purchaseDetail.status === undefined) return '未知状态'
      const targetStatus = parseInt(this.purchaseDetail.status)
      const statusItem = this.purchaseInStatusOptions.find(item => parseInt(item.dictValue) === targetStatus)
      return statusItem?.dictName || '未知状态'
    },
    // 入库状态标签样式（0待审核-蓝色，1已审核-绿色）
    getStatusTagType() {
      if (!this.purchaseDetail.status) return 'info'
      const status = parseInt(this.purchaseDetail.status)
      switch (status) {
        case 0: return 'primary' // 待审核
        case 1: return 'success' // 已审核
        default: return 'info'
      }
    }
  },
  created() {
    // 初始化状态字典 + 获取入库单详情
    this.initDict()
    if (!this.inId) {
      this.$message.error('入库单ID不能为空')
      this.$router.back()
      return
    }
    this.fetchPurchaseInDetail()
  },
  methods: {
    // 初始化入库单状态字典（从store获取）
    async initDict() {
      this.purchaseInStatusOptions = this.$store.getters['dict/getPurchaseInStatus']
    },
    // 获取入库单详情 + 调用接口获取已入库数量并回填
    async fetchPurchaseInDetail() {
      this.loading = true
      try {
        // 1. 获取入库单主信息+基础明细
        const detailRes = await request({
          url: `/api/purchase/in/${this.inId}`,
          method: 'get'
        })
        this.purchaseDetail = detailRes.data || { purchaseInItem: [] }
        const { purchaseId, purchaseInItem } = this.purchaseDetail
        // 2. 采购单ID存在 && 有明细时，调用接口获取已入库数量
        if (purchaseId && purchaseInItem.length > 0) {
          const stockRes = await request({
            url: `/api/purchase/in/instockedQty/${purchaseId}`,
            method: 'get'
          })
          // 转换为 {skuId: 已入库数量} 映射，方便匹配
          const stockMap = (stockRes.data || []).reduce((map, item) => {
            map[item.skuId] = item.qty || 0
            return map
          }, {})
          // 回填已入库数量到明细列表
          this.purchaseDetail.purchaseInItem = purchaseInItem.map(item => ({
            ...item,
            totalInstockQty: stockMap[item.skuId] || 0
          }))
        }
      } catch (e) {
        this.$message.error('入库单详情加载失败：' + (e.msg || e.message || '系统异常'))
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    // 审核通过：仅二次确认，无原因输入
    async handleAuditPass() {
      this.$confirm('确定要审核通过该入库单吗？', '操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(async() => {
        try {
          await request({
            url: `/api/purchase/in/audit/pass/${this.inId}`,
            method: 'put'
          })
          this.$message.success('审核通过成功')
          this.fetchPurchaseInDetail() // 刷新详情，更新状态和已入库数量
        } catch (e) {
          this.$message.error('审核通过失败：' + (e.msg || e.message || '系统异常'))
        }
      }).catch(() => {
        this.$message.info('已取消审核通过')
      })
    },
    // 审核驳回：仅二次确认，无原因输入
    async handleAuditReject() {
      this.$confirm('确定要驳回该入库单吗？', '操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await request({
            url: `/api/purchase/in/audit/reject/${this.inId}`,
            method: 'put'
          })
          this.$message.success('审核驳回成功')
          this.fetchPurchaseInDetail() // 刷新详情，更新状态
        } catch (e) {
          this.$message.error('审核驳回失败：' + (e.msg || e.message || '系统异常'))
        }
      }).catch(() => {
        this.$message.info('已取消审核驳回')
      })
    },
    // 返回入库单列表页
    handleBack() {
      this.$router.push('/stock/in/page')
    }
  }
}
</script>
<style lang="scss" scoped>
// 整体容器样式，完全参考产品详情页
.purchaseInForm-container {
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 20px;
  // 表单主容器
  .form-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 20px;
  }
  // 主体内容容器
  .purchaseInForm-main-container {
    padding: 20px 0;
  }
  // 分段卡片样式（核心参考）
  .detail-section {
    background: #fafbfc;
    border-radius: 8px;
    padding: 20px 24px;
    margin-bottom: 20px;
    border: 1px solid #e4e7ed;
    // 分段标题
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e7ed;
    }
  }
  // 文本展示样式
  .detail-text {
    font-size: 14px;
    color: #303133;
    // 解决文字过窄换行：设置最小宽度，单行显示
    display: inline-block;
    min-width: 60px;
    white-space: nowrap;
  }
  // 关键：label标签加粗（和产品页保持一致）
  ::v-deep .el-form-item__label {
    font-weight: 700 !important;
    color: #303133 !important;
  }
  // 适配表格样式，和整体风格统一
  ::v-deep .el-table {
    --el-table-header-text-color: #303133;
    --el-table-row-hover-bg-color: #fafbfc;
  }
  // 标签样式适配
  ::v-deep .el-tag {
    margin: 0;
  }
}
</style>
