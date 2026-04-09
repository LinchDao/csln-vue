<template>
  <el-dialog
    :title="dialogTitle"
    :visible="innerVisible"
    width="75%"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="dict-form"
    >
      <!-- 主字典基础信息 -->
      <el-divider content-position="left">
        <span style="font-weight:bold">主字典信息</span>
      </el-divider>
      <el-row>
        <el-col :span="12">
          <el-form-item label="字典名称" prop="dictName">
            <el-input v-model="form.dictName" placeholder="请输入字典名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="字典值" prop="dictValue">
            <el-input v-model="form.dictValue" placeholder="请输入字典值" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-row>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注" />
      </el-form-item>

      <!-- 子字典列表 -->
      <el-divider content-position="left">
        <span style="font-weight:bold">子项列表</span>
      </el-divider>

      <el-button
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="addChildItem"
      >
        添加子项
      </el-button>

      <el-table
        :data="form.dictList"
        border
        style="width:100%;margin-top:10px"
        size="mini"
        row-key="id"
      >
        <el-table-column label="字典名称" min-width="130">
          <template slot-scope="{ row, $index }">
            <el-form-item
              :prop="`dictList[${$index}].dictName`"
              :rules="{required: true, message: '名称不能为空', trigger: 'blur'}"
            >
              <el-input v-model="row.dictName" placeholder="名称" />
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column label="字典值" min-width="130">
          <template slot-scope="{ row, $index }">
            <el-form-item
              :prop="`dictList[${$index}].dictValue`"
            >
              <el-input v-model="row.dictValue" placeholder="值" />
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="140" align="center">
          <template slot-scope="{ $index }">
            <el-button
              icon="el-icon-arrow-up"
              size="mini"
              :disabled="$index === 0"
              @click="moveUp($index)"
            />
            <el-button
              icon="el-icon-arrow-down"
              size="mini"
              :disabled="$index === form.dictList.length - 1"
              @click="moveDown($index)"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="140">
          <template slot-scope="{ row }">
            <el-radio-group v-model="row.status" size="mini">
              <el-radio :label="1">启</el-radio>
              <el-radio :label="0">禁</el-radio>
            </el-radio-group>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="90" align="center">
          <template slot-scope="{ $index }">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeChild($index)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确认保存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'DictEditDialog',
  props: {
    visible: { type: Boolean, default: false },
    type: { type: String, default: 'add' },
    id: { type: String, default: '' }
  },
  data() {
    return {
      innerVisible: false, // 加这个
      submitLoading: false,
      form: {
        id: '',
        parentId: '0',
        dictName: '',
        dictValue: '',
        sort: 0,
        status: 1,
        remark: '',
        dictList: []
      },
      rules: {
        dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.type === 'add' ? '新增字典' : '编辑字典'
    }
  },
  watch: {
    // 监听父组件传入的 visible，同步给内部变量
    visible(val) {
      this.innerVisible = val
      if (val) {
        this.resetForm()
        if (this.type === 'edit') this.loadDictData()
      }
    }
  },
  methods: {
    // 加载编辑数据
    async loadDictData() {
      try {
        const res = await request({ url: `/erp-service/dict/get/${this.id}`, method: 'get' })
        this.form = res.data
      } catch (e) {
        this.$message.error('加载失败')
      }
    },

    // 提交
    async handleSubmit() {
      await this.$refs.formRef.validate()
      this.submitLoading = true
      try {
        if (this.type === 'add') {
          await request({ url: '/erp-service/dict/add', method: 'post', data: this.form })
        } else {
          await request({ url: '/erp-service/dict/update', method: 'put', data: this.form })
        }
        this.$message.success('保存成功')
        this.$emit('success')
        this.handleClose()
      } catch (e) {
        this.$message.error('保存失败')
      } finally {
        this.submitLoading = false
      }
    },

    // 上移
    moveUp(index) {
      if (index === 0) return
      const temp = this.form.dictList[index]
      this.form.dictList.splice(index, 1)
      this.form.dictList.splice(index - 1, 0, temp)
      this.refreshSort()
    },

    // 下移
    moveDown(index) {
      if (index === this.form.dictList.length - 1) return
      const temp = this.form.dictList[index]
      this.form.dictList.splice(index, 1)
      this.form.dictList.splice(index + 1, 0, temp)
      this.refreshSort()
    },

    // 自动刷新 sort 序号
    refreshSort() {
      this.form.dictList.forEach((item, i) => {
        item.sort = i + 1
      })
    },

    // 添加子项
    addChildItem() {
      this.form.dictList.push({
        id: '',
        parentId: this.form.id || '',
        dictName: '',
        dictValue: '',
        sort: this.form.dictList.length + 1,
        status: 1,
        remark: ''
      })
    },

    // 删除子项
    removeChild(index) {
      this.form.dictList.splice(index, 1)
      this.refreshSort()
    },

    resetForm() {
      this.form = {
        id: '', parentId: '0', dictName: '', dictValue: '',
        sort: 0, status: 1, remark: '', dictList: []
      }
      this.$refs.formRef?.clearValidate()
    },

    handleClose() {
      this.innerVisible = false
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.dict-form { padding-right: 20px; }
.dialog-footer { text-align: right; }
</style>
