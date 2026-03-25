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
      previewUrl: ''
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
      handler(val) {
        if (!val) {
          this.fileList = []
          return
        }
        const ids = Array.isArray(val) ? val : [val]
        this.fileList = ids.map(id => ({
          url: `/api/erp/file/download/${id}`
        }))
      }
    }
  },
  methods: {
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件！')
        return false
      }
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB！')
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
          url: '/api/erp/file/upload',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const fileId = res.data
        onSuccess()
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

    handleRemove(file, fileList) {
      if (this.limit === 1) {
        this.$emit('input', '')
      } else {
        const currentIds = Array.isArray(this.value) ? [...this.value] : []
        const index = this.fileList.findIndex(item => item.uid === file.uid)
        if (index > -1) currentIds.splice(index, 1)
        this.$emit('input', currentIds)
      }
    }
  }
}
</script>
