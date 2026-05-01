<template>
  <div class="product-v2-detail-container template-detail-container">
    <div v-loading="loading" class="template-section">
      <div class="template-section__title">
        商品详情V2
        <div class="header-actions" style="float: right;">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="goToEdit"
          >
            进入编辑
          </el-button>
          <el-button
            size="mini"
            icon="el-icon-back"
            @click="back"
          >
            返回列表
          </el-button>
        </div>
      </div>

      <!-- 1. 基础信息展示 (使用兼容的 Row/Col 替代 el-descriptions) -->
      <div class="info-grid product-desc">
        <el-row class="info-row">
          <el-col :span="8" class="info-item">
            <div class="info-label">商品款号</div>
            <div class="info-value">{{ product.productNo }}</div>
          </el-col>
          <el-col :span="8" class="info-item">
            <div class="info-label">商品名称</div>
            <div class="info-value">{{ product.name }}</div>
          </el-col>
          <el-col :span="8" class="info-item">
            <div class="info-label">品牌</div>
            <div class="info-value">{{ product.brand }}</div>
          </el-col>
        </el-row>
        <el-row class="info-row">
          <el-col :span="8" class="info-item">
            <div class="info-label">所属类目</div>
            <div class="info-value">{{ getCategoryName(product.categoryId) }}</div>
          </el-col>
          <el-col :span="8" class="info-item">
            <div class="info-label">成本价</div>
            <div class="info-value">¥{{ product.costPrice }}</div>
          </el-col>
          <el-col :span="8" class="info-item">
            <div class="info-label">状态</div>
            <div class="info-value">
              <el-tag :type="product.status === 1 ? 'success' : 'danger'" size="small">
                {{ product.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row class="info-row">
          <el-col :span="8" class="info-item">
            <div class="info-label">批发价</div>
            <div class="info-value">¥{{ product.wholesalePrice }}</div>
          </el-col>
          <el-col :span="8" class="info-item">
            <div class="info-label">零售价</div>
            <div class="info-value">¥{{ product.retailPrice }}</div>
          </el-col>
          <el-col :span="8" class="info-item">
            <div class="info-label">可挂图维度</div>
            <div class="info-value">{{ getMountDimName() }}</div>
          </el-col>
        </el-row>
        <el-row class="info-row last-row">
          <el-col :span="24" class="info-item image-item">
            <div class="info-label">商品主图</div>
            <div class="info-value">
              <TableImage
                v-if="product.mainImageId"
                :image-id="product.mainImageId"
                :image-width="120"
                :image-height="120"
              />
              <span v-else style="color: #999;">暂无图片</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 2. 通用属性展示 -->
      <div v-if="product.attrList && product.attrList.length > 0" class="sub-section">
        <div class="section-title">通用属性</div>
        <el-table :data="product.attrList" border style="width: 100%; margin-top: 15px;">
          <el-table-column label="属性名" prop="name" width="250" align="center" />
          <el-table-column label="属性值" prop="value" align="center" />
        </el-table>
      </div>

      <hr class="template-divider">

      <!-- 3. SKU 规格多级展示区 -->
      <div class="sku-explore-section">
        <div class="section-title">SKU 规格详情 (级联探索)</div>

        <el-row :gutter="20" style="margin-top: 20px;">
          <!-- 左侧：级联展示区 -->
          <el-col :span="16">
            <div v-if="sortedDimensions.length === 0" class="empty-data-hint">
              <p>该商品暂未定义 SKU 维度规格</p>
            </div>
            <div
              v-for="(dim, index) in sortedDimensions"
              :key="'level-' + dim.key"
              class="level-box"
              :class="{ 'is-active': activeLevel === index }"
            >
              <div class="level-header">
                <span class="level-title">L{{ index + 1 }} {{ dim.name }}</span>
              </div>

              <div class="level-content">
                <!-- 非最末级：列表 -->
                <div v-if="index < sortedDimensions.length - 1" class="value-list">
                  <div
                    v-for="item in getLevelData(index)"
                    :key="item.value"
                    class="value-item"
                    :class="{ 'is-selected': selectedPath[dim.key] === item.value }"
                    @click="handleSelectValue(dim.key, item.value, index)"
                  >
                    <span>{{ item.value }}</span>
                    <i class="el-icon-arrow-right" />
                  </div>
                </div>

                <!-- 最末级：明细展示 -->
                <el-table v-else :data="getLevelData(index)" border size="mini">
                  <el-table-column :label="dim.name" prop="value" align="center" />
                  <el-table-column label="条码 (Barcode)" prop="sku.barcode" align="center">
                    <template slot-scope="scope">
                      <span class="barcode-text">{{ scope.row.sku.barcode || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column v-if="isMountDim(dim.key)" label="图片" width="120" align="center">
                    <template slot-scope="scope">
                      <TableImage
                        v-if="getDimImage(dim.key, scope.row.value)"
                        :image-id="getDimImage(dim.key, scope.row.value)"
                        :image-width="60"
                        :image-height="60"
                      />
                      <span v-else>-</span>
                    </template>
                  </el-table-column>
                </el-table>

                <!-- 中间层级的图片展示 -->
                <div v-if="index < sortedDimensions.length - 1 && isMountDim(dim.key) && selectedPath[dim.key]" class="dim-image-preview">
                  <span class="preview-label">{{ dim.name }}[{{ selectedPath[dim.key] }}] 图片:</span>
                  <TableImage
                    v-if="getDimImage(dim.key, selectedPath[dim.key])"
                    :image-id="getDimImage(dim.key, selectedPath[dim.key])"
                    :image-width="80"
                    :image-height="80"
                    style="margin-left: 15px;"
                  />
                  <span v-else style="margin-left: 15px; color: #999;">无图片</span>
                </div>
              </div>
            </div>
          </el-col>

          <!-- 右侧：结构树 -->
          <el-col :span="8">
            <div class="tree-container">
              <div class="tree-header">SKU 逻辑结构树</div>
              <el-tree
                ref="skuTree"
                :data="treeData"
                node-key="id"
                default-expand-all
                highlight-current
                :expand-on-click-node="false"
                @node-click="handleTreeNodeClick"
              >
                <span slot-scope="{ node, data }" class="custom-tree-node">
                  <span>{{ node.label }}</span>
                  <span v-if="data.isLeaf" class="tree-barcode">{{ data.barcode || '(无条码)' }}</span>
                </span>
              </el-tree>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="detail-footer" style="margin-top: 40px; text-align: center;">
        <el-button icon="el-icon-back" @click="back">返回商品列表</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import TableImage from '@/components/tableImg'
import request from '@/utils/request'

export default {
  name: 'ProductV2Detail',
  components: { TableImage },
  data() {
    return {
      loading: false,
      productId: null,
      product: {},
      skuList: [],
      dimensions: [],
      selectedPath: {},
      activeLevel: 0
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
        const filteredSkus = this.skuList.filter(sku => {
          return Object.keys(parentFilters).every(key => {
            const d = sku.dims.find(d => d.key === key)
            return d && d.value === parentFilters[key]
          })
        })

        const values = [...new Set(filteredSkus.map(sku => {
          const d = sku.dims.find(d => d.key === dim.key)
          return d ? d.value : null
        }).filter(v => !!v))]

        return values.map(val => {
          const node = {
            id: Object.values(parentFilters).join('|') + '|' + val,
            label: val,
            levelIndex: currentLevelIndex,
            children: []
          }
          if (currentLevelIndex < dims.length - 1) {
            node.children = buildTree(currentLevelIndex + 1, { ...parentFilters, [dim.key]: val })
          } else {
            node.isLeaf = true
            const targetSku = filteredSkus.find(sku => {
              const d = sku.dims.find(d => d.key === dim.key)
              return d && d.value === val
            })
            node.barcode = targetSku ? targetSku.barcode : ''
          }
          return node
        })
      }
      return buildTree(0)
    }
  },
  created() {
    this.productId = this.$route.params.id
    if (this.productId) {
      this.fetchDetail()
    } else {
      this.$message.error('参数错误')
      this.back()
    }
  },
  methods: {
    getCategoryName(id) {
      if (!id) return '-'
      const item = this.categoryList.find(c => c.dictValue === id)
      return item ? item.dictName : id
    },
    fetchDetail() {
      this.loading = true
      request({
        url: `/erp-service/product/v2/${this.productId}`,
        method: 'get'
      }).then(res => {
        const data = res.data
        this.product = data
        this.skuList = data.skuList || []

        if (this.skuList.length > 0) {
          this.dimensions = this.skuList[0].dims.map(d => ({
            key: d.key,
            name: d.name,
            order: d.order
          }))

          this.initDefaultPath()
        }
      }).finally(() => {
        this.loading = false
      })
    },
    initDefaultPath() {
      const path = {}
      let currentList = this.skuList
      this.sortedDimensions.forEach(dim => {
        if (currentList.length > 0) {
          const firstVal = currentList[0].dims.find(d => d.key === dim.key)?.value
          path[dim.key] = firstVal
          currentList = currentList.filter(sku => sku.dims.find(d => d.key === dim.key)?.value === firstVal)
        }
      })
      this.selectedPath = path
      this.activeLevel = this.sortedDimensions.length > 0 ? this.sortedDimensions.length - 1 : 0
      this.syncTreeHighlight()
    },
    getLevelData(levelIndex) {
      const dims = this.sortedDimensions
      if (!dims[levelIndex]) return []
      const parentPath = {}
      for (let i = 0; i < levelIndex; i++) {
        const pVal = this.selectedPath[dims[i].key]
        if (!pVal) return []
        parentPath[dims[i].key] = pVal
      }

      const filtered = this.skuList.filter(sku => {
        return Object.keys(parentPath).every(key => {
          const d = sku.dims.find(d => d.key === key)
          return d && d.value === parentPath[key]
        })
      })

      const uniqueValues = [...new Set(filtered.map(sku => {
        const d = sku.dims.find(d => d.key === dims[levelIndex].key)
        return d ? d.value : null
      }).filter(v => !!v))]

      return uniqueValues.map(val => {
        const sku = filtered.find(s => s.dims.find(d => d.key === dims[levelIndex].key)?.value === val)
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
    isMountDim(dimKey) {
      return this.product.mountDimKeys && this.product.mountDimKeys.includes(dimKey)
    },
    getDimImage(dimKey, value) {
      const sku = this.skuList.find(s => {
        const d = s.dims.find(dim => dim.key === dimKey && dim.value === value)
        return d && d.imageFileId
      })
      if (sku) {
        return sku.dims.find(dim => dim.key === dimKey && dim.value === value).imageFileId
      }
      return null
    },
    getMountDimName() {
      if (!this.product.mountDimKeys || this.product.mountDimKeys.length === 0) return '无'
      const names = this.product.mountDimKeys.map(key => {
        const dim = this.dimensions.find(d => d.key === key)
        return dim ? dim.name : key
      })
      return names.join(', ')
    },
    goToEdit() {
      this.$router.push({ path: `/product-v2/edit/${this.productId}` })
    },
    back() {
      this.$router.push({ path: '/product-v2/page' })
    }
  }
}
</script>

<style scoped>
.product-v2-detail-container { padding: 20px; }
.sub-section { margin-top: 30px; }
.section-title { font-weight: bold; font-size: 16px; border-left: 4px solid #409EFF; padding-left: 10px; color: #303133; }
.template-divider { border: 0; border-top: 1px solid #eee; margin: 40px 0; }

/* 基础信息网格样式 */
.info-grid {
  border: 1px solid #EBEEF5;
  margin-top: 20px;
}
.info-row {
  display: flex;
  border-bottom: 1px solid #EBEEF5;
}
.info-row.last-row {
  border-bottom: none;
}
.info-item {
  display: flex;
  align-items: stretch;
  border-right: 1px solid #EBEEF5;
}
.info-item:last-child {
  border-right: none;
}
.info-label {
  width: 120px;
  background-color: #F8F9FB;
  color: #606266;
  padding: 12px 15px;
  font-size: 13px;
  border-right: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
}
.info-value {
  flex: 1;
  padding: 12px 15px;
  color: #303133;
  font-size: 13px;
  display: flex;
  align-items: center;
}
.image-item .info-label {
  width: 120px;
}

/* 级联展示样式 */
.level-box { border: 1px solid #ebeef5; border-radius: 4px; margin-bottom: 15px; }
.level-box.is-active { border-color: #409EFF; background-color: #fbfdff; }
.level-header { padding: 10px 15px; background: #f8f9fb; border-bottom: 1px solid #ebeef5; }
.level-title { font-weight: bold; font-size: 13px; color: #606266; }
.level-content { padding: 15px; }
.empty-data-hint { padding: 40px; text-align: center; color: #909399; background: #fafafa; border: 1px dashed #dcdfe6; border-radius: 4px; }

/* 列表展示 */
.value-list { display: flex; flex-wrap: wrap; }
.value-item { padding: 10px 20px; border: 1px solid #dcdfe6; margin: 0 12px 12px 0; border-radius: 4px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; background: #fff; }
.value-item:hover { border-color: #409EFF; color: #409EFF; }
.value-item.is-selected { background-color: #409EFF; color: #fff; border-color: #409EFF; }
.value-item i { margin-left: 10px; font-size: 12px; }

/* 预览条码 */
.barcode-text { font-family: monospace; font-weight: bold; color: #303133; }

/* 挂图预览 */
.dim-image-preview { margin-top: 15px; padding: 15px; background: #f0f7ff; border-radius: 4px; display: flex; align-items: center; border: 1px solid #d1e9ff; }
.preview-label { font-size: 13px; color: #409EFF; font-weight: bold; }

/* 树形区 */
.tree-container { border: 1px solid #ebeef5; border-radius: 4px; height: 650px; display: flex; flex-direction: column; background: #fff; }
.tree-header { padding: 12px 15px; background: #f8f9fb; font-weight: bold; border-bottom: 1px solid #ebeef5; color: #333; }
.el-tree { flex: 1; overflow-y: auto; padding: 10px; }
.custom-tree-node { font-size: 13px; display: flex; align-items: center; justify-content: space-between; width: 100%; padding-right: 10px; }
.tree-barcode { color: #909399; font-size: 11px; font-style: italic; background: #f4f4f5; padding: 0 5px; border-radius: 2px; }
</style>
