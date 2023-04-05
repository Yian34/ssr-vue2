<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="姓名" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.telphone" placeholder="电话" style="width: 200px;margin-left:10px;margin-right:10px" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
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
      <el-table-column label="性别" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.sex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年龄" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.age }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="电话" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.telphone }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="余额" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.balance }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="350" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status==1" icon="el-icon-s-management" size="mini" type="success" @click="handleAdd(row,$index)">
            充值
          </el-button>
          <el-button v-if="row.status==1" icon="el-icon-view" size="mini" type="success" @click="handleView(row)">
            充值记录
          </el-button>
          <el-button v-if="row.status==1" icon="el-icon-view" size="mini" type="success" @click="handleReduceView(row)">
            消费记录
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogAddFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 500px; margin-left:50px;">
        <el-form-item v-if="show" label="ID" prop="_id">
          <el-input v-model="temp._id" />
        </el-form-item>
        <el-form-item label="姓名">
          {{ temp.name }}
        </el-form-item>
        <el-form-item label="电话">
          {{ temp.telphone }}
        </el-form-item>
        <el-form-item label="开卡日期">
          {{ temp.registerdate }}
        </el-form-item>
        <el-form-item label="余额">
          {{ temp.balance }}
        </el-form-item>
        <el-form-item label="充值金额" prop="addmoney">
          <el-input v-model.number="temp.addmoney" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="addMoney()">
          保存
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPvVisible" title="充值记录查看">
      <el-row>
        <el-col :span="12"><div class="grid-content">姓名:{{ temp.name }}</div></el-col>
        <el-col :span="12"><div class="grid-content">性别:{{ temp.sex }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><div class="grid-content">年龄:{{ temp.age }}</div></el-col>
        <el-col :span="12"><div class="grid-content">电话:{{ temp.telphone }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"><div class="grid-content">地址:{{ temp.address }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><div class="grid-content">余额:{{ temp.balance }}</div></el-col>
        <el-col :span="12"><div class="grid-content">开卡日期:{{ temp.registerdate }}</div></el-col>
      </el-row>
      <el-table :data="temp.addrecord" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="adddate" label="充值日期" :formatter="dateFormatter" :sortable="true" :sort-method="sortByDate" />
        <el-table-column prop="name" label="充值金额">
          <template slot-scope="scope">
            {{ scope.row.addmoney }}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogReduceVisible" title="消费记录查看">
      <el-row>
        <el-col :span="12"><div class="grid-content">姓名:{{ temp.name }}</div></el-col>
        <el-col :span="12"><div class="grid-content">性别:{{ temp.sex }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><div class="grid-content">年龄:{{ temp.age }}</div></el-col>
        <el-col :span="12"><div class="grid-content">电话:{{ temp.telphone }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"><div class="grid-content">地址:{{ temp.address }}</div></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><div class="grid-content">余额:{{ temp.balance }}</div></el-col>
        <el-col :span="12"><div class="grid-content">开卡日期:{{ temp.registerdate }}</div></el-col>
      </el-row>
      <el-table :data="temp.reducecorde" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="reducedate" label="消费日期" :formatter="dateReduceFormatter" :sortable="true" :sort-method="sortByDate" />
        <el-table-column prop="reducemoney" label="消费金额">
          <template slot-scope="scope">
            {{ scope.row.reducemoney }}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogReduceVisible = false">关闭</el-button>
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
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
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
      options: ['男', '女', '其他'],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        _id: undefined,
        name: '',
        sex: '',
        age: '',
        telphone: '',
        address: '',
        status: 0
      },
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '新增用户',
        add: '充值'
      },
      dialogPvVisible: false,
      dialogReduceVisible: false,
      pvData: [],
      rules: {
        addmoney: [{ required: true, type: 'number', message: '金额必须为数字', trgger: 'blur' }]
      },
      dialogFormVisible: false,
      dialogAddFormVisible: false,
      downloadLoading: false
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
      const queryString = { status: 1 }
      if (this.listQuery.name) {
        queryString.name = this.listQuery.name
      }
      if (this.listQuery.telphone) {
        queryString.telphone = this.listQuery.telphone
      }
      const queryResult = await this.$cloudbase.database().collection('customer').where(queryString).skip((this.listQuery.page - 1) * this.listQuery.limit).limit(this.listQuery.limit).orderBy('createdate', 'desc').get()
      const queryTotal = await this.$cloudbase.database().collection('customer').where(queryString).count()
      this.list = queryResult.data
      this.listLoading = false
      this.total = queryTotal.total
      /* getList().then(response => {
        this.list = response.data.items
        this.listLoading = false
      })*/
    },
    handleFilter() {
      this.fetchData()
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['姓名', '性别', '年龄', '电话', '联系地址']
        const filterVal = ['name', 'sex', 'age', 'telphone', 'address']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '用户列表'
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
    addMoney() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const newbalance = this.temp.balance + this.temp.addmoney
          let record = []
          if (this.temp.addrecord) {
            record = this.temp.addrecord
          }
          record.push({
            adddate: new Date(),
            addmoney: this.temp.addmoney
          })
          this.$cloudbase.database().collection('customer').doc(this.temp._id).update({
            balance: newbalance,
            addrecord: record

          }).then(res => {
            const index = this.list.findIndex(v => v._id === this.temp._id)
            this.list.splice(index, 1, this.temp)
            this.dialogAddFormVisible = false
            this.$notify({
              title: '操作提示',
              message: '充值成功',
              type: 'success',
              duration: 2000
            })
            this.fetchData()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    handleView(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.registerdate = parseTime(this.temp.registerdate, '{y}-{m}-{d}')
      this.pvData = this.temp.items
      this.dialogPvVisible = true
    },
    handleReduceView(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.registerdate = parseTime(this.temp.registerdate, '{y}-{m}-{d}')
      this.pvData = this.temp.items
      this.dialogReduceVisible = true
    },
    handleAdd(row) {
      this.temp = Object.assign({}, row)
      this.temp.registerdate = parseTime(this.temp.registerdate, '{y}-{m}-{d}')
      this.dialogAddFormVisible = true
    },
    dateFormatter(row, column) {
      const datetime = parseTime(row.adddate, '{y}-{m}-{d}')
      return datetime
    },
    dateReduceFormatter(row, column) {
      const datetime = parseTime(row.reducedate, '{y}-{m}-{d}')
      return datetime
    },
    sortByDate(obj1, obj2) {
      const val1 = obj1.adddate
      const val2 = obj2.adddate
      return val1 - val2
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
