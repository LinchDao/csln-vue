<template>
  <el-dialog
    :title="'批量添加: ' + dimName"
    :visible.sync="visible"
    width="450px"
    :before-close="handleClose"
  >
    <el-form label-position="top">
      <div v-if="contextDesc" class="expand-context-info">
        正在为 <el-tag size="mini">{{ contextDesc }}</el-tag> 添加下级
      </div>
      <el-form-item label="请输入维度值 (多个请用逗号或换行分隔)">
        <div slot="label" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span>请输入维度值 (多个请用逗号或换行分隔)</span>
          <el-button
            v-if="historyValue"
            type="text"
            size="mini"
            icon="el-icon-refresh-left"
            @click="useHistory"
          >
            使用上次录入的值
          </el-button>
        </div>
        <el-input
          v-model="inputValue"
          type="textarea"
          :rows="5"
          placeholder="例如：红色, 蓝色, 绿色"
        />
      </el-form-item>
      <div v-if="historyValue" class="history-preview">
        上次录入: <span class="history-text">{{ historyValue }}</span>
      </div>
    </el-form>
    <div slot="footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定添加</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'BatchAddDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dimName: {
      type: String,
      default: ''
    },
    contextDesc: {
      type: String,
      default: ''
    },
    historyValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputValue: ''
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.inputValue = ''
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },
    useHistory() {
      this.inputValue = this.historyValue
    },
    handleConfirm() {
      if (!this.inputValue.trim()) {
        this.$message.warning('请输入维度值')
        return
      }
      this.$emit('confirm', this.inputValue)
      this.handleClose()
    }
  }
}
</script>

<style scoped>
.expand-context-info {
  margin-bottom: 15px;
  padding: 10px;
  background: #fff8e6;
  color: #8a6d3b;
  border-radius: 4px;
  font-size: 13px;
}
.history-preview {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  background: #f4f4f5;
  padding: 5px 10px;
  border-radius: 4px;
}
.history-text {
  color: #409EFF;
  font-family: monospace;
}
</style>
