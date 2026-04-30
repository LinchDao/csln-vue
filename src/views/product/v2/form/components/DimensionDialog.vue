<template>
  <el-dialog
    title="添加维度"
    :visible.sync="visible"
    width="400px"
    :before-close="handleClose"
  >
    <el-form :model="form" label-width="80px" @submit.native.prevent>
      <el-form-item label="维度名称">
        <el-input 
          v-model="form.name" 
          placeholder="如：颜色、尺码" 
          @input="handleNameInput"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DimensionDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    existingDimensions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {
        name: '',
        key: ''
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.form = { name: '', key: '' }
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },
    // 自动生成 Key 的逻辑
    handleNameInput(val) {
      if (!val) {
        this.form.key = ''
        return
      }
      // 如果已经有匹配的旧维度（编辑场景暂不涉及，此处为新增），保持 key
      // 简单策略：dim_ + 随机字符串或时间戳
      if (!this.form.key) {
        this.form.key = 'dim_' + Math.random().toString(36).substr(2, 6)
      }
    },
    handleConfirm() {
      const name = this.form.name.trim()
      if (!name) {
        this.$message.warning('请输入维度名称')
        return
      }
      // 校验名称防重
      const isNameDup = this.existingDimensions.some(d => d.name === name)
      if (isNameDup) {
        this.$message.error('维度名称已存在')
        return
      }
      
      this.$emit('confirm', { 
        name: name,
        key: this.form.key
      })
      this.handleClose()
    }
  }
}
</script>
