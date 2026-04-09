<template>
  <div>
    <el-upload
      action="#"
      list-type="picture-card"
      :file-list="fileList"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :http-request="customUpload"
      :before-upload="beforeUpload"
      :limit="realLimit"
      :on-exceed="handleExceed"
    >
      <i class="el-icon-plus" />
    </el-upload>

    <el-dialog :visible.sync="previewVisible" append-to-body>
      <img width="100%" :src="previewUrl" alt="预览">
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ImageUpload',
  props: {
    value: [String, Number, Array],
    // 限制上传数量
    // 1 = 单张
    // 0 = 不限制
    // 其他数字 = 限制 N 张
    limit: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      fileList: [],
      previewVisible: false,
      previewUrl: '',
      internalValue: [] // 用于追踪已经处理过的 ID
    }
  },
  computed: {
    // 真实限制数量：0 代表不限制（给 el-upload 设为无限大）
    realLimit() {
      return this.limit === 0 ? 9999 : this.limit
    }
  },
  watch: {
    value: {
      immediate: true,
      async handler(val) {
        if (!val || (Array.isArray(val) && val.length === 0)) {
          this.clearFileList()
          this.internalValue = []
          return
        }

        // 归一化为字符串数组进行比较
        const newIds = (Array.isArray(val) ? val : [val]).map(id => String(id))

        // 深度比较，避免重复渲染和请求
        if (JSON.stringify(this.internalValue) === JSON.stringify(newIds)) {
          return
        }

        this.internalValue = newIds
        await this.syncFileList(newIds)
      }
    }
  },
  beforeDestroy() {
    this.clearFileList()
  },
  methods: {
    // 清理文件列表并释放 Blob URL
    clearFileList() {
      this.fileList.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
      })
      this.fileList = []
    },

    // 同步文件列表（并行加载）
    async syncFileList(ids) {
      // 先清理旧的（可选，如果想平滑切换可以不清理，但这里为了简单直接清理）
      const oldList = [...this.fileList]

      const promises = ids.map(async(id) => {
        // 查找是否已经存在（避免重复下载同一个 ID）
        const existing = oldList.find(f => String(f.id) === String(id))
        if (existing && existing.url.startsWith('blob:')) {
          return existing
        }

        const downloadUrl = `/erp-service/erp/file/download/${id}`
        try {
          const data = await request({
            url: downloadUrl,
            method: 'get',
            responseType: 'blob'
          })

          if (data.type === 'application/json') {
            throw new Error('Invalid image data')
          }

          return {
            id: id,
            uid: id,
            url: URL.createObjectURL(data),
            name: `image-${id}`
          }
        } catch (e) {
          console.error(`加载图片 [${id}] 失败:`, e)
          return {
            id: id,
            uid: id,
            url: '', // 加载失败
            name: `error-${id}`
          }
        }
      })

      const newList = await Promise.all(promises)

      // 清理不再需要的旧 Blob
      oldList.forEach(oldFile => {
        if (oldFile.url.startsWith('blob:') && !newList.some(n => n.url === oldFile.url)) {
          URL.revokeObjectURL(oldFile.url)
        }
      })

      this.fileList = newList
    },

    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件！')
        return false
      }
      const isLt5M = file.size / 1024 / 1024 < 50
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 50MB！')
        return false
      }
      return true
    },

    handleExceed() {
      if (this.limit === 0) return
      this.$message.error(`最多只能上传 ${this.limit} 张图片！`)
    },

    async customUpload({ file, onSuccess }) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await request({
          url: '/erp-service/erp/file/upload',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const fileId = res.data
        onSuccess()

        // 更新父组件 value
        if (this.limit === 1) {
          this.$emit('input', fileId)
        } else {
          const current = Array.isArray(this.value) ? [...this.value] : []
          current.push(fileId)
          this.$emit('input', current)
        }

        this.$message.success('上传成功')
      } catch (e) {
        this.$message.error('上传失败')
        console.error(e)
      }
    },

    handlePreview(file) {
      this.previewUrl = file.url
      this.previewVisible = true
    },

    handleRemove(file) {
      const currentIds = Array.isArray(this.value) ? [...this.value] : (this.value ? [this.value] : [])
      const index = currentIds.findIndex(id => String(id) === String(file.id))

      if (index > -1) {
        if (this.limit === 1) {
          this.$emit('input', '')
        } else {
          currentIds.splice(index, 1)
          this.$emit('input', currentIds)
        }
      }
    }
  }
}
</script>
