<template>
  <div class="app-container template-page-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      inline
      label-width="88px"
      class="template-section"
      @keyup.enter.native="handleFilter"
    >
      <div class="template-section__title">查询条件</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="关键字">
            <el-input
              v-model="queryParams.keyword"
              clearable
              placeholder="请输入名称/编码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              clearable
              placeholder="请选择状态"
            >
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="queryParams.dateRange"
              clearable
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="template-operate-bar template-operate-bar--center">
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
          新增
        </el-button>
      </div>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%; margin-top: 16px;"
    >
      <el-table-column label="序号" width="80" align="center">
        <template slot-scope="{ $index }">
          <span>{{ (queryParams.page - 1) * queryParams.limit + $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板编码" prop="code" min-width="140" />
      <el-table-column label="模板名称" prop="name" min-width="180" />
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="180" />
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="{ row }">
          <el-button type="text" @click="handleDetail(row)">详情</el-button>
          <el-button type="text" @click="handleUpdate(row)">编辑</el-button>
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

export default {
  name: 'TemplatePage',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      queryParams: {
        page: 1,
        limit: 10,
        keyword: undefined,
        status: undefined,
        dateRange: []
      },
      list: [],
      total: 0,
      loading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        // request placeholder
        // const res = await request({
        //   url: '/api/xxx/page',
        //   method: 'post',
        //   data: this.queryParams
        // })
        // this.list = res.data.rows || []
        // this.total = res.data.total || 0
        this.list = [
          { id: 1, code: 'TMP-001', name: '模板数据A', status: 1, createTime: '2026-04-01 09:00:00' },
          { id: 2, code: 'TMP-002', name: '模板数据B', status: 0, createTime: '2026-04-01 10:00:00' }
        ]
        this.total = this.list.length
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
        keyword: undefined,
        status: undefined,
        dateRange: []
      }
      this.getList()
    },
    handleCreate() {
      this.$message.info('模板占位：跳转新增页')
    },
    handleDetail(row) {
      this.$message.info(`模板占位：查看 ${row.name} 详情`)
    },
    handleUpdate(row) {
      this.$message.info(`模板占位：编辑 ${row.name}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.template-page-container {
  .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
