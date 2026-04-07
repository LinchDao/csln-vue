<template>
  <el-dialog
    :title="modalTitle"
    :visible.sync="isVisible"
    width="700px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="form"
      label-width="110px"
      label-position="right"
      :rules="rules"
      class="user-form"
    >
      <el-form-item label="用户账号" prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户账号"
          clearable
          maxlength="30"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="form.realName"
          placeholder="请输入真实姓名"
          clearable
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="请输入11位手机号"
          clearable
          maxlength="11"
        />
      </el-form-item>
      <el-form-item label="所属门店" prop="shopId">
        <el-select
          v-model="form.shopId"
          placeholder="请选择门店"
          clearable
          style="width:100%"
        >
          <el-option
            v-for="item in shopList"
            :key="item.id"
            :label="item.shopName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属仓库" prop="warehouseId">
        <el-select
          v-model="form.warehouseId"
          placeholder="请选择仓库"
          clearable
          style="width:100%"
        >
          <el-option
            v-for="item in warehouseList"
            :key="item.id"
            :label="item.warehouseName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分配角色" prop="roleIds">
        <el-checkbox-group v-model="form.roleIds">
          <el-checkbox
            v-for="role in roleList"
            :key="role.id"
            :label="role.id"
            style="margin: 0 15px 10px 0;"
          >{{ role.roleName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="用户状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择用户状态"
          clearable
          style="width:100%"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        v-if="!formLoading"
        type="primary"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        {{ type === 'add' ? '新增' : '保存' }}
      </el-button>
    </template>
  </el-dialog>
</template>
<script>
import request from '@/utils/request'
export default {
  name: 'UserFormModal',
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ['add', 'edit'].includes(val)
    },
    userId: { // 仅接收用户ID，替代rowData
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isVisible: true, // 弹窗内部默认显示（由父组件v-if控制整体显隐）
      submitLoading: false,
      formLoading: false,
      shopList: [],
      warehouseList: [],
      roleList: [],
      form: {
        id: '',
        username: '',
        realName: '',
        phone: '',
        shopId: '',
        warehouseId: '',
        roleIds: [],
        status: 1
      },
      rules: {
        username: [
          { required: true, message: '请输入用户账号', trigger: 'blur' },
          { min: 3, max: 30, message: '账号长度3-30个字符', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度2-20个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择用户状态', trigger: 'change' }
        ],
        roleIds: [
          { required: true, message: '请至少选择一个角色', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    modalTitle() {
      return this.type === 'add' ? '新增用户' : '编辑用户'
    }
  },
  // created中加载下拉，编辑时拉取详情
  created() {
    this.loadAllSelectList() // 加载下拉
    if (this.type === 'edit' && this.userId) {
      this.fetchUserDetail() // 编辑时用props的userId拉取详情
    }
  },
  methods: {
    /**
     * 父组件调用：初始化弹窗（仅触发表单重置）
     */
    openModal() {
      this.initForm()
    },
    /**
     * 加载下拉数据
     */
    async loadAllSelectList() {
      try {
        const [shopRes, warehouseRes, roleRes] = await Promise.all([
          request({ url: '/api/shop/list', method: 'get' }),
          request({ url: '/api/warehouse/list', method: 'get' }),
          request({ url: '/api/role/list', method: 'get' })
        ])
        this.shopList = shopRes.data || []
        this.warehouseList = warehouseRes.data || []
        this.roleList = roleRes.data || []
      } catch (error) {
        this.$message.error('下拉数据加载失败，请刷新页面重试！')
        console.error('下拉接口异常：', error)
      }
    },
    /**
     * 初始化表单
     */
    initForm() {
      this.$nextTick(() => {
        this.$refs.formRef?.resetFields()
        this.submitLoading = false
        this.form = {
          id: this.userId || '',
          username: '',
          realName: '',
          phone: '',
          shopId: '',
          warehouseId: '',
          roleIds: [],
          status: 1
        }
      })
    },
    /**
     * 编辑时：用props的userId拉取详情
     */
    async fetchUserDetail() {
      this.formLoading = true
      try {
        const res = await request({
          url: `/api/user/get/${this.userId}`,
          method: 'get'
        })
        if (res.code === 200 && res.data) {
          const detail = res.data
          this.form = {
            id: detail.id || '',
            username: detail.username || '',
            realName: detail.realName || '',
            phone: detail.phone || '',
            shopId: detail.shopId || '',
            warehouseId: detail.warehouseId || '',
            roleIds: Array.isArray(detail.roleIds) ? detail.roleIds : [],
            status: detail.status ?? 1
          }
        } else {
          this.$message.error(res.message || '获取用户详情失败')
          this.handleClose()
        }
      } catch (error) {
        this.$message.error('获取详情失败：' + (error.response?.data?.message || error.message))
        this.handleClose()
        console.error('详情接口异常：', error)
      } finally {
        this.formLoading = false
      }
    },
    /**
     * 关闭弹窗：通知父组件隐藏
     */
    handleClose() {
      this.$refs.formRef?.resetFields()
      this.formLoading = false
      this.submitLoading = false
      this.$emit('close') // 父组件接收后设置modalVisible=false
    },
    /**
     * 提交表单
     */
    async handleSubmit() {
      const isValid = await this.$refs.formRef.validate().catch(() => false)
      if (!isValid) return

      this.submitLoading = true
      try {
        const requestData = this.type === 'add'
          ? { ...this.form, id: undefined }
          : { ...this.form }

        const res = await request({
          url: this.type === 'add' ? '/api/user/add' : '/api/user/update',
          method: this.type === 'add' ? 'post' : 'put',
          data: requestData
        })

        if (res.code === 200) {
          this.$message.success(this.type === 'add' ? '新增成功' : '编辑成功')
          this.$emit('success')
          this.handleClose()
        } else {
          this.$message.error(res.message || (this.type === 'add' ? '新增失败' : '编辑失败'))
        }
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message || '网络异常'
        this.$message.error(`${this.type === 'add' ? '新增' : '编辑'}失败：${errMsg}`)
      } finally {
        this.submitLoading = false
      }
    }
  }
}
</script>
<style scoped>
.user-form {
  padding: 10px 0;
}
.el-checkbox-group {
  line-height: 1.8;
}
</style>
