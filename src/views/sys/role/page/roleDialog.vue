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
      class="role-form"
    >
      <el-form-item label="角色编码" prop="roleCode">
        <el-input
          v-model="form.roleCode"
          placeholder="请输入角色编码"
          clearable
          maxlength="30"
          show-word-limit
          :disabled="type === 'edit'"
        />
      </el-form-item>
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="form.roleName"
          placeholder="请输入角色名称"
          clearable
          maxlength="30"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注"
          clearable
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="分配菜单" prop="menuIds">
        <el-tree
          ref="menuTree"
          :data="menuList"
          :props="{ label: 'title', children: 'children' }"
          node-key="id"
          show-checkbox
          style="margin-top: 8px; max-height: 200px; overflow-y: auto; border: 1px solid #dcdfe6; border-radius: 4px; padding: 5px;"
          @check="handleMenuCheck"
        />
      </el-form-item>
      <el-form-item label="分配权限" prop="permIds">
        <el-tree
          ref="permTree"
          :data="permissionTree"
          :props="{ label: 'permName', children: 'children' }"
          node-key="id"
          show-checkbox
          style="margin-top: 8px; max-height: 250px; overflow-y: auto; border: 1px solid #dcdfe6; border-radius: 4px; padding: 5px;"
          @check="handlePermCheck"
        />
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
  name: 'RoleFormModal',
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ['add', 'edit'].includes(val)
    },
    roleId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isVisible: true,
      submitLoading: false,
      formLoading: false,
      menuList: [],
      permList: [],
      form: {
        id: '',
        roleCode: '',
        roleName: '',
        remark: '',
        menuIds: [],
        permIds: []
      },
      rules: {
        roleCode: [
          { required: true, message: '请输入角色编码', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ],
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    modalTitle() {
      return this.type === 'add' ? '新增角色' : '编辑角色'
    },
    permissionTree() {
      if (!this.permList || this.permList.length === 0) return []
      const tree = []
      const moduleMap = {}

      this.permList.forEach(perm => {
        const nameParts = perm.permName.split('-')
        const moduleName = nameParts.length > 1 ? nameParts[0] : '其他'
        const actionName = nameParts.length > 1 ? nameParts[1] : perm.permName

        if (!moduleMap[moduleName]) {
          moduleMap[moduleName] = {
            id: `module:${moduleName}`,
            permName: moduleName,
            children: [],
            isModule: true
          }
          tree.push(moduleMap[moduleName])
        }

        moduleMap[moduleName].children.push({
          ...perm,
          permName: actionName,
          isModule: false
        })
      })

      return tree
    }
  },
  async created() {
    this.formLoading = true
    // 1. 先确保下拉列表（菜单树）加载完成
    await this.loadAllSelectList()
    // 2. 菜单树数据到位后，再加载详情并回显
    if (this.type === 'edit' && this.roleId) {
      await this.fetchRoleDetail()
    }
    this.formLoading = false
  },
  methods: {
    openModal() {
      this.initForm()
    },
    async loadAllSelectList() {
      try {
        const [menuRes, permRes] = await Promise.all([
          request({ url: '/erp-service/menu/list', method: 'get' }),
          request({ url: '/erp-service/permission/list', method: 'get' })
        ])
        const flatMenus = menuRes.data || []
        this.menuList = this.buildTree(flatMenus, '0')
        // 兼容处理：如果没有明显的根节点（parentId='0'不存在），直接使用列表返回的形式构建树或平铺
        if (this.menuList.length === 0 && flatMenus.length > 0) {
          this.menuList = this.buildTree(flatMenus, null) || flatMenus
        }
        this.permList = permRes.data || []
      } catch (error) {
        this.$message.error('下拉数据加载失败，请刷新页面重试！')
        console.error('下拉接口异常：', error)
      }
    },
    buildTree(list, parentId) {
      const tree = []
      for (let i = 0; i < list.length; i++) {
        // 如果没有parentId但是需要作为根节点，使用 == 判断以便兼容 null 和 undefined
        if (list[i].parentId === parentId || (!list[i].parentId && !parentId)) {
          const node = { ...list[i] }
          const children = this.buildTree(list, list[i].id)
          if (children.length > 0) {
            node.children = children
          }
          tree.push(node)
        }
      }
      return tree
    },
    initForm() {
      this.$nextTick(() => {
        this.$refs.formRef?.resetFields()
        this.$refs.menuTree?.setCheckedKeys([])
        this.$refs.permTree?.setCheckedKeys([])
        this.submitLoading = false
        this.form = {
          id: this.roleId || '',
          roleCode: '',
          roleName: '',
          remark: '',
          menuIds: [],
          permIds: []
        }
      })
    },
    handlePermCheck(currentObj, treeStatus) {
      this.form.permIds = treeStatus.checkedKeys.filter(id => !id.toString().startsWith('module:'))
    },
    async fetchRoleDetail() {
      this.formLoading = true
      try {
        const res = await request({
          url: `/erp-service/role/get/${this.roleId}`,
          method: 'get'
        })
        if (res.code === 200 && res.data) {
          const detail = res.data
          this.form = {
            id: detail.id || '',
            roleCode: detail.roleCode || '',
            roleName: detail.roleName || '',
            remark: detail.remark || '',
            menuIds: Array.isArray(detail.menuIds) ? detail.menuIds : [],
            permIds: Array.isArray(detail.permIds) ? detail.permIds : []
          }
          this.$nextTick(() => {
            if (this.$refs.menuTree) {
              const leafKeys = this.form.menuIds.filter(id => {
                const node = this.$refs.menuTree.getNode(id)
                return node && node.isLeaf
              })
              this.$refs.menuTree.setCheckedKeys(leafKeys)
            }
            if (this.$refs.permTree) {
              const realPermIds = this.form.permIds.filter(id => !id.toString().startsWith('module:'))
              this.$refs.permTree.setCheckedKeys(realPermIds)
            }
          })
        } else {
          this.$message.error(res.message || '获取角色详情失败')
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
    handleMenuCheck(currentObj, treeStatus) {
      this.form.menuIds = treeStatus.checkedKeys.concat(treeStatus.halfCheckedKeys)
    },
    handleClose() {
      this.$refs.formRef?.resetFields()
      this.$refs.menuTree?.setCheckedKeys([])
      this.$refs.permTree?.setCheckedKeys([])
      this.formLoading = false
      this.submitLoading = false
      this.$emit('close')
    },
    async handleSubmit() {
      const isValid = await this.$refs.formRef.validate().catch(() => false)
      if (!isValid) return

      // 更新选中和半选中的菜单IDs
      if (this.$refs.menuTree) {
        this.form.menuIds = this.$refs.menuTree.getCheckedKeys().concat(this.$refs.menuTree.getHalfCheckedKeys())
      }

      // 更新选中的权限IDs（排除模块节点）
      if (this.$refs.permTree) {
        this.form.permIds = this.$refs.permTree.getCheckedKeys().filter(id => !id.toString().startsWith('module:'))
      }

      this.submitLoading = true
      try {
        const requestData = this.type === 'add'
          ? { ...this.form, id: undefined }
          : { ...this.form }

        const res = await request({
          url: this.type === 'add' ? '/erp-service/role/add' : '/erp-service/role/update',
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
.role-form {
  padding: 10px 0;
}
.el-checkbox-group {
  line-height: 1.8;
}
</style>
