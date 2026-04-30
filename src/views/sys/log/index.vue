<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="业务ID" prop="bizId">
        <el-input
          v-model="queryParams.bizId"
          placeholder="请输入业务ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属模块" prop="module">
        <el-select v-model="moduleList" placeholder="选择模块(多选)" multiple collapse-tags clearable size="small">
          <el-option
            v-for="dict in logModuleDict"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="动作类型" prop="actionType">
        <el-select v-model="actionTypeList" placeholder="选择动作(多选)" multiple collapse-tags clearable size="small">
          <el-option
            v-for="dict in logActionDict"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="日志状态" clearable size="small">
          <el-option label="成功" :value="1" />
          <el-option label="失败" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="logList" border>
      <el-table-column label="业务ID" align="center" prop="bizId" width="200" show-overflow-tooltip />
      <el-table-column label="所属模块" align="center" prop="module" width="120" />
      <el-table-column label="动作类型" align="center" prop="actionType" width="120" />
      <el-table-column label="请求URL" align="center" prop="requestUrl" show-overflow-tooltip />
      <el-table-column label="方式" align="center" prop="requestMethod" width="80" />
      <el-table-column label="操作人" align="center" prop="userName" width="120" />
      <el-table-column label="耗时(ms)" align="center" prop="costTime" width="100" />
      <el-table-column label="执行状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="异常信息" align="center" prop="errorMsg" show-overflow-tooltip />
      <el-table-column label="操作时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleViewDiff(scope.row)"
          >查看差异</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.limit"
      @pagination="getList"
    />

    <!-- 日志差异详情对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="open" width="800px" append-to-body>
      <div v-if="diffData">
        <el-input
          v-model="diffData"
          type="textarea"
          :rows="20"
          readonly
          placeholder="暂无差异数据"
        />
      </div>
      <div v-else style="text-align: center; padding: 20px;">
        <span style="color: #909399;">暂无差异数据</span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'

export default {
  name: 'SysLog',
  components: { Pagination },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 日志表格数据
      logList: [],
      // 日期范围
      dateRange: [],
      // 弹出层标题
      dialogTitle: '查看日志差异',
      // 是否显示弹出层
      open: false,
      // 差异数据
      diffData: '',
      // 多选临时存储
      moduleList: [],
      actionTypeList: [],
      // 查询参数
      queryParams: {
        page: 1,
        limit: 10,
        module: undefined,
        actionType: undefined,
        status: undefined,
        startTime: undefined,
        endTime: undefined,
        bizId: undefined
      }
    }
  },
  computed: {
    logActionDict() {
      return this.$store.getters['dict/getLogActionDict']
    },
    logModuleDict() {
      return this.$store.getters['dict/getLogModuleDict']
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parseTime,
    /** 查询日志列表 */
    getList() {
      this.loading = true
      const params = { ...this.queryParams }

      // 直接传数组，后端已改为 List<String> 接收
      params.module = this.moduleList && this.moduleList.length > 0 ? this.moduleList : undefined
      params.actionType = this.actionTypeList && this.actionTypeList.length > 0 ? this.actionTypeList : undefined

      if (this.dateRange && this.dateRange.length === 2) {
        params.startTime = this.dateRange[0]
        params.endTime = this.dateRange[1]
      }

      request({
        url: '/erp-service/log/page',
        method: 'post',
        data: params
      }).then(response => {
        const { rows, total } = response.data
        this.logList = rows || []
        this.total = total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.moduleList = []
      this.actionTypeList = []
      this.queryParams = {
        page: 1,
        limit: 10,
        module: undefined,
        actionType: undefined,
        status: undefined,
        startTime: undefined,
        endTime: undefined,
        bizId: undefined
      }
      this.handleQuery()
    },
    /** 查看差异按钮操作 */
    handleViewDiff(row) {
      this.diffData = ''
      this.open = true
      request({
        url: `/erp-service/log/diff-data/${row.id}`,
        method: 'get'
      }).then(response => {
        this.diffData = response.data
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
