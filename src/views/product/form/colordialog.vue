<template>
  <el-dialog
    title="颜色信息"
    :visible="innerVisible"
    width="600px"
    append-to-body
    @close="handleClose"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="颜色名称">
        <el-input
          v-model="form.colorName"
          placeholder="点击下方按钮选择或手动输入"
          clearable
          :disabled="isStockExist"
        />
        <div v-if="isStockExist" style="color: #F56C6C; font-size: 12px; margin-top: 5px; line-height: 1.4;">
          该颜色存在库存或关联SKU，不再支持修改名称。如需修改，请删除后重建或联系管理员。
        </div>
      </el-form-item>

      <el-form-item label="选择颜色">
        <el-radio-group
          v-model="form.colorName"
          size="small"
          :disabled="isStockExist"
        >
          <el-radio-button
            v-for="c in availableColors"
            :key="c.id"
            :label="c.dictName"
            :disabled="isColorDisabled(c.dictName)"
          >
            {{ c.dictName }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="颜色图片">
        <ImageUpload
          v-model="form.colorImageIdList"
          :limit="0"
        />
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submit">确认保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
export default {
  name: 'ColorSelectDialog',
  components: { ImageUpload },
  props: {
    visible: Boolean,
    editData: {
      type: Object,
      default: null
    },
    selectedColorNames: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      innerVisible: false,
      availableColors: [],
      isStockExist: false,
      form: {
        colorName: '',
        colorImageIdList: [],
        skuIdList: []
      }
    }
  },
  computed: {
    // 判断颜色是否已选且非当前编辑项
    isColorDisabled() {
      return (colorName) => {
        if (!this.selectedColorNames || this.selectedColorNames.length === 0) return false
        const isEditSelf = this.editData && this.editData.colorName === colorName
        return this.selectedColorNames.includes(colorName) && !isEditSelf
      }
    }
  },
  watch: {
    visible(val) {
      this.innerVisible = val
      if (val) {
        this.availableColors = this.$store.getters['dict/getColorDict']
      }
    },
    editData: {
      immediate: true,
      handler(d) {
        if (d) {
          this.form = { ...d }
          this.isStockExist = !!d.skuIdList && d.skuIdList.length > 0
        } else {
          this.form = { colorName: '', colorImageIdList: [], skuIdList: [] }
          this.isStockExist = false
        }
      }
    }
  },
  created() {
    this.availableColors = this.$store.getters['dict/getColorDict']
  },

  methods: {
    handleClose() {
      this.innerVisible = false
      this.$emit('update:visible', false)
    },
    submit() {
      if (!this.form.colorName) {
        this.$message.warning('请选择颜色')
        return
      }
      if (this.isColorDisabled(this.form.colorName)) {
        this.$message.warning('该颜色已经存在，请勿重复添加')
        return
      }
      this.$emit('confirm', this.form)
      this.handleClose()
    }
  }
}

</script>
