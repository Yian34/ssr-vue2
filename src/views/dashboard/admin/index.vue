<template>
  <div class="dashboard-editor-container">

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'

const lineChartData = {
  newVisitis: {
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart
  },
  data() {
    return {
      lineChartData: lineChartData.newVisitis
    }
  },
  async created() {
    // const username = this.$store.state.user.username
    // const password = this.$store.state.user.password
    const loginState = this.$cloudbase.auth().hasLoginState()

    if (loginState) {
      // 登录态有效
      this.fetchData()
    } else {
      // 没有登录态，或者登录态已经失效
      await this.$store.dispatch('user/logout')
      this.$cloudbase.auth({ persistence: 'local' }).signOut()
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
    // this.$cloudbase.auth({ persistence: 'local' }).signInWithEmailAndPassword(username, password)
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
    async fetchData() {
      const db = this.$cloudbase.database()
      const _ = db.command
      let January = 0; let February = 0; let March = 0; let April = 0; let May = 0; let June = 0; let July = 0; let August = 0; let September = 0; let October = 0; let November = 0; let December = 0
      const year = new Date().getFullYear()
      const order = await this.$cloudbase.database().collection('order').where(
        {
          createdate: _.gt(new Date(year, 1, 1))
        }
      ).get()
      for (const item of order.data) {
        if (item.createdate.getMonth() === 0) {
          January += item.discountprice
        }
        if (item.createdate.getMonth() === 1) {
          February += item.discountprice
        }
        if (item.createdate.getMonth() === 2) {
          March += item.discountprice
        }
        if (item.createdate.getMonth() === 3) {
          April += item.discountprice
        }
        if (item.createdate.getMonth() === 4) {
          May += item.discountprice
        }
        if (item.createdate.getMonth() === 5) {
          June += item.discountprice
        }
        if (item.createdate.getMonth() === 6) {
          July += item.discountprice
        }
        if (item.createdate.getMonth() === 7) {
          August += item.discountprice
        }
        if (item.createdate.getMonth() === 8) {
          September += item.discountprice
        }
        if (item.createdate.getMonth() === 9) {
          October += item.discountprice
        }
        if (item.createdate.getMonth() === 10) {
          November += item.discountprice
        }
        if (item.createdate.getMonth() === 11) {
          December += item.discountprice
        }
      }
      console.log(January, February, March, April, May, June, July, August, September, October, November, December)
      this.lineChartData = {
        actualData: [January, February, March, April, May, June, July, August, September, October, November, December]
      }
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
