<template>
  <div class="template-form-container template-form-layout">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="template-form-body"
    >
      <!-- 顶部操作按钮（核心优化：按状态+接口规范动态展示） -->
      <sticky :z-index="10" class-name="sub-navbar">
        <!-- 编辑-正式单（isDraft=0）：仅显示「提交修改」（调用正式单编辑接口） -->
        <el-button
          v-if="isEditMode && formData.isDraft === 0"
          v-loading="loading"
          type="primary"
          class="template-btn-gap"
          @click="submitForm('formal')"
        >
          提交修改
        </el-button>

        <!-- 编辑-草稿单（isDraft=1）：显示「保存草稿+提交修改」（分别调用草稿编辑+草稿提交接口） -->
        <template v-if="isEditMode && formData.isDraft === 1">
          <el-button
            v-loading="loading"
            type="warning"
            class="template-btn-gap"
            @click="submitForm('draft')"
          >
            保存草稿
          </el-button>
          <el-button
            v-loading="loading"
            type="primary"
            class="template-btn-gap"
            @click="submitForm('submitDraft')"
          >
            提交修改
          </el-button>
        </template>

        <!-- 新建状态（非编辑）：显示「保存草稿+提交订单」（分别调用创建订单接口的草稿/正式模式） -->
        <template v-if="!isEditMode">
          <el-button
            v-loading="loading"
            type="warning"
            class="template-btn-gap"
            @click="submitForm('createDraft')"
          >
            保存草稿
          </el-button>
          <el-button
            v-loading="loading"
            type="primary"
            class="template-btn-gap"
            @click="submitForm('createFormal')"
          >
            提交订单
          </el-button>
        </template>

        <el-button class="template-btn-gap" @click="cancelForm">
          取消
        </el-button>
      </sticky>

      <!-- 1. 主订单信息 + 全局合计 -->
      <el-row :gutter="20" style="margin-bottom: 16px;">
        <el-col :span="16">
          <el-card shadow="never" class="template-section">
            <div class="template-section__title">主订单信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="客户名称" prop="customerId">
                  <el-select
                    v-model="formData.customerId"
                    placeholder="请选择客户"
                    clearable
                    filterable
                    style="width:100%;"
                    @focus="loadCustomerList"
                  >
                    <el-option
                      v-for="item in customerList"
                      :key="item.id"
                      :label="`${item.name} - ${item.phone || '无电话'}`"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="订单类型" prop="orderType">
                  <el-select v-model="formData.orderType" placeholder="请选择订单类型" clearable style="width:100%;">
                    <el-option v-for="item in masterOrderTypes" :key="item.dictValue" :label="item.dictName" :value="item.dictValue" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="订单备注" prop="remark">
                  <el-input
                    v-model="formData.remark"
                    type="textarea"
                    :rows="3"
                    maxlength="255"
                    placeholder="请输入订单备注"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        <!-- 独立合计卡片：主订单总数量/总金额 -->
        <el-col :span="8">
          <el-card shadow="never" class="template-section total-card">
            <div class="template-section__title">订单合计</div>
            <div class="total-item">
              <span class="total-label">总订单数：</span>
              <span class="total-value">{{ formData.subOrders.length }} 个子订单</span>
            </div>
            <div class="total-item">
              <span class="total-label">商品总数量：</span>
              <span class="total-value">{{ formData.totalQty || 0 }} 件</span>
            </div>
            <div class="total-item total-amount">
              <span class="total-label">订单总金额：</span>
              <span class="total-value">¥{{ (formData.totalAmount || 0).toFixed(2) }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 2. 子订单信息 -->
      <el-card v-for="(sub, subIndex) in formData.subOrders" :key="subIndex" shadow="never" class="template-section template-section--mt16">
        <div class="template-section__title">
          子订单信息 {{ subIndex + 1 }}
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            style="float: right;"
            :disabled="formData.subOrders.length === 1"
            @click="removeSubOrder(subIndex)"
          >
            删除子订单
          </el-button>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            style="float: right; margin-right: 10px;"
            @click="addSubOrder"
          >
            新增子订单
          </el-button>
        </div>
        <!-- 子订单基础信息（含仓库下拉） -->
        <el-row :gutter="20" style="margin-bottom: 15px;">
          <el-col :span="8">
            <el-form-item label="仓库选择" :prop="`subOrders[${subIndex}].warehouseId`" :rules="[{ required: true, message: '请选择仓库', trigger: 'change' }]">
              <el-select
                v-model="sub.warehouseId"
                placeholder="请选择仓库"
                clearable
                style="width:100%;"
                @focus="loadWarehouseList"
              >
                <el-option
                  v-for="item in warehouseList"
                  :key="item.id"
                  :label="item.warehouseName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="配送方式" :prop="`subOrders[${subIndex}].deliveryType`" :rules="[{ required: true, message: '请选择配送方式', trigger: 'change' }]">
              <el-select v-model="sub.deliveryType" placeholder="请选择配送方式" clearable style="width:100%;">
                <el-option v-for="item in deliveryTypes" :key="item.dictValue" :label="item.dictName" :value="item.dictValue" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发货日期" :prop="`subOrders[${subIndex}].expectSendDate`" :rules="[{ required: true, message: '请选择发货日期', trigger: 'change' }]">
              <el-date-picker
                v-model="sub.expectSendDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择发货日期"
                clearable
                style="width:100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-bottom: 15px;">
          <el-col :span="24">
            <el-form-item label="配送备注" :prop="`subOrders[${subIndex}].deliveryRemark`">
              <el-input v-model="sub.deliveryRemark" clearable placeholder="请输入配送备注" style="width:100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 商品明细表格 -->
        <div class="template-section__title" style="font-size:14px; margin-top:20px;">商品明细</div>
        <el-table
          :data="sub.items"
          border
          style="width: 100%; margin-top:10px;"
          show-summary
          :summary-method="(param) => getSummary(param, subIndex)"
        >
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column label="款号" min-width="180" align="center">
            <template slot-scope="{ row, $index }">
              <el-select
                v-model="row.productNo"
                placeholder="输入款号搜索"
                clearable
                filterable
                remote
                :remote-method="(query) => remoteSearchProduct(query, subIndex, $index)"
                :loading="row.productSearchLoading"
                style="width: 100%;"
                @change="(val) => handleProductSelect(val, subIndex, $index)"
              >
                <el-option
                  v-for="item in row.productOptions"
                  :key="item.productId"
                  :label="`${item.productNo} - ${item.productName}`"
                  :value="item.productId"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" min-width="200" align="center">
            <template slot-scope="{ row }">
              <el-input v-model="row.productName" disabled placeholder="请先选择款号" />
            </template>
          </el-table-column>
          <el-table-column label="颜色" width="120" align="center">
            <template slot-scope="{ row }">
              <el-select
                v-model="row.colorName"
                placeholder="请先选择款号"
                clearable
                style="width:100%;"
                :disabled="!row.productId"
                @change="() => { matchSkuId(row); checkDuplicateSku(row, subIndex) }"
              >
                <el-option
                  v-for="item in getUniqueColor(row.skuOptions)"
                  :key="item.colorName"
                  :label="item.colorName"
                  :value="item.colorName"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="尺码" width="120" align="center">
            <template slot-scope="{ row }">
              <el-select
                v-model="row.sizeName"
                placeholder="请先选择颜色"
                clearable
                style="width:100%;"
                :disabled="!row.colorName"
                @change="() => { matchSkuId(row); checkDuplicateSku(row, subIndex) }"
              >
                <el-option
                  v-for="item in filterSizeByColor(row.skuOptions, row.colorName)"
                  :key="item.sizeName"
                  :label="item.sizeName"
                  :value="item.sizeName"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120" align="center">
            <template slot-scope="{ row }">
              <el-input-number
                v-model="row.qty"
                :min="1"
                :controls="false"
                style="width: 100%;"
                :disabled="!row.sizeName"
                @change="() => calcItemAmount(row, subIndex)"
              />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120" align="center">
            <template slot-scope="{ row }">
              <el-input-number
                v-model="row.price"
                :min="0"
                :precision="2"
                :controls="false"
                style="width: 100%;"
                :disabled="!row.sizeName"
                @change="() => calcItemAmount(row, subIndex)"
              />
            </template>
          </el-table-column>
          <el-table-column label="单项金额" width="140" align="center">
            <template slot-scope="{ row }">
              ¥{{ (row.amount || 0).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="{ $index }">
              <el-button type="danger" @click="removeItem(subIndex, $index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          style="margin-top:10px;"
          @click="addItem(subIndex)"
        >
          新增商品明细
        </el-button>
      </el-card>
    </el-form>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky'
import request from '@/utils/request'
import waves from '@/directive/waves'

// 主订单默认值
const defaultFormData = {
  id: undefined,
  customerId: '', // 存储客户ID
  totalQty: 0,
  totalAmount: 0,
  orderType: 0,
  isAr: 0,
  allowReplace: null,
  isDraft: 0, // 默认非草稿（新建时可通过逻辑调整）
  remark: '',
  subOrders: [] // 默认初始化1个子订单
}

// 子订单默认值（已包含warehouseId字段）
const defaultSubOrder = {
  id: undefined,
  warehouseId: '', // 仓库ID（新增下拉绑定字段）
  qty: 0,
  amount: 0,
  deliveryType: null,
  deliveryRemark: '',
  expectSendDate: '',
  items: [] // 商品明细
}

// 商品明细默认值（字段名调整：styleNo→productNo、goodsName→productName、color→colorName、size→sizeName）
const defaultItem = {
  id: undefined,
  subId: '',
  productId: '', // 商品ID（款号对应的主键）
  skuId: '', // 自动匹配的SKU主键ID
  productNo: '', // 款号（原styleNo）
  productName: '', // 商品名称（原goodsName）
  colorName: '', // 颜色（原color）
  sizeName: '', // 尺码（原size）
  qty: 1,
  price: 0,
  amount: 0,
  productOptions: [], // 款号搜索结果选项
  productSearchLoading: false, // 款号搜索加载状态
  skuOptions: [] // 该商品对应的SKU列表
}

export default {
  name: 'OrderForm',
  components: { Sticky },
  directives: { waves },
  data() {
    return {
      loading: false,
      formData: JSON.parse(JSON.stringify(defaultFormData)),
      // 字典选项（按规范取值）
      masterOrderTypes: this.$store.getters['dict/getMasterOrderTypes'],
      deliveryTypes: this.$store.getters['dict/getDeliveryTypes'],
      // 客户下拉列表数据
      customerList: [],
      // 仓库下拉列表数据
      warehouseList: [],
      // 表单校验规则
      rules: {
        customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
        orderType: [{ required: true, message: '请选择订单类型', trigger: 'change' }]
      }
    }
  },
  computed: {
    isEditMode() {
      return !!this.$route.params.id
    }
  },
  created() {
    // 初始化默认1个子订单
    this.addSubOrder()
    // 编辑模式加载数据
    if (this.isEditMode) {
      this.initEditData(this.$route.params.id)
    } else {
      // 新建状态默认设置为草稿（isDraft=1），显示保存草稿按钮
      this.formData.isDraft = 1
    }
  },
  methods: {
    // 加载客户下拉列表（对接后端接口）
    async loadCustomerList() {
      if (this.customerList.length > 0) return // 避免重复请求
      try {
        const { data } = await request({
          url: '/erp-service/customer/list',
          method: 'get'
        })
        this.customerList = data || [] // 接口返回格式：[{id, name, phone}, ...]
      } catch (err) {
        this.$message.error('加载客户列表失败')
        console.error(err)
      }
    },

    // 加载仓库列表（核心接口：/api/warehouse/list，GET请求）
    async loadWarehouseList() {
      if (this.warehouseList.length > 0) return // 避免重复请求
      try {
        const { data } = await request({
          url: '/erp-service/warehouse/list', // 仓库列表接口（行业通用规范）
          method: 'get'
        })
        this.warehouseList = data || []
      } catch (err) {
        this.$message.error('加载仓库列表失败')
        console.error(err)
      }
    },

    // 编辑模式：加载订单详情数据（调用GET /order/master/{id}/detail）
    async initEditData(id) {
      this.loading = true
      try {
        const { data } = await request({
          url: `/erp-service/order/master/${id}/detail`,
          method: 'get'
        })
        this.formData = data
        // 格式化子订单时间字段
        this.formData.subOrders.forEach(sub => {
          if (sub.expectSendDate) sub.expectSendDate = sub.expectSendDate.slice(0, 10)
          // 给每个商品明细初始化联动字段（适配新字段名）
          sub.items.forEach(item => {
            // 补全缺失的联动字段
            item.productOptions = item.productOptions || []
            item.productSearchLoading = false
            item.skuOptions = item.skuOptions || []
            item.skuId = item.skuId || ''
            // 若有productId，加载对应的SKU列表并匹配skuId
            if (item.productId) {
              this.loadSkuList(item.productId, sub.items.indexOf(item), sub.items).then(() => {
                // 加载SKU列表后，若已有颜色和尺码，自动匹配SKUId
                this.matchSkuId(item)
              })
            }
          })
        })
        // 加载客户列表和仓库列表（用于回显）
        await Promise.all([this.loadCustomerList(), this.loadWarehouseList()])
      } catch (err) {
        this.$message.error('加载订单数据失败')
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // 1. 款号远程搜索：调用 /api/product/no/name/list 接口
    async remoteSearchProduct(query, subIndex, itemIndex) {
      const item = this.formData.subOrders[subIndex].items[itemIndex]
      item.productSearchLoading = true
      try {
        const { data } = await request({
          url: '/erp-service/product/no/name/list',
          method: 'post',
          data: { productNo: query } // 传参格式：{productNo: 搜索关键词}
        })
        // 适配 ProductSelectDTO 字段（id→productId，name→productName，wholesalePrice→wholesalePrice）
        item.productOptions = (data || []).map(product => ({
          productId: product.id, // 对应 DTO 的 id 字段
          productNo: product.productNo, // 对应 DTO 的 productNo 字段
          productName: product.name, // 对应 DTO 的 name 字段
          wholesalePrice: product.wholesalePrice // 自动回填批发价
        }))
      } catch (err) {
        this.$message.error('款号搜索失败')
        console.error(err)
      } finally {
        item.productSearchLoading = false
      }
    },

    // 2. 选择款号后：回显商品名称+加载SKU列表（字段名调整）
    async handleProductSelect(productId, subIndex, itemIndex) {
      const item = this.formData.subOrders[subIndex].items[itemIndex]
      // 从搜索结果中匹配商品信息
      const selectedProduct = item.productOptions.find(opt => opt.productId === productId)
      if (selectedProduct) {
        item.productId = productId // 存储商品ID（对应 DTO 的 id）
        item.productName = selectedProduct.productName // 回显商品名称（原goodsName）
        item.productNo = productId // 存储 productId 用于下拉回显（原styleNo）
        item.price = selectedProduct.wholesalePrice || 0 // 自动填写单价为返回的批发价
        // 加载该商品对应的SKU列表
        await this.loadSkuList(productId, itemIndex, this.formData.subOrders[subIndex].items)
        // 重置颜色、尺码、skuId（字段名调整）
        item.colorName = ''
        item.sizeName = ''
        item.skuId = ''
        // 重新计算单项金额
        this.calcItemAmount(item, subIndex)
      }
    },

    // 3. 加载SKU列表：调用 /api/product/get/sku/by/{productId} 接口
    async loadSkuList(productId, itemIndex, items) {
      const item = items[itemIndex]
      try {
        const { data } = await request({
          url: `/erp-service/product/get/sku/by/${productId}`,
          method: 'get'
        })
        item.skuOptions = data || [] // 存储SKU列表（含colorName、sizeName、id）
      } catch (err) {
        this.$message.error('加载商品规格失败')
        console.error(err)
      }
    },

    // 4. 颜色/尺码变更时，自动匹配对应的SKUId（字段名调整：color→colorName、size→sizeName）
    matchSkuId(item) {
      // 检查颜色和尺码是否都已填写，且SKU列表非空
      if (item.colorName && item.sizeName && item.skuOptions.length > 0) {
        // 从SKU列表中匹配颜色和尺码完全一致的记录
        const matchedSku = item.skuOptions.find(sku =>
          sku.colorName === item.colorName && sku.sizeName === item.sizeName
        )
        // 找到匹配的SKU，赋值skuId；未找到则清空并提示
        if (matchedSku) {
          item.skuId = matchedSku.id
        } else {
          item.skuId = ''
          this.$message.warning(`未找到【${item.colorName}-${item.sizeName}】对应的商品规格，请重新选择`)
        }
      } else {
        // 颜色或尺码未填写，清空skuId
        item.skuId = ''
      }
    },

    // 5. 检查同一子订单内是否有重复SKU，有则弹窗提醒（无字段名依赖，无需修改）
    checkDuplicateSku(currentRow, subIndex) {
      // 仅当skuId存在时才校验（避免空值误判）
      if (!currentRow.skuId) return
      const currentSubOrder = this.formData.subOrders[subIndex]
      const duplicateRows = []
      // 遍历当前子订单的所有商品明细，查找相同skuId的行
      currentSubOrder.items.forEach((item, index) => {
        // 排除当前行本身，只检查其他行
        if (item.skuId === currentRow.skuId && item !== currentRow) {
          duplicateRows.push(index + 1) // 行号从1开始计数
        }
      })
      // 有重复行时弹窗提醒
      if (duplicateRows.length > 0) {
        this.$message({
          type: 'error',
          message: `该商品已添加在第 ${duplicateRows.join('、')} 行`,
          duration: 3000
        })
      }
    },

    // 辅助方法：获取唯一颜色列表（去重）（无字段名依赖，无需修改）
    getUniqueColor(skuOptions) {
      const colorSet = new Set()
      const uniqueColors = []
      skuOptions.forEach(sku => {
        if (!colorSet.has(sku.colorName)) {
          colorSet.add(sku.colorName)
          uniqueColors.push({ colorName: sku.colorName })
        }
      })
      return uniqueColors
    },

    // 辅助方法：根据选中的颜色过滤尺码列表（字段名调整：selectedColor→item.colorName）
    filterSizeByColor(skuOptions, selectedColor) {
      if (!selectedColor) return []
      // 过滤出该颜色对应的所有尺码（去重）
      const sizeSet = new Set()
      const filteredSizes = []
      skuOptions.forEach(sku => {
        if (sku.colorName === selectedColor && !sizeSet.has(sku.sizeName)) {
          sizeSet.add(sku.sizeName)
          filteredSizes.push({ sizeName: sku.sizeName })
        }
      })
      return filteredSizes
    },

    // 提交表单：按场景调用不同接口（核心优化）
    submitForm(type) {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        // 校验所有子订单是否有商品明细
        const hasNoItem = this.formData.subOrders.some(sub => sub.items.length === 0)
        if (hasNoItem) {
          return this.$message.warning('所有子订单都必须添加商品明细')
        }
        // 校验商品明细是否完整（含skuId必填，字段名调整）
        const invalidItem = this.formData.subOrders.some(sub =>
          sub.items.some(item => !item.productId || !item.colorName || !item.sizeName || !item.skuId || !item.qty || !item.price)
        )
        if (invalidItem) {
          return this.$message.warning('商品明细请完善款号、颜色、尺码、数量、单价信息（需选择有效规格组合）')
        }

        this.loading = true
        let errorMsg
        try {
          let url, method, successMsg
          const orderId = this.formData.id

          // 场景1：编辑-正式单提交修改 → PUT /order/master/{id}
          if (type === 'formal') {
            url = `/erp-service/order/master/${orderId}`
            method = 'put'
            successMsg = '正式单修改提交成功'
            errorMsg = '正式单修改提交失败'
          } else if (type === 'draft') {
            url = `/erp-service/order/master/${orderId}/draft`
            method = 'put'
            successMsg = '草稿保存成功'
            errorMsg = '草稿保存失败'
          } else if (type === 'submitDraft') {
            url = `/erp-service/order/master/${orderId}/submit`
            method = 'post'
            successMsg = '草稿单提交成功'
            errorMsg = '草稿单提交失败'
          } else if (type === 'createDraft') {
            url = '/erp-service/order/master/create'
            method = 'post'
            this.formData.isDraft = 1
            successMsg = '新建草稿保存成功'
            errorMsg = '新建草稿保存失败'
          } else if (type === 'createFormal') {
            url = '/erp-service/order/master/create'
            method = 'post'
            this.formData.isDraft = 0
            successMsg = '订单提交成功'
            errorMsg = '订单提交失败'
          }

          // 发起请求
          await request({ url, method, data: this.formData })
          this.$message.success(successMsg)
          this.$router.back()
        } catch (err) {
          this.$message.error(errorMsg)
          console.error(err)
        } finally {
          this.loading = false
        }
      })
    },

    // 取消表单
    cancelForm() {
      this.$router.back()
    },

    // ===== 子订单相关操作 =====
    addSubOrder() {
      const newSub = JSON.parse(JSON.stringify(defaultSubOrder))
      this.formData.subOrders.push(newSub)
      this.$nextTick(() => {
        this.$refs.formRef.clearValidate()
      })
    },
    removeSubOrder(index) {
      this.formData.subOrders.splice(index, 1)
      this.calcTotalAmount()
    },

    // ===== 商品明细相关操作 =====
    addItem(subIndex) {
      const newItem = JSON.parse(JSON.stringify(defaultItem))
      newItem.subId = this.formData.subOrders[subIndex].id || ''
      this.formData.subOrders[subIndex].items.push(newItem)
    },
    removeItem(subIndex, itemIndex) {
      this.formData.subOrders[subIndex].items.splice(itemIndex, 1)
      this.calcSubOrderAmount(subIndex)
      this.calcTotalAmount()
    },
    calcItemAmount(row, subIndex) {
      const qty = Number(row.qty || 0)
      const price = Number(row.price || 0)
      row.amount = Number((qty * price).toFixed(2))
      this.calcSubOrderAmount(subIndex)
      this.calcTotalAmount()
    },

    // ===== 金额计算 =====
    calcSubOrderAmount(subIndex) {
      const sub = this.formData.subOrders[subIndex]
      let totalQty = 0
      let totalAmount = 0
      sub.items.forEach(item => {
        totalQty += Number(item.qty || 0)
        totalAmount += Number(item.amount || 0)
      })
      sub.qty = totalQty
      sub.amount = Number(totalAmount.toFixed(2))
    },
    calcTotalAmount() {
      let totalQty = 0
      let totalAmount = 0
      this.formData.subOrders.forEach(sub => {
        totalQty += Number(sub.qty || 0)
        totalAmount += Number(sub.amount || 0)
      })
      this.formData.totalQty = totalQty
      this.formData.totalAmount = Number(totalAmount.toFixed(2))
    },

    // ===== 表格合计行方法（无字段名依赖，无需修改） =====
    getSummary(param, subIndex) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '本单合计'
          return
        }
        // 数量列合计
        if (column.label === '数量') {
          const total = data.reduce((prev, curr) => {
            return Number(prev) + Number(curr.qty || 0)
          }, 0)
          sums[index] = total
          return
        }
        // 单项金额列合计
        if (column.label === '单项金额') {
          const total = data.reduce((prev, curr) => {
            return Number(prev) + Number(curr.amount || 0)
          }, 0)
          sums[index] = `¥${total.toFixed(2)}`
          return
        }
        // 其他列合计行置空
        sums[index] = ''
      })
      return sums
    }
  }
}
</script>

<style lang="scss" scoped>
// 样式保持统一规范
.template-form-body {
  .el-card {
    border: 1px solid #e4e7ed;
  }
  .total-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    .total-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;
      &:last-child {
        border-bottom: none;
      }
      .total-label {
        font-size: 14px;
        color: #666;
      }
      .total-value {
        font-size: 14px;
        font-weight: 500;
      }
    }
    .total-amount {
      margin-top: 10px;
      .total-label {
        font-size: 15px;
      }
      .total-value {
        font-size: 18px;
        color: #e6a23c;
        font-weight: 600;
      }
    }
  }
}
::v-deep .el-table__summary {
  background-color: #fafafa !important;
  .el-table__cell {
    font-weight: 600 !important;
    color: #333 !important;
  }
}
</style>

