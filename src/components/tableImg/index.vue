<template>
  <div class="table-image-container">
    <!-- 有图片ID且加载成功时展示图片 -->
    <el-image
      v-if="imageId && imageBlobUrl"
      :src="imageBlobUrl"
      fit="cover"
      :style="{ width: imageWidth + 'px', height: imageHeight + 'px' }"
      class="clickable-image"
      @error="handleImageError"
      @click="openFullScreen"
    >
      <!-- 图片加载失败占位 -->
      <template #error>
        <div class="image-slot" :style="{ width: imageWidth + 'px', height: imageHeight + 'px', fontSize: iconSize + 'px' }">
          <i class="el-icon-picture-outline" />
        </div>
      </template>
      <!-- 图片加载中占位 -->
      <template #placeholder>
        <div class="image-slot" :style="{ width: imageWidth + 'px', height: imageHeight + 'px', fontSize: iconSize + 'px' }">
          <i class="el-icon-loading" />
        </div>
      </template>
    </el-image>

    <!-- 无图片时显示提示 -->
    <span v-else class="no-image-text">{{ emptyText }}</span>

    <!-- 全屏展示遮罩层 -->
    <div v-if="isFullScreen" class="fullscreen-mask" @click="closeFullScreen">
      <div class="fullscreen-content" @click.stop>
        <el-button
          class="close-btn"
          icon="el-icon-close"
          circle
          @click="closeFullScreen"
        />
        <img
          :src="imageBlobUrl"
          alt="全屏图片"
          class="fullscreen-img"
          :style="{ maxWidth: '90vw', maxHeight: '90vh' }"
        >
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'TableImage',
  props: {
    // 图片ID（核心属性，对应后端的fileId）
    imageId: {
      type: [String, Number],
      default: ''
    },
    // 无图片时的提示文字
    emptyText: {
      type: String,
      default: '暂无图片'
    },
    // 图片宽度（外部可配置）
    imageWidth: {
      type: Number,
      default: 60
    },
    // 图片高度（外部可配置）
    imageHeight: {
      type: Number,
      default: 60
    }
  },
  data() {
    return {
      imageBlobUrl: '', // 转换后的图片Blob URL
      abortController: null, // 用于取消请求
      isFullScreen: false // 控制全屏展示的显隐
    }
  },
  computed: {
    // 自动计算占位图标大小
    iconSize() {
      return Math.min(this.imageWidth, this.imageHeight) / 2
    },
    // 完整的下载接口地址
    downloadApiUrl() {
      return `/erp-service/erp/file/download/${this.imageId}`
    }
  },
  watch: {
    // 监听 imageId 变化，支持组件复用时的更新
    imageId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadImage()
        } else {
          this.cleanup()
        }
      }
    }
  },
  beforeDestroy() {
    this.cleanup()
  },
  methods: {
    // 清理资源
    cleanup() {
      if (this.imageBlobUrl) {
        URL.revokeObjectURL(this.imageBlobUrl)
        this.imageBlobUrl = ''
      }
      if (this.abortController) {
        this.abortController.abort()
        this.abortController = null
      }
    },
    // 加载图片
    async loadImage() {
      if (!this.imageId) return

      // 先清理旧请求和 URL
      this.cleanup()

      try {
        this.abortController = new AbortController()

        // 发起请求：以blob形式接收/download接口的文件流
        const data = await request({
          url: this.downloadApiUrl,
          method: 'get',
          responseType: 'blob',
          signal: this.abortController.signal
        })

        // 校验：如果后端报错返回了 JSON 包装在 Blob 中
        if (data.type === 'application/json') {
          throw new Error('Invalid image data (JSON error)')
        }

        // 将blob转换为可预览的URL
        this.imageBlobUrl = URL.createObjectURL(data)
      } catch (error) {
        // 忽略取消请求的错误
        if (error.name !== 'AbortError') {
          console.error(`图片 [${this.imageId}] 加载失败：`, error)
          this.imageBlobUrl = ''
        }
      }
    },
    // 图片加载失败处理
    handleImageError() {
      this.imageBlobUrl = ''
    },
    // 打开全屏展示
    openFullScreen() {
      if (!this.imageBlobUrl) return
      this.isFullScreen = true
      document.body.style.overflow = 'hidden'
    },
    // 关闭全屏展示
    closeFullScreen() {
      this.isFullScreen = false
      document.body.style.overflow = ''
    }
  }
}
</script>

<style scoped>
/* 容器样式 */
.table-image-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

/* 可点击图片样式 */
.clickable-image {
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-image:hover {
  transform: scale(1.05);
}

/* 图片占位样式 */
.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  border-radius: 4px;
}

/* 无图片提示文字 */
.no-image-text {
  color: #909399;
  font-size: 12px;
}

/* 全屏遮罩层 */
.fullscreen-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 全屏内容容器 */
.fullscreen-content {
  position: relative;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: -20px;
  right: -20px;
  background-color: #fff;
  width: 40px;
  height: 40px;
  z-index: 10000;
}

/* 全屏图片样式 */
.fullscreen-img {
  object-fit: contain;
}
</style>
