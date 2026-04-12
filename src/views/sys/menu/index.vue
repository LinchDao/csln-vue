<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 20px; display: flex; align-items: center; justify-content: flex-end;">
      <span style="margin-right: auto; color: #909399; font-size: 14px;">
        提示：拖拽节点进行同级排序，完成后请点击"保存排序"
      </span>
      <el-button icon="el-icon-refresh" @click="fetchMenuTree">
        刷新
      </el-button>
      <el-button type="primary" icon="el-icon-check" :loading="saving" @click="handleSaveSort">
        保存排序
      </el-button>
    </div>

    <el-tree
      ref="tree"
      v-loading="loading"
      :data="menuTree"
      node-key="id"
      :props="defaultProps"
      draggable
      :allow-drop="allowDrop"
      class="menu-tree"
      style="max-width: 600px; margin-top: 10px;"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node" style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
        <span>
          <svg-icon v-if="data.icon" :icon-class="data.icon" style="margin-right: 5px;" />
          {{ data.title }}
        </span>
        <span style="margin-left: 20px;">
          <el-tag size="mini" :type="data.parentId === null ? 'primary' : 'success'">
            {{ data.parentId === null ? '目录' : '菜单' }}
          </el-tag>
        </span>
      </span>
    </el-tree>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'SysMenuIndex',
  data() {
    return {
      loading: false,
      saving: false,
      menuTree: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      lastSavedData: ''
    }
  },
  created() {
    this.fetchMenuTree()
  },
  methods: {
    async fetchMenuTree() {
      this.loading = true
      try {
        const res = await request({
          url: '/erp-service/menu/tree',
          method: 'get'
        })
        if (res.code === 200) {
          this.menuTree = res.data || []
          this.lastSavedData = JSON.stringify(this.formatTreeForSave(this.menuTree))
        } else {
          this.$message.error(res.message || '获取菜单失败')
        }
      } catch (error) {
        console.error(error)
        this.$message.error('获取菜单失败')
      } finally {
        this.loading = false
      }
    },
    // 将 Element UI 树形数据转换为后端需要的 { id, children } 结构
    formatTreeForSave(nodes) {
      if (!nodes || nodes.length === 0) return []
      return nodes.map(node => {
        const item = { id: node.id }
        if (node.children && node.children.length > 0) {
          item.children = this.formatTreeForSave(node.children)
        }
        return item
      })
    },
    async handleSaveSort() {
      const sortedData = this.formatTreeForSave(this.menuTree)
      const currentData = JSON.stringify(sortedData)

      if (currentData === this.lastSavedData) {
        this.$message.info('排序未发生变化')
        return
      }

      this.saving = true
      try {
        const res = await request({
          url: '/erp-service/menu/sort/save',
          method: 'put',
          data: { menus: sortedData }
        })
        if (res.code === 200) {
          this.$message.success('排序保存成功')
          this.fetchMenuTree() // 刷新以确认最终状态
        } else {
          this.$message.error(res.message || '保存排序失败')
        }
      } catch (error) {
        console.error(error)
        this.$message.error('保存排序失败')
      } finally {
        this.saving = false
      }
    },
    // 限制只能同级拖拽（且必须拥有相同的父节点），并且不能成为子节点(type !== 'inner')
    allowDrop(draggingNode, dropNode, type) {
      if (draggingNode.level === dropNode.level && draggingNode.parent === dropNode.parent) {
        return type === 'prev' || type === 'next'
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-tree {
  user-select: none;
}
</style>
