<template>
  <div v-loading="loading" class="pdf-preview-container">
    <iframe
      v-if="pdfUrl"
      :src="pdfUrl"
      width="100%"
      height="100%"
      frameborder="0"
      class="pdf-iframe"
    />
    <div v-else-if="!loading" class="empty-state">
      <el-empty description="无法加载 PDF 文件" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'PdfPreview',
  data() {
    return {
      loading: false,
      pdfUrl: null
    }
  },
  computed: {
    fileId() {
      if (this.$route.params.id) return this.$route.params.id
      if (this.$route.query.id) return this.$route.query.id

      const pathSegments = this.$route.path.split('/')
      return pathSegments[pathSegments.length - 1]
    }
  },
  watch: {
    // 监听 ID 变化，支持在同一组件内切换不同的 PDF
    fileId: {
      handler(val) {
        if (val) {
          this.fetchPdf()
        } else {
          this.pdfUrl = null
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    // 释放内存，防止内存泄漏
    if (this.pdfUrl) {
      window.URL.revokeObjectURL(this.pdfUrl)
    }
  },
  methods: {
    async fetchPdf() {
      this.loading = true
      try {
        const response = await request({
          url: `/erp-service/erp/file/download/${this.fileId}`,
          method: 'get',
          responseType: 'blob'
        })

        // 验证返回的是内容是否为 PDF（可选，增强健壮性）
        const blob = new Blob([response], { type: 'application/pdf' })
        this.pdfUrl = window.URL.createObjectURL(blob)
      } catch (error) {
        console.error('PDF 加载失败:', error)
        this.$message.error('PDF 加载失败，请检查文件 ID 是否正确')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pdf-preview-container {
  width: 100%;
  height: calc(100vh - 84px);
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;

  .pdf-iframe {
    flex: 1;
    border: none;
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}
</style>
