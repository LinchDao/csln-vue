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
          :disabled="isStockExist && !isUnlockedEdit"
        />

        <el-button
          v-if="isStockExist && !isUnlockedEdit"
          type="warning"
          size="mini"
          style="margin-left: 10px"
          @click="handleUnlockEdit"
        >
          存在库存，点击允许修改
        </el-button>
      </el-form-item>

      <el-form-item label="选择颜色">
        <el-radio-group
          v-model="form.colorName"
          size="small"
          :disabled="isStockExist && !isUnlockedEdit"
        >
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
      isStockExist: false,
      isUnlockedEdit: false,
      form: {
        colorName: '',
        colorImageIdList: [],
        skuIdList: []
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
          this.isUnlockedEdit = false
        } else {
          this.form = { colorName: '', colorImageIdList: [], skuIdList: [] }
          this.isStockExist = false
          this.isUnlockedEdit = false
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
    // 解锁编辑
    handleUnlockEdit() {
      this.$confirm(
        '该颜色存在库存，不建议修改！',
        '警告',
        {
          confirmButtonText: '仍要修改',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.isUnlockedEdit = true
        this.$message.success('已解锁，可以修改颜色')
      })
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
