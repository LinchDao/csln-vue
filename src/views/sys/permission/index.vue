<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 20px;">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="权限编码">
          <el-input v-model="listQuery.permCode" placeholder="权限编码" clearable @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="权限名称">
          <el-input v-model="listQuery.permName" placeholder="权限名称" clearable @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新增权限</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ (listQuery.page - 1) * listQuery.limit + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限编码" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.permCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限名称" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.permName }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 弹窗 (仅保留新增逻辑) -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="权限编码" prop="permCode">
          <el-input v-model="temp.permCode" placeholder="请输入权限编码" />
        </el-form-item>
        <el-form-item label="权限名称" prop="permName">
          <el-input v-model="temp.permName" placeholder="请输入权限名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addPermission, pagePermission } from '@/api/sys/permission'
import Pagination from '@/components/Pagination'

export default {
  name: 'PermissionManagement',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        permCode: undefined,
        permName: undefined
      },
      temp: {
        id: undefined,
        permCode: '',
        permName: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        create: '新增权限'
      },
      rules: {
        permCode: [{ required: true, message: '权限编码是必填项', trigger: 'blur' }],
        permName: [{ required: true, message: '权限名称是必填项', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const response = await pagePermission(this.listQuery)
        if (response.code === 200) {
          this.list = response.data.rows || []
          this.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取权限分页数据失败', error)
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 10,
        permCode: undefined,
        permName: undefined
      }
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        permCode: '',
        permName: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addPermission(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
</style>
