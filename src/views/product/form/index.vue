<template>
  <div class="productForm-container">
    <el-form
      ref="productForm"
      :model="productForm"
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
          {{ isEditMode ? '保存修改' : '新增商品' }}
        </el-button>
        <el-button
          type="default"
          style="margin-left: 10px;"
          @click="cancelForm"
        >
          取消
        </el-button>
      </sticky>

      <div class="productForm-main-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="productNo" label="款号：">
              <el-input
                v-model="productForm.productNo"
                placeholder="请输入商品款号（如PROD2026）"
                maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="name" label="商品名称：">
              <el-input
                v-model="productForm.name"
                placeholder="请输入商品名称"
                maxlength="100"
                clearable
              />
            </el-form-item>
          </el-col>

          <!-- 品牌/年份/季节（调整后） -->
          <el-col :span="8">
            <el-form-item prop="brand" label="品牌：">
              <el-input
                v-model="productForm.brand"
                placeholder="请输入品牌（如：耐克/李宁）"
                maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="year" label="年份：">
              <el-date-picker
                v-model="productForm.year"
                type="year"
                placeholder="选择年份"
                value-format="yyyy"
                style="width: 100%;"
                clearable
              /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="season" label="季节：">
              <el-input
                v-model="productForm.season"
                placeholder="请输入季节（如：春季/夏季/四季款）"
                maxlength="20"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item prop="costPrice" label="成本价：">
              <el-input
                v-model="productForm.costPrice"
                placeholder="请输入成本价"
                type="number"
                precision="2"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="wholesalePrice" label="批发价：">
              <el-input
                v-model="productForm.wholesalePrice"
                placeholder="请输入批发价"
                type="number"
                precision="2"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="retailPrice" label="零售价：">
              <el-input
                v-model="productForm.retailPrice"
                placeholder="请输入零售价"
                type="number"
                precision="2"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="商品状态：">
              <el-radio-group v-model="productForm.status">
                <el-radio label="1">启用</el-radio>
                <el-radio label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品系列：">
              <el-input
                v-model="productForm.series"
                placeholder="请输入商品系列（如运动系列）"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="可选尺码：">
              <!-- 全选框 -->
              <el-checkbox
                v-model="checkAll"
                style="margin-bottom: 10px; display: block;"
                @change="handleCheckAllChange"
              >
                全选
              </el-checkbox>
              <!-- 尺码多选列表 -->
              <el-checkbox-group
                v-model="productForm.sizeIds"
                @change="handleSizeChange"
              >
                <el-checkbox
                  v-for="size in sizeList"
                  :key="size.id"
                  :label="size.dictName"
                  style="margin-right: 15px; margin-bottom: 10px;"
                >
                  {{ size.dictName }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 商品颜色表格 -->
        <el-row>
          <el-col :span="24">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 500;">商品颜色：</span>
              <el-button type="primary" size="small" icon="el-icon-plus" @click="openColorDialog">
                新增颜色
              </el-button>
            </div>

            <el-table :data="productForm.colorList" border style="width: 100%;" row-key="colorName">
              <el-table-column
                label="颜色名称"
                prop="colorName"
                align="center"
                width="140"
              />

              <el-table-column
                label="颜色图片"
                align="center"
                min-width="180"
              >
                <template slot-scope="{ row }">
                  <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
                    <TableImage
                      v-for="imageId in row.colorImageIdList"
                      :key="imageId"
                      :image-id="imageId"
                      :image-width="100"
                      :image-height="100"
                      style="flex-shrink: 0;"
                    />
                    <div v-if="!row.colorImageIdList || row.colorImageIdList.length === 0" style="color: #999;">
                      暂无颜色图片
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="操作" align="center" width="180">
                <template slot-scope="scope">
                  <el-button
                    type="success"
                    icon="el-icon-edit"
                    size="mini"
                    @click="handleEditColor(scope.row)"
                  >
                    修改
                  </el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    style="margin-left:5px"
                    @click="deleteColor(scope.row)"
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

    <!-- 颜色弹窗组件 -->
    <ColorSelectDialog
      :visible.sync="showColorDialog"
      :edit-data="editColorRow"
      @confirm="handleColorConfirm"
    />

    <!-- 表格图片预览弹窗 -->
    <el-dialog :visible.sync="previewDialogVisible" append-to-body>
      <img width="100%" :src="previewImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky'
import ColorSelectDialog from './colordialog.vue'
import TableImage from '@/components/tableImg'

// 表单默认值
const defaultForm = {
  id: undefined,
  productNo: '',
  name: '',
  brand: '',
  year: '',
  season: '',
  series: '',
  costPrice: '',
  wholesalePrice: '',
  retailPrice: '',
  status: '1',
  description: '',
  sizeIds: [],
  colorList: []
}

export default {
  name: 'ProductForm',
  components: { Sticky, ColorSelectDialog, TableImage },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value) {
        this.$message.error(`${rule.field}为必填项`)
        callback(new Error(`${rule.field}为必填项`))
      } else {
        callback()
      }
    }
    const validatePrice = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (value < 0) {
        this.$message.error(`${rule.field}不能为负数`)
        callback(new Error(`${rule.field}不能为负数`))
      } else {
        callback()
      }
    }

    return {
      productForm: { ...defaultForm },
      loading: false,
      tempRoute: {},
      sizeList: [],
      checkAll: false,
      rules: {
        productNo: [{ validator: validateRequire, trigger: 'blur', field: '款号' }],
        name: [{ validator: validateRequire, trigger: 'blur', field: '商品名称' }],
        brand: [{ validator: validateRequire, trigger: 'blur', field: '品牌' }],
        season: [{ validator: validateRequire, trigger: 'blur', field: '季节' }],
        costPrice: [{ validator: validatePrice, trigger: 'blur', field: '成本价' }],
        wholesalePrice: [{ validator: validatePrice, trigger: 'blur', field: '批发价' }],
        retailPrice: [{ validator: validatePrice, trigger: 'blur', field: '零售价' }]
      },

      // 颜色相关
      showColorDialog: false,
      editColorRow: null,
      // 图片预览
      previewImageUrl: '',
      previewDialogVisible: false
    }
  },
  computed: {
    isEditMode() {
      return !!this.$route.params.id
    }
  },
  created() {
    this.fetchSizeList()
    this.tempRoute = { ...this.$route }
    if (this.isEditMode) {
      this.fetchProductDetail(this.$route.params.id)
    } else {
      this.setPageTitle('新增商品')
      this.productForm.year = new Date().getFullYear().toString()
    }
  },
  methods: {
    handleCheckAllChange(val) {
      this.productForm.sizeIds = val ? this.sizeList.map(i => i.id) : []
    },
    handleSizeChange(val) {
      this.checkAll = val.length === this.sizeList.length
    },
    fetchSizeList() {
      this.sizeList = this.$store.getters['dict/getSizeDict']
    },
    openColorDialog() {
      this.editColorRow = null
      this.showColorDialog = true
    },
    handleEditColor(row) {
      this.editColorRow = row
      this.showColorDialog = true
    },
    handleColorConfirm(data) {
      if (this.editColorRow) {
        Object.assign(this.editColorRow, data)
        this.$message.success('修改颜色成功')
        this.editColorRow = null
      } else {
        this.productForm.colorList.push({
          id: Date.now(),
          ...data
        })
        this.$message.success('添加颜色成功')
      }
    },
    deleteColor(row) {
      this.$confirm('确定删除该颜色吗？', '提示', { type: 'warning' }).then(() => {
        this.productForm.colorList = this.productForm.colorList.filter(i => i.id !== row.id)
        this.$message.success('删除成功')
      })
    },
    handlePreviewImg(url) {
      this.previewImageUrl = url
      this.previewDialogVisible = true
    },

    // 商品详情
    fetchProductDetail(id) {
      setTimeout(() => {
        this.productForm = {
          ...defaultForm,
          id,
          productNo: `PROD${id}`,
          name: `测试商品${id}`,
          brand: '耐克',
          year: '2026',
          season: '夏季',
          series: '运动系列',
          costPrice: '100.00',
          wholesalePrice: '150.00',
          retailPrice: '299.00',
          status: '1',
          colorList: [
            { id: 1, colorName: '白色', colorImage: 'https://fuss10.oss-cn-beijing.aliyuncs.com/1/20230628/b06751c38704434395d06d09c42e106a.png' },
            { id: 2, colorName: '黑色', colorImage: 'https://fuss10.oss-cn-beijing.aliyuncs.com/1/20230628/86d54f08c32c430c9d6c7d9c42e106a.png' }
          ]
        }
        this.setTagsViewTitle()
        this.setPageTitle(`编辑商品-${this.productForm.name}`)
      }, 500)
    },
    setTagsViewTitle() {
      try {
        this.$store.dispatch('tagsView/updateVisitedView', { ...this.tempRoute, title: `编辑商品-${this.productForm.name}` })
      } catch (e) {
        console.error(e)
      }
    },
    setPageTitle(title) {
      document.title = title
    },
    submitForm() {
      this.$refs.productForm.validate(valid => {
        if (valid) {
          this.loading = true
          setTimeout(() => {
            console.log('提交数据：', this.productForm)
            this.$message.success(this.isEditMode ? '修改成功' : '新增成功')
            this.loading = false
            this.$router.push('/product/page')
          }, 800)
        }
      })
    },
    cancelForm() {
      this.$router.push('/product/page')
    }
  }
}
</script>

<style lang="scss" scoped>
.productForm-container {
  background: #fff;
  min-height: calc(100vh - 60px);
  .form-container { padding: 20px; }
  .productForm-main-container { padding: 20px 0; }
}
::v-deep .el-input-number, ::v-deep .el-date-editor { width: 100%; }
::v-deep .el-radio { margin-right: 20px; }
</style>
