<template>
  <el-dialog
    :title="type === 'add' ? '新增客户' : '编辑客户'"
    :visible.sync="isVisible"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="客户名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入客户名称" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>
      <el-form-item label="客户等级" prop="levelId">
        <el-select v-model="form.levelId" placeholder="请选择等级" style="width: 100%" clearable>
          <el-option
            v-for="item in customerLevels"
            :key="item.dictValue"
            :label="item.dictName"
            :value="item.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="联系地址" prop="address">
        <el-input v-model="form.address" type="textarea" placeholder="请输入详情地址" :rows="2" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注内容" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'

export default {
  props: {
    type: { type: String, default: 'add' },
    customerId: { type: String, default: '' }
  },
  data() {
    return {
      isVisible: true,
      formLoading: false,
      submitLoading: false,
      form: {
        id: undefined,
        name: '',
        phone: '',
        levelId: '',
        address: '',
        remark: '',
        status: 1
      },
      rules: {
        name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }]
      },
      customerLevels: []
    }
  },
  computed: {

  },
  created() {
    this.customerLevels = this.$store.getters['dict/getCustomerLevels']
    if (this.type === 'edit' && this.customerId) {
      this.fetchDetail()
    }
  },
  methods: {
    async fetchDetail() {
      this.formLoading = true
      try {
        const res = await request({ url: `/erp-service/customer/get/${this.customerId}`, method: 'get' })
        if (res.code === 200) {
          const data = res.data
          this.form = { ...data }
        }
      } finally {
        this.formLoading = false
      }
    },
    async handleSubmit() {
      await this.$refs.formRef.validate()
      this.submitLoading = true
      try {
        const isAdd = this.type === 'add'
        const res = await request({
          url: isAdd ? '/erp-service/customer/add' : '/erp-service/customer/update',
          method: isAdd ? 'post' : 'put',
          data: this.form
        })
        if (res.code === 200) {
          this.$message.success(`${isAdd ? '新增' : '修改'}成功`)
          this.$emit('success')
          this.handleClose()
        }
      } finally {
        this.submitLoading = false
      }
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>
