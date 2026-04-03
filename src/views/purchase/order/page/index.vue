<template>
  <div class="app-container purchase-order-page template-page-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" inline class="template-section" @keyup.enter.native="handleFilter">
      <div class="template-section__title">查询条件</div>
      <el-row>
        <el-col :span="8">
          <el-form-item label="采购单号">
            <el-input v-model="queryParams.purchaseNo" placeholder="请输入采购单号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="供应商ID">
            <el-input v-model="queryParams.supplierId" placeholder="请输入供应商ID" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="订单状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option
                v-for="dict in purchaseOrderStatusOptions"
                :key="dict.dictValue"
                :label="dict.dictName"
                :value="parseInt(dict.dictValue)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row class="template-filter-row">
        <el-col :span="24">
          <div class="template-operate-bar template-operate-bar--center template-action-group">
            <el-form-item>
              <el-button
                v-waves
                type="primary"
                icon="el-icon-search"
                @click="handleFilter"
              >
                查询
              </el-button>
              <el-button
                v-waves
                icon="el-icon-refresh"
                class="template-btn-gap"
                @click="handleReset"
              >
                重置
              </el-button>
              <el-button
                type="primary"
                icon="el-icon-plus"
                class="template-btn-gap"
                @click="handleCreate"
              >
                新增采购单
              </el-button>
              <el-button
                v-waves
                :loading="downloadLoading"
                type="success"
                icon="el-icon-download"
                class="template-btn-gap"
                @click="handleDownload"
              >
                导出Excel
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 订单列表表格 -->
    <el-table v-loading="loading" :data="list" border class="template-table-section" style="width: 100%; margin-top: 16px;">
      <el-table-column label="行号" type="index" align="center" width="80" />
      <el-table-column label="采购单号" align="center" width="160">
        <template slot-scope="scope">
          <el-link
            type="primary"
            @click="handleDetail(scope.row)"
          >
            {{ scope.row.purchaseNo }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="供应商名称" prop="supplierName" align="center" />
      <el-table-column label="总数量" prop="totalQty" align="center" />
      <el-table-column label="总金额" align="center">
        <template slot-scope="scope">
          ¥{{ (scope.row.totalAmount || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="120" :formatter="formatStatus" />
      <el-table-column label="制单人" prop="createUserName" align="center" />
      <el-table-column label="下单时间" prop="orderTime" align="center" width="180" />
      <el-table-column label="到货时间" prop="arrivalTime" align="center" width="180" />
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="操作" align="center" width="160">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            :disabled="[1, 2, 3].includes(scope.row.status)"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="mini"
            class="template-btn-gap-sm"
            :disabled="[1, 2, 3].includes(scope.row.status)"
            @click="handleCancel(scope.row)"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <Pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import request from '@/utils/request'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'PurchaseOrderPage',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      queryParams: {
        purchaseNo: undefined,
        supplierId: undefined,
        status: undefined,
        page: 1,
        limit: 10
      },
      total: 0,
      list: [],
      loading: false,
      downloadLoading: false,
      purchaseOrderStatusOptions: []
    }
  },
  created() {
    this.initDict()
    this.getList()
  },
  methods: {
    // 初始化字典（订单状态）
    async initDict() {
      this.purchaseOrderStatusOptions = this.$store.getters['dict/getPurchaseOrderStatus'] || []
    },

    // 获取订单列表数据
    async getList() {
      this.loading = true
      try {
        const res = await request({
          url: '/api/purchase/order/page',
          method: 'post',
          data: this.queryParams
        })
        this.list = res.data.rows || []
        this.total = res.data.total || 0
      } catch (e) {
        this.$message.error('查询采购订单列表失败')
        console.error('列表查询异常：', e)
      } finally {
        this.loading = false
      }
    },

    // 搜索查询
    handleFilter() {
      this.queryParams.page = 1
      this.getList()
    },

    // 重置查询条件
    handleReset() {
      this.queryParams = {
        purchaseNo: undefined,
        supplierId: undefined,
        status: undefined,
        page: 1,
        limit: 10
      }
      this.getList()
    },

    // 新增采购单
    handleCreate() {
      this.$router.push({ path: '/purchase/order/create' })
    },

    // 导出Excel
    handleDownload() {
      console.log('导出采购订单Excel')
      // 可补充导出逻辑：
      // this.downloadLoading = true
      // request({ url: '/api/purchase/order/export', method: 'get', responseType: 'blob' })
      //   .then(res => { /* 处理文件下载 */ })
      //   .finally(() => { this.downloadLoading = false })
    },

    // 格式化订单状态显示
    formatStatus(row) {
      const targetStatus = parseInt(row.status)
      const statusItem = this.purchaseOrderStatusOptions.find(
        item => parseInt(item.dictValue) === targetStatus
      )
      return statusItem ? statusItem.dictName : '未知状态'
    },

    // 编辑订单（跳转对应行编辑页）
    handleEdit(row) {
      if (!row || !row.id) {
        this.$message.warning('订单ID不存在，无法编辑')
        return
      }
      this.$router.push({ path: `/purchase/order/edit/${row.id}` })
    },

    // 取消订单
    handleCancel(row) {
      if (!row || !row.id) {
        this.$message.warning('订单ID不存在，无法取消')
        return
      }
      this.$confirm('确定要取消该采购单吗？取消后可能无法恢复，请谨慎操作！', '警告', {
        type: 'warning',
        confirmButtonText: '确定取消',
        cancelButtonText: '取消操作'
      }).then(async() => {
        try {
          await request({
            url: `/api/purchase/order/cancel/${row.id}`,
            method: 'post'
          })
          this.$message.success('采购单取消成功')
          this.getList() // 刷新列表
        } catch (e) {
          this.$message.error('取消采购单失败')
          console.error('订单取消异常：', e)
        }
      }).catch(() => {
        this.$message.info('已取消操作，采购单保持原状态')
      })
    },

    // 查看订单详情
    handleDetail(row) {
      if (!row || !row.id) {
        this.$message.warning('订单ID不存在，无法查看详情')
        return
      }
      this.$router.push({ path: `/purchase/order/detail/${row.id}` })
    }
  }
}
</script>

<style scoped>
.purchase-order-page {
  background: transparent;
  padding: 0 20px;
}

.template-filter-row {
  margin-top: 15px;
}

.template-operate-bar--center {
  display: flex;
  justify-content: center;
}

/* 表格操作列按钮间距 */
.el-table-column__content .el-button + .el-button {
  margin-left: 8px !important;
}

/* 金额显示样式优化 */
.el-table .el-link {
  color: #1890ff;
  cursor: pointer;
}
.el-table .el-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}
</style>
