<template>
	<div class="leave">
		<el-row>
			<el-button type="primary" icon="el-icon-plus" @click="dialogFormVisible = true">请假申请</el-button>
			<!-- <el-popconfirm
					confirm-button-text='确定'
					cancel-button-text='取消'
					icon="el-icon-info"
					icon-color="red"
					title="此操作不可逆，您想好了吗？"
					@confirm="handleDelete"
				>
					<el-button type="danger" slot="reference" icon="el-icon-minus">批量删除</el-button>
				</el-popconfirm> -->
		</el-row>

		<el-dialog :title="dialogTitle" 
				:visible.sync="dialogFormVisible" 
				:modal="true"
				append-to-body
				:close-on-click-modal="true"
				:lock-scroll="true"
				custom-class="addcasedialog">
				<el-form :model="formLeaveData" :label-position="labelPosition" label-width="80px">
					<el-form-item label="姓名">
							<el-select v-model="formLeaveData.student_no" placeholder="姓名" @change="selectChange">
								<el-option v-for="(item, index) in childData" :label="item.name" :value="item.student_no" :key="index"></el-option>
							</el-select>
						</el-form-item>
					<el-form-item label="学号">
								<el-input v-model="formLeaveData.student_no" :disabled="true"></el-input>
						</el-form-item>
						<el-form-item label="班级">
								<el-input v-model="formLeaveData.class" :disabled="true"></el-input>
						</el-form-item>
						<el-form-item label="请假事由">
							<el-input :disabled="disabled" type="textarea" v-model="formLeaveData.reason" maxlength="100" show-word-limit></el-input>
						</el-form-item>
						<el-form-item label="开始时间">
							<el-date-picker :disabled="disabled" v-model="formLeaveData.start_time" type="date" value-format="yyyy-MM-dd" placeholder="选择开始时间" :picker-options="pickerOptions"></el-date-picker>
						</el-form-item>
						<el-form-item label="结束时间">
							<el-date-picker :disabled="disabled" v-model="formLeaveData.end_time" type="date" value-format="yyyy-MM-dd" placeholder="选择结束时间" :picker-options="pickerOptions"></el-date-picker>
						</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
						<el-button @click="dialogFormVisible = false">取 消</el-button>
						<el-button type="primary" @click="handleSure"  :disabled="disabled">确 定</el-button>
				</div>
		</el-dialog>

		<el-card class="box-card">
			<el-table :data="tableData" style="width: 100%" v-loading="loading">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column label="序号" type="index" width="50"></el-table-column>
				<el-table-column prop="class" label="班级" width="100"></el-table-column>
				<el-table-column prop="student_no" label="学号" width="150"></el-table-column>
				<el-table-column prop="name" label="姓名" width="120"></el-table-column>
				<el-table-column prop="reason" label="请假事由" width="100"></el-table-column>
				<el-table-column label="开始时间" width="200">
					<template slot-scope="scope">
						{{ formatTime(scope.row.start_time) }}
					</template>
				</el-table-column>
				<el-table-column label="结束时间" width="200">
					<template slot-scope="scope">
						{{ formatTime(scope.row.end_time) }}
					</template>
				</el-table-column>
				<el-table-column prop="status" label="审核状态" width="100">
					<template slot-scope="scope">
						{{ statusType(scope.row.status) }}
					</template>
				</el-table-column>
				<el-table-column prop="status_username" label="审核人" width="100">
					<template slot-scope="scope">
						{{ scope.row.status_username ? scope.row.status_username : '--' }}
					</template>
				</el-table-column>
				<!-- <el-table-column
					fixed="right"
						label="操作"
						width="100">
						<template slot-scope="scope">
						<el-button @click.native.prevent="handleShow(scope.row)" type="text">
								查看
						</el-button>
						</template>
				</el-table-column> -->
			</el-table>
			<el-pagination
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
					:current-page="currentPage"
					:page-sizes="[10, 20, 30, 40]"
					:page-size="pageSize"
					layout="total, sizes, prev, pager, next, jumper"
					:total="total">
			</el-pagination>
		</el-card>
	</div>
</template>

