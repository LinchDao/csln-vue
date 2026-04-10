<template>
  <div class="app-container template-page-container">
    <!-- 基于 el-form 的筛选表单 -->
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
        <el-col :span="6">
          <!-- 款号筛选 -->
          <el-form-item label="款号">
            <el-input
              v-model="listQuery.productNo"
              placeholder="请输入商品款号"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <!-- 商品名称筛选 -->
          <el-form-item label="商品名称">
            <el-input
              v-model="listQuery.name"
              placeholder="请输入商品名称"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="商品状态">
            <el-radio-group v-model="listQuery.status" @change="handleFilter">
              <el-radio label="">全部</el-radio>
              <el-radio label="1">启用</el-radio>
              <el-radio label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <!-- 预留列，保证布局对称 -->
        <el-col :span="6" />
      </el-row>

      <el-row class="template-filter-row">
        <el-col :span="24">
          <div class="template-operate-bar template-operate-bar--center template-action-group">
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
                class="template-btn-gap"
                @click="handleReset"
              >
                重置
              </el-button>
              <el-button
                type="primary"
                icon="el-icon-plus"
                class="template-btn-gap"
                @click="handleCreate"
              >
                添加商品
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
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格部分（保持不变） -->
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
        label="商品编号"
        sortable="custom"
        align="center"
        width="160"
        :class-name="getSortClass('productNo')"
      >
        <template slot-scope="scope">
          <el-link
            type="primary"
            @click="handleDetail(scope.row)"
          >
            {{ scope.row.productNo }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column label="商品名称" min-width="200px" align="center">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="商品图片"
        align="center"
        width="100"
      >
        <template slot-scope="{ row }">
          <TableImage
            :image-id="row.mainImageId"
            :image-width="80"
            :image-height="80"
            empty-text="暂无商品图片"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="品牌"
        prop="brand"
        align="center"
        width="120px"
      >
        <template slot-scope="{ row }">
          <span>{{ row.brand }}</span>
        </template>
      </el-table-column>

      <el-table-column label="季节/年份" align="center" width="120px">
        <template slot-scope="{ row }">
          <span>{{ row.year }}/{{ row.season }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="系列"
        prop="series"
        align="center"
        width="120px"
      >
        <template slot-scope="{ row }">
          <span>{{ row.series }}</span>
        </template>
      </el-table-column>

      <el-table-column label="成本价" align="center" width="100px">
        <template slot-scope="{ row }">
          <span>¥{{ row.costPrice }}</span>
        </template>
      </el-table-column>

      <el-table-column label="批发价" align="center" width="100px">
        <template slot-scope="{ row }">
          <span>¥{{ row.wholesalePrice }}</span>
        </template>
      </el-table-column>

      <el-table-column label="零售价" align="center" width="100px">
        <template slot-scope="{ row }">
          <span>¥{{ row.retailPrice }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="200px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" class-name="status-col" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
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
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import TableImage from '@/components/tableImg'
import request from '@/utils/request'

export default {
  name: 'ProductList',
  components: { Pagination, TableImage },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      downloadLoading: false,
      selectedList: [], // 批量选择的行数据
      listQuery: {
        page: 1,
        limit: 20,
        productNo: undefined, // 款号
        name: undefined, // 商品名称
        status: undefined // 商品状态（1：启用，0：禁用）
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 跳转到商品详情页
    handleDetail(row) {
      this.$router.push({ path: `/product/detail/${row.id}` })
    },
    // 获取商品列表
    getList() {
      this.listLoading = true
      const query = { ...this.listQuery }

      request({ url: '/erp-service/product/page', method: 'post', data: query })
        .then(res => {
          this.list = res.data.rows
          this.total = res.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.listLoading = false
          this.$message.error('获取商品列表失败')
        })
    },

    // 筛选查询
    handleFilter() {
      this.listQuery.page = 1 // 筛选后重置页码
      this.getList()
    },

    // 重置筛选条件
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 20,
        productNo: undefined, // 款号
        name: undefined, // 商品名称
        status: undefined // 商品状态（1：启用，0：禁用）
      }

      this.$refs.filterForm.resetFields()
      this.getList() // 重置后重新查询
    },

    // 表格排序
    sortChange(data) {
      this.listQuery.sortField = data.prop
      this.listQuery.sortOrder = data.order === 'ascending' ? 'asc' : 'desc'
      this.getList()
    },

    // 批量选择行
    handleSelectionChange(val) {
      this.selectedList = val
    },

    // 批量删除
    handleBatchDelete() {
      this.$confirm('确定要批量删除选中的商品吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedList.map(item => item.id)
        request({ url: '/erp-service/product/batchDelete', method: 'post', data: { ids }})
          .then(() => {
            this.$message.success('批量删除成功')
            this.getList()
          })
          .catch(() => {
            this.$message.error('批量删除失败')
          })
      })
    },

    // 添加商品
    handleCreate() {
      this.$router.push({ path: '/product/create' })
    },

    // 编辑商品
    handleUpdate(row) {
      this.$router.push({ path: `/product/edit/${row.id}` })
    },

    // 删除商品
    handleDelete(row, index) {
      this.$confirm('确定要删除该商品吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({ url: `/erp-service/product/delete/${row.id}`, method: 'delete' })
          .then(() => {
            this.$message.success('删除成功')
            this.getList()
          })
          .catch(() => {
            this.$message.error('删除失败')
          })
      })
    },

    handleDownload() {
      this.downloadLoading = true
      request({
        url: '/erp-service/product/export',
        method: 'post',
        data: this.listQuery,
        responseType: 'blob'
      }).then(res => {
        const fileName = `商品列表_${new Date().getTime()}.xlsx`
        const a = document.createElement('a')
        a.href = URL.createObjectURL(res)
        a.download = fileName
        a.click()
        URL.revokeObjectURL(a.href)
        this.downloadLoading = false
        this.$message.success('导出成功')
      }).catch((error) => {
        console.error('导出失败：', error)
        this.downloadLoading = false
        this.$message.error('导出失败')
      })
    },

    getSortClass(key) {
      if (this.listQuery.sortField === key) {
        return this.listQuery.sortOrder === 'asc' ? 'sort-asc' : 'sort-desc'
      }
      return ''
    }
  }
}
</script>

<style scoped>
.template-filter-row {
  margin-top: 15px;
}

.template-operate-bar--center {
  display: flex;
  justify-content: center;
}

.template-btn-gap {
  margin-left: 10px;
}
</style>
