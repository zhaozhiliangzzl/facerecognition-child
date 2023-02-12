<template>
	<div class="leave">
		<el-dialog :title="dialogTitle" 
			:visible.sync="dialogFormVisible" 
			:modal="true"
			append-to-body
			:close-on-click-modal="true"
			:lock-scroll="true"
			custom-class="addcasedialog">
			<el-form :model="formLeaveData" :label-position="labelPosition" label-width="80px">
				<el-form-item label="姓名">
						<el-input v-model="formLeaveData.name" :disabled="disabled"></el-input>
					</el-form-item>
				<el-form-item label="学号">
							<el-input v-model="formLeaveData.student_no" :disabled="disabled"></el-input>
					</el-form-item>
					<el-form-item label="班级">
							<el-input v-model="formLeaveData.class" :disabled="disabled"></el-input>
					</el-form-item>
					<el-form-item label="请假事由">
						<el-input :disabled="disabled" type="textarea" v-model="formLeaveData.reason" maxlength="100" show-word-limit></el-input>
					</el-form-item>
					<el-form-item label="提交时间">
						<el-date-picker :disabled="disabled" v-model="formLeaveData.submit_time" type="datetime" align="right" :picker-options="pickerOptions" placeholder="选择提交时间"></el-date-picker>
					</el-form-item>
					<el-form-item label="开始时间">
						<el-date-picker :disabled="disabled" v-model="formLeaveData.start_time" type="datetime" align="right" :picker-options="pickerOptions" placeholder="选择出险时间"></el-date-picker>
					</el-form-item>
					<el-form-item label="结束时间">
						<el-date-picker :disabled="disabled" v-model="formLeaveData.end_time" type="datetime" align="right" :picker-options="pickerOptions" placeholder="选择报案时间"></el-date-picker>
					</el-form-item>
					<el-form-item label="审核意见">
						<el-select v-model="formLeaveData.status" placeholder="请选择">
                <el-option label="待审核" :value=1 key='1'></el-option>
                <el-option label="同意" :value=2 key='2'></el-option>
                <el-option label="拒绝" :value=3 key='3'></el-option>
            </el-select>
					</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
					<el-button @click="dialogFormVisible = false">取 消</el-button>
					<el-button type="primary" @click="handleSure">确 定</el-button>
			</div>
		</el-dialog>

		<el-card class="box-card">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" :max-width="tableWidth">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column label="序号" type="index" width="50"></el-table-column>
				<el-table-column prop="class" label="班级" width="150"></el-table-column>
				<el-table-column prop="student_no" label="学号" width="150"></el-table-column>
				<el-table-column prop="name" label="姓名" width="120"></el-table-column>
				<el-table-column label="审核意见" width="120">
					<template slot-scope="scope">
						{{ statusType(scope.row.status) }}
					</template>
				</el-table-column>
				<el-table-column prop="reason" label="请假事由" width="200"></el-table-column>
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
				<el-table-column label="提交时间" width="200">
					<template slot-scope="scope">
						{{ formatTime(scope.row.submit_time) }}
					</template>
				</el-table-column>
				<el-table-column
					fixed="right"
						label="操作"
						width="100">
						<template slot-scope="scope">
						<el-button @click="handleShow(scope.row)" type="text">
								查看
						</el-button>
						<el-button @click="handleDel(scope.row)" type="text">
								删除
						</el-button>
						</template>
				</el-table-column>
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
			disabled: true,
			formLeaveData: {
				student_no: '',
				user_id: '',
				real_name: '',
				class_no: '',
				reason: '',
				start_time: '',
				end_time: '',
				submit_time: '',
				status: ''
			},
			studentArray: '',
			labelPosition: 'right',
			pickerOptions: {
				shortcuts: [{
					text: '今天',
					onClick(picker) {
						picker.$emit('pick', new Date());
					}
				}, {
					text: '昨天',
					onClick(picker) {
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24);
						picker.$emit('pick', date);
					}
				}, {
					text: '一周前',
					onClick(picker) {
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
						picker.$emit('pick', date);
					}
				}]
			},
		};
	},
	
	created() {
		this.load();
	},

	mounted() {
		
	},

	computed: {
		formatTime() {
			return (val) => {
        return val.replace("T", " ").slice(0,19)
      }
		},
		tableWidth() {
			return window.innerWidth - 700
		},
		statusType() {
			return (val) => {
        return Util.statusType(val)
      }
		}
	},

	methods: {
		load() {
			this.loading = true;
			this.request.get('api/admin/getLeaveRecord').then(res => {
					this.tableData = res.data;
					console.log(res)
				}).finally(() => {
					this.loading = false;
				})
		},
		handleSure() {
			this.formLeaveData.status_userid = this.$store.state.user.user_id;
			this.formLeaveData.status_username = this.$store.state.user.real_name;
			this.request.post('/api/admin/updateSignRecord', {
				...this.formLeaveData
			}).then(res => {
				if (res.code == '200'){
					this.$notify.success({
          message: res.msg
        });
				this.dialogFormVisible = false;
				}
			})
		},
		handleShow(val) {
			console.log(val)
			this.title = val.real_name;
			this.formLeaveData = val;
			this.dialogFormVisible = true;
		},
		handleDel(val) {
			this.request.post('api/admin/delLeaveRecord', {
				...val
			}).then(res  => {
				if (res.code == 200) {
					this.$message.success(res.msg);
					this.load();
				}
			})
		},
		selectChange(val) {
			this.childData.forEach(item => {
				if (item.user_id == val){
					this.formLeaveData.student_no = item.student_no
					this.formLeaveData.class_no = item.class_no
					this.formLeaveData.real_name = item.real_name
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
	},
};
</script>

<style lang="less">
.leave{
	padding: 20px 40px;
	width: calc(100% - 60px);
	.el-pagination{
      float: right;
  }
	
}
.box-card{
.el-table__body-wrapper::-webkit-scrollbar {
    width: 8px; /*滚动条宽度*/
    height: 8px; /*滚动条高度*/
  }
 .el-table__body-wrapper::-webkit-scrollbar-track {
    border-radius: 10px; /*滚动条的背景区域的圆角*/
    -webkit-box-shadow: inset 0 0 6px rgba(238,238,238, 0.3);
    background-color: #eeeeee; /*滚动条的背景颜色*/
  }
  .el-table__body-wrapper::-webkit-scrollbar-thumb {
    border-radius: 10px; /*滚动条的圆角*/
    -webkit-box-shadow: inset 0 0 6px rgba(145, 143, 0143, 0.3);
    background-color: rgb(145, 143, 143); /*滚动条的背景颜色*/
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