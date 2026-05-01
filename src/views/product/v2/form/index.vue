<template>
  <div class="product-v2-form-container template-form-container">
    <el-form
      ref="productForm"
      :model="productForm"
      :rules="rules"
      label-width="100px"
      class="template-section"
    >
      <div class="template-section__title">
        {{ isEdit ? '编辑商品V2' : '新增商品V2' }}
        <div class="header-actions" style="float: right;">
          <el-button type="primary" size="mini" :loading="submitting" @click="submitForm">提交保存</el-button>
          <el-button size="mini" @click="cancel">取消返回</el-button>
        </div>
      </div>

      <!-- 基础信息 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="款号" prop="productNo">
            <el-input v-model="productForm.productNo" placeholder="请输入商品款号" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="productForm.name" placeholder="请输入商品名称" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="品牌" prop="brand">
            <el-input v-model="productForm.brand" placeholder="请输入品牌" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="所属类目" prop="categoryId">
            <el-select
              v-model="productForm.categoryId"
              placeholder="请选择类目"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in categoryList"
                :key="item.dictValue"
                :label="item.dictName"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="成本价" prop="costPrice">
            <el-input-number v-model="productForm.costPrice" :precision="2" :step="0.1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="批发价" prop="wholesalePrice">
            <el-input-number v-model="productForm.wholesalePrice" :precision="2" :step="0.1" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="零售价" prop="retailPrice">
            <el-input-number v-model="productForm.retailPrice" :precision="2" :step="0.1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="状态">
            <el-radio-group v-model="productForm.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="商品主图">
        <ImageUpload v-model="productForm.mainImageId" :limit="1" />
      </el-form-item>

      <hr class="template-divider">

      <!-- 通用属性管理 (attrList) -->
      <div class="attr-section">
        <div class="section-header">
          <span class="title">通用属性 (年份、季节、材质等)</span>
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="addAttr">添加属性</el-button>
        </div>
        <el-table :data="productForm.attrList" border style="width: 100%; margin-top: 10px;">
          <el-table-column label="属性名" width="300">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.name"
                size="mini"
                placeholder="如：年份"
                @input="(val) => handleAttrNameChange(val, scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="属性值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.value" size="mini" placeholder="输入属性值" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-button type="text" style="color: #F56C6C" icon="el-icon-delete" @click="removeAttr(scope.$index)" />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <hr class="template-divider">

      <!-- SKU 维度管理 (左侧展示区，右侧树形) -->
      <div class="sku-management-section">
        <div class="section-header">
          <span class="title">SKU 规格管理 (最多 3 层级)</span>
          <div class="header-right" style="display: flex; align-items: center;">
            <span style="font-size: 13px; color: #606266; margin-right: 10px;">可挂图维度:</span>
            <el-select v-model="productForm.mountDimKey" clearable size="mini" placeholder="请选择(单选)" style="width: 150px; margin-right: 15px;">
              <el-option v-for="dim in sortedDimensions" :key="dim.key" :label="dim.name" :value="dim.key" />
            </el-select>
            <el-tooltip :disabled="!isEdit" content="编辑模式下禁止修改维度结构" placement="top">
              <span>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  :disabled="dimensions.length >= 3 || isEdit"
                  @click="dimDialogVisible = true"
                >
                  添加维度列 ({{ dimensions.length }}/3)
                </el-button>
              </span>
            </el-tooltip>
          </div>
        </div>

        <div class="dimension-tags" style="margin-top: 10px;">
          <el-tag
            v-for="(dim, index) in sortedDimensions"
            :key="dim.key"
            :closable="!isEdit"
            :disable-transitions="false"
            style="margin-right: 10px; margin-bottom: 10px; height: 32px; line-height: 30px;"
            @close="removeDimension(index)"
          >
            <span style="font-weight: bold; color: #409EFF; margin-right: 5px;">L{{ index + 1 }}:</span>
            {{ dim.name }}
            <template v-if="skuEditableList.length === 0 && !isEdit">
              <i v-if="index > 0" class="el-icon-top" style="margin-left: 8px; cursor: pointer;" title="上移" @click.stop="moveDimension(index, -1)" />
              <i v-if="index < sortedDimensions.length - 1" class="el-icon-bottom" style="margin-left: 5px; cursor: pointer;" title="下移" @click.stop="moveDimension(index, 1)" />
            </template>
            <el-tooltip v-else :content="isEdit ? '编辑模式下禁止调整层级' : '已有SKU数据，禁止调整层级'" placement="top">
              <i class="el-icon-lock" style="margin-left: 8px; color: #999;" />
            </el-tooltip>
          </el-tag>
        </div>

        <el-row :gutter="20" style="margin-top: 20px;">
          <!-- 左侧：级联展示区 -->
          <el-col :span="16">
            <div v-if="sortedDimensions.length === 0" class="empty-level-guide">
              <i class="el-icon-info" />
              <p>请先在上方点击“添加维度列”来定义 SKU 规格（如：颜色、尺码）</p>
            </div>
            <div v-for="(dim, index) in sortedDimensions" v-else :key="'level-' + dim.key" class="level-display-box" :class="{ 'is-active': activeLevel === index }">
              <div class="level-header">
                <span class="level-title">L{{ index + 1 }} {{ dim.name }}</span>
                <el-button type="text" size="mini" icon="el-icon-circle-plus-outline" @click="handleOpenBatchAdd(dim, index)">批量添加</el-button>
              </div>

              <!-- 展示区内容 -->
              <div v-if="getLevelData(index).length === 0" class="empty-placeholder">
                <p>暂无数据，请先点击“批量添加”</p>
              </div>
              <div v-else class="level-content">
                <!-- 非最末级：简单列表 -->
                <div v-if="index < sortedDimensions.length - 1" class="value-list">
                  <div
                    v-for="(item, vIndex) in getLevelData(index)"
                    :key="dim.key + vIndex"
                    class="value-item"
                    :class="{ 'is-selected': selectedPath[dim.key] === item.value }"
                    @click="handleSelectValue(dim.key, item.value, index)"
                  >
                    <el-input
                      :value="item.value"
                      size="mini"
                      class="value-rename-input"
                      placeholder="输入名称"
                      @input="(val) => handleRenameValue(dim.key, item.value, val)"
                      @click.native.stop
                    />
                    <i class="el-icon-arrow-right" />
                  </div>
                </div>

                <!-- 最末级：明细展示 -->
                <el-table v-else :data="getLevelData(index)" border size="mini">
                  <el-table-column :label="dim.name" align="center">
                    <template slot-scope="scope">
                      <el-input
                        :value="scope.row.value"
                        size="mini"
                        placeholder="规格名称"
                        @input="(val) => handleRenameValue(dim.key, scope.row.value, val)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column v-if="isEdit" label="条码 (Barcode)" width="180" align="center">
                    <template slot-scope="scope">
                      <span class="barcode-display" style="font-family: monospace; color: #666;">{{ scope.row.sku.barcode || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column v-if="dim.key === productForm.mountDimKey" label="图片" width="120" align="center">
                    <template slot-scope="scope">
                      <ImageUpload v-model="dimImageMap[dim.key + ':' + scope.row.value]" :limit="1" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="60" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" style="color: #F56C6C" icon="el-icon-delete" @click="removeSpecificSku(scope.row.sku)" />
                    </template>
                  </el-table-column>
                </el-table>

                <!-- 特殊处理：如果是中间层级但被选为挂图维度 -->
                <div v-if="index < sortedDimensions.length - 1 && dim.key === productForm.mountDimKey && selectedPath[dim.key]" class="dim-image-mini-box">
                  <span>{{ dim.name }}[{{ selectedPath[dim.key] }}]图片:</span>
                  <ImageUpload v-model="dimImageMap[dim.key + ':' + selectedPath[dim.key]]" :limit="1" size="mini" style="margin-left: 10px;" />
                </div>
              </div>
            </div>
          </el-col>

          <!-- 右侧：同步树形组件 -->
          <el-col :span="8">
            <div class="tree-container">
              <div class="tree-header">SKU 结构树</div>
              <el-tree
                ref="skuTree"
                :data="treeData"
                node-key="id"
                default-expand-all
                highlight-current
                :expand-on-click-node="false"
                @node-click="handleTreeNodeClick"
              >
                <span slot-scope="{ node }" class="custom-tree-node">
                  <span>{{ node.label }}</span>
                </span>
              </el-tree>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <!-- 弹窗组件化 -->
    <DimensionDialog
      :visible.sync="dimDialogVisible"
      :existing-dimensions="dimensions"
      @confirm="confirmAddDimension"
    />

    <BatchAddDialog
      :visible.sync="expandDialogVisible"
      :dim-name="expandForm.dimName"
      :dim-key="expandForm.dimKey"
      :context-desc="expandForm.contextDesc"
      :history-value="inputHistory[expandForm.dimKey]"
      @confirm="confirmExpand"
    />
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
import DimensionDialog from './components/DimensionDialog'
import BatchAddDialog from './components/BatchAddDialog'
import request from '@/utils/request'

export default {
  name: 'ProductV2Form',
  components: { ImageUpload, DimensionDialog, BatchAddDialog },
  data() {
    return {
      isEdit: false,
      productId: null,
      submitting: false,
      tableKey: 0,
      productForm: {
        productNo: '',
        name: '',
        brand: '',
        categoryId: '',
        costPrice: 0,
        wholesalePrice: 0,
        retailPrice: 0,
        status: 1,
        mainImageId: '',
        mountDimKey: '',
        attrList: [],
        skuList: []
      },
      skuEditableList: [],
      dimImageMap: {},
      dimensions: [],
      dimDialogVisible: false,
      expandDialogVisible: false,
      expandForm: { dimKey: '', dimName: '', contextDesc: '', levelIndex: 0 },
      inputHistory: {},
      selectedPath: {},
      activeLevel: 0,
      rules: {
        productNo: [{ required: true, message: '请输入款号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        categoryId: [{ required: true, message: '请选择所属类目', trigger: 'change' }],
        costPrice: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
        wholesalePrice: [{ required: true, message: '请输入批发价', trigger: 'blur' }],
        retailPrice: [{ required: true, message: '请输入零售价', trigger: 'blur' }]
      }
    }
  },
  computed: {
    categoryList() {
      return this.$store.getters['dict/getCategories']
    },
    sortedDimensions() {
      return [...this.dimensions].sort((a, b) => (a.order || 0) - (b.order || 0))
    },
    treeData() {
      const dims = this.sortedDimensions
      if (dims.length === 0) return []

      const buildTree = (currentLevelIndex, parentFilters = {}) => {
        const dim = dims[currentLevelIndex]
        const filteredSkus = this.skuEditableList.filter(sku => {
          return Object.keys(parentFilters).every(key => sku.dimValues[key] === parentFilters[key])
        })
        const uniqueValues = [...new Set(filteredSkus.map(sku => sku.dimValues[dim.key]).filter(v => !!v))]

        return uniqueValues.map(val => {
          const node = {
            id: Object.values(parentFilters).join('|') + '|' + val,
            label: val,
            dimKey: dim.key,
            value: val,
            levelIndex: currentLevelIndex,
            children: []
          }
          if (currentLevelIndex < dims.length - 1) {
            node.children = buildTree(currentLevelIndex + 1, { ...parentFilters, [dim.key]: val })
          } else {
            node.isLeaf = true
            const targetSku = filteredSkus.find(sku => sku.dimValues[dim.key] === val)
            node.barcode = targetSku ? targetSku.barcode : ''
          }
          return node
        })
      }
      return buildTree(0)
    }
  },
  watch: {
    dimensions() {
      this.resetPath()
    }
  },
  created() {
    const id = this.$route.params.id
    if (id) {
      this.isEdit = true
      this.productId = id
      this.fetchDetail()
    }
  },
  methods: {
    fetchDetail() {
      request({
        url: `/erp-service/product/v2/${this.productId}`,
        method: 'get'
      }).then(res => {
        const data = res.data
        if (data.skuList && data.skuList.length > 0) {
          const firstSku = data.skuList[0]
          this.dimensions = firstSku.dims.map(d => ({
            key: d.key,
            name: d.name,
            order: d.order
          }))
          const newDimImageMap = {}
          data.skuList.forEach(sku => {
            sku.dims.forEach(d => {
              if (d.imageFileId) {
                newDimImageMap[`${d.key}:${d.value}`] = d.imageFileId
              }
            })
          })
          this.dimImageMap = newDimImageMap
        }
        this.skuEditableList = (data.skuList || []).map(sku => {
          const dimValues = {}
          sku.dims.forEach(d => { dimValues[d.key] = d.value })
          return { id: sku.id, barcode: sku.barcode, dimValues: dimValues }
        })
        this.productForm = {
          ...data,
          mountDimKey: data.mountDimKeys && data.mountDimKeys.length > 0 ? data.mountDimKeys[0] : '',
          attrList: data.attrList || []
        }
      })
    },
    getLevelData(levelIndex) {
      const dims = this.sortedDimensions
      const parentPath = {}
      for (let i = 0; i < levelIndex; i++) {
        const pDim = dims[i]
        const pVal = this.selectedPath[pDim.key]
        if (!pVal) return []
        parentPath[pDim.key] = pVal
      }
      const filtered = this.skuEditableList.filter(sku => {
        return Object.keys(parentPath).every(key => sku.dimValues[key] === parentPath[key])
      })
      const uniqueValues = [...new Set(filtered.map(sku => sku.dimValues[dims[levelIndex].key]).filter(v => !!v))]
      return uniqueValues.map(val => {
        const sku = filtered.find(s => s.dimValues[dims[levelIndex].key] === val)
        return { value: val, sku: sku }
      })
    },
    handleSelectValue(dimKey, value, levelIndex) {
      this.$set(this.selectedPath, dimKey, value)
      for (let i = levelIndex + 1; i < this.sortedDimensions.length; i++) {
        this.$set(this.selectedPath, this.sortedDimensions[i].key, '')
      }
      this.activeLevel = levelIndex + 1
      this.syncTreeHighlight()
    },
    handleTreeNodeClick(data) {
      const dims = this.sortedDimensions
      const nodePath = data.id.split('|').filter(v => !!v)
      nodePath.forEach((val, index) => {
        if (index < dims.length) {
          this.$set(this.selectedPath, dims[index].key, val)
        }
      })
      this.activeLevel = data.levelIndex + 1
    },
    syncTreeHighlight() {
      const pathValues = []
      for (const dim of this.sortedDimensions) {
        if (this.selectedPath[dim.key]) {
          pathValues.push(this.selectedPath[dim.key])
        } else {
          break
        }
      }
      const treeId = '|' + pathValues.join('|')
      this.$nextTick(() => {
        if (this.$refs.skuTree) {
          this.$refs.skuTree.setCurrentKey(treeId)
        }
      })
    },
    resetPath() {
      this.selectedPath = {}
      this.sortedDimensions.forEach(d => { this.$set(this.selectedPath, d.key, '') })
      this.activeLevel = 0
    },
    addAttr() {
      this.productForm.attrList.push({
        key: '', name: '', value: '', valueType: 'text', sort: this.productForm.attrList.length + 1
      })
    },
    handleAttrNameChange(val, row) {
      if (!val) {
        row.key = ''
        return
      }
      if (!row.key) {
        row.key = 'attr_' + Math.random().toString(36).substr(2, 6)
      }
    },
    removeAttr(index) {
      this.productForm.attrList.splice(index, 1)
    },
    confirmAddDimension(dimForm) {
      this.dimensions.push({ ...dimForm, order: this.dimensions.length + 1 })
    },
    removeDimension(index) {
      const dimToRemove = this.sortedDimensions[index]
      this.$confirm(`删除维度“${dimToRemove.name}”及其下级层级将导致相关数据截断，是否继续？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const removedOrder = dimToRemove.order
        const keptDimensions = this.dimensions.filter(d => d.order < removedOrder)
        const keptKeys = keptDimensions.map(d => d.key)
        this.dimensions = keptDimensions
        if (keptKeys.length === 0) {
          this.skuEditableList = []
        } else {
          const seen = new Set()
          const newList = []
          this.skuEditableList.forEach(sku => {
            const newDimValues = {}
            keptKeys.forEach(k => { newDimValues[k] = sku.dimValues[k] })
            const hash = JSON.stringify(newDimValues)
            if (!seen.has(hash)) {
              seen.add(hash)
              newList.push({ barcode: '', dimValues: newDimValues })
            }
          })
          this.skuEditableList = newList
        }
        if (this.productForm.mountDimKey === dimToRemove.key) { this.productForm.mountDimKey = '' }
        this.resetPath()
        this.tableKey++
        this.$message.success('维度已截断')
      }).catch(() => {})
    },
    moveDimension(index, delta) {
      const dims = this.sortedDimensions
      const targetIndex = index + delta
      if (targetIndex < 0 || targetIndex >= dims.length) return
      const tempOrder = dims[index].order
      dims[index].order = dims[targetIndex].order
      dims[targetIndex].order = tempOrder
      this.dimensions = [...this.dimensions]
      this.tableKey++
    },
    handleOpenBatchAdd(dim, levelIndex) {
      for (let i = 0; i < levelIndex; i++) {
        if (!this.selectedPath[this.sortedDimensions[i].key]) {
          this.$message.warning(`请先选择 L${i + 1} ${this.sortedDimensions[i].name} 的值`)
          return
        }
      }
      const parts = []
      for (let i = 0; i < levelIndex; i++) {
        const d = this.sortedDimensions[i]
        parts.push(`${d.name}:${this.selectedPath[d.key]}`)
      }
      const contextDesc = parts.length > 0 ? parts.join(' > ') : ''
      this.expandForm = { dimKey: dim.key, dimName: dim.name, contextDesc: contextDesc, levelIndex: levelIndex }
      this.expandDialogVisible = true
    },
    confirmExpand(inputValue) {
      const inputValues = inputValue.split(/[,，\n]/).map(v => v.trim()).filter(v => !!v)
      this.$set(this.inputHistory, this.expandForm.dimKey, inputValue)
      const dims = this.sortedDimensions
      const levelIndex = this.expandForm.levelIndex
      const contextPath = {}
      for (let i = 0; i < levelIndex; i++) {
        contextPath[dims[i].key] = this.selectedPath[dims[i].key]
      }
      if (levelIndex === 0) {
        inputValues.forEach(val => {
          const exists = this.skuEditableList.some(s => s.dimValues[dims[0].key] === val)
          if (!exists) {
            const dimValues = {}
            dims.forEach(d => { dimValues[d.key] = (d.key === dims[0].key ? val : '') })
            this.skuEditableList.push({ barcode: '', dimValues: dimValues })
          }
        })
      } else {
        const targetSkus = this.skuEditableList.filter(sku => {
          return Object.keys(contextPath).every(key => sku.dimValues[key] === contextPath[key])
        })
        inputValues.forEach(val => {
          const exists = targetSkus.some(s => s.dimValues[this.expandForm.dimKey] === val)
          if (!exists) {
            const emptySku = targetSkus.find(s => !s.dimValues[this.expandForm.dimKey])
            if (emptySku) {
              emptySku.dimValues[this.expandForm.dimKey] = val
            } else {
              const baseSku = targetSkus[0]
              const newSku = JSON.parse(JSON.stringify(baseSku))
              newSku.id = ''
              newSku.barcode = ''
              newSku.dimValues[this.expandForm.dimKey] = val
              for (let i = levelIndex + 1; i < dims.length; i++) {
                newSku.dimValues[dims[i].key] = ''
              }
              this.skuEditableList.push(newSku)
            }
          }
        })
      }
    },
    handleRenameValue(dimKey, oldValue, newValue) {
      if (oldValue === newValue) return
      if (!newValue) return
      this.skuEditableList.forEach(sku => {
        if (sku.dimValues[dimKey] === oldValue) {
          sku.dimValues[dimKey] = newValue
        }
      })
      if (this.selectedPath[dimKey] === oldValue) {
        this.selectedPath[dimKey] = newValue
      }
      const oldImgKey = `${dimKey}:${oldValue}`
      const newImgKey = `${dimKey}:${newValue}`
      if (this.dimImageMap[oldImgKey]) {
        this.$set(this.dimImageMap, newImgKey, this.dimImageMap[oldImgKey])
        this.$delete(this.dimImageMap, oldImgKey)
      }
    },
    removeSpecificSku(sku) {
      const index = this.skuEditableList.indexOf(sku)
      if (index > -1) { this.skuEditableList.splice(index, 1) }
    },
    useHistory() {
      this.expandForm.values = this.inputHistory[this.expandForm.dimKey] || ''
    },
    submitForm() {
      this.$refs.productForm.validate(valid => {
        if (valid) {
          if (this.skuEditableList.length === 0) {
            this.$message.warning('请至少添加一个SKU')
            return
          }
          const combinationSet = new Set()
          const attrNameSet = new Set()
          for (const attr of this.productForm.attrList) {
            const name = (attr.name || '').trim()
            if (!name) {
              this.$message.warning('通用属性名不能为空')
              return
            }
            if (attrNameSet.has(name)) {
              this.$message.error(`通用属性名重复: ${name}`)
              return
            }
            attrNameSet.add(name)
          }
          for (const sku of this.skuEditableList) {
            for (const dim of this.dimensions) {
              if (!sku.dimValues[dim.key]) {
                this.$message.warning(`请补全 SKU 的 ${dim.name} 信息`)
                return
              }
            }
            const comboKey = Object.values(sku.dimValues).join('|')
            if (combinationSet.has(comboKey)) {
              this.$message.error(`存在重复的规格组合: ${comboKey.replace(/\|/g, ' / ')}`)
              return
            }
            combinationSet.add(comboKey)
          }
          this.submitting = true
          const submitData = { ...this.productForm }
          submitData.mountDimKeys = this.productForm.mountDimKey ? [this.productForm.mountDimKey] : []
          submitData.skuList = this.skuEditableList.map(sku => {
            const dims = this.dimensions.map((d) => {
              const val = sku.dimValues[d.key]
              const imageFileId = this.dimImageMap[`${d.key}:${val}`]
              return {
                key: d.key, name: d.name, value: val, order: d.order,
                imageFileId: (d.key === this.productForm.mountDimKey) ? (imageFileId || '') : ''
              }
            })
            const skuItem = { id: sku.id, dims: dims }
            if (this.isEdit && sku.barcode) {
              skuItem.barcode = sku.barcode
            }
            return skuItem
          })
          const apiCall = this.isEdit
            ? request({ url: `/erp-service/product/v2/${this.productId}`, method: 'put', data: submitData })
            : request({ url: '/erp-service/product/v2/add', method: 'post', data: submitData })
          apiCall.then(() => {
            this.$message.success('保存成功')
            this.$router.push({ path: '/product-v2/page' })
          }).finally(() => { this.submitting = false })
        }
      })
    },
    cancel() { this.$router.back() }
  }
}
</script>

<style scoped>
.product-v2-form-container { padding: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.section-header .title { font-weight: bold; font-size: 14px; }
.template-divider { border: 0; border-top: 1px solid #eee; margin: 20px 0; }
.level-display-box { border: 1px solid #ebeef5; border-radius: 4px; margin-bottom: 15px; transition: all 0.3s; }
.level-display-box.is-active { border-color: #409EFF; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); }
.level-header { padding: 8px 15px; background: #f8f9fb; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; }
.level-title { font-weight: bold; font-size: 13px; color: #333; }
.empty-placeholder { padding: 30px; text-align: center; color: #999; font-size: 13px; border: 1px dashed #ddd; margin: 10px; }
.empty-level-guide { height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px dashed #ccc; border-radius: 4px; background: #fafafa; color: #909399; font-size: 14px; }
.empty-level-guide i { font-size: 40px; margin-bottom: 15px; color: #409EFF; }
.level-content { padding: 10px; }
.value-list { display: flex; flex-wrap: wrap; }
.value-item { padding: 8px 15px; border: 1px solid #dcdfe6; margin: 0 10px 10px 0; border-radius: 4px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; }
.value-item:hover { border-color: #409EFF; color: #409EFF; }
.value-item.is-selected { background-color: #409EFF; color: #fff; border-color: #409EFF; }
.value-item.is-selected .value-rename-input /deep/ .el-input__inner { background-color: #409EFF; color: #fff; border-color: transparent; }
.value-rename-input { width: 80px; }
.value-rename-input /deep/ .el-input__inner { border: none; padding: 0; height: 20px; line-height: 20px; background: transparent; }
.value-item i { margin-left: 8px; font-size: 12px; }
.dim-image-mini-box { margin-top: 10px; padding: 10px; background: #f0f7ff; border-radius: 4px; display: flex; align-items: center; font-size: 12px; }
.tree-container { border: 1px solid #ebeef5; border-radius: 4px; height: 600px; display: flex; flex-direction: column; }
.tree-header { padding: 10px 15px; background: #f8f9fb; font-weight: bold; border-bottom: 1px solid #ebeef5; }
.el-tree { flex: 1; overflow-y: auto; padding: 10px 0; }
.custom-tree-node { font-size: 13px; display: flex; align-items: center; justify-content: space-between; width: 100%; padding-right: 10px; }
.tree-barcode { color: #999; font-size: 11px; font-style: italic; }
.expand-context-info { margin-bottom: 15px; padding: 10px; background: #fff8e6; color: #8a6d3b; border-radius: 4px; font-size: 13px; }
.history-preview { font-size: 12px; color: #909399; margin-top: 5px; background: #f4f4f5; padding: 5px 10px; border-radius: 4px; }
.history-text { color: #409EFF; font-family: monospace; }
.mountable-cell { display: flex; flex-direction: column; padding: 5px 0; }
</style>
