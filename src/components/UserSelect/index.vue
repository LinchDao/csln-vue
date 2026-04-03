<template>
  <el-dialog
    title="选择分配人员"
    :visible="true"
    width="500px"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <!-- 人员姓名模糊查询（匹配realName/用户名模糊搜索） -->
    <el-form :model="searchForm" inline style="margin-bottom: 16px;">
      <el-form-item label="人员姓名">
        <el-input
          v-model="searchForm.realName"
          placeholder="请输入人员姓名查询"
          clearable
          style="width: 200px;"
          @keyup.enter.native="getUserList"
        />
      </el-form-item>
      <el-button
        type="primary"
        icon="el-icon-search"
        @click="getUserList"
      >
        查询
      </el-button>
    </el-form>
    <!-- 人员列表：单选展示【账号、名称、手机号码】 -->
    <el-table
      v-loading="loading"
      :data="userList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      :row-key="row => row.id"
      :default-sort="{prop: 'id', order: 'ascending'}"
      @row-click="handleRowClick"
    >
      <el-table-column
        label="序号"
        align="center"
        width="60"
        type="index"
        :index="(index) => (page - 1) * limit + index + 1"
      />
      <el-table-column label="账号" prop="username" align="center" width="160" />
      <el-table-column label="名称" prop="realName" align="center" width="140" />
      <el-table-column label="手机号码" prop="phone" align="center" />
    </el-table>
    <!-- 项目自定义分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="page"
      :limit.sync="limit"
      :page-sizes="[5]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 16px; text-align: right;"
      @pagination="handlePagination"
    />
    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('close')">取消</el-button>
      <el-button
        type="primary"
        :disabled="!selectedUserId"
        @click="handleConfirm"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import request from '@/utils/request'
// 引入项目自定义分页组件
import Pagination from '@/components/Pagination'
export default {
  name: 'UserSelectDialog',
  components: {
    Pagination // 注册自定义分页组件
  },
  data() {
    return {
      searchForm: {
        realName: ''
      },
      userList: [],
      total: 0, // 总数据条数
      page: 1, // 当前页码（默认第1页）
      limit: 5, // 每页条数（匹配后端默认5条）
      loading: false,
      selectedUserId: '', // 选中人员ID
      selectedrealName: '' // 选中人员名称（仅回显）
    }
  },
  mounted() {
    // 弹窗渲染后加载第一页数据
    this.getUserList()
  },
  methods: {
    // 核心：加载人员列表（适配后端返回字段+分页参数）
    getUserList() {
      this.loading = true
      const queryParam = {
        page: this.page, // 当前页码
        limit: this.limit, // 每页条数
        realName: this.searchForm.realName // 模糊查询关键词
      }
      request({
        url: '/api/user/page',
        method: 'post',
        data: queryParam
      }).then(res => {
        const responseData = res.data || {}
        this.userList = responseData.rows || [] // 后端返回rows数组
        this.total = responseData.total || 0 // 后端返回总条数
        this.loading = false
      }).catch(error => {
        console.error('获取人员列表失败：', error)
        this.$message.error('获取人员列表失败，请重试')
        this.userList = []
        this.total = 0
        this.loading = false
      })
    },
    // 表格行点击：单选选中人员（赋值ID和名称）
    handleRowClick(row) {
      this.selectedUserId = row.id
      this.selectedrealName = row.realName
    },
    // 确定选择：向父组件传递选中人员ID
    handleConfirm() {
      this.$emit('confirm', this.selectedUserId)
    },
    // 分页事件处理：接收自定义分页组件回调，重新加载数据
    handlePagination({ page, limit }) {
      this.page = page
      this.limit = limit
      this.getUserList()
    }
  }
}
</script>
