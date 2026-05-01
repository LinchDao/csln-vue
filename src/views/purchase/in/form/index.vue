<template>
  <div class="app-container purchase-detail-container template-form-container template-form-layout">
    <!-- 面包屑/标题 -->
    <div class="page-header template-page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item><a href="/purchase/order/page">采购单管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>采购单详情 & 入库操作</el-breadcrumb-item>
      </el-breadcrumb>
      <h3 class="page-title">采购单详情 & 入库操作</h3>
    </div>
    <!-- 操作按钮 + 仓库选择：新增仓库下拉 -->
    <div class="operate-bar template-operate-bar purchase-in-operate">
      <div class="warehouse-select">
        <label class="select-label purchase-in-label">入库仓库：</label>
        <el-select
          v-model="selectedWarehouseId"
          placeholder="请选择入库仓库"
          style="width: 200px;"
          :disabled="!canInstock"
        >
          <el-option
            v-for="item in warehouseList"
            :key="item.id"
            :label="item.warehouseName"
            :value="item.id"
          />
        </el-select>
      </div>
      <div class="btn-group">
        <el-button type="primary" icon="el-icon-check" :disabled="!canInstock || !selectedWarehouseId" @click="handleSubmitInstock">
          提交入库
        </el-button>
        <el-button type="warning" icon="el-icon-refresh" :disabled="!canInstock" class="template-btn-gap" @click="handleAllOneKeyFill">
          全部一键填写
        </el-button>
        <el-button icon="el-icon-arrow-left" class="template-btn-gap" @click="handleBack">
          返回列表
        </el-button>
      </div>
    </div>
    <!-- 主信息卡片：仅展示核心入库相关字段 -->
    <el-card shadow="hover" class="main-info-card template-section">
      <div class="card-title template-section__title">采购单主信息</div>
      <el-row class="info-row" :gutter="20">
        <el-col :span="6">
          <div class="info-item template-info-item">
            <label class="info-label template-info-item__label">采购单号：</label>
            <span class="info-value template-info-item__value">{{ purchaseDetail.purchaseNo || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item template-info-item">
            <label class="info-label template-info-item__label">订单状态：</label>
            <el-tag :type="getStatusTagType">{{ getStatusName }}</el-tag>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item template-info-item">
            <label class="info-label template-info-item__label">制单人：</label>
            <span class="info-value template-info-item__value">{{ purchaseDetail.createUserName || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item template-info-item">
            <label class="info-label template-info-item__label">下单时间：</label>
            <span class="info-value template-info-item__value">{{ purchaseDetail.orderTime || '-' }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row class="info-row" :gutter="20" style="margin-top: 15px;">
        <el-col :span="6">
          <div class="info-item template-info-item">
            <label class="info-label template-info-item__label">到货时间：</label>
            <span class="info-value template-info-item__value">{{ purchaseDetail.arrivalTime || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item template-info-item">
            <label class="info-label template-info-item__label">总数量：</label>
            <span class="info-value template-info-item__value">{{ purchaseDetail.totalQty || 0 }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item full-width template-info-item">
            <label class="info-label template-info-item__label">备注：</label>
            <span class="info-value template-info-item__value">{{ purchaseDetail.remark || '无' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <!-- 商品明细卡片（带入库操作：新增已入库列+input入库数量+一键填写） -->
    <el-card shadow="hover" class="item-info-card template-section template-section--mt16">
      <div class="card-title template-section__title">采购商品明细 & 入库操作</div>
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
        <el-table-column label="规格" align="center" min-width="150">
          <template slot-scope="scope">
            {{ formatSkuDims(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="采购数量" prop="qty" align="center" width="120" />
        <el-table-column label="已入库数量" prop="instockedQty" align="center" width="120">
          <template slot-scope="scope">
            {{ scope.row.instockedQty || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="入库数量" align="center" width="140">
          <template slot-scope="scope">
            <el-input
              v-model.number="scope.row.instockQty"
              type="number"
              min="0"
              placeholder="请输入"
              size="small"
              :disabled="!canInstock"
              style="width: 100%;"
              @input="handleInstockQtyInput(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit-outline"
              :disabled="!canInstock || (scope.row.qty - (scope.row.instockedQty || 0) <= 0)"
              @click="handleOneKeyFill(scope.row)"
            >
              一键填写
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
import request from '@/utils/request'
// 引入Vue用于手动设置响应式属性（Vue2核心修复）
import Vue from 'vue'
export default {
  name: 'PurchaseOrderDetail',
  data() {
    return {
      loading: false,
      purchaseId: this.$route.params.id, // 从路由获取采购单ID
      purchaseDetail: {
        purchaseOrderItem: [] // 初始化明细数组，避免空指针
      },
      purchaseOrderStatusOptions: [], // 采购单状态字典
      warehouseList: [], // 仓库列表 [{id, warehouseName}]
      selectedWarehouseId: '' // 选中的仓库ID
    }
  },
  computed: {
    // 状态名称：从store字典匹配
    getStatusName() {
      if (this.purchaseDetail.status === null || this.purchaseDetail.status === undefined) return '未知状态'
      const targetStatus = parseInt(this.purchaseDetail.status)
      const statusItem = this.purchaseOrderStatusOptions.find(item => parseInt(item.dictValue) === targetStatus)
      return statusItem?.dictName || '未知状态'
    },
    // 状态标签样式
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
    },
    // 是否可入库：仅待入库/部分入库可操作
    canInstock() {
      const status = parseInt(this.purchaseDetail.status)
      // 增加非空判断，避免NaN导致禁用异常
      return !isNaN(status) && (status === 0 || status === 1)
    }
  },
  created() {
    // 初始化字典 + 仓库列表 + 获取详情 + 获取已入库数量
    this.initDict()
    this.initWarehouseList() // 初始化仓库列表
    if (!this.purchaseId) {
      this.$message.error('采购单ID不能为空')
      this.$router.back()
      return
    }
    this.fetchData()
  },
  methods: {
    // 初始化状态字典：和列表页完全一致的写法
    async initDict() {
      this.purchaseOrderStatusOptions = this.$store.getters['dict/getPurchaseOrderStatus']
    },
    // 初始化仓库列表：从后端接口加载
    async initWarehouseList() {
      await this.fetchWarehouseList()
    },
    // 从后端拉取仓库列表
    async fetchWarehouseList() {
      try {
        const res = await request({
          url: '/erp-service/warehouse/list', // 后端仓库列表接口
          method: 'get'
        })
        this.warehouseList = res.data || []
      } catch (e) {
        this.$message.error('仓库列表加载失败')
        console.error(e)
      }
    },
    // 统一获取采购单详情+已入库数量（保证数据同步）
    async fetchData() {
      this.loading = true
      try {
        // 并行请求：采购单详情 + 已入库数量，提升性能
        const [detailRes, instockedRes] = await Promise.all([
          this.fetchPurchaseDetail(),
          this.fetchInstockedQty()
        ])
        this.purchaseDetail = detailRes.data || { purchaseOrderItem: [] }
        this.mapInstockedQty(instockedRes.data || [])
        this.initInstockQty()
      } catch (e) {
        this.$message.error('数据加载失败：' + (e.msg || e.message || '系统异常'))
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    // 获取采购单详情
    fetchPurchaseDetail() {
      return request({
        url: `/erp-service/purchase/order/${this.purchaseId}`,
        method: 'get'
      })
    },
    fetchInstockedQty() {
      return request({
        url: `/erp-service/purchase/in/instockedQty/${this.purchaseId}`,
        method: 'get'
      })
    },
    // 将接口返回的已入库数量映射到采购明细行（按skuId匹配）
    mapInstockedQty(instockedList) {
      if (!Array.isArray(instockedList) || this.purchaseDetail.purchaseOrderItem.length === 0) return
      // 转成map：key=skuId，value=已入库数量，方便匹配
      const instockedMap = instockedList.reduce((map, item) => {
        map[item.skuId] = item.qty || 0
        return map
      }, {})
      // 为每个明细行赋值已入库数量（响应式）
      this.purchaseDetail.purchaseOrderItem.forEach(item => {
        Vue.set(item, 'instockedQty', instockedMap[item.skuId] || 0)
      })
    },
    // 初始化本次入库数量（响应式，解决输入无法改值）
    initInstockQty() {
      this.purchaseDetail.purchaseOrderItem.forEach(item => {
        Vue.set(item, 'instockQty', 0)
      })
    },
    // 单行一键填写：入库数量 = 采购数量 - 已入库数量（响应式赋值）
    handleOneKeyFill(row) {
      const fillQty = row.qty - (row.instockedQty || 0)
      if (fillQty <= 0) {
        return this.$message.warning('该商品无未入库数量，无需填写')
      }
      // 响应式赋值，确保视图同步
      Vue.set(row, 'instockQty', fillQty)
      this.$message.success('该商品入库数量已一键填充')
    },
    // 全部一键填写：所有明细执行 入库数量 = 采购数量 - 已入库数量（响应式赋值）
    handleAllOneKeyFill() {
      let hasFill = false
      this.purchaseDetail.purchaseOrderItem.forEach(item => {
        const fillQty = item.qty - (item.instockedQty || 0)
        if (fillQty > 0) {
          // 响应式赋值
          Vue.set(item, 'instockQty', fillQty)
          hasFill = true
        } else {
          // 响应式赋值
          Vue.set(item, 'instockQty', 0)
        }
      })
      if (hasFill) {
        this.$message.success('所有商品未入库数量已一键填充')
      } else {
        this.$message.warning('所有商品均无未入库数量，无需填写')
      }
    },
    // 入库数量输入校验（优化逻辑，避免拦截正常输入，响应式更新）
    handleInstockQtyInput(row) {
      const maxAbleQty = row.qty - (row.instockedQty || 0)
      // 延迟处理，确保输入值已同步到Vue实例
      this.$nextTick(() => {
        // 空值/非数字处理
        if (row.instockQty === null || row.instockQty === '' || isNaN(row.instockQty)) {
          Vue.set(row, 'instockQty', 0)
          return
        }
        // 取整并限制边界
        let inputVal = Math.floor(row.instockQty)
        // 最大值限制
        if (inputVal > maxAbleQty) {
          inputVal = maxAbleQty
          this.$message.warning(`该商品最大可入库数量为${maxAbleQty}`)
        }
        // 最小值限制
        if (inputVal < 0) {
          inputVal = 0
        }
        // 响应式更新最终值
        Vue.set(row, 'instockQty', inputVal)
      })
    },
    async handleSubmitInstock() {
      // 1. 筛选出入库数量>0的行，过滤掉0的行
      const validItemList = this.purchaseDetail.purchaseOrderItem.filter(item => item.instockQty > 0)
      // 2. 校验：有效明细为空（全部为0）则拦截提交
      if (validItemList.length === 0) {
        return this.$message.warning('请填写有效入库数量（大于0），不可全部为0')
      }
      // 3. 构造入库参数：携带仓库ID + 过滤后的有效明细
      const instockParams = {
        purchaseId: this.purchaseId,
        warehouseId: this.selectedWarehouseId, // 新增仓库ID
        itemList: validItemList.map(item => ({
          skuId: item.skuId,
          qty: item.instockQty
        }))
      }
      try {
        // 调用后端入库接口
        await request({
          url: '/erp-service/purchase/in/create',
          method: 'post',
          data: instockParams
        })
        this.$message.success('入库操作成功')
        this.$router.push({ path: `/purchase/order/detail/${this.purchaseId}` })
      } catch (e) {
        this.$message.error('入库操作失败：' + (e.msg || e.message || '系统异常'))
        console.error(e)
      }
    },
    // 创建入库单：跳转指定路由
    handleCreateInstock() {
      this.$router.push({
        path: `/purchase/in/form/${this.purchaseId}`
      })
    },
    // 返回采购单列表页
    handleBack() {
      this.$router.push('/purchase/order/page')
    },
    // 格式化规格显示
    formatSkuDims(row) {
      if (!row.skuSpecSnapshot) return '-'
      try {
        const snapshot = JSON.parse(row.skuSpecSnapshot)
        const dims = snapshot.dims || []
        if (dims.length > 0) {
          return dims.sort((a, b) => (a.order || 0) - (b.order || 0)).map(d => d.value).join(' / ')
        }
      } catch (e) {
        console.error('解析规格快照失败', e)
      }
      return '-'
    }
  }
}
</script>
<style lang="scss" scoped>
.purchase-detail-container {
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}
.page-header {
  margin-bottom: 20px;
  .page-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
}
.operate-bar {
  margin-bottom: 20px;
}

.purchase-in-operate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: right;
}

.warehouse-select {
  display: flex;
  align-items: center;
}

.purchase-in-label {
  margin-right: 10px;
  font-weight: 500;
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
:deep(.el-input) {
  width: 100%;
}
// 数字输入框去除上下箭头（优化样式）
:deep(input[type="number"]) {
  -moz-appearance: textfield;
}
:deep(input[type="number"]::-webkit-outer-spin-button),
:deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
