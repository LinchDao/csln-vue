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
          <!-- 订单类型筛选 -->
          <el-form-item label="订单类型">
            <el-select
              v-model="listQuery.orderType"
              placeholder="请选择订单类型"
              clearable
              @change="handleFilter"
            >
              <el-option label="现货" value="1" />
              <el-option label="预售" value="2" />
              <el-option label="分批发货" value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <!-- 订单状态筛选 -->
          <el-form-item label="订单状态">
            <el-radio-group v-model="listQuery.status" @change="handleFilter">
              <el-radio label="">全部</el-radio>
              <el-radio label="1">待处理</el-radio>
              <el-radio label="2">已完成</el-radio>
              <el-radio label="3">已取消</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 是否草稿筛选 -->
          <el-form-item label="是否草稿">
            <el-radio-group v-model="listQuery.isDraft" @change="handleFilter">
              <el-radio label="">全部</el-radio>
              <el-radio label="0">正式单</el-radio>
              <el-radio label="1">草稿单</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="16">
          <el-form-item class="template-operate-bar template-operate-bar--center">
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
              v-waves
              type="primary"
              icon="el-icon-plus"
              style="margin-left: 10px;"
              @click="handleCreate"
            >
              新增订单
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
      style="width: 100%;"
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
      <el-table-column label="客户ID" prop="customerId" align="center" width="120px" />
      <el-table-column label="门店ID" prop="shopId" align="center" width="120px" />
      <el-table-column label="总数量" prop="totalQty" align="center" width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.totalQty }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总金额" prop="totalAmount" align="center" width="120px">
        <template slot-scope="{ row }">
          <span>¥{{ row.totalAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="订单类型"
        align="center"
        width="120px"
      >
        <template slot-scope="{ row }">
          <el-tag v-if="row.orderType === 1">现货</el-tag>
          <el-tag v-else-if="row.orderType === 2" type="warning">预售</el-tag>
          <el-tag v-else-if="row.orderType === 3" type="info">分批发货</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开单时间" prop="createTime" width="200px" align="center" />
      <el-table-column label="草稿状态" class-name="status-col" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.isDraft === 1 ? 'warning' : 'success'">
            {{ row.isDraft === 1 ? '草稿单' : '正式单' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" class-name="status-col" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.status === 1">待处理</el-tag>
          <el-tag v-else-if="row.status === 2" type="success">已完成</el-tag>
          <el-tag v-else-if="row.status === 3" type="danger">已取消</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini" :disabled="row.isDraft === 0" @click="handleUpdate(row)">
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
  directives: { waves }, // 注册waves指令
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      downloadLoading: false,
      selectedList: [], // 批量选择的行数据
      // 订单查询参数，匹配表字段，格式和商品列表一致
      listQuery: {
        page: 1,
        limit: 20,
        orderNo: undefined, // 订单号
        orderType: undefined, // 订单类型 1现货2预售3分批发货
        status: undefined, // 订单状态 1待处理2已完成3已取消
        isDraft: undefined, // 是否草稿 0正式1草稿
        sortField: undefined, // 排序字段
        sortOrder: undefined // 排序方式 asc/desc
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 跳转到订单详情页
    handleDetail(row) {
      this.$router.push({ path: `/order/detail/${row.id}` })
    },
    // 获取订单列表 内联request，和商品列表请求格式一致
    getList() {
      this.listLoading = true
      const query = { ...this.listQuery }
      request({ url: '/api/order/page', method: 'post', data: query })
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
    // 重置筛选条件 重置所有参数+表单，和商品列表逻辑一致
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 20,
        orderNo: undefined,
        orderType: undefined,
        status: undefined,
        isDraft: undefined,
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
        request({ url: '/api/order/batchDelete', method: 'post', data: { ids }})
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
      this.$router.push({ path: '/order/create' })
    },
    // 编辑订单 路由跳转，仅草稿单可编辑
    handleUpdate(row) {
      this.$router.push({ path: `/order/edit/${row.id}` })
    },
    // 删除订单 内联request，delete请求，和商品列表逻辑一致
    handleDelete(row, index) {
      this.$confirm('确定要删除该订单吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({ url: `/api/order/delete/${row.id}`, method: 'delete' })
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
        url: '/api/order/export',
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
