<template>
  <div class="app-container template-page-container">
    <!-- 查询条件区域 -->
    <el-form
      ref="filterForm"
      :model="listQuery"
      inline
      class="filter-container template-section"
      label-position="right"
      label-width="100px"
    >
      <div class="template-section__title">查询条件</div>
      <!-- 第一行查询条件 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="子订单号">
            <el-input
              v-model="listQuery.subOrderNo"
              placeholder="请输入子订单号"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="客户名称">
            <el-input
              v-model="listQuery.customerName"
              placeholder="请输入客户名称"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="制单人">
            <el-input
              v-model="listQuery.createUserName"
              placeholder="请输入制单人"
              clearable
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 第二行查询条件 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="发货日期起">
            <el-date-picker
              v-model="listQuery.sendDateStart"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择开始日期"
              clearable
              @change="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发货日期止">
            <el-date-picker
              v-model="listQuery.sendDateEnd"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择结束日期"
              clearable
              @change="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="子订单状态">
            <el-select
              v-model="listQuery.subOrderStatus"
              placeholder="请选择子订单状态"
              clearable
              @change="handleFilter"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="item in subOrderStatusOptions"
                :key="item.dictValue"
                :label="item.dictName"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 操作按钮 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="template-operate-bar template-operate-bar--center template-action-group stock-order-actions-center">
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
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 子订单表格区域 -->
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
      <!-- 序号列 -->
      <el-table-column
        label="序号"
        align="center"
        width="80"
      >
        <template slot-scope="{ $index }">
          <span>{{ (listQuery.page - 1) * listQuery.limit + $index + 1 }}</span>
        </template>
      </el-table-column>
      <!-- 子订单号 -->
      <el-table-column label="订单号" prop="orderNo" align="center" width="160" />
      <!-- 主订单号 -->
      <el-table-column
        label="订单号"
        sortable="custom"
        align="center"
        width="200"
      >
        <template slot-scope="scope">
          <el-link
            type="primary"
            @click="handleDetail(scope.row)"
          >
            {{ scope.row.subOrderNo }}
          </el-link>
        </template>
      </el-table-column>

      <!-- 客户名称 -->
      <el-table-column label="客户名称" prop="customerName" align="center" min-width="150" />
      <!-- 制单人 -->
      <el-table-column label="制单人" prop="createUserName" align="center" width="120" />
      <!-- 订单类型 -->
      <el-table-column
        label="订单类型"
        align="center"
        width="150"
      >
        <template slot-scope="{ row }">
          {{ getDictLabel(masterOrderTypes, row.orderType) }}
        </template>
      </el-table-column>
      <!-- 主单状态 -->
      <el-table-column label="订单状态" class-name="status-col" width="120" align="center">
        <template slot-scope="{ row }">
          {{ getDictLabel(masterOrderStatus, row.status) }}
        </template>
      </el-table-column>
      <!-- 子单状态 -->
      <el-table-column label="子单状态" align="center" width="120">
        <template slot-scope="{ row }">
          {{ getDictLabel(subOrderStatusOptions, row.subOrderStatus) }}
        </template>
      </el-table-column>
      <!-- 配送方式 -->
      <el-table-column label="配送方式" align="center" width="120">
        <template slot-scope="{ row }">
          {{ getDictLabel(deliveryTypes, row.deliveryType) }}
        </template>
      </el-table-column>
      <!-- 预计发货日期 -->
      <el-table-column label="发货日期" prop="expectSendDate" width="160" align="center" />
      <!-- 配货员 -->
      <el-table-column label="配货员" prop="allocationUserName" align="center" width="120" />
      <!-- 操作列：分配+配货完成+发货 -->
      <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <!-- 分配按钮：子单状态1（待分配）可点击 -->
          <el-button
            type="success"
            size="mini"
            :disabled="Number(row.subOrderStatus) !== 1"
            @click="handleAssign(row)"
          >
            分配
          </el-button>
          <!-- 配货完成按钮：子单状态2可点击 -->
          <el-button
            type="primary"
            size="mini"
            style="margin-left: 5px;"
            :disabled="Number(row.subOrderStatus) !== 2"
            @click="handlePickingComplete(row)"
          >
            配货完成
          </el-button>
          <!-- 发货按钮：子单状态2、3可点击 -->
          <el-button
            type="warning"
            size="mini"
            style="margin-left: 5px;"
            :disabled="![2,3].includes(Number(row.subOrderStatus))"
            @click="handleShip(row)"
          >
            发货
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件：项目自定义Pagination -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 人员选择弹窗：v-if控制 -->
    <user-select-dialog
      v-if="userSelectVisible"
      @confirm="handleUserSelectConfirm"
      @close="handleDialogClose"
    />

    <!-- 发货弹窗：v-if控制，传递子订单ID -->
    <order-sub-ship-dialog
      v-if="shipDialogVisible"
      :order-sub-id="currentShipRow.id"
      @confirm="handleShipConfirm"
      @close="handleShipClose"
    />
  </div>
