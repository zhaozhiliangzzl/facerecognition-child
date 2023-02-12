<template>
	<div>
		<el-card class="box-card">
			<el-table :data="tableData" style="width: 100%" v-loading="loading">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column label="序号" type="index" width="50"></el-table-column>
				<el-table-column prop="class" label="班级" width="150"></el-table-column>
				<el-table-column prop="student_no" label="学号" width="200"></el-table-column>
				<el-table-column prop="name" label="姓名" width="150"></el-table-column>
				<el-table-column label="签到时间" width="220">
					<template slot-scope="scope">
						{{ formatTime(scope.row.sign_time) }}
					</template>
				</el-table-column>
				<el-table-column label="签退时间" width="220">
					<template slot-scope="scope">
						{{ formatTime(scope.row.out_time) }}
					</template>
				</el-table-column>
				<el-table-column label="考勤情况" width="200">
					<template slot-scope="scope">
						{{ signData(scope.row) }}
					</template>
				</el-table-column>
					<el-table-column
					fixed="right"
						label="操作"
						width="150">
						<template slot-scope="scope">
						<el-button @click="handleShow(scope.row)" type="text">
								查看
						</el-button>
						<el-button @click="handleEdit(scope.row)" type="text">
								编辑
						</el-button>
						<el-button @click="handleDel(scope.row)" type="text">
								删除
						</el-button>
						</template>
				</el-table-column>
			</el-table>
			
		</el-card>

		<el-dialog :title="dialogTitle" 
			:visible.sync="dialogFormVisible" 
			:modal="true"
			append-to-body
			:close-on-click-modal="true"
			:lock-scroll="true"
			custom-class="addcasedialog">
			<el-form :model="formLeaveData" label-position="right" label-width="80px">
				<el-form-item label="姓名">
						<el-input v-model="formLeaveData.name" :disabled="true"></el-input>
					</el-form-item>
				<el-form-item label="学号">
							<el-input v-model="formLeaveData.student_no" :disabled="true"></el-input>
					</el-form-item>
					<el-form-item label="班级">
							<el-input v-model="formLeaveData.class" :disabled="true"></el-input>
					</el-form-item>
					<el-form-item label="签到时间">
						<el-date-picker
							:disabled="disabled"
							type="datetime"
							format="yyyy-MM-dd HH:mm:ss"
							value-format="yyyy-MM-dd HH:mm:ss"
							v-model="formLeaveData.sign_time"
							align="left">
						</el-date-picker>
					</el-form-item>
					<el-form-item label="签退时间">
						<el-date-picker
							:disabled="disabled"
							type="datetime"
							format="yyyy-MM-dd HH:mm:ss"
							value-format="yyyy-MM-dd HH:mm:ss"
							v-model="formLeaveData.out_time"
							align="left"></el-date-picker>
					</el-form-item>

					
			</el-form>
			<div slot="footer" class="dialog-footer">
					<el-button @click="dialogFormVisible = false">取 消</el-button>
					<el-button type="primary" @click="handleSure" :disabled="disabled">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import Util from '@/utils/utils.js';

export default {
	name: 'SingRecord',

	data() {
		return {
			tableData: [],
			dialogTitle: '考勤详情',
			dialogFormVisible: false,
			formLeaveData: {},
			loading: false,
			disabled: true
		};
	},

	mounted() {
		
	},

	computed: {
		formatTime() {
			return (val) => {
        // return val === null ? '--' : val.replace("T", " ").slice(0,19)
				return val;
      }
		},
		tableWidth() {
			return window.innerWidth - 700
		},
		statusType() {
			return (val) => {
        return Util.statusType(val)
      }
		},
		signData(val) {
			return (val) => {
				if (val.is_out == 2) return '已签退';
				if (val.is_sign == 1) return '已签到';
				return '未签到'
			}
		}
	},

	created() {
		this.load()
		// this.getClassStudentList()
	},

	methods: {
		load() {
			this.request.get('api/admin/getSignRecord').then(res => {
				this.tableData = res.data;
			})
		},
		handleShow(val) {
			this.formLeaveData = val;
			// this.formLeaveData.sign_time = new Date(this.formLeaveData.sign_time);
			// this.formLeaveData.out_time = new Date(this.formLeaveData.out_time);
			console.log(val)
			this.disabled = true;
			this.dialogFormVisible = true;
		},
		handleSure(val) {
			this.request.post('api/admin/updateSignRecord', {
				...this.formLeaveData
			}).then(res => {
				if (res.code == 200) {
					this.$message.success(res.msg);
					this.dialogFormVisible = false;
					this.load();
				}
			})
		},
		handleEdit(val) {
			this.formLeaveData = val;
			console.log(this.formLeaveData)
			this.disabled = false;
			this.dialogFormVisible = true;
		},
		handleDel(val) {
			this.request.post('api/admin/delSignRecord', {
				...val
			}).then(res  => {
				if (res.code == 200) {
					this.$message.success(res.msg);
					this.load();
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
	},
};
</script>

<style lang="less" scoped>
.el-date-editor,.el-select{
	width: 100%;
}
</style>