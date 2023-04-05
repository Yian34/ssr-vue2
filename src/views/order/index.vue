<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="姓名" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.telphone" placeholder="电话" style="width: 200px;margin-left:10px;margin-right:10px" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" clearable class="filter-item" style="width: 200px;margin-left:10px;margin-right:10px" placeholder="请选择状态">
        <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="show" label="ID" prop="_id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="电话" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.telphone }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="联系地址" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单金额" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.totalprice }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="订单状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status=='待支付'" type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status=='待支付'" size="mini" type="danger" @click="selectPay(row)">
            支付
          </el-button>
          <el-button v-if="row.status=='待支付'" size="mini" type="warning" @click="handleCancle(row,$index)">
            取消
          </el-button>
          <el-button v-if="row.status!='待支付'" size="mini" type="success" @click="handleView(row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-dialog
        width="60%"
        title="选择商品"
        :visible.sync="innerVisible"
        append-to-body
        lock-scroll
      >
        <el-tabs :tab-position="tabPosition">
          <el-tab-pane v-for="(item,index) in tabOptions" :key="index" :label="item.name">
            <el-row v-for="o in item.row" :key="o" :gutter="12">
              <el-col v-for="(product,pindex) in item.products" v-if="pindex>=(o-1)*3&&pindex<((o-1)*3+3)" :key="pindex" style="margin-bottom:10px" :span="8">
                <el-card v-show="pindex>=(o-1)*3&&pindex<((o-1)*3+3)" shadow="always">
                  <div class="el-form-item el-form-item--mini" style="text-align:center;margin-bottom:5px">
                    <label class="el-form-item__label" style="text-align:center;width: 206px;">{{ product.name }}</label>
                  </div>
                  <div class="el-form-item el-form-item--mini">
                    <label class="el-form-item__label" style="width: 80px;">规格：</label>
                    <div class="el-form-item__content" style="margin-left:80px">
                      <el-select v-if="product.skus.length>0" v-model="product.price" size="mini" placeholder="请选择规格">
                        <el-option
                          v-for="sku in product.skus"
                          :key="sku.price"
                          :label="sku.name"
                          :value="sku.price"
                        />
                      </el-select>
                    </div>
                    <div class="el-form-item el-form-item--mini">
                      <label class="el-form-item__label" style="width: 80px;">价格：</label>
                      <div class="el-form-item__content" style="margin-left:80px">
                        {{ product.price }}
                      </div>
                    </div>
                    <div class="el-form-item el-form-item--mini">
                      <label class="el-form-item__label" style="width: 80px;">数量：</label>
                      <div class="el-form-item__content" style="margin-left:80px">
                        <el-input-number v-model="product.num" size="mini" :min="0" label="描述文字" />
                      </div>
                    </div>
                  </div></el-card>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
        <div slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="selectProduct()">
            确定
          </el-button>
        </div>
      </el-dialog>
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 550px; margin-left:50px;">
        <el-form-item v-if="show" label="ID" prop="_id">
          <el-input v-model="temp._id" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-autocomplete
            v-model="temp.name"
            class="inline-input"
            :fetch-suggestions="querySearch"
            placeholder="请输入内容"
            :trigger-on-focus="false"
            prop="name"
            @select="handleSelect"
          />
        </el-form-item>
        <el-form-item label="电话" prop="telphone">
          <el-input v-model="temp.telphone" />
        </el-form-item>
        <el-form-item label="送货地址">
          <el-input v-model="temp.address" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入地址" />
        </el-form-item>
        <div>
          <el-link icon="el-icon-shopping-cart-1" @click="chooseProduct">商品明细</el-link>
        </div>
        <el-table
          :data="products"
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="名称"
            width="180"
          />
          <el-table-column
            prop="num"
            label="数量"
            width="180"
          />
          <el-table-column
            prop="price"
            label="价格"
          />
          <el-table-column
            prop="money"
            label="金额"
          />
        </el-table>
        <el-form-item label="订单金额" prop="totalprice">
          <el-input v-model="temp.totalprice" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="优惠金额" prop="discountprice">
          <el-input v-model="temp.discountprice" placeholder="请输入优惠后的金额" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </el-button>
        <el-button type="primary" @click="chooseProduct">选择商品</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPayVisible" title="订单支付">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 550px; margin-left:50px;">
        <el-form-item label="姓名">
          {{ temp.name }}
        </el-form-item>
        <el-form-item label="电话">
          {{ temp.telphone }}
        </el-form-item>
        <el-form-item label="订单金额">
          {{ temp.totalprice }}
        </el-form-item>
        <el-form-item label="优惠金额">
          {{ temp.discountprice }}
        </el-form-item>
        <el-form-item label="支付方式" prop="paytype">
          <el-select v-model="temp.paytype" class="filter-item" placeholder="请选择">
            <el-option v-for="item in options" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="temp.paytype=='会员卡'" label="余额">
          {{ temp.balance }}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPayVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handlePay">
          保存
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPvVisible" title="订单查看">
      <el-row>
        <el-col :span="12"><div class="grid-content">订单编号:{{ temp.no }}</div></el-col>
        <el-col :span="12"><div class="grid-content">订单状态:{{ temp.status }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><div class="grid-content">姓名:{{ temp.name }}</div></el-col>
        <el-col :span="12"><div class="grid-content">电话:{{ temp.telphone }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"><div class="grid-content">地址:{{ temp.address }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><div class="grid-content">订单金额:{{ temp.totalprice }}</div></el-col>
        <el-col :span="12"><div class="grid-content">优惠金额:{{ temp.discountprice }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><div class="grid-content">支付方式:{{ temp.paytype }}</div></el-col>
      </el-row>
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column type="index" label="序号" width="50" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="num" label="数量" />
        <el-table-column prop="money" label="金额" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import { getList } from '@/api/customer'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        '已支付': 'success',
        '待支付': 'gray',
        '已取消': 'danger'
      }
      return statusMap[status]
    }
  },
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      listLoading: true,
      show: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        name: undefined,
        telphone: undefined
      },
      statusOptions: ['待支付', '已支付', '已取消'],
      temp: {
        _id: undefined,
        name: '',
        telphone: '',
        address: '',
        items: [{
          productname: '',
          productprice: '',
          productnum: '',
          money: ''
        }],
        totalprice: 0
      },
      dialogStatus: '',
      textMap: {
        update: '编辑订单',
        create: '新增订单'
      },
      dialogPvVisible: false,
      pvData: [],
      dialogFormVisible: false,
      downloadLoading: false,
      dialogPayVisible: false,
      innerVisible: false,
      tabPosition: 'top',
      tabOptions: [],
      products: [],
      options: ['微信', '支付宝', '现金', '会员卡'],
      rules: {
        name: [{ required: true, message: '姓名是必录项', trigger: 'blur' }],
        paytype: [{ required: true, message: '支付方式是必录项', trigger: 'blur' }],
        totalprice: [{ required: true, message: '订单金额是必录项', trigger: 'blur' }],
        discountprice: [{ required: true, message: '优惠金额是必录项', trigger: 'blur' }]
      }
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
    async fetchData() {
      this.listLoading = true
      const queryString = {}
      if (this.listQuery.name) {
        queryString.name = this.listQuery.name
      }
      if (this.listQuery.telphone) {
        queryString.telphone = this.listQuery.telphone
      }
      if (this.listQuery.status) {
        queryString.status = this.listQuery.status
      }
      const queryResult = await this.$cloudbase.database().collection('order').where(queryString).skip((this.listQuery.page - 1) * this.listQuery.limit).limit(this.listQuery.limit).orderBy('createdate', 'desc').get()
      const queryTotal = await this.$cloudbase.database().collection('order').where(queryString).count()
      this.list = queryResult.data
      console.log(this.list)
      this.listLoading = false
      this.total = queryTotal.total
    },
    resetTemp() {
      this.temp = {
        _id: undefined,
        no: '',
        name: '',
        telphone: '',
        address: '',
        items: [],
        totalprice: '',
        discountprice: '',
        status: ''
      }
      this.products = []
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          this.temp.status = '待支付'
          this.temp.no = parseTime(new Date(), '{y}{m}{d}') + (++this.total).toString().padStart(5, '0')
          this.$cloudbase.database().collection('order').add({
            no: this.temp.no,
            name: this.temp.name,
            telphone: this.temp.telphone,
            address: this.temp.address,
            items: this.products,
            totalprice: this.temp.totalprice,
            discountprice: this.temp.discountprice,
            status: this.temp.status,
            createdate: new Date()
          }).then((res) => {
            this.temp._id = res.id
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '提示信息',
              message: '新增成功',
              type: 'success',
              duration: 2000
            })
            this.fetchData()
          }).catch((e) => {})
        }
      })
    },
    handleFilter() {
      this.fetchData()
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['姓名', '电话', '联系地址', '订单金额', '优惠金额']
        const filterVal = ['name', 'telphone', 'address', 'totalprice', 'discountprice']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '订单列表'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          this.$cloudbase.database().collection('order').doc(this.temp._id)
            .update({
              name: this.temp.name,
              telphone: this.temp.telphone,
              address: this.temp.address,
              itmes: this.products,
              totalprice: this.temp.totalprice,
              discountprice: this.temp.discountprice
            }).then(res => {
              const index = this.list.findIndex(v => v._id === this.temp._id)
              this.list.splice(index, 1, this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: '操作提示',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.products = this.temp.items
      console.log(this.temp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleView(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.pvData = this.temp.items
      this.dialogPvVisible = true
    },
    async handleDelete(row, index) {
      await this.$cloudbase.database().collection('order').doc(row._id).remove()
      this.$notify({
        title: '操作提示',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.fetchData()
    },
    async selectPay(row) {
      this.temp = Object.assign({}, row) // copy obj
      const telphone = this.temp.telphone
      const member = await this.$cloudbase.database().collection('customer').where({
        telphone: telphone
      }).get()
      console.log(this.temp)
      if (member.data) {
        this.temp.userid = member.data[0]._id
        this.temp.balance = member.data[0].balance
        if (member.data[0].reducecorde) {
          this.temp.reducecorde = member.data[0].reducecorde
        }
      }
      this.dialogPayVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handlePay(row, index) {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          console.log(this.temp.paytype)
          if (this.temp.paytype === '会员卡') {
            if (this.temp.balance >= this.temp.discountprice) {
              const newbalance = this.temp.balance - this.temp.discountprice
              let reducecorde = []
              if (this.temp.reducecorde) {
                reducecorde = this.temp.reducecorde
              }
              reducecorde.push({
                reducedate: new Date(),
                reducemoney: this.temp.discountprice
              })
              const paytype = this.temp.paytype
              const orderid = row._id
              console.log('orderid:' + orderid)
              this.$cloudbase.database().collection('customer').doc(this.temp.userid).update({
                balance: newbalance,
                reducecorde: reducecorde
              }).then((res) => {
                console.log(row._id)
                this.$cloudbase.database().collection('order').doc(this.temp._id).update({
                  paytype: paytype,
                  status: '已支付'
                }).then(res => {
                  this.$notify({
                    title: '操作提示',
                    message: '支付成功',
                    type: 'success',
                    duration: 2000
                  })
                  this.dialogPayVisible = false
                  this.fetchData()
                })
              })
            } else {
              this.$notify({
                title: '操作提示',
                message: '支付失败，余额不足',
                type: 'fail',
                duration: 2000
              })
              return false
            }
          } else {
            this.$cloudbase.database().collection('order').doc(this.temp._id).update({
              paytype: this.temp.paytype,
              status: '已支付'
            }).then(res => {
              this.$notify({
                title: '操作提示',
                message: '支付成功',
                type: 'success',
                duration: 2000
              })
              this.dialogPayVisible = false
              this.fetchData()
            })
          }
        }
      })
    },
    async handleCancle(row, index) {
      await this.$cloudbase.database().collection('order').doc(row._id).update({
        status: '已取消'
      })
      this.$notify({
        title: '操作提示',
        message: '取消成功',
        type: 'success',
        duration: 2000
      })
      this.fetchData()
    },
    addDomain() {
      this.temp.items.push({
        productname: '',
        productprice: '',
        productnum: '',
        money: ''
      })
    },
    removeDomain(item) {
      var index = this.temp.items.indexOf(item)
      if (index !== -1) {
        this.temp.items.splice(index, 1)
      }
    },
    async querySearch(queryString, cb) {
      const users = []
      await this.$cloudbase.database().collection('customer').where({
        name: queryString
      }).get().then((res) => {
        for (const item of res.data) {
          item.value = item.name + '  ' + item.telphone
          users.push(item)
        }
      })
      // var results = queryString ? users.filter(this.createFilter(queryString)) : users
      // 调用 callback 返回建议列表的数据
      cb(users)
    },
    handleSelect(item) {
      this.temp.name = item.name
      this.temp.telphone = item.telphone
      this.temp.address = item.address
    },
    async chooseProduct() {
      this.innerVisible = true
      const category = await this.$cloudbase.database().collection('category').orderBy('name', 'asc').get()
      const products = await this.$cloudbase.database().collection('product').orderBy('category', 'asc').get()
      for (const item of category.data) {
        const pitems = []
        for (const prdouct of products.data) {
          if (item.name === prdouct.category) {
            prdouct.num = 0
            pitems.push(prdouct)
          }
        }
        item.products = pitems
        item.row = Math.ceil(pitems.length / 3)
      }
      this.tabOptions = category.data
    },
    selectProduct() {
      this.products = []
      let totalPrice = 0
      for (const tab of this.tabOptions) {
        if (tab.products.length > 0) {
          for (const product of tab.products) {
            if (product.num > 0) {
              product.money = product.num * product.price
              this.products.push(product)
              totalPrice += product.money
            }
          }
        }
      }
      this.temp.totalprice = totalPrice
      this.temp.discountprice = totalPrice
      this.innerVisible = false
    }
  }
}
</script>
<style scoped>
.filter-container{
  padding-bottom:10px
}
.text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
  }
  .el-row {
    margin-bottom: 5px;
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
    font-size:16px;
    text-align: left;
    vertical-align: bottom;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
  .el-header, .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }

  .el-aside {
    background-color: #D3DCE6;
    color: #333;
    text-align: center;
    line-height: 200px;
  }

  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }

  body > .el-container {
    margin-bottom: 40px;
  }

  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }

  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
</style>
