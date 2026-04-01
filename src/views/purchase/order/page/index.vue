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
      <el-row style="margin-top: 15px;">
        <el-col :span="24">
          <div class="template-operate-bar template-operate-bar--center">
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
                style="margin-left: 10px;"
                @click="handleReset"
              >
                重置
              </el-button>
              <el-button
                type="primary"
                icon="el-icon-plus"
                style="margin-left: 10px;"
                @click="handleCreate"
              >
                新增采购单
              </el-button>
              <el-button
                v-waves
                :loading="downloadLoading"
                type="success"
                icon="el-icon-download"
                style="margin-left: 10px;"
                @click="handleDownload"
              >
                导出Excel
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="list" border style="width:100%;margin-top:10px;">
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
          ¥{{ scope.row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="120" :formatter="formatStatus" />
      <el-table-column label="制单人" prop="createUserName" align="center" />
      <el-table-column label="下单时间" prop="orderTime" align="center" width="180" />
      <el-table-column label="到货时间" prop="arrivalTime" align="center" width="180" />
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="操作" align="center" width="160">
        <el-button type="primary" size="mini" @click="handleEdit">编辑</el-button>
        <el-button type="danger" size="mini" @click="handleCancel">取消</el-button>
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
      purchaseOrderStatusOptions: [],
      currentRow: {}
    }
  },
  created() {
    this.initDict()
    this.getList()
  },
  methods: {
    async initDict() {
      this.purchaseOrderStatusOptions = this.$store.getters['dict/getPurchaseOrderStatus']
    },
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
        this.$message.error('查询失败')
      } finally {
        this.loading = false
      }
    },
    handleFilter() {
      this.queryParams.page = 1
      this.getList()
    },
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
    handleCreate() {
      this.$router.push({ path: '/purchase/order/create' })
    },
    handleDownload() {
      console.log('导出Excel')
    },
    formatStatus(row) {
      this.currentRow = row
      const target = parseInt(row.status)
      const item = this.purchaseOrderStatusOptions.find(i => parseInt(i.dictValue) === target)
      return item ? item.dictName : '未知'
    },
    handleEdit() {
      this.$router.push({ path: `/purchase/order/edit/${this.currentRow.id}` })
    },
    handleCancel() {
      const id = this.currentRow.id
      this.$confirm('确定要取消该采购单吗？', '提示', {
        type: 'warning'
      }).then(() => {
        request({
          url: `/api/purchase/order/cancel/${id}`,
          method: 'post'
        }).then(res => {
          this.$message.success('取消成功')
          this.getList() // 刷新列表
        })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    handleDetail(row) {
      this.currentRow = row
      this.$router.push({ path: `/purchase/order/detail/${row.id}` })
    }
  }
}
</script>

<style scoped>
.purchase-order-page {
  background: transparent;
}
</style>
