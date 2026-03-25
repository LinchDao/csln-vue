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
        />
      </el-form-item>

      <!-- 颜色按钮组 -->
      <el-form-item label="选择颜色">
        <el-radio-group v-model="form.colorName" size="small">
          <el-radio-button
            v-for="c in availableColors"
            :key="c.id"
            :label="c.dictName"
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
    editData: Object
  },
  data() {
    return {
      innerVisible: false,
      availableColors: [],
      form: {
        colorName: '',
        colorImageIdList: []
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
        } else {
          this.form = { colorName: '', colorImageIdList: [] }
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
      this.$emit('confirm', this.form)
      this.handleClose()
    }
  }
}
</script>
