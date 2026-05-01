<template>
  <el-dialog
    :visible="internalVisible"
    :title="`选择规格 - ${productName}`"
    width="70%"
    append-to-body
    @close="handleClose"
  >
    <!-- SKU编辑表格：动态显示维度列 + 级联合并 -->
    <el-table
      v-loading="loading"
      :data="skuList"
      :span-method="handleSpanMethod"
      border
      style="width: 100%;"
      row-key="id"
    >
      <el-table-column
        v-for="dim in dimensionConfigs"
        :key="dim.name"
        :label="dim.name"
        align="center"
        min-width="120"
      >
        <template slot-scope="scope">
          {{ getDimValue(scope.row, dim.name) }}
        </template>
      </el-table-column>
      <el-table-column label="条码" prop="barcode" align="center" width="200" />
      <el-table-column label="单价" align="center" width="200">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.price"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%;"
            @change="computeSkuAmount(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" width="150">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.qty"
            :min="0"
            :precision="0"
            style="width: 100%;"
            @change="computeSkuAmount(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="单项金额" prop="amount" align="center" width="150">
        <template slot-scope="scope">
          ¥{{ (scope.row.amount || 0).toFixed(2) }}
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClearAll">清除所有选择</el-button>
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button type="primary" size="small" :disabled="!skuList.some(item => item.qty > 0)" @click="handleSave">
        确认选择
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
    defaultPrice: {
      type: Number,
      default: 0
    },
    existingSkuData: { // 接收当前行或子订单中已选该商品的SKU数据
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      internalVisible: false,
      skuList: [],
      dimensionConfigs: [], // 动态维度配置 { name, order }
      loading: false
    }
  },
  computed: {
    dimensionNames() {
      return this.dimensionConfigs.map(d => d.name)
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.internalVisible = val
        if (val) {
          this.fetchSkuList()
        }
      },
      immediate: true
    }
  },
  methods: {
    handleClose() {
      this.internalVisible = false
      this.$emit('close')
    },
    handleClearAll() {
      this.skuList.forEach(item => {
        item.qty = 0
        item.amount = 0
      })
    },
    // 获取维度值
    getDimValue(row, dimName) {
      const dim = (row.dims || []).find(d => d.name === dimName)
      return dim ? dim.value : '-'
    },
    // 表格合并逻辑：级联合并
    handleSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex < this.dimensionConfigs.length) {
        // 当前维度索引
        const dimIndex = columnIndex

        // 检查当前行与上一行在该维度及之前所有维度的值是否完全一致
        const isSameWithPrev = (idx) => {
          if (idx < 0) return true
          const dName = this.dimensionConfigs[idx].name
          const prevRow = this.skuList[rowIndex - 1]
          if (!prevRow) return false
          return this.getDimValue(row, dName) === this.getDimValue(prevRow, dName) && isSameWithPrev(idx - 1)
        }

        if (rowIndex > 0 && isSameWithPrev(dimIndex)) {
          return { rowspan: 0, colspan: 0 }
        }

        // 计算 rowspan：向下查找多少行是连续一致的
        let rowspan = 1
        for (let i = rowIndex + 1; i < this.skuList.length; i++) {
          const nextRow = this.skuList[i]
          const isSameWithNext = (idx) => {
            if (idx < 0) return true
            const dName = this.dimensionConfigs[idx].name
            return this.getDimValue(row, dName) === this.getDimValue(nextRow, dName) && isSameWithNext(idx - 1)
          }

          if (isSameWithNext(dimIndex)) {
            rowspan++
          } else {
            break
          }
        }
        return { rowspan, colspan: 1 }
      }
    },
    async fetchSkuList() {
      this.loading = true
      try {
        const res = await request({
          url: '/erp-service/product/v2/sku/list',
          method: 'post',
          data: { productId: this.productId }
        })

        const rawSkuList = res.data || []

        // 提取并排序维度配置
        const configMap = {}
        rawSkuList.forEach(sku => {
          (sku.dims || []).forEach(dim => {
            if (dim.name && !configMap[dim.name]) {
              configMap[dim.name] = dim.order || 99
            }
          })
        })
        this.dimensionConfigs = Object.keys(configMap)
          .map(name => ({ name, order: configMap[name] }))
          .sort((a, b) => a.order - b.order)

        // 对 SKU 列表进行排序，确保级联合并正确
        this.skuList = rawSkuList.sort((a, b) => {
          for (const config of this.dimensionConfigs) {
            const valA = this.getDimValue(a, config.name)
            const valB = this.getDimValue(b, config.name)
            if (valA !== valB) return valA.localeCompare(valB)
          }
          return 0
        }).map(sku => ({
          ...sku,
          price: this.defaultPrice || 0,
          qty: 0,
          amount: 0
        }))

        // 回显已选数据
        if (this.existingSkuData && this.existingSkuData.length > 0) {
          this.skuList = this.skuList.map(sku => {
            const existingItem = this.existingSkuData.find(
              item => item.skuId === sku.id
            )
            if (existingItem) {
              const price = existingItem.price !== undefined ? existingItem.price : (this.defaultPrice || 0)
              return {
                ...sku,
                price: price,
                qty: existingItem.qty,
                amount: Number((price * existingItem.qty).toFixed(2))
              }
            }
            return sku
          })
        }
      } catch (e) {
        this.$message.error('加载规格列表失败')
      } finally {
        this.loading = false
      }
    },
    computeSkuAmount(row) {
      row.amount = Number((row.price * row.qty).toFixed(2))
    },
    handleSave() {
      // 仅返回数量大于0的SKU
      const selectedSkus = this.skuList.filter(item => item.qty > 0)
      const resultList = selectedSkus.map(i => {
        const sortedDims = [...(i.dims || [])].sort((a, b) => a.order - b.order)
        const colorDim = sortedDims[0]
        const sizeDim = sortedDims[1]

        const snapshotObj = {
          dims: i.dims,
          barcode: i.barcode
        }

        return {
          skuId: i.id,
          productId: this.productId,
          productNo: this.productNo,
          productName: this.productName,
          colorName: colorDim ? colorDim.value : '',
          sizeName: sizeDim ? sizeDim.value : '',
          dims: i.dims,
          skuSpecSnapshot: JSON.stringify(snapshotObj),
          price: i.price,
          qty: i.qty,
          amount: Number(i.amount.toFixed(2))
        }
      })
      this.$emit('confirm', resultList)
      this.handleClose()
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
:deep(.el-table__cell) {
  padding: 12px 8px;
}
:deep(.el-select),
:deep(.el-input-number) {
  width: 100%;
}
</style>
