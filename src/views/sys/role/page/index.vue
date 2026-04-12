<template>
  <div class="app-container role-page-container">
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
          <el-form-item label="角色编码">
            <el-input
              v-model="queryParams.roleCode"
              clearable
              placeholder="请输入角色编码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="角色名称">
            <el-input
              v-model="queryParams.roleName"
              clearable
              placeholder="请输入角色名称"
            />
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
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleCreate"
        >
          新增角色
        </el-button>
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
      <el-table-column label="角色编码" prop="roleCode" min-width="140" />
      <el-table-column label="角色名称" prop="roleName" min-width="140" />
      <el-table-column label="备注" prop="remark" min-width="180" />
      <el-table-column label="操作" width="220" align="center">
        <template slot-scope="{ row }">
          <el-button type="text" @click="handleDetail(row)">详情</el-button>
          <el-button type="text" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="text" style="color: #f56c6c" @click="handleDelete(row)">删除</el-button>
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
    <RoleFormModal
      v-if="modalVisible"
      ref="roleFormModalRef"
      :type="modalType"
      :role-id="modalRoleId"
      @close="handleModalClose"
      @success="getList"
    />
    <!-- 详情弹窗 -->
    <RoleDetailModal
      v-if="detailVisible"
      :role-id="currentRoleId"
      @close="handleDetailClose"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import RoleFormModal from './roleDialog.vue'
import RoleDetailModal from './roleDetail.vue'

export default {
  name: 'RolePage',
  components: {
    Pagination,
    RoleFormModal,
    RoleDetailModal
  },
  directives: { waves },
  data() {
    return {
      queryParams: {
        page: 1,
        limit: 10,
        roleCode: undefined,
        roleName: undefined
      },
      list: [],
      total: 0,
      loading: false,
      modalVisible: false,
      modalType: 'add',
      modalRoleId: '',
      detailVisible: false,
      currentRoleId: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const res = await request({
          url: '/erp-service/role/page',
          method: 'post',
          data: this.queryParams
        })
        if (res.code === 200) {
          this.list = res.data.rows || []
          this.total = res.data.total || 0
        } else {
          this.$message.error(res.message || '获取角色列表失败')
        }
      } catch (error) {
        console.error(error)
        this.$message.error('获取角色列表失败，请刷新重试！')
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
        roleCode: undefined,
        roleName: undefined
      }
      this.getList()
    },
    handleCreate() {
      this.modalType = 'add'
      this.modalRoleId = ''
      this.modalVisible = true
      this.$nextTick(() => {
        this.$refs.roleFormModalRef.openModal()
      })
    },
    handleUpdate(row) {
      this.modalType = 'edit'
      this.modalRoleId = row.id
      this.modalVisible = true
      this.$nextTick(() => {
        this.$refs.roleFormModalRef.openModal()
      })
    },
    handleModalClose() {
      this.modalVisible = false
      this.modalRoleId = ''
      this.modalType = 'add'
    },
    handleDetail(row) {
      this.currentRoleId = row.id
      this.detailVisible = true
    },
    handleDetailClose() {
      this.detailVisible = false
      this.currentRoleId = ''
    },
    async handleDelete(row) {
      try {
        await this.$confirm(`确定要删除角色【${row.roleName}】吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await request({
          url: `/erp-service/role/delete/${row.id}`,
          method: 'delete'
        })
        if (res.code === 200) {
          this.$message.success('删除成功！')
          this.getList()
        } else {
          this.$message.error(res.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败！' + (error.response?.data?.message || error.message))
        } else {
          this.$message.info('已取消删除')
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.role-page-container {
  .el-form-item {
    margin-bottom: 18px;
  }
  .template-action-group {
    justify-content: center;
  }
  .el-button--text {
    margin: 0 4px;
  }
}
</style>
