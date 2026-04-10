<template>
  <div class="app-container purchase-in-page template-page-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" inline class="template-section" @keyup.enter.native="handleFilter">
      <div class="template-section__title">查询条件</div>
      <el-row>
        <el-col :span="8">
          <el-form-item label="入库单号">
            <el-input v-model="queryParams.inNo" placeholder="请输入入库单号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="采购单号">
            <el-input v-model="queryParams.purchaseNo" placeholder="请输入来源采购单号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="入库状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option
                v-for="dict in purchaseInStatusOptions"
                :key="dict.dictValue"
                :label="dict.dictName"
                :value="parseInt(dict.dictValue)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row class="template-filter-row">
        <el-col :span="8">
          <el-form-item label="仓库名称">
            <el-select v-model="queryParams.warehouseId" placeholder="请选择仓库" clearable>
              <el-option
                v-for="warehouse in warehouseList"
                :key="warehouse.id"
                :label="warehouse.warehouseName"
                :value="warehouse.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="16">
          <el-form-item class="template-action-group">
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
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" border class="template-table-section" style="width: 100%; margin-top: 16px;">
      <el-table-column label="行号" type="index" align="center" width="80" />
      <el-table-column label="入库单号" align="center" width="180">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleDetail(scope.row)">
            {{ scope.row.inNo }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="来源采购单号" prop="purchaseNo" align="center" width="180" />
      <el-table-column label="仓库名称" prop="warehouseName" align="center" width="180" />
      <el-table-column label="入库总数量" prop="totalQty" align="center" width="120" />
      <el-table-column label="入库状态" prop="status" align="center" width="120" :formatter="formatStatus" />

      <!-- 改动点 1：操作人ID → 入库人名称 -->
      <el-table-column label="入库人名称" prop="createUserName" align="center" width="150" />

      <!-- 改动点 2：新增审核人名称列 -->
      <el-table-column label="审核人名称" prop="auditUserName" align="center" width="150" />

      <el-table-column label="入库时间" prop="createTime" align="center" width="200" />
      <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip />
    </el-table>

    <!-- 分页 -->
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
  name: 'PurchaseInPage',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      queryParams: {
        inNo: undefined,
        purchaseNo: undefined,
        warehouseId: undefined,
        status: undefined,
        page: 1,
        limit: 10
      },
      total: 0,
      list: [],
      loading: false,
      purchaseInStatusOptions: [],
      warehouseList: []
    }
  },
  created() {
    this.initDict()
    this.initWarehouseList()
    this.getList()
  },
  methods: {
    async initDict() {
      this.purchaseInStatusOptions = this.$store.getters['dict/getPurchaseInStatus']
    },
    async initWarehouseList() {
      try {
        const res = await request({
          url: '/erp-service/warehouse/list',
          method: 'get'
        })
        this.warehouseList = res.data || []
      } catch (e) {
        this.$message.error('仓库列表加载失败')
      }
    },
    async getList() {
      this.loading = true
      try {
        const res = await request({
          url: '/erp-service/purchase/in/page',
          method: 'post',
          data: this.queryParams
        })
        this.list = res.data.rows || []
        this.total = res.data.total || 0
      } catch (e) {
        this.$message.error('数据加载失败')
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
        inNo: undefined,
        purchaseNo: undefined,
        warehouseId: undefined,
        status: undefined,
        page: 1,
        limit: 10
      }
      this.getList()
    },
    formatStatus(row) {
      const target = parseInt(row.status)
      const item = this.purchaseInStatusOptions.find(i => parseInt(i.dictValue) === target)
      return item ? item.dictName : '未知'
    },
    handleDetail(row) {
      this.$router.push({ path: `/stock/in/detail/${row.id}` })
    }
  }
}
</script>

<style scoped>
.purchase-in-page {
  background: transparent;
}
</style>
