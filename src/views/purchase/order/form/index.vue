<template>
  <div class="purchaseForm-container template-form-container">
    <el-form
      ref="purchaseForm"
      :model="purchaseForm"
      :rules="rules"
      class="form-container"
      label-width="100px"
    >
      <sticky :z-index="10" class-name="sub-navbar">
        <el-button
          v-loading="loading"
          style="margin-left: 10px;"
          type="primary"
          @click="submitForm"
        >
          {{ isEditMode ? '保存修改' : '新增采购单' }}
        </el-button>
        <el-button
          type="default"
          style="margin-left: 10px;"
          @click="cancelForm"
        >
          取消
        </el-button>
      </sticky>
      <div class="purchaseForm-main-container template-section">
        <el-row>
          <el-col :span="8">
            <el-form-item prop="purchaseNo" label="采购单号：">
              <el-input
                v-model="purchaseForm.purchaseNo"
                placeholder="自动生成或输入"
                maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="supplierId" label="供应商：">
              <el-select
                v-model="purchaseForm.supplierId"
                placeholder="请选择供应商"
                clearable
                filterable
                remote
                :remote-method="searchSupplier"
                :loading="supplierLoading"
                style="width: 100%;"
              >
                <el-option
                  v-for="item in supplierList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <span>{{ item.name }}</span>
                  <span v-if="item.phone" style="margin-left: 10px; color: #999;">{{ item.phone }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="总数量：">
              <el-input
                v-model="purchaseForm.totalQty"
                type="number"
                disabled
                placeholder="自动计算"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 业务时间字段：下单时间 + 到货时间（全驼峰命名） -->
        <el-row>
          <el-col :span="8">
            <el-form-item label="下单时间：">
              <el-date-picker
                v-model="purchaseForm.orderTime"
                type="date"
                placeholder="选择下单时间"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="到货时间：">
              <el-date-picker
                v-model="purchaseForm.arrivalTime"
                type="date"
                placeholder="选择到货时间"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="总金额：">
              <el-input
                v-model="purchaseForm.totalAmount"
                type="number"
                disabled
                :precision="2"
                placeholder="自动计算"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="备注：">
              <el-input
                v-model="purchaseForm.remark"
                type="textarea"
                :rows="3"
                placeholder="备注信息"
                maxlength="255"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="选择商品：">
              <el-select
                v-model="selectedProductId"
                placeholder="输入款号/名称搜索商品"
                clearable
                filterable
                :loading="productLoading"
                style="width: 100%;"
                @change="handleProductSelect"
                @visible-change="handleProductSelectVisible"
              >
                <el-option
                  v-if="productAllList.length === 0 && !productLoading"
                  label="暂无商品数据"
                  value=""
                  disabled
                />
                <el-option
                  v-for="item in filterProductList"
                  :key="item.id"
                  :label="item.productNo + ' - ' + item.name"
                  :value="item.id"
                >
                  <span>{{ item.productNo }} - {{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-button
              type="primary"
              icon="el-icon-plus"
              :disabled="!selectedProductId"
              style="width:100%;"
              @click="openSkuDialog"
            >
              {{ isProductExist ? '编辑' : '新增' }}
            </el-button>
          </el-col>
        </el-row>

        <el-row class="template-section template-section--mt16" style="margin-top:10px;">
          <el-col :span="24">
            <div class="template-section__title" style="margin-bottom:10px;">采购商品明细</div>
          </el-col>
          <el-col :span="24">
            <el-table
              :data="showPurchaseItems"
              border
              style="width:100%;"
              row-key="skuId"
            >
              <el-table-column label="款号" prop="productNo" align="center" min-width="120" />
              <el-table-column label="商品名称" prop="productName" align="center" min-width="180" />
              <el-table-column label="颜色" prop="colorName" align="center" width="100" />
              <el-table-column label="尺码" prop="sizeName" align="center" width="100" />
              <el-table-column label="单价" prop="price" align="center" width="120">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    style="width:100%"
                    @blur="handlePriceBlur(scope.row)"
                    @input="handlePriceInput(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="数量" prop="qty" align="center" width="120">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.qty"
                    type="number"
                    min="0"
                    placeholder="0"
                    style="width:100%"
                    @blur="handleQtyBlur(scope.row)"
                    @input="handleQtyInput(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="金额" prop="amount" align="center" width="120">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.amount"
                    type="number"
                    disabled
                    placeholder="0.00"
                    style="width:100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="100">
                <template slot-scope="scope">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="deleteItem(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <ProductSkuSelectDialog
      v-if="showSkuDialog"
      :visible="showSkuDialog"
      :product-id="selectedProductId"
      :product-no="currentSelectProduct ? currentSelectProduct.productNo : ''"
      :product-name="currentSelectProduct ? currentSelectProduct.name : ''"
      :existing-sku-data="existingSkuData"
      @confirm="handleSkuConfirm"
      @close="handleDialogClose"
    />
  </div>
</template>

<script>
import Sticky from '@/components/Sticky'
import request from '@/utils/request'
import ProductSkuSelectDialog from './ProductSkuSelectDialog'

// 表单默认值（全驼峰命名，与后端DTO完全一致）
const defaultForm = {
  id: undefined,
  purchaseNo: '', // 采购单号
  supplierId: '', // 供应商ID
  totalQty: 0, // 总数量
  totalAmount: 0.00, // 总金额
  status: 0, // 状态（0待入库 1部分入库 2已完成 3取消）
  createUserId: '', // 制单人ID
  createTime: '', // 系统创建时间（自动生成，不可编辑）
  orderTime: new Date().toISOString().split('T')[0], // 默认当前日期（格式：yyyy-MM-dd）
  arrivalTime: '', // 到货时间（用户可编辑）
  remark: '', // 备注
  purchaseOrderItem: [] // 采购明细列表（子DTO数组，全驼峰）
}

export default {
  name: 'PurchaseOrderForm',
  components: {
    Sticky,
    ProductSkuSelectDialog
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value) {
        this.$message.error(rule.field + '不能为空')
        callback(new Error(rule.field + '不能为空'))
      } else {
        callback()
      }
    }
    return {
      purchaseForm: JSON.parse(JSON.stringify(defaultForm)),
      loading: false,
      rules: {
        purchaseNo: [{ validator: validateRequire, trigger: 'blur', field: '采购单号' }],
        supplierId: [{ validator: validateRequire, trigger: 'change', field: '供应商' }]
      },
      productAllList: [],
      filterProductList: [],
      productLoading: false,
      selectedProductId: '',
      currentSelectProduct: null,
      supplierList: [],
      supplierLoading: false,
      showSkuDialog: false,
      existingSkuData: [],
      isProductExist: false,
      allPurchaseItems: []
    }
  },
  computed: {
    isEditMode() {
      return !!this.$route.params.id
    },
    // 仅显示数量>0的明细（过滤无效数据）
    showPurchaseItems() {
      return this.allPurchaseItems.filter(item => item.qty > 0)
    }
  },
  created() {
    this.loadAllProductList()
    this.getSupplierList()
    if (this.isEditMode) {
      this.fetchPurchaseDetail(this.$route.params.id)
    }
  },
  methods: {
    // 加载所有商品列表
    async loadAllProductList() {
      this.productLoading = true
      try {
        const res = await request({
          url: '/api/product/no/name/list',
          method: 'post'
        })
        this.productAllList = res.data || []
        this.filterProductList = this.productAllList
      } catch (e) {
        this.productAllList = []
        this.filterProductList = []
        this.$message.error('商品列表加载失败')
      } finally {
        this.productLoading = false
      }
    },
    // 商品选择下拉框输入搜索（实时过滤）
    handleProductSelectVisible(visible) {
      const input = document.querySelector('.el-select__input')
      if (visible && input) {
        input.oninput = (e) => {
          const key = e.target.value.trim().toLowerCase()
          this.filterProductList = this.productAllList.filter(p => {
            const no = (p.productNo || '').toLowerCase()
            const name = (p.name || '').toLowerCase()
            return no.includes(key) || name.includes(key)
          })
        }
      }
    },
    // 选择商品变化时触发
    handleProductSelect(id) {
      this.selectedProductId = id
      if (!id) {
        this.currentSelectProduct = null
        this.existingSkuData = []
        this.isProductExist = false
        return
      }
      this.currentSelectProduct = this.productAllList.find(item => item.id === id)
      this.checkProductExist()
    },
    // 检查商品是否已存在于采购明细中
    checkProductExist() {
      const has = this.allPurchaseItems.some(
        item => item.productId === this.selectedProductId
      )
      this.isProductExist = has
    },
    // 打开SKU选择弹窗
    openSkuDialog() {
      if (!this.selectedProductId) {
        this.$message.warning('请先选择商品')
        return
      }
      // 提取当前商品的所有明细（含数量0，确保编辑时不丢失数据）
      this.existingSkuData = this.allPurchaseItems.filter(
        item => item.productId === this.selectedProductId
      )
      this.showSkuDialog = true
    },
    // 关闭SKU弹窗
    handleDialogClose() {
      this.showSkuDialog = false
      this.existingSkuData = []
    },
    // 确认选择SKU（覆盖原有明细）
    handleSkuConfirm(list) {
      // 删除当前商品的旧明细（避免重复）
      this.allPurchaseItems = this.allPurchaseItems.filter(
        item => item.productId !== this.selectedProductId
      )
      // 添加新明细（含数量0，由父组件过滤显示）
      this.allPurchaseItems = this.allPurchaseItems.concat(list)
      // 更新采购单明细（仅同步数量>0的有效数据）
      this.purchaseForm.purchaseOrderItem = this.showPurchaseItems
      this.computeTotal()
      this.$message.success(this.existingSkuData.length > 0 ? '编辑成功' : '添加成功')
      this.showSkuDialog = false
      this.existingSkuData = []
      this.checkProductExist()
    },
    // 获取供应商列表
    async getSupplierList(name = '') {
      this.supplierLoading = true
      try {
        const res = await request({
          url: '/api/purchase/order/supplier/list',
          method: 'get'
        })
        this.supplierList = res.data || []
      } catch (e) {
        this.supplierList = []
        this.$message.error('供应商列表加载失败')
      } finally {
        this.supplierLoading = false
      }
    },
    // 搜索供应商（远程搜索）
    searchSupplier(key) {
      this.getSupplierList(key)
    },
    // 删除采购明细
    deleteItem(row) {
      this.$confirm('确认删除该明细？', '提示', { type: 'warning' }).then(() => {
        this.allPurchaseItems = this.allPurchaseItems.filter(i => i.skuId !== row.skuId)
        this.purchaseForm.purchaseOrderItem = this.showPurchaseItems
        this.computeTotal()
        this.$message.success('删除成功')
        this.checkProductExist()
      })
    },
    // 计算总数量和总金额
    computeTotal() {
      const items = this.showPurchaseItems || []
      let qty = 0; let amount = 0
      items.forEach(i => {
        qty += i.qty || 0
        amount += i.amount || 0
      })
      this.purchaseForm.totalQty = qty
      this.purchaseForm.totalAmount = Number(amount.toFixed(2))
    },
    async fetchPurchaseDetail(id) {
      try {
        const { data } = await request({
          url: '/api/purchase/order/' + id,
          method: 'get'
        })
        this.purchaseForm = {
          ...data,
          purchaseOrderItem: data.purchaseOrderItem || []
        }
        this.allPurchaseItems = data.purchaseOrderItem || []
        this.checkProductExist()
      } catch (e) {
        this.$message.error('采购单详情加载失败')
      }
    },
    // 提交表单（直接提交驼峰格式）
    submitForm() {
      this.$refs.purchaseForm.validate(valid => {
        if (!valid) return
        // 直接使用驼峰格式提交，与后端DTO一致
        const submitData = { ...this.purchaseForm }

        // 校验明细有效性（单价≥0，数量≥1，避免无效数据提交）
        const validItems = submitData.purchaseOrderItem.every(item =>
          item.price >= 0 && item.qty >= 1 && !isNaN(item.price) && !isNaN(item.qty)
        )
        if (!validItems) {
          this.$message.error('采购明细中存在无效的单价/数量，请检查')
          return
        }

        this.loading = true
        let url, method
        if (this.isEditMode) {
          url = '/api/purchase/order/' + this.purchaseForm.id
          method = 'put'
        } else {
          url = '/api/purchase/order/create'
          method = 'post'
        }

        request({
          url: url,
          method: method,
          data: submitData // 全驼峰数据直接提交
        }).then(() => {
          this.$message.success(this.isEditMode ? '修改成功' : '新增成功')
          this.$router.back()
        }).catch(() => {
          this.$message.error(this.isEditMode ? '修改失败' : '新增失败')
        }).finally(() => {
          this.loading = false
        })
      })
    },
    // 取消操作（返回上一页）
    cancelForm() {
      this.$router.back()
    },
    // 单价输入实时校验（过滤非数字+限制小数位）
    handlePriceInput(row) {
      if (row.price === '' || row.price === null) return
      // 仅保留数字和单个小数点
      row.price = row.price.toString().replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.')
      // 限制小数点后最多2位
      const dotIndex = row.price.indexOf('.')
      if (dotIndex > -1) {
        row.price = row.price.substring(0, dotIndex + 3)
      }
      // 实时计算金额
      row.amount = Number((Number(row.price) * Number(row.qty || 0)).toFixed(2))
      this.computeTotal()
    },
    // 单价失焦校验（补0+格式修正）
    handlePriceBlur(row) {
      if (!row.price || row.price === '' || isNaN(Number(row.price))) {
        row.price = 0.00
      } else {
        row.price = Number(Number(row.price).toFixed(2))
      }
      row.amount = Number((row.price * (row.qty || 0)).toFixed(2))
      this.computeTotal()
    },
    // 数量输入实时校验（仅保留正整数）
    handleQtyInput(row) {
      if (row.qty === '' || row.qty === null) return
      // 过滤非数字字符
      row.qty = row.qty.toString().replace(/\D/g, '')
      // 实时计算金额
      row.amount = Number((Number(row.price || 0) * Number(row.qty || 0)).toFixed(2))
      this.computeTotal()
    },
    // 数量失焦校验（补0+格式修正）
    handleQtyBlur(row) {
      if (!row.qty || row.qty === '' || isNaN(Number(row.qty)) || Number(row.qty) < 0) {
        row.qty = 0
      } else {
        row.qty = Number(row.qty)
      }
      row.amount = Number((row.price * row.qty).toFixed(2))
      this.computeTotal()
    }
  }
}
</script>

<style lang="scss" scoped>
.purchaseForm-container {
  background: transparent;
  min-height: calc(100vh - 60px);
}
.form-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.el-form-item {
  width: 100%;
}
:deep(.el-input) {
  width: 100%;
}
:deep(.el-input__inner) {
  text-align: center;
}
</style>
