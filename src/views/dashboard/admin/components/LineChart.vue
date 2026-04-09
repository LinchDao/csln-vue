<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import * as echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions({ xAxisData, orderAmountData, orderQtyData, shippedQtyData } = {}) {
      this.chart.setOption({
        xAxis: {
          data: xAxisData || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: [
          {
            type: 'value',
            name: '订单金额',
            axisTick: {
              show: false
            }
          },
          {
            type: 'value',
            name: '数量',
            axisTick: {
              show: false
            }
          }
        ],
        legend: {
          data: ['订单金额', '当日订单件数', '当日出库数量']
        },
        series: [
          {
            name: '订单金额',
            yAxisIndex: 0,
            itemStyle: {
              normal: {
                color: '#FF005A',
                lineStyle: {
                  color: '#FF005A',
                  width: 2
                }
              }
            },
            smooth: true,
            type: 'line',
            data: orderAmountData,
            animationDuration: 2800,
            animationEasing: 'cubicInOut'
          },
          {
            name: '当日订单件数',
            yAxisIndex: 1,
            itemStyle: {
              normal: {
                color: '#3888fa',
                lineStyle: {
                  color: '#3888fa',
                  width: 2
                }
              }
            },
            smooth: true,
            type: 'line',
            data: orderQtyData,
            animationDuration: 2800,
            animationEasing: 'quadraticOut'
          },
          {
            name: '当日出库数量',
            yAxisIndex: 1,
            itemStyle: {
              normal: {
                color: '#f4516c',
                lineStyle: {
                  color: '#f4516c',
                  width: 2
                }
              }
            },
            smooth: true,
            type: 'line',
            data: shippedQtyData,
            animationDuration: 2800,
            animationEasing: 'quadraticOut'
          }
        ]
      }, true)
    }
  }
}
</script>
