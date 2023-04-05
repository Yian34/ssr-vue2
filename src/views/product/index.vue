<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="名称" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.category" clearable class="filter-item" style="width: 200px;margin-left:10px;margin-right:10px" placeholder="请选择类别">
        <el-option v-for="item in options" :key="item" :label="item" :value="item" />
      </el-select>
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
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="类别" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="库存" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.stock }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status=='待上架'" type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status=='待上架'" size="mini" icon="el-icon-delete" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button v-if="row.status=='已上架'" size="mini" icon="el-icon-bottom" type="danger" @click="cancelData(row,$index)">
            下架
          </el-button>
          <el-button v-if="row.status=='已下架'" size="mini" icon="el-icon-top" type="success" @click="republishData(row,$index)">
            上架
          </el-button>
          <el-button v-if="row.status=='已上架'||row.status=='已下架'" icon="el-icon-refresh-right" size="mini" type="warning" @click="resetData(row,$index)">
            撤销
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item v-if="show" label="ID" prop="_id">
          <el-input v-model="temp._id" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="temp.category" class="filter-item" placeholder="请选择">
            <el-option v-for="item in options" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="temp.price" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input v-model.number="temp.stock" />
        </el-form-item>

        <div>
          <el-link icon="el-icon-circle-plus-outline" @click="addDomain">规格</el-link>
        </div>
        <el-card v-for="(sku,index) in temp.skus" :key="index" class="box-card" style="margin-top:15px">
          <div slot="header" class="clearfix">
            <span>规格明细</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click.prevent="removeDomain(sku)">删除</el-button>
          </div>
          <div class="text item">

            <el-form-item label="名称">
              <el-input v-model="temp.skus[index].name" />
            </el-form-item>
            <el-form-item label="价格">
              <el-input v-model="temp.skus[index].price" />
            </el-form-item>
            <el-form-item label="库存">
              <el-input v-model="temp.skus[index].stock" />
            </el-form-item>
          </div>
        </el-card>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </el-button>
        <el-button v-if="textMap[dialogStatus]=='编辑'" type="danger" @click="publishData()">
          上架
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
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
        '已上架': 'success',
        '待上架': 'gray',
        '已下架': 'danger'
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
        category: undefined,
        status: undefined
      },
      options: [],
      statusOptions: ['待上架', '已上架', '已下架'],
      temp: {
        _id: undefined,
        name: '',
        category: '',
        price: '',
        stock: '',
        status: '待上架'
      },
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '名称为必填项', trigger: 'blur' }],
        category: [{ required: true, message: '类别为必填项', trigger: 'blur' }],
        price: [{ type: 'number', message: '价格必须为数字', trgger: 'blur' }],
        stock: [{ type: 'number', message: '库存必须为数字', trgger: 'blur' }]
      },
      dialogFormVisible: false,
      downloadLoading: false
    }
  },
  async created() {
    // const username = this.$store.state.user.username
    // const password = this.$store.state.user.password
    const loginState = this.$cloudbase.auth().hasLoginState()

    if (loginState) {
      // 登录态有效
      const result = await this.$cloudbase.database().collection('category').get()
      for (const option of result.data) {
        this.options.push(option.name)
      }
      this.fetchData()
    } else {
      // 没有登录态，或者登录态已经失效
      console.log('未登录')
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
      if (this.listQuery.category) {
        queryString.category = this.listQuery.category
      }
      if (this.listQuery.status) {
        queryString.status = this.listQuery.status
      }
      const queryResult = await this.$cloudbase.database().collection('product').where(queryString).skip((this.listQuery.page - 1) * this.listQuery.limit).limit(this.listQuery.limit).orderBy('createdate', 'desc').get()
      const queryTotal = await this.$cloudbase.database().collection('product').where(queryString).count()
      this.list = queryResult.data
      this.listLoading = false
      this.total = queryTotal.total
    },
    resetTemp() {
      this.temp = {
        _id: undefined,
        name: '',
        category: '',
        price: 0,
        stock: 0,
        status: '待上架',
        skus: []
      }
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
          this.$cloudbase.database().collection('product').add({
            name: this.temp.name,
            category: this.temp.category,
            price: this.temp.price,
            stock: this.temp.stock,
            status: '待上架',
            skus: this.temp.skus,
            createdate: new Date()
          }).then((res) => {
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
        const tHeader = ['名称', '类别', '价格', '库存']
        const filterVal = ['name', 'category', 'price', 'stock']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '商品列表'
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
          console.log(this.dialogFormVisible)
          this.$cloudbase.database().collection('product').doc(this.temp._id)
            .update({
              name: this.temp.name,
              category: this.temp.category,
              price: this.temp.price,
              stock: this.temp.stock,
              skus: this.temp.skus
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
    publishData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          console.log(this.dialogFormVisible)
          this.temp.status = '已上架'
          this.$cloudbase.database().collection('product').doc(this.temp._id)
            .update({
              name: this.temp.name,
              category: this.temp.category,
              price: this.temp.price,
              stock: this.temp.stock,
              skus: this.temp.skus,
              status: this.temp.status
            }).then(res => {
              const index = this.list.findIndex(v => v._id === this.temp._id)
              this.list.splice(index, 1, this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: '操作提示',
                message: '上架成功',
                type: 'success',
                duration: 2000
              })
            })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      console.log(row)
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async handleDelete(row, index) {
      await this.$cloudbase.database().collection('product').doc(row._id).remove()
      this.$notify({
        title: '操作提示',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.fetchData()
    },
    async cancelData(row, index) {
      await this.$cloudbase.database().collection('product').doc(row._id).update({
        status: '已下架'
      })
      this.$notify({
        title: '操作提示',
        message: '下架成功',
        type: 'success',
        duration: 2000
      })
      this.fetchData()
    },
    async republishData(row, index) {
      await this.$cloudbase.database().collection('product').doc(row._id).update({
        status: '已上架'
      })
      this.$notify({
        title: '操作提示',
        message: '上架成功',
        type: 'success',
        duration: 2000
      })
      this.fetchData()
    },
    async resetData(row, index) {
      await this.$cloudbase.database().collection('product').doc(row._id).update({
        status: '待上架'
      })
      this.$notify({
        title: '操作提示',
        message: '撤销成功',
        type: 'success',
        duration: 2000
      })
      this.fetchData()
    },
    addDomain() {
      this.temp.skus.push({
        name: '',
        price: '',
        stock: ''
      })
    },
    removeDomain(item) {
      console.log(item)
      console.log(this.temp)
      var index = this.temp.skus.indexOf(item)
      if (index !== -1) {
        this.temp.skus.splice(index, 1)
      }
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
</style>
