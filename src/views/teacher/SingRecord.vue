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
export default {
	name: 'SingRecord',

	data() {
		return {
			tableData: [],
			total: 20,
			pageNum: 1,
			pageSize: 10,
			currentPage: 1,
			loading: false,
			studentArray: [],
			studentData: [],
			signRecord:[]
		};
	},

	mounted() {
		
	},

	computed: {
		formatTime() {
			return (val) => {
        return val === null ? '--' : val.replace("T", " ").slice(0,19)
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
		this.getStudentList()
		// this.getClassStudentList()
	},

	methods: {
		load() {
			this.studentData = []
			this.signRecord = []
			this.studentArray.forEach(async (item, index) => {
				let studentTmp = '', signTmp = ''
				await this.request.post('api/user/getUserById', {
					user_id: item
				}).then(res => {
					studentTmp = res.data[0]
				})
				await this.request.post('api/teacher/getSignRecord', {
					child_id: item
				}).then(res => {
					if (!res.data.length) signTmp = {'sign_time': null, 'out_time': null, 'is_sign': null, 'is_out': null}
					else signTmp = res.data[0]
				})
				this.tableData.push({...studentTmp, ...signTmp})
			})
		},
		getStudentList() {
			this.request.post('api/teacher/getStudentListInfo',{
				teacher_id: this.$store.state.user.user_id
			}).then(res => {
				this.tableData = res.data;
				// this.studentArray = res.data[0].class;
				console.log(res)
			})
		},
		getClassStudentList() {
			this.request.post('api/teacher/getClassStudentList',{
				teacher_id: this.$store.state.user.user_id
			}).then(res => {
				this.tableData = res.data;
			}).finally(() => {
				this.load();
			})
		},
		changeData() {
			this.studentArray.forEach((item, index) => {
				this.tableData.push(this.studentData[index], this.signRecord[index])
				console.log(this.studentData[index], this.signRecord[index])
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

</style>