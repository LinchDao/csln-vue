<template>
  <div class="productForm-container">
    <el-form
      :model="productForm"
      class="form-container"
      label-width="120px"
    >
      <!-- 顶部固定返回按钮 -->
      <sticky :z-index="10" class-name="sub-navbar">
        <el-button type="default" icon="el-icon-arrow-left" @click="cancelForm">
          返回列表
        </el-button>
      </sticky>

      <!-- 主体内容：el-form 布局 -->
      <div class="productForm-main-container">
        <!-- 基础信息 -->
        <div class="detail-section">
          <div class="section-title">基础信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="款号">
                <span class="detail-text">{{ productForm.productNo }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="商品名称">
                <span class="detail-text">{{ productForm.name }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="商品系列">
                <span class="detail-text">{{ productForm.series }}</span>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="品牌">
                <span class="detail-text">{{ productForm.brand }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="年份">
                <span class="detail-text">{{ productForm.year }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="季节">
                <span class="detail-text">{{ productForm.season }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 价格信息 -->
        <div class="detail-section">
          <div class="section-title">价格信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="成本价">
                <span class="detail-text price">{{ productForm.costPrice }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="批发价">
                <span class="detail-text price">{{ productForm.wholesalePrice }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="零售价">
                <span class="detail-text price">{{ productForm.retailPrice }}</span>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="商品状态">
                <el-tag :type="productForm.status === '1' ? 'success' : 'danger'">
                  {{ productForm.status === '1' ? '启用' : '禁用' }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 尺码信息 -->
        <div class="detail-section">
          <div class="section-title">可选尺码</div>
          <el-form-item label="尺码">
            <el-tag
              v-for="(item, index) in productForm.sizeNameList"
              :key="index"
              size="small"
              style="margin-right: 6px"
            >
              {{ item }}
            </el-tag>
          </el-form-item>
        </div>

        <!-- 颜色图片 -->
        <div class="detail-section">
          <div class="section-title">颜色及图片</div>
          <el-table
            :data="productForm.colorList"
            border
            style="width: 100%"
            row-key="colorName"
          >
            <el-table-column label="序号" align="center" width="80">
              <template slot-scope="{ $index }">{{ $index + 1 }}</template>
            </el-table-column>
            <el-table-column label="颜色名称" prop="colorName" align="center" />
            <el-table-column label="颜色图片" align="center">
              <template slot-scope="{ row }">
                <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; align-items:center; min-height:60px;">

                  <!-- 有图片就显示图片 -->
                  <TableImage
                    v-for="id in row.colorImageIdList"
                    :key="id"
                    :image-id="id"
                    :image-width="100"
                    :image-height="100"
                  />

                  <!-- 没有图片就显示文字 -->
                  <span v-if="!row.colorImageIdList || row.colorImageIdList.length === 0" style="color:#999;">
                    暂无图片
                  </span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

      </div>
    </el-form>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky'
import TableImage from '@/components/tableImg'
import request from '@/utils/request'

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
  sizeNameList: [],
  colorList: []
}

export default {
  name: 'ProductDetail',
  components: { Sticky, TableImage },
  data() {
    return {
      productForm: { ...defaultForm },
      loading: false
    }
  },
  created() {
    this.fetchProductDetail(this.$route.params.id)
  },
  methods: {
    async fetchProductDetail(id) {
      this.loading = true
      try {
        const res = await request({
          url: `/api/product/${id}`,
          method: 'get'
        })
        const data = res.data

        // 基础信息赋值
        this.productForm = {
          id: data.id,
          productNo: data.productNo,
          name: data.name,
          brand: data.brand,
          season: data.season,
          year: data.year,
          series: data.series,
          costPrice: data.costPrice,
          wholesalePrice: data.wholesalePrice,
          retailPrice: data.retailPrice,
          status: data.status + '',
          sizeNameList: [],
          colorList: []
        }

        // 尺码处理
        const sizeSet = new Set(data.skuList.map(item => item.sizeName))
        this.productForm.sizeNameList = Array.from(sizeSet)

        // ==============================================
        // 颜色处理【修复版：所有颜色都显示，无图也显示】
        // ==============================================
        const colorMap = {}
        // 先把所有 sku 中的颜色拿出来
        data.skuList.forEach(item => {
          if (!colorMap[item.colorName]) {
            colorMap[item.colorName] = []
          }
        })
        // 再把图片放进去
        data.productColorImageList.forEach(img => {
          if (colorMap[img.colorName]) {
            colorMap[img.colorName].push(img.colorFileId)
          }
        })
        // 组装表格数据
        this.productForm.colorList = Object.keys(colorMap).map(colorName => ({
          colorName: colorName,
          colorImageIdList: colorMap[colorName] || []
        }))
      } catch (e) {
        this.$message.error('加载详情失败')
      } finally {
        this.loading = false
      }
    },
    cancelForm() {
      this.$router.push('/product/page')
    }
  }
}
</script>

<style lang="scss" scoped>
.productForm-container {
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 20px;

  .form-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 20px;
  }

  .productForm-main-container {
    padding: 20px 0;
  }

  .detail-section {
    background: #fafbfc;
    border-radius: 8px;
    padding: 20px 24px;
    margin-bottom: 20px;
    border: 1px solid #e4e7ed;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e7ed;
    }
  }

  .detail-text {
    font-size: 14px;
    color: #303133;
    display: inline-block;
    min-width: 60px;
    white-space: nowrap;

    &.price {
      color: #f56c6c;
      font-weight: 500;
    }
  }

  /* 关键：属性名标签加粗 */
  ::v-deep .el-form-item__label {
    font-weight: 700 !important; /* 加粗 */
    color: #303133 !important;
  }

  ::v-deep .el-table {
    --el-table-header-text-color: #303133;
    --el-table-row-hover-bg-color: #fafbfc;
  }

  ::v-deep .el-tag {
    margin: 0;
  }
}
</style>
