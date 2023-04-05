<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="名称" style="width: 200px;margin-right:5px" class="filter-item" clearable @keyup.enter.native="handleFilter" />
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
      <el-table-column label="类别名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" icon="el-icon-delete" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
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
        <el-form-item label="类别名称" prop="name" label-width="80px">
          <el-input v-model="temp.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
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
      temp: {
        _id: undefined,
        name: ''
      },
      dialogStatus: '',
      textMap: {
        update: '编辑类别',
        create: '新增类别'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '名称必须填写', trigger: 'blur' }]
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
      console.log(this.listQuery.page)
      console.log(this.listQuery.limit)
      const queryString = {}
      if (this.listQuery.name) {
        queryString.name = this.listQuery.name
      }
      const queryResult = await this.$cloudbase.database().collection('category').where(queryString).skip((this.listQuery.page - 1) * this.listQuery.limit).limit(this.listQuery.limit).orderBy('createdate', 'desc').get()
      const queryTotal = await this.$cloudbase.database().collection('category').where(queryString).count()
      this.list = queryResult.data
      this.listLoading = false
      console.log(queryTotal)
      this.total = queryTotal.total
      console.log(this.list)
      /* getList().then(response => {
        this.list = response.data.items
        this.listLoading = false
      })*/
    },
    resetTemp() {
      this.temp = {
        _id: undefined,
        name: ''
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
          this.$cloudbase.database().collection('category').add({
            name: this.temp.name,
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
        const tHeader = ['类别名称']
        const filterVal = ['name']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '类别表'
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
          this.$cloudbase.database().collection('category').doc(this.temp._id)
            .update({
              name: this.temp.name
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
      console.log(row)
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async handleDelete(row, index) {
      await this.$cloudbase.database().collection('category').doc(row._id).remove()
      this.$notify({
        title: '操作提示',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.listQuery.name = undefined
      this.fetchData()
    }
  }
}
</script>
<style scoped>
.filter-container{
  padding-bottom:10px
}
</style>
