<template>
  <div class="app-container user-page-container">
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
          <el-form-item label="用户信息">
            <el-input
              v-model="queryParams.userKeyWord"
              clearable
              placeholder="请输入账号/手机号/名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属关联">
            <el-input
              v-model="queryParams.storeWarehouseKeyword"
              clearable
              placeholder="请输入商店/仓库名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="用户状态">
            <el-select
              v-model="queryParams.status"
              clearable
              placeholder="请选择用户状态"
            >
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
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
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleCreate"
        >
          新增用户
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
      <el-table-column label="用户账号" prop="username" min-width="140" />
      <el-table-column label="名称" prop="realName" min-width="120" />
      <el-table-column label="手机号" prop="phone" min-width="140" />
      <el-table-column label="商店权限" prop="shopName" min-width="180" align="center">
        <template slot-scope="{ row }">
          {{ row.shopName || '无' }}
        </template>
      </el-table-column>
      <el-table-column label="仓库权限" prop="warehouseName" min-width="180" align="center">
        <template slot-scope="{ row }">
          {{ row.warehouseName || '无' }}
        </template>
      </el-table-column>
      <el-table-column label="用户状态" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="180" />
      <el-table-column label="操作" width="280" align="center">
        <template slot-scope="{ row }">
          <el-button type="text" @click="handleDetail(row)">详情</el-button>
          <el-button type="text" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="text" @click="handleResetPassword(row)">重置密码</el-button>
          <el-button type="text" :style="{color: row.status === 1 ? '#f56c6c' : '#67c23a'}" @click="handleChangeStatus(row)">
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
    <UserFormModal
      v-if="modalVisible"
      ref="userFormModalRef"
      :type="modalType"
      :user-id="modalUserId"
      @close="handleModalClose"
      @success="getList"
    />
    <!-- 详情弹窗 -->
    <UserDetailModal
      v-if="detailVisible"
      :user-id="currentUserId"
      @close="handleDetailClose"
    />
  </div>
</template>
<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
// 引入两个弹窗组件
import UserFormModal from './userDialog.vue'
import UserDetailModal from './userDetail.vue'

export default {
  name: 'UserPage',
  components: {
    Pagination,
    UserFormModal,
    UserDetailModal // 注册详情弹窗
  },
  directives: { waves },
  data() {
    return {
      queryParams: {
        page: 1,
        limit: 10,
        userKeyWord: undefined,
        storeWarehouseKeyword: undefined,
        status: undefined
      },
      list: [],
      total: 0,
      loading: false,
      // 新增/编辑弹窗控制
      modalVisible: false,
      modalType: 'add',
      modalUserId: '',
      // 详情弹窗控制
      detailVisible: false,
      currentUserId: ''
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
          url: '/erp-service/user/page',
          method: 'post',
          data: this.queryParams
        })
        if (res.code === 200) {
          this.list = res.data.rows || []
          this.total = res.data.total || 0
        } else {
          this.$message.error(res.message || '获取用户列表失败')
        }
      } catch (error) {
        console.error(error)
        this.$message.error('获取用户列表失败，请刷新重试！')
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
        userKeyWord: undefined,
        storeWarehouseKeyword: undefined,
        status: undefined
      }
      this.getList()
    },
    // 新增用户
    handleCreate() {
      this.modalType = 'add'
      this.modalUserId = ''
      this.modalVisible = true
      this.$nextTick(() => {
        this.$refs.userFormModalRef.openModal()
      })
    },
    // 编辑用户
    handleUpdate(row) {
      this.modalType = 'edit'
      this.modalUserId = row.id
      this.modalVisible = true
      this.$nextTick(() => {
        this.$refs.userFormModalRef.openModal()
      })
    },
    // 关闭新增/编辑弹窗
    handleModalClose() {
      this.modalVisible = false
      this.modalUserId = ''
      this.modalType = 'add'
    },
    // 打开详情弹窗
    handleDetail(row) {
      this.currentUserId = row.id
      this.detailVisible = true
    },
    // 关闭详情弹窗
    handleDetailClose() {
      this.detailVisible = false
      this.currentUserId = ''
    },
    // 重置用户密码
    async handleResetPassword(row) {
      try {
        await this.$confirm(`确定要重置用户【${row.realName}】的密码吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await request({
          url: `/erp-service/user/password/reset/${row.id}`,
          method: 'put'
        })
        if (res.code === 200) {
          this.$message.success('密码重置成功！')
        } else {
          this.$message.error(res.message || '密码重置失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('密码重置失败！' + (error.response?.data?.message || error.message))
        }
      }
    },
    // 切换用户状态（核心修改：PUT请求+新接口+新请求体）
    async handleChangeStatus(row) {
      const targetStatus = row.status === 1 ? 0 : 1 // 目标状态：启用→禁用(0)，禁用→启用(1)
      const statusText = targetStatus === 0 ? '禁用' : '启用'
      try {
        await this.$confirm(`确定要${statusText}【${row.realName}】吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 核心修改：PUT请求 + 接口地址 /erp-service/user/status + 请求体 {userId, status}
        await request({
          url: '/erp-service/user/status',
          method: 'put', // 改为PUT请求
          data: {
            userId: row.id, // 字段名改为userId（匹配接口要求）
            status: targetStatus // 目标状态
          }
        })
        this.$message.success(`${statusText}成功！`)
        this.getList() // 刷新列表
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(`${statusText}失败！` + (error.response?.data?.message || error.message))
        } else {
          this.$message.info(`已取消${statusText}`)
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.user-page-container {
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
/style>
