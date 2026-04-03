<template>
  <el-dialog
    title="子订单发货"
    width="500px"
    :visible="true"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <el-form
      ref="shipForm"
      :model="form"
      label-width="100px"
      label-position="right"
      :rules="rules"
    >
      <el-form-item label="配送方式" prop="deliveryType">
        <el-select v-model="form.deliveryType" placeholder="请选择配送方式">
          <!-- 从Vuex字典获取配送方式选项 -->
          <el-option
            v-for="item in deliveryTypes"
            :key="item.dictValue"
            :label="item.dictName"
            :value="item.dictValue.toString()"
          /></el-select>
      </el-form-item>
      <!-- 快递配送：显示快递单号，隐藏手机号 -->
      <el-form-item v-if="form.deliveryType === '0'" label="快递单号" prop="expressNo">
        <el-input v-model="form.expressNo" placeholder="请输入快递单号" clearable />
      </el-form-item>
      <!-- 自提/专车配送：显示手机号，隐藏快递单号 -->
      <el-form-item v-if="form.deliveryType === '1' || form.deliveryType === '2'" label="手机号码" prop="driverPhone">
        <el-input v-model="form.driverPhone" placeholder="请输入联系手机号" clearable />
      </el-form-item>
      <el-form-item label="实际发货时间" prop="actualSendDate">
        <el-date-picker
          v-model="form.actualSendDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择发货时间"
          clearable
        />
      </el-form-item>
      <el-form-item label="配送备注" prop="deliveryRemark">
        <el-input
          v-model="form.deliveryRemark"
          type="textarea"
          rows="3"
          placeholder="请输入配送备注（选填）"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="handleShip">确认发货</el-button>
    </div>
  </el-dialog>
</template>
<script>
import request from '@/utils/request'
export default {
  name: 'OrderSubShipDialog',
  props: {
    // 父组件传递的子订单ID
    orderSubId: {
      type: String,
      required: true
    }
  },
  data() {
    // 生成默认日期（格式：yyyy-MM-dd，无时间部分）
    const now = new Date()
    const defaultDate = now.getFullYear() + '-' +
      (now.getMonth() + 1).toString().padStart(2, '0') + '-' +
      now.getDate().toString().padStart(2, '0')

    return {
      form: {
        deliveryType: '', // 0-快递 1-自提 2-专车（与字典dictValue对应）
        expressNo: '',
        driverPhone: '',
        actualSendDate: defaultDate, // 默认当前日期（yyyy-MM-dd）
        deliveryRemark: ''
      },
      rules: {
        deliveryType: [{ required: true, message: '请选择配送方式', trigger: 'change' }],
        expressNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }],
        driverPhone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        actualSendDate: [{ required: true, message: '请选择实际发货时间', trigger: 'change' }]
      }
    }
  },
  computed: {
    // 从Vuex获取配送方式字典（与详情页/列表页保持一致）
    deliveryTypes() {
      return this.$store.getters['dict/getDeliveryTypes'] || []
    }
  },
  methods: {
    handleShip() {
      this.$refs.shipForm.validate((valid) => {
        if (!valid) return
        // 构造请求参数：actualSendDate已为yyyy-MM-dd格式
        const params = {
          orderSubId: this.orderSubId,
          deliveryType: Number(this.form.deliveryType), // 转为数字，匹配后端参数类型
          expressNo: this.form.expressNo || '',
          driverPhone: this.form.driverPhone || '',
          deliveryRemark: this.form.deliveryRemark || '',
          actualSendDate: this.form.actualSendDate // 直接传递yyyy-MM-dd格式
        }
        // 调用发货接口
        request({
          url: '/api/order/sub/ship',
          method: 'post',
          data: params
        }).then(() => {
          this.$message.success('发货成功')
          this.$emit('confirm') // 通知父组件刷新数据
        }).catch(error => {
          console.error('子订单发货失败：', error)
          this.$message.error('发货失败，请重试')
        })
      })
    }
  }
}
</script>
