<template>
  <div class="app-container stock-product-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      inline
      label-width="88px"
      class="template-section template-query-section"
      @keyup.enter.native="handleFilter"
    >
      <div class="template-section__title">查询条件</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="款号">
            <el-input
              v-model="queryParams.productNo"
              clearable
              placeholder="请输入款号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品名称">
            <el-input
              v-model="queryParams.name"
              clearable
              placeholder="请输入商品名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属仓库">
            <el-select
              v-model="queryParams.warehouseId"
              placeholder="请选择仓库"
              clearable
              style="width: 100%;"
            >
              <el-option
                v-for="item in warehouseList"
                :key="item.id"
                :label="item.warehouseName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="template-operate-bar template-operate-bar--center template-action-group">
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
          @click="handleReset"
        >
          重置
        </el-button>
      </div>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      border
      fit
      highlight-current-row
      row-key="skuId"
      class="template-table-section"
      style="width: 100%; margin-top: 16px;"
    >
      <el-table-column label="序号" width="80" align="center">
        <template slot-scope="{ $index }">
          <span>{{ (queryParams.page - 1) * queryParams.limit + $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="款号" prop="productNo" min-width="200" align="center" />
      <el-table-column label="商品名称" prop="name" min-width="180" align="center" show-overflow-tooltip />
      <el-table-column label="规格" min-width="150" align="center">
        <template slot-scope="{ row }">
          <span>{{ parseDimension(row.dimensionSignature) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前库存" prop="qty" min-width="100" align="center" />
      <el-table-column label="可用库存" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span :style="{ color: (row.qty - row.lockQty) > (row.warnQty || 0) ? '#67c23a' : '#f56c6c' }">
            {{ row.qty - row.lockQty }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="锁定库存" prop="lockQty" min-width="100" align="center" />
      <el-table-column label="退货途中" prop="recoveryQty" min-width="100" align="center" />
      <el-table-column label="预警数量" prop="warnQty" min-width="100" align="center" />
      <el-table-column label="仓库名称" prop="warehouseName" min-width="140" align="center" />
      <el-table-column label="更新时间" prop="updateTime" min-width="160" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.updateTime ? parseTime(new Date(row.updateTime), '{y}-{m}-{d}') : '-' }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import { parseTime } from '@/utils'

export default {
  name: 'StockProductPage',
  components: {
    Pagination
  },
  directives: { waves },
  data() {
    return {
      queryParams: {
        page: 1,
        limit: 10,
        productNo: undefined,
        name: undefined,
        warehouseId: undefined
      },
      list: [],
      total: 0,
      loading: false,
      warehouseList: []
    }
  },
  created() {
    this.initWarehouseList()
    this.getList()
  },
  methods: {
    parseTime,
    parseDimension(signature) {
      if (!signature) return '-'
      return signature.split('|')
        .map(item => item.includes('=') ? item.split('=')[1] : item)
        .join('/')
    },
    async initWarehouseList() {
      try {
        const res = await request({
          url: '/erp-service/warehouse/list',
          method: 'get'
        })
        this.warehouseList = res.data || []
      } catch (error) {
        console.error('获取仓库列表失败:', error)
      }
    },
    async getList() {
      this.loading = true
      try {
        const res = await request({
          url: '/erp-service/stock/page',
          method: 'post',
          data: this.queryParams
        })
        if (res.code === 200) {
          this.list = res.data.rows || []
          this.total = res.data.total || 0
        } else {
          this.$message.error(res.message || '获取库存列表失败')
        }
      } catch (error) {
        console.error(error)
        this.$message.error('获取库存列表失败，请刷新重试！')
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
        page: 1,
        limit: 10,
        productNo: undefined,
        name: undefined,
        warehouseId: undefined
      }
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.stock-product-container {
  .el-form-item {
    margin-bottom: 18px;
  }
  .template-action-group {
    justify-content: center;
  }
}
</style>
