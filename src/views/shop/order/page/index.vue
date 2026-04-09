<template>
  <div class="app-container template-page-container">
    <!-- 基于 el-form 的筛选表单 完全匹配商品列表布局 -->
    <el-form
      ref="filterForm"
      :model="listQuery"
      inline
      class="filter-container template-section"
      label-position="right"
      label-width="80px"
    >
      <div class="template-section__title">查询条件</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 订单号筛选 -->
          <el-form-item label="订单号">
            <el-input
              v-model="listQuery.orderNo"
              placeholder="请输入订单号"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <!-- 订单类型筛选（对接字典枚举：getMasterOrderTypes） -->
          <el-form-item label="订单类型">
            <el-select
              v-model="listQuery.orderType"
              placeholder="请选择订单类型"
              clearable
              @change="handleFilter"
            >
              <el-option
                v-for="item in masterOrderTypes"
                :key="item.dictValue"
                :label="item.dictName"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <!-- 订单状态筛选：改为单选下拉（对接字典枚举：getMasterOrderStatus） -->
          <el-form-item label="订单状态">
            <el-select
              v-model="listQuery.status"
              placeholder="请选择订单状态"
              clearable
              @change="handleFilter"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="item in masterOrderStatus"
                :key="item.dictValue"
                :label="item.dictName"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 恢复草稿状态筛选（查询条件保留原来的样子） -->
      <el-row :gutter="20" class="template-filter-row">
        <el-col :span="8">
          <el-form-item label="草稿状态">
            <el-radio-group v-model="listQuery.isDraft" @change="handleFilter">
              <el-radio label="">全部</el-radio>
              <el-radio label="1">草稿</el-radio>
              <el-radio label="0">正式单</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item class="template-operate-bar template-operate-bar--center template-action-group">
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
              v-waves
              type="primary"
              icon="el-icon-plus"
              class="template-btn-gap"
              @click="handleCreate"
            >
              新增订单
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
        </el-col>
      </el-row>

    </el-form>
    <!-- 表格部分 完全匹配商品列表结构 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      class="template-table-section"
      style="width: 100%; margin-top: 16px;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="序号"
        align="center"
        width="80"
      >
        <template slot-scope="{ $index }">
          <span>{{ (listQuery.page - 1) * listQuery.limit + $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="订单号"
        sortable="custom"
        align="center"
        width="160"
        :class-name="getSortClass('orderNo')"
      >
        <template slot-scope="scope">
          <el-link
            type="primary"
            @click="handleDetail(scope.row)"
          >
            {{ scope.row.orderNo }}
          </el-link>
        </template>
      </el-table-column>
      <!-- 客户ID改为客户名称 -->
      <el-table-column label="客户名称" prop="customerName" align="center" min-width="120" />
      <!-- 门店ID改为门店名称 -->
      <el-table-column label="门店名称" prop="shopName" align="center" min-width="200" />
      <el-table-column label="仓库名称" prop="warehouseNames" align="center" min-width="200" />

      <el-table-column label="总数量" prop="totalQty" align="center" width="120">
        <template slot-scope="{ row }">
          <span>{{ row.totalQty }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总金额" prop="totalAmount" align="center" width="120">
        <template slot-scope="{ row }">
          <span>¥{{ row.totalAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="订单类型"
        align="center"
        width="150"
      >
        <template slot-scope="{ row }">
          {{ getDictLabel(masterOrderTypes, row.orderType) }}
        </template>
      </el-table-column>
      <el-table-column label="开单时间" prop="createTime" width="200px" align="center" />
      <el-table-column label="订单状态" class-name="status-col" width="100" align="center">
        <template slot-scope="{ row }">
          {{ getDictLabel(masterOrderStatus, row.status) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="primary"
            size="mini"
            :disabled="!(row.isDraft === 1 || [0, 1, 4].includes(Number(row.status)))"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 完全复用 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>
<script>
// 保留原文件的内联引入，未拆分任何请求
import request from '@/utils/request'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
export default {
  name: 'OrderList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      downloadLoading: false,
      selectedList: [], // 批量选择的行数据
      // 恢复isDraft参数（草稿状态筛选）
      listQuery: {
        page: 1,
        limit: 20,
        orderNo: undefined, // 订单号
        orderType: undefined, // 订单类型（字典dictValue）
        status: undefined, // 订单状态（字典dictValue）
        isDraft: '', // 草稿状态：''=全部，1=草稿，0=正式单
        sortField: undefined, // 排序字段
        sortOrder: undefined // 排序方式 asc/desc
      }
    }
  }, // 注册waves指令
  computed: {
    // 订单类型枚举（从字典获取）
    masterOrderTypes() {
      return this.$store.getters['dict/getMasterOrderTypes'] || []
    },
    // 订单状态枚举（从字典获取）
    masterOrderStatus() {
      return this.$store.getters['dict/getMasterOrderStatus'] || []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 通用方法：根据字典列表和dictValue获取dictName
    getDictLabel(dictList, dictValue) {
      if (dictValue === null || dictValue === undefined || dictValue === '') return '未知'
      const val = Number(dictValue)
      const item = dictList.find(item => Number(item.dictValue) === val)
      return item ? item.dictName : '未知'
    },
    // 跳转到订单详情页
    handleDetail(row) {
      this.$router.push({ path: `/shop/order/detail/${row.id}` })
    },
    // 获取订单列表 内联request，携带isDraft参数
    getList() {
      this.listLoading = true
      const query = { ...this.listQuery }
      request({ url: '/erp-service/order/master/page', method: 'post', data: query })
        .then(res => {
          this.list = res.data.rows
          this.total = res.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.listLoading = false
          this.$message.error('获取订单列表失败')
        })
    },
    // 筛选查询 重置页码，和商品列表逻辑一致
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 重置筛选条件 恢复isDraft参数重置
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 20,
        orderNo: undefined,
        orderType: undefined,
        status: undefined,
        isDraft: '', // 重置为全部
        sortField: undefined,
        sortOrder: undefined
      }
      this.$refs.filterForm.resetFields()
      this.getList()
    },
    // 表格排序 完全复用商品列表逻辑
    sortChange(data) {
      this.listQuery.sortField = data.prop
      this.listQuery.sortOrder = data.order === 'ascending' ? 'asc' : 'desc'
      this.getList()
    },
    // 批量选择行 完全复用
    handleSelectionChange(val) {
      this.selectedList = val
    },
    // 批量删除 内联request，和商品列表请求格式一致
    handleBatchDelete() {
      this.$confirm('确定要批量删除选中的订单吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedList.map(item => item.id)
        request({ url: '/erp-service/order/batchDelete', method: 'post', data: { ids }})
          .then(() => {
            this.$message.success('批量删除成功')
            this.getList()
          })
          .catch(() => {
            this.$message.error('批量删除失败')
          })
      })
    },
    // 新增订单 路由跳转
    handleCreate() {
      this.$router.push({ path: '/shop/order/create' })
    },
    // 编辑订单 路由跳转，仅草稿单可编辑（isDraft仍从接口返回，不显示仅用于判断）
    handleUpdate(row) {
      this.$router.push({ path: `/shop/order/edit/${row.id}` })
    },
    // 删除订单 内联request，delete请求，和商品列表逻辑一致
    handleDelete(row, index) {
      this.$confirm('确定要删除该订单吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({ url: `/erp-service/order/delete/${row.id}`, method: 'delete' })
          .then(() => {
            this.$message.success('删除成功')
            this.getList()
          })
          .catch(() => {
            this.$message.error('删除失败')
          })
      })
    },
    // 导出Excel 内联request，blob格式，完全复用商品列表逻辑
    handleDownload() {
      this.downloadLoading = true
      request({
        url: '/erp-service/order/export',
        method: 'post',
        data: this.listQuery,
        responseType: 'blob'
      }).then(res => {
        const blob = new Blob([res])
        const fileName = `订单列表_${new Date().getTime()}.xlsx`
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = fileName
        a.click()
        URL.revokeObjectURL(a.href)
        this.downloadLoading = false
        this.$message.success('导出成功')
      }).catch(() => {
        this.downloadLoading = false
        this.$message.error('导出失败')
      })
    },
    // 排序样式类 完全复用商品列表逻辑
    getSortClass(key) {
      if (this.listQuery.sortField === key) {
        return this.listQuery.sortOrder === 'asc' ? 'sort-asc' : 'sort-desc'
      }
      return ''
    }
  }
}
</script>
