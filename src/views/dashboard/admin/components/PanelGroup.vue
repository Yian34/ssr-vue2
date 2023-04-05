<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            客户数量
          </div>
          <span class="card-panel-num">{{ customer }}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('messages')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="list" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            商品数量
          </div>
          <span class="card-panel-num">{{ product }}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('purchases')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            订单金额
          </div>
          <span class="card-panel-num">{{ totalPrice }}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('shoppings')">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon icon-class="shopping" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            订单数量
          </div>
          <span class="card-panel-num">{{ totalCount }}</span>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>

export default {
  data() {
    return {
      customer: 0,
      product: 0,
      totalPrice: 0,
      totalCount: 0
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
      this.$emit('handleSetLineChartData', type)
    },
    async fetchData() {
      const queryCustomerTotal = await this.$cloudbase.database().collection('customer').count()
      const queryOrderTotal = await this.$cloudbase.database().collection('order').count()
      const queryProduct = await this.$cloudbase.database().collection('product').count()
      const orders = await this.$cloudbase.database().collection('order').get()
      let price = 0
      for (const order of orders.data) {
        price += order.totalprice
      }
      this.customer = queryCustomerTotal.total
      this.totalCount = queryOrderTotal.total
      this.product = queryProduct.total
      this.totalPrice = price
      console.log(this.customer)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
