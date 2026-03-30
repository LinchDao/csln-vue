<template>
  <el-dialog
    :visible="internalVisible"
    :title="`选择SKU - ${productName}`"
    width="90%"
    append-to-body
    @close="handleClose"
  >
    <!-- 批量设置区域：使用el-table作为布局载体，整合单价+数量批量设置 -->
    <el-table
      border
      style="width: 100%; margin-bottom: 20px;"
      :data="batchTableData"
      row-key="type"
    >
      <el-table-column
        label="批量设置类型"
        align="center"
        width="180"
      >
        <template slot-scope="scope">
          <span style="font-weight: 500; color: #333;">{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="批量维度"
        align="center"
        width="200"
      >
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.batchType"
            placeholder="选择批量维度"
            style="width: 100%;"
          >
            <el-option label="全量SKU" value="all" />
            <el-option label="按颜色批量" value="color" />
            <el-option label="按尺码批量" value="size" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        label="维度值选择"
        align="center"
        width="200"
      >
        <template slot-scope="scope">
          <el-select
            v-if="scope.row.batchType && scope.row.batchType !== 'all'"
            v-model="scope.row.batchValue"
            :placeholder="`选择${scope.row.batchType === 'color' ? '颜色' : '尺码'}`"
            style="width: 100%;"
          >
            <el-option
              v-for="item in scope.row.batchOptionList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <span v-else style="color: #999;">无需选择</span>
        </template>
      </el-table-column>
      <el-table-column
        label="设置值"
        align="center"
        width="200"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.batchVal"
            :min="scope.row.min"
            :precision="scope.row.precision"
            :step="scope.row.step"
            placeholder="请输入设置值"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-setting"
            size="small"
            :disabled="!scope.row.batchType || (scope.row.batchType !== 'all' && !scope.row.batchValue) || scope.row.batchVal < 0"
            @click="handleBatchOperate(scope.row)"
          >
            应用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- SKU编辑表格：保留原有单条编辑功能 -->
    <el-table
      :data="skuList"
      border
      style="width: 100%;"
      row-key="id"
    >
      <el-table-column label="颜色" prop="colorName" align="center" width="120" />
      <el-table-column label="尺码" prop="sizeName" align="center" width="100" />
      <el-table-column label="采购单价" align="center" width="150">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.purchasePrice"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%;"
            @change="computeSkuAmount(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="采购数量" align="center" width="150">
        <template slot-scope="scope">
          <!-- 数量最小设为0，允许输入0 -->
          <el-input-number
            v-model="scope.row.purchaseQty"
            :min="0"
            :precision="0"
            style="width: 100%;"
            @change="computeSkuAmount(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="单SKU金额" prop="purchaseAmount" align="center" width="150">
        <template slot-scope="scope">
          {{ scope.row.purchaseAmount.toFixed(2) }}
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="!skuList.some(item => item.purchasePrice > 0 && item.purchaseQty > 0)" @click="handleSave">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'
export default {
  name: 'ProductSkuSelectDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      default: ''
    },
    productNo: {
      type: String,
      default: ''
    },
    existingSkuData: { // 接收父组件传入的已选SKU数据（全驼峰）
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      internalVisible: false,
      skuList: [],
      loading: false,
      // 批量设置表格数据源：默认选中全量SKU，数量最小设为0
      batchTableData: [
        {
          type: 'price', // 单价标识
          label: '单价批量设置',
          batchType: 'all', // 默认选中全量SKU
          batchValue: '',
          batchVal: 1, // 默认值1
          min: 0,
          precision: 2,
          step: 0.01,
          batchOptionList: []
        },
        {
          type: 'qty', // 数量标识
          label: '数量批量设置',
          batchType: 'all', // 默认选中全量SKU
          batchValue: '',
          batchVal: 0, // 默认值0（允许初始为0）
          min: 0, // 最小设为0，允许输入0
          precision: 0,
          step: 1,
          batchOptionList: []
        }
      ]
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.internalVisible = val
        if (val) {
          this.fetchSkuList()
        } else {
          this.resetAllBatchParams()
        }
      },
      immediate: true
    },
    priceBatchType: {
      handler(newVal) {
        this.handleBatchTypeChange(newVal, this.batchTableData[0])
      },
      get() {
        return this.batchTableData[0].batchType
      }
    },
    qtyBatchType: {
      handler(newVal) {
        this.handleBatchTypeChange(newVal, this.batchTableData[1])
      },
      get() {
        return this.batchTableData[1].batchType
      }
    }
  },
  created() {
    if (this.visible) {
      this.fetchSkuList()
    }
  },
  methods: {
    // 关闭弹窗
    handleClose() {
      this.internalVisible = false
      this.resetAllBatchParams()
      this.$emit('close')
    },
    // 加载SKU后回显已选的单价和数量
    async fetchSkuList() {
      this.loading = true
      try {
        const res = await request({
          url: `/api/product/get/sku/by/${this.productId}`,
          method: 'get'
        })
        // 初始化SKU数据：数量默认0（全驼峰）
        this.skuList = res.data.map(sku => ({
          ...sku,
          purchasePrice: 0,
          purchaseQty: 0, // 默认0
          purchaseAmount: 0
        }))
        // 若存在已选SKU数据，回显单价和数量（包括可能的0）
        if (this.existingSkuData && this.existingSkuData.length > 0) {
          this.skuList = this.skuList.map(sku => {
            const existingItem = this.existingSkuData.find(
              item => item.skuId === sku.id
            )
            if (existingItem) {
              return {
                ...sku,
                purchasePrice: existingItem.price,
                purchaseQty: existingItem.qty, // 保留原有的0值
                purchaseAmount: Number((existingItem.price * existingItem.qty).toFixed(4))
              }
            }
            return sku
          })
        }
      } catch (e) {
        this.$message.error('加载SKU失败')
      } finally {
        this.loading = false
      }
    },
    // 批量维度变化通用处理
    handleBatchTypeChange(newVal, row) {
      if (!newVal || this.skuList.length === 0) {
        row.batchOptionList = []
        row.batchValue = ''
        return
      }
      if (newVal === 'all') {
        row.batchOptionList = []
        row.batchValue = ''
        return
      }
      const key = newVal === 'color' ? 'colorName' : 'sizeName'
      row.batchOptionList = [...new Set(this.skuList.map(item => item[key]))]
      row.batchValue = ''
    },
    // 批量操作核心方法：统一处理单价/数量的批量设置
    handleBatchOperate(row) {
      let filterSku = this.skuList
      if (row.batchType === 'color') {
        filterSku = this.skuList.filter(item => item.colorName === row.batchValue)
      } else if (row.batchType === 'size') {
        filterSku = this.skuList.filter(item => item.sizeName === row.batchValue)
      }
      if (row.type === 'price') {
        filterSku.forEach(item => {
          item.purchasePrice = row.batchVal
          this.computeSkuAmount(item)
        })
        this.$message.success(`已${row.batchType === 'all' ? '为全量SKU' : `为【${row.batchValue}】`}设置单价为${row.batchVal.toFixed(2)}`)
        row.batchVal = 1
      } else {
        // 批量设置数量时允许设为0
        filterSku.forEach(item => {
          item.purchaseQty = row.batchVal
          this.computeSkuAmount(item)
        })
        this.$message.success(`已${row.batchType === 'all' ? '为全量SKU' : `为【${row.batchValue}】`}设置数量为${row.batchVal}`)
        row.batchVal = 0
      }
    },
    computeSkuAmount(row) {
      row.purchaseAmount = Number((row.purchasePrice * row.purchaseQty).toFixed(4))
    },
    handleSave() {
      const validList = this.skuList.map(i => ({
        skuId: i.id,
        productId: this.productId,
        productNo: this.productNo,
        productName: this.productName,
        colorName: i.colorName,
        sizeName: i.sizeName,
        price: i.purchasePrice,
        qty: i.purchaseQty, // 保留0值
        amount: Number(i.purchaseAmount.toFixed(2))
      }))
      this.$emit('confirm', validList)
      this.handleClose()
    },
    // 重置所有批量参数：数量最小仍为0
    resetAllBatchParams() {
      this.batchTableData = [
        {
          type: 'price',
          label: '采购单价批量设置',
          batchType: 'all',
          batchValue: '',
          batchVal: 1,
          min: 0,
          precision: 2,
          step: 0.01,
          batchOptionList: []
        },
        {
          type: 'qty',
          label: '数量批量设置',
          batchType: 'all',
          batchValue: '',
          batchVal: 0,
          min: 0,
          precision: 0,
          step: 1,
          batchOptionList: []
        }
      ]
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
/* 批量设置表格样式适配 */
:deep(.el-table__cell) {
  padding: 12px 8px;
}
:deep(.el-select),
:deep(.el-input-number) {
  width: 100%;
}
/* 响应式适配：小屏下收缩列宽 */
@media (max-width: 1200px) {
  :deep(.el-table-column--batch-type) {
    width: 150px !important;
  }
  :deep(.el-table-column--batch-dimension) {
    width: 180px !important;
  }
}
@media (max-width: 992px) {
  :deep(.el-table) {
    min-width: 800px;
    overflow-x: auto;
  }
}
</style>
