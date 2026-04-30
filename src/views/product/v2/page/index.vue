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
          <el-form-item label="类目ID">
            <el-input
              v-model="listQuery.categoryId"
              placeholder="请输入类目ID"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="商品状态">
            <el-radio-group v-model="listQuery.status" @change="handleFilter">
              <el-radio :label="null">全部</el-radio>
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
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
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 表格部分 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      class="template-table-section"
      style="width: 100%; margin-top: 16px;"
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
        align="center"
        width="160"
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
        label="类目ID"
        prop="categoryId"
        align="center"
        width="120px"
      />

      <el-table-column
        label="品牌"
        prop="brand"
        align="center"
        width="120px"
      />

      <el-table-column label="成本价" align="center" width="100px">
        <template slot-scope="{ row }">
          <span>¥{{ row.costPrice }}</span>
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
          <el-button size="mini" type="danger" @click="handleDelete(row, $index)">
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
  name: 'ProductListv2',
  components: { Pagination, TableImage },
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
        limit: 10,
        productNo: undefined,
        name: undefined,
        categoryId: undefined,
        status: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleDetail(row) {
      this.$router.push({ path: `/product-v2/detail/${row.id}` })
    },
    getList() {
      this.listLoading = true
      request({ url: '/erp-service/product/v2/page', method: 'post', data: this.listQuery })
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
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 20,
        productNo: undefined,
        name: undefined,
        categoryId: undefined,
        status: null
      }
      this.getList()
    },
    handleSelectionChange(val) {
      this.selectedList = val
    },
    handleCreate() {
      this.$router.push({ path: '/product-v2/create' })
    },
    handleUpdate(row) {
      this.$router.push({ path: `/product-v2/edit/${row.id}` })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该商品吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({ url: `/erp-service/product/v2/delete/${row.id}`, method: 'delete' })
          .then(() => {
            this.$message.success('删除成功')
            this.getList()
          })
          .catch(() => {
            this.$message.error('删除失败')
          })
      })
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
