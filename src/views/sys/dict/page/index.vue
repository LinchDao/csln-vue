<template>
  <div class="app-container">
    <!-- 筛选表单 -->
    <el-form
      ref="filterForm"
      :model="listQuery"
      inline
      class="filter-container"
      label-position="right"
      label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="字典名称">
            <el-input
              v-model="listQuery.dictName"
              placeholder="请输入字典名称"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="字典值">
            <el-input
              v-model="listQuery.dictValue"
              placeholder="请输入字典值"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态">
            <el-radio-group v-model="listQuery.status" @change="handleFilter">
              <el-radio label="">全部</el-radio>
              <el-radio label="1">启用</el-radio>
              <el-radio label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="6" />
      </el-row>

      <el-row style="margin-top: 15px;">
        <el-col :span="24">
          <div style="text-align: center;">
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
                新增字典
              </el-button>
              <el-button
                v-waves
                type="danger"
                icon="el-icon-delete"
                style="margin-left: 10px;"
                @click="handleBatchDelete"
              >
                批量删除
              </el-button>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column
        label="ID"
        prop="id"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="字典名称"
        prop="dictName"
        align="center"
        min-width="150"
      >
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleUpdate(row)">{{ row.dictName }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="字典值"
        prop="dictValue"
        align="center"
        min-width="150"
      />

      <el-table-column
        label="状态"
        align="center"
        width="100"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="备注"
        prop="remark"
        align="center"
        min-width="200"
      />

      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <dict-edit-dialog
      :id="dialog.id"
      :visible.sync="dialog.visible"
      :type="dialog.type"
      @success="getList"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import DictEditDialog from './DictEditDialog'

export default {
  name: 'DictList',
  components: { Pagination, DictEditDialog },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      selectedList: [],
      listQuery: {
        page: 1,
        limit: 20,
        dictName: undefined,
        dictValue: undefined,
        status: undefined
      },
      dialog: {
        visible: false,
        type: 'add',
        id: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取字典分页列表
    getList() {
      this.listLoading = true
      request({
        url: '/api/dict/page',
        method: 'post',
        data: this.listQuery
      }).then(res => {
        this.list = res.data.rows
        this.total = res.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取字典列表失败')
      })
    },

    // 查询
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    // 重置
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 20,
        dictName: undefined,
        dictValue: undefined,
        status: undefined
      }
      this.$refs.filterForm.resetFields()
      this.getList()
    },
    handleSelectionChange(val) {
      this.selectedList = val
    },
    handleCreate() {
      this.dialog = { visible: true, type: 'add', id: '' }
    },
    handleUpdate(row) {
      this.dialog = { visible: true, type: 'edit', id: row.id }
    },
    handleDelete(row) {
      this.$confirm('确定要删除该字典吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: `/api/dict/delete/${row.id}`,
          method: 'delete'
        }).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      })
    },
    handleBatchDelete() {
      if (this.selectedList.length === 0) {
        this.$message.warning('请选择要删除的数据')
        return
      }
      this.$confirm('确定要批量删除选中的字典吗？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = this.selectedList.map(item => item.id)
        request({
          url: '/api/dict/batchDelete',
          method: 'post',
          data: ids
        }).then(() => {
          this.$message.success('批量删除成功')
          this.getList()
        })
      })
    }
  }
}
</script>

<style scoped>
.link-type {
  color: #409eff;
  cursor: pointer;
}
</style>
