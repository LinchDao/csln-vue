<template>
  <div class="dashboard-editor-container">

    <panel-group :panel-data="panelData" @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <!-- <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart :chart-data="raddarData" />
        </div>
      </el-col> -->
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <pie-chart :chart-data="pieData" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <bar-chart :chart-data="barData" />
        </div>
      </el-col>
    </el-row>

    <!-- <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
        <transaction-table />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <todo-list />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <box-card />
      </el-col>
    </el-row> -->
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
// import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
// import TransactionTable from './components/TransactionTable'
// import TodoList from './components/TodoList'
// import BoxCard from './components/BoxCard'

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart,
    // RaddarChart,
    PieChart,
    BarChart
    // TransactionTable,
    // TodoList,
    // BoxCard
  },
  data() {
    return {
      lineChartData: {
        xAxisData: [],
        orderAmountData: [],
        orderQtyData: [],
        shippedQtyData: []
      },
      raddarData: {
        indicator: [
          { name: 'Sales', max: 10000 },
          { name: 'Administration', max: 20000 },
          { name: 'Information Technology', max: 20000 },
          { name: 'Customer Support', max: 20000 },
          { name: 'Development', max: 20000 },
          { name: 'Marketing', max: 20000 }
        ],
        seriesData: [
          {
            value: [5000, 7000, 12000, 11000, 15000, 14000],
            name: 'Allocated Budget'
          },
          {
            value: [4000, 9000, 15000, 15000, 13000, 11000],
            name: 'Expected Spending'
          },
          {
            value: [5500, 11000, 12000, 15000, 12000, 12000],
            name: 'Actual Spending'
          }
        ]
      },
      pieData: [],
      panelData: {
        customerCount: 0,
        totalOrderAmount: 0,
        pendingShipmentQty: 0,
        shippedQty: 0
      },
      barData: {
        xAxisData: [],
        seriesData: []
      }
    }
  },
  created() {
    this.fetchLineChartData()
    this.fetchPieChartData()
    this.fetchPanelGroupData()
    this.fetchBarChartData()
  },
  methods: {
    handleSetLineChartData(type) {
      // Data is dynamically loaded
    },
    fetchBarChartData() {
      import('@/utils/request').then(({ default: request }) => {
        request({
          url: '/erp-service/statistics/top-customers-last-month',
          method: 'get'
        }).then(response => {
          const resData = response.data || response
          if (Array.isArray(resData)) {
            const xAxisData = resData.map(item => item.customerName)
            const orderAmountData = resData.map(item => item.orderAmount || 0)
            const totalQtyData = resData.map(item => {
              return (item.topProducts || []).reduce((sum, p) => sum + (p.qty || 0), 0)
            })

            this.barData = {
              xAxisData,
              seriesData: [
                {
                  name: '订单金额',
                  type: 'bar',
                  data: orderAmountData,
                  yAxisIndex: 0,
                  animationDuration: 6000
                },
                {
                  name: '下单数量',
                  type: 'bar',
                  data: totalQtyData,
                  yAxisIndex: 1,
                  animationDuration: 6000
                }
              ]
            }
          }
        }).catch(error => {
          console.error('获取柱状图数据失败:', error)
        })
      })
    },
    fetchPanelGroupData() {
      import('@/utils/request').then(({ default: request }) => {
        request({
          url: '/erp-service/statistics/summary',
          method: 'get'
        }).then(response => {
          const resData = response.data || response
          if (resData) {
            this.panelData = {
              customerCount: resData.customerCount || 0,
              totalOrderAmount: resData.totalOrderAmount || 0,
              pendingShipmentQty: resData.pendingShipmentQty || 0,
              shippedQty: resData.shippedQty || 0
            }
          }
        }).catch(error => {
          console.error('获取统计概览数据失败:', error)
        })
      })
    },
    fetchPieChartData() {
      import('@/utils/request').then(({ default: request }) => {
        request({
          url: '/erp-service/statistics/top-products-last-month',
          method: 'get'
        }).then(response => {
          const resData = response.data || response
          if (Array.isArray(resData)) {
            this.pieData = resData.map(item => ({
              name: item.productNo || item.productName,
              value: item.qty || 0
            }))
          }
        }).catch(error => {
          console.error('获取饼图数据失败:', error)
        })
      })
    },
    fetchLineChartData() {
      import('@/utils/request').then(({ default: request }) => {
        request({
          url: '/erp-service/statistics/daily-sales',
          method: 'get'
        }).then(response => {
          const resData = response.data || response
          if (Array.isArray(resData)) {
            const xAxisData = []
            const orderAmountData = []
            const orderQtyData = []
            const shippedQtyData = []

            resData.forEach(item => {
              // Handle formatting "03=25" to "03-25"
              const day = item.day ? item.day.replace('=', '-') : ''
              xAxisData.push(day)
              orderAmountData.push(item.salesAmount || 0)
              orderQtyData.push(item.salesQty || 0)
              shippedQtyData.push(item.shipmentQty || 0)
            })

            this.lineChartData = {
              xAxisData,
              orderAmountData,
              orderQtyData,
              shippedQtyData
            }
          }
        }).catch(error => {
          console.error('获取折线图数据失败:', error)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