<script>
import Util from '@/utils/utils.js';
export default {
	name: 'LeaveRecord',

	data() {
		return {
			childData: [],
			tableData: [],
			total: 20,
			pageNum: 1,
			pageSize: 10,
			currentPage: 1,
			loading: false,
			dialogFormVisible: false,
			dialogTitle: '请假申请',
			disabled: false,
			formLeaveData: {
				student_no: '',
				name: '',
				class: '',
				reason: '',
				start_time: '',
				end_time: '',
				submit_time: ''
			},
			labelPosition: 'right',
			pickerOptions: {
				disabledDate(time) {
					return time.getTime() < Date.now() - 8.64e7;
				},
			},
		}
	},

	mounted() {
		
	},

	computed: {
		formatTime() {
			return (val) => {
        return val.replace("T", " ").slice(0,19)
      }
		},
		statusType() {
			return (val) => {
        return Util.statusType(val)
      }
		}
	},
	
	created() {
		this.load();
		this.getLeaveTotl();
		this.getChildInfo();
	},

	methods: {
		load() {
			this.loading = true;
			this.request.post('/api/parent/getLeave', {
				pageNum: this.pageNum,
				pageSize: this.pageSize,
				user_id: this.$store.state.user.user_id
			}).then(res => {
				this.tableData = res.data
			}).finally(() => {
				this.loading = false;
			})
		},
		getLeaveTotl() {
			this.request.post('/api/parent/getLeaveTotle', {
				'user_id': this.$store.state.user.user_id
			}).then(res => {
				this.total = res.data
			})
		},
		getChildInfo() {
			this.request.post('api/parent/getChildInfo', {
				parent_id: this.$store.state.user.user_id
			}).then(res => {
				if (res.data.length) this.childShow = true;
				this.childData = res.data;
			})
		},
		// getChildInfo() {
		// 	this.request.post('/api/parent/getChild', {
		// 		'user_id': this.$store.state.user.user_id
		// 	}).then(res => {
		// 		this.getChildByid(res.data[0].child_id)
		// 	}).catch(err => {

		// 	})
		// },
		// getChildByid(val) {
		// 		this.request.post('api/user/getUserById', {
		// 			user_id: val
		// 	}).then((res) => {
		// 			this.childData = res.data;
		// 	}).catch(err => {
		// 		this.$notify.error({
    //       title: '错误',
    //       message: err
    //     });
		// 	})
		// },
		handleSure() {
			this.formLeaveData.submit_time = new Date();
			this.formLeaveData.parent_id = this.$store.state.user.user_id;
			// this.formLeaveData.start_time = /\d{4}-\d{1,2}-\d{1,2}/g.exec(this.formLeaveData.start_time);
			// this.formLeaveData.end_time = /\d{4}-\d{1,2}-\d{1,2}/g.exec(this.formLeaveData.end_time);
			this.request.post('/api/parent/addLeave', {
				...this.formLeaveData
			}).then(res => {
				this.dialogFormVisible = false;
				this.load();
				if (res.code == '200'){
					this.$notify.success({
          message: res.msg
        });
				}
			}).catch(err => {
				
			})
		},
		selectChange(val) {
			this.childData.forEach(item => {
				if (item.student_no == val){
					this.formLeaveData.student_no = item.student_no
					this.formLeaveData.class = item.class
					this.formLeaveData.name = item.name
				}
			})
		},
		handleSizeChange(val) {
			this.pageSize = val;
			this.load()
		},
		handleCurrentChange(val) {
			this.currentPage = val;
			this.load()
		},
		selectCode() {
			let str = 'KFR-35-BP' + new Date().getTime()
			this.formCaseData.case_code = str
		},
		handleDelete() {
			if (this.multipleSelection.length === 0){
				this.$message('请至少选择一项！')
				return
			}
			let deleteList = []
			this.multipleSelection.forEach(item => {
				deleteList.push(item.id)
			})
			// this.request.post('/api/user/deleteCaseById', {
			// 	deleteList
			// }).then(res => {
			// 	if (res.code == '200') this.$message.success(res.msg)
			// 	else this.$message.warning(res.msg)
			// 	this.load();
			// 	this.getTotal();
			// }).catch(err => {
			// 	this.notification(err)
			// })
		}
	},
};
</script>

<style lang="less">
.leave{
	padding: 20px 40px;
	.el-pagination{
      float: right;
  }
}
.addcasedialog{
		border-radius: 10px;
		.el-dialog__header {
			background: #f2f9fd !important;
			border-radius: 10px;
			border-bottom: none;
		}
		.el-date-editor{
			width: 100%;
		}
		.el-cascader{
			width: 350px;
		}
		.address-input{
				width: calc(100% - 360px);
				margin-left: 10px;
			}
		.el-select{
			width: 100%;
		}
	}
	.el-row{
		.el-button{
			margin-right: 10px;
			margin-bottom: 10px;
		}
	}
</style>