</template>

<script>
import request from '@/utils/request'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
// 引入人员选择弹窗组件
import UserSelectDialog from '@/components/UserSelect'
// 引入发货弹窗组件
import OrderSubShipDialog from './orderShipDialog.vue'

export default {
  name: 'OrderList',
  components: {
    Pagination,
    UserSelectDialog,
    OrderSubShipDialog
  },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: false,
      selectedList: [],
      // 分页查询参数
      listQuery: {
        page: 1,
        limit: 20,
        subOrderNo: undefined,
        customerName: undefined,
        createUserName: undefined,
        sendDateStart: undefined,
        sendDateEnd: undefined,
        subOrderStatus: undefined,
        isDraft: '',
        sortField: undefined,
        sortOrder: undefined
      },
      // 人员选择弹窗控制
      userSelectVisible: false,
      currentAssignRow: null,
      // 发货弹窗控制
      shipDialogVisible: false,
      currentShipRow: null
    }
  },
  computed: {
    // 主订单类型字典
    masterOrderTypes() {
      return this.$store.getters['dict/getMasterOrderTypes'] || []
    },
    // 主订单状态字典
    masterOrderStatus() {
      return this.$store.getters['dict/getMasterOrderStatus'] || []
    },
    // 子订单状态字典
    subOrderStatusOptions() {
      return this.$store.getters['dict/getSubOrderStatus'] || []
    },
    // 配送方式字典
    deliveryTypes() {
      return this.$store.getters['dict/getDeliveryTypes'] || []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 通用字典标签转换方法
    getDictLabel(dictList, dictValue) {
      if (dictValue === null || dictValue === undefined || dictValue === '') return '未知'
      const item = dictList.find(item => item.dictValue === dictValue)
      return item ? item.dictName : '未知'
    },
    // 跳转到子订单详情页
    handleDetail(row) {
      this.$router.push({ path: `/stock/order/detail/${row.id}` })
    },
    // 获取子订单列表数据
    getList() {
      this.listLoading = true
      const queryParam = {
        page: this.listQuery.page,
        limit: this.listQuery.limit,
        subOrderNo: this.listQuery.subOrderNo,
        customerName: this.listQuery.customerName,
        createUserName: this.listQuery.createUserName,
        sendDateStart: this.listQuery.sendDateStart,
        sendDateEnd: this.listQuery.sendDateEnd,
        subOrderStatus: this.listQuery.subOrderStatus,
        isDraft: this.listQuery.isDraft,
        sortField: this.listQuery.sortField,
        sortOrder: this.listQuery.sortOrder
      }
      request({
        url: '/erp-service/order/sub/page',
        method: 'post',
        data: queryParam
      }).then(res => {
        const responseData = res.data || {}
        // 适配后端返回格式：rows为数据列表，pickerUserName映射为allocationUserName
        this.list = responseData.rows?.map(row => ({
          ...row,
          allocationUserName: row.pickerUserName
        })) || []
        this.total = responseData.total || 0
        this.listLoading = false
      }).catch(error => {
        console.error('获取订单列表失败：', error)
        this.$message.error('获取订单列表失败，请重试')
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    // 筛选查询
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 重置查询条件
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 20,
        subOrderNo: undefined,
        customerName: undefined,
        createUserName: undefined,
        sendDateStart: undefined,
        sendDateEnd: undefined,
        subOrderStatus: undefined,
        isDraft: '',
        sortField: undefined,
        sortOrder: undefined
      }
      this.$refs.filterForm?.resetFields()
      this.getList()
    },
    // 表格排序
    sortChange(data) {
      this.listQuery.sortField = data.prop
      this.listQuery.sortOrder = data.order === 'ascending' ? 'asc' : 'desc'
      this.getList()
    },
    // 表格批量选择
    handleSelectionChange(val) {
      this.selectedList = val
    },
    // 批量删除（保留原有逻辑）
    handleBatchDelete() {
      if (this.selectedList.length === 0) {
        this.$message.warning('请选择要删除的订单')
        return
      }
      this.$confirm('确定要批量删除选中的订单吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedList.map(item => item.id)
        request({
          url: '/erp-service/order/sub/batchDelete',
          method: 'post',
          data: { ids }
        }).then(res => {
          this.$message.success('批量删除成功')
          this.getList()
        }).catch(error => {
          console.error('批量删除失败：', error)
          this.$message.error('批量删除失败，请重试')
        })
      })
    },
    // 新增订单（保留原有逻辑）
    handleCreate() {
      this.$router.push({ path: '/shop/order/create' })
    },
    // 编辑订单（保留原有逻辑）
    handleUpdate(row) {
      this.$router.push({ path: `/shop/order/edit/${row.id}` })
    },
    // 单条删除（保留原有逻辑）
    handleDelete(row, index) {
      this.$confirm('确定要删除该订单吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: `/erp-service/order/sub/delete/${row.id}`,
          method: 'delete'
        }).then(res => {
          this.$message.success('删除成功')
          this.getList()
        }).catch(error => {
          console.error('删除订单失败：', error)
          this.$message.error('删除订单失败，请重试')
        })
      })
    },
    // 打开人员分配弹窗
    handleAssign(row) {
      this.currentAssignRow = row
      this.userSelectVisible = true
    },
    // 处理人员分配确认（调用分配接口）
    handleUserSelectConfirm(selectedUserId) {
      this.userSelectVisible = false
      request({
        url: '/erp-service/order/sub/assign',
        method: 'post',
        data: {
          orderSubId: this.currentAssignRow.id,
          userId: selectedUserId
        }
      }).then(res => {
        this.$message.success(`已成功分配配货员（ID：${selectedUserId}）`)
        this.getList()
      }).catch(error => {
        console.error('订单分配失败：', error)
        this.$message.error('订单分配失败，请重试')
      })
    },
    // 关闭人员分配弹窗
    handleDialogClose() {
      this.userSelectVisible = false
    },
    // 配货完成（调用配货完成接口）
    handlePickingComplete(row) {
      this.$confirm('确定要标记该子订单为配货完成吗？', '提示', {
        type: 'info'
      }).then(() => {
        request({
          url: '/erp-service/order/sub/picking/complete',
          method: 'post',
          data: { orderSubId: row.id }
        }).then(() => {
          this.$message.success('配货完成标记成功')
          this.getList()
        }).catch(error => {
          console.error('配货完成失败：', error)
          this.$message.error('配货完成失败，请重试')
        })
      })
    },
    // 打开发货弹窗
    handleShip(row) {
      this.currentShipRow = row
      this.shipDialogVisible = true
    },
    // 处理发货确认（刷新列表）
    handleShipConfirm() {
      this.shipDialogVisible = false
      this.getList()
    },
    // 关闭发货弹窗
    handleShipClose() {
      this.shipDialogVisible = false
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 16px;
}

.stock-order-actions-center {
  justify-content: center;
}
</style>
