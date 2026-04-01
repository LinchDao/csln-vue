<template>
  <div class="template-form-container">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="template-form-body"
    >
      <sticky :z-index="10" class-name="sub-navbar">
        <el-button
          v-loading="loading"
          type="primary"
          style="margin-left: 10px;"
          @click="submitForm"
        >
          {{ isEditMode ? '保存修改' : '新建' }}
        </el-button>
        <el-button style="margin-left: 10px;" @click="cancelForm">
          取消
        </el-button>
      </sticky>

      <el-card shadow="never" class="template-section">
        <div class="template-section__title">基础信息</div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="单据编码" prop="code">
              <el-input v-model="formData.code" clearable placeholder="请输入单据编码" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单据名称" prop="name">
              <el-input v-model="formData.name" clearable placeholder="请输入单据名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                maxlength="200"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card shadow="never" class="template-section template-section--mt16">
        <div class="template-section__title">
          明细信息
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            style="float: right;"
            @click="addLineItem"
          >
            新增行
          </el-button>
        </div>
        <el-table :data="formData.items" border style="width: 100%;">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column label="明细名称" min-width="180">
            <template slot-scope="{ row }">
              <el-input v-model="row.itemName" clearable placeholder="请输入明细名称" />
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120" align="center">
            <template slot-scope="{ row }">
              <el-input-number
                v-model="row.qty"
                :min="0"
                :controls="false"
                style="width: 100%;"
                @change="syncAmount(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120" align="center">
            <template slot-scope="{ row }">
              <el-input-number
                v-model="row.price"
                :min="0"
                :precision="2"
                :controls="false"
                style="width: 100%;"
                @change="syncAmount(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120" align="center">
            <template slot-scope="{ row }">
              {{ (row.amount || 0).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="{ $index }">
              <el-button type="text" @click="removeLineItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-form>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky'

const defaultFormData = {
  id: undefined,
  code: '',
  name: '',
  status: 1,
  remark: '',
  items: []
}

export default {
  name: 'TemplateForm',
  components: { Sticky },
  data() {
    return {
      loading: false,
      formData: JSON.parse(JSON.stringify(defaultFormData)),
      rules: {
        code: [{ required: true, message: '请输入单据编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入单据名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  computed: {
    isEditMode() {
      return !!this.$route.params.id
    }
  },
  created() {
    if (this.isEditMode) {
      this.initEditData(this.$route.params.id)
    } else {
      this.addLineItem()
    }
  },
  methods: {
    async initEditData(id) {
      this.loading = true
      try {
        // request placeholder
        // const { data } = await request({
        //   url: `/api/xxx/${id}`,
        //   method: 'get'
        // })
        // this.formData = data
        this.formData = {
          id,
          code: 'TMP-FRM-001',
          name: '表单模板数据',
          status: 1,
          remark: '用于统一表单页结构',
          items: [
            { itemName: '明细A', qty: 1, price: 88.5, amount: 88.5 }
          ]
        }
      } finally {
        this.loading = false
      }
    },
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          // request placeholder
          // const method = this.isEditMode ? 'put' : 'post'
          // const url = this.isEditMode ? `/api/xxx/${this.formData.id}` : '/api/xxx/create'
          // await request({ url, method, data: this.formData })
          this.$message.success(this.isEditMode ? '保存成功' : '创建成功')
          this.$router.back()
        } finally {
          this.loading = false
        }
      })
    },
    cancelForm() {
      this.$router.back()
    },
    addLineItem() {
      this.formData.items.push({
        itemName: '',
        qty: 0,
        price: 0,
        amount: 0
      })
    },
    removeLineItem(index) {
      this.formData.items.splice(index, 1)
    },
    syncAmount(row) {
      const qty = Number(row.qty || 0)
      const price = Number(row.price || 0)
      row.amount = Number((qty * price).toFixed(2))
    }
  }
}
</script>

<style lang="scss" scoped>
.template-form-container {
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.template-form-body {
  .el-card {
    border: 1px solid #e4e7ed;
  }
}
</style>
