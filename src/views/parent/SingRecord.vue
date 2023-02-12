<template>
	<div>
		<el-card class="box-card">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" :row-class-name="tableRowClassName">
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
			signRecord:[],
			childData: [],
			childArray: [],
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
		// this.getChildInfo()
		// this.getClassStudentList()
		this.getChildList();
	},

	methods: {
		getChildList() {
			this.loading = true;
			this.request.post('api/parent/getChildInfo', {
				parent_id: this.$store.state.user.user_id
			}).then(res => {
				// if (res.data.length) this.childShow = true;
				// this.childList = res.data;
				this.childData = res.data;
			}).finally(() => {
				this.load();
			})
		},
		// getChildInfo() {
		// 	this.request.post('/api/parent/getChild', {
		// 		'user_id': this.$store.state.user.user_id
		// 	}).then(res => {
		// 		this.childData = res.data;
		// 		// this.getChildByid(res.data[0].child_id)
		// 	}).catch(err => {

		// 	}).finally(() => {
		// 		this.load();
		// 	})
		// },
		// getChildByid() {
		// 	this.childArray = []
		// 	this.childData.forEach(async item => {
		// 		await this.request.post('api/user/getUserById', {
		// 				user_id: item.id
		// 		}).then((res) => {
		// 			this.childArray.push(res.data[0])
		// 				// this.childData = res.data;
		// 		}).catch(err => {
		// 			this.$notify.error({
		// 				title: '错误',
		// 				message: err
		// 			});
		// 		})
		// 	})
		// 	this.load();
		// },
		load() {
			this.childData.forEach(async (item, index) => {
				let studentTmp = '', signTmp = ''
				// await this.request.post('api/user/getUserById', {
				// 	user_id: item.student_no
				// }).then(res => {
				// 	studentTmp = res.data[0]
				// })
				await this.request.post('api/parent/getSignRecord', {
					child_id: item.student_no
				}).then(res => {
					if (!res.data.length) signTmp = {'sign_time': null, 'out_time': null, 'is_sign': null, 'is_out': null}
					else signTmp = res.data[0]
				})
				this.tableData.push({...item, ...signTmp})
				if (index == this.childData.length - 1) this.loading = false;
			})
		},
		tableRowClassName({row, rowIndex}) {
        if (rowIndex === 1) {
          return 'warning-row';
        } else if (rowIndex === 3) {
          return 'success-row';
        }
        return '';
      },
		getClassStudentList() {
			this.request.post('api/teacher/getClassStudentList',{
				teacher_id: this.$store.state.user.user_id
			}).then(res => {
				this.studentArray = []
				res.data.forEach(item => {
					this.studentArray.push(item.child_id)
				})
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
.el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>