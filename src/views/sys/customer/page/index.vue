<template>
  <div class="app-container customer-page-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      inline
      label-width="80px"
      class="template-section template-query-section"
      @keyup.enter.native="handleFilter"
    >
      <div class="template-section__title">查询条件</div>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="客户名称">
            <el-input
              v-model="queryParams.name"
              clearable
              placeholder="请输入客户名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="手机号">
            <el-input
              v-model="queryParams.phone"
              clearable
              placeholder="请输入手机号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              clearable
              placeholder="请选择状态"
            >
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col></el-row>
      <div class="template-operate-bar template-operate-bar--center template-action-group">
        <el-button v-waves type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
        <el-button v-waves icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新增客户</el-button>
      </div>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      border
      fit
      highlight-current-row
      class="template-table-section"
      style="width: 100%; margin-top: 16px;"
    >
      <el-table-column label="序号" width="80" align="center">
        <template slot-scope="{ $index }">
          <span>{{ (queryParams.page - 1) * queryParams.limit + $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户名称" prop="name" min-width="120" />
      <el-table-column label="手机号" prop="phone" min-width="120" />
      <el-table-column label="客户等级" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag effect="plain">{{ getLevelName(row.levelId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="地址" prop="address" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="160" align="center" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" @click="handleDetail(row)">详情</el-button>
          <el-button type="text" @click="handleUpdate(row)">编辑</el-button>
          <el-button
            type="text"
            :style="{color: row.status === 1 ? '#f56c6c' : '#67c23a'}"
            @click="handleChangeStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
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

    <!-- 新增/编辑弹窗 -->
    <CustomerFormModal
      v-if="modalVisible"
      ref="customerFormModalRef"
      :type="modalType"
      :customer-id="modalCustomerId"
      @close="handleModalClose"
      @success="getList"
    />
    <!-- 详情弹窗 -->
    <CustomerDetailModal
      v-if="detailVisible"
      :customer-id="currentCustomerId"
      @close="handleDetailClose"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import CustomerFormModal from './customerDialog.vue'
import CustomerDetailModal from './customerDetail.vue'

export default {
  name: 'CustomerPage',
  components: { Pagination, CustomerFormModal, CustomerDetailModal },
  directives: { waves },
  data() {
    return {
      queryParams: {
        page: 1,
        limit: 10,
        name: undefined,
        phone: undefined,
        status: undefined
      },
      list: [],
      total: 0,
      loading: false,
      modalVisible: false,
      modalType: 'add',
      modalCustomerId: '',
      detailVisible: false,
      currentCustomerId: '',
      customerLevels: []
    }
  },
  computed: {

  },
  created() {
    this.customerLevels = this.$store.getters['dict/getCustomerLevels']
    this.getList()
  },
  methods: {
    getLevelName(levelId) {
      if (!levelId && levelId !== 0) return '未设置'
      const level = this.customerLevels.find(item => String(item.dictValue) === String(levelId))
      return level ? level.dictName : '未知等级'
    },
    async getList() {
      this.loading = true
      try {
        const res = await request({
          url: '/erp-service/customer/page',
          method: 'post',
          data: this.queryParams
        })
        if (res.code === 200) {
          this.list = res.data.rows || []
          this.total = res.data.total || 0
        }
      } finally {
        this.loading = false
      }
    },
    handleFilter() {
      this.queryParams.page = 1
      this.getList()
    },
    handleReset() {
      this.queryParams = { page: 1, limit: 10, name: undefined, phone: undefined, status: undefined }
      this.getList()
    },
    handleCreate() {
      this.modalType = 'add'
      this.modalCustomerId = ''
      this.modalVisible = true
    },
    handleUpdate(row) {
      this.modalType = 'edit'
      this.modalCustomerId = row.id
      this.modalVisible = true
    },
    handleModalClose() {
      this.modalVisible = false
    },
    handleDetail(row) {
      this.currentCustomerId = row.id
      this.detailVisible = true
    },
    handleDetailClose() {
      this.detailVisible = false
    },
    async handleChangeStatus(row) {
      const targetStatus = row.status === 1 ? 0 : 1
      const statusText = targetStatus === 0 ? '禁用' : '启用'
      try {
        await this.$confirm(`确定要${statusText}客户【${row.name}】吗？`, '提示', { type: 'warning' })
        await request({
          url: '/erp-service/customer/status',
          method: 'put',
          data: { customerId: row.id, status: targetStatus }
        })
        this.$message.success(`${statusText}成功！`)
        this.getList()
      } catch (error) {
        if (error !== 'cancel') console.error(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-page-container {
  .template-action-group { justify-content: center; }
  .el-button--text { margin: 0 4px; }
}
</style>
