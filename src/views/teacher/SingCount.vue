<template>
	<div class="count">
		<el-row :gutter="20">
			<el-form ref="form" label-width="80px">
			<el-col :span="12">
				<el-form-item label="考勤时间">
					<el-date-picker
						v-model="date"
						type="date"
						placeholder="选择日期">
					</el-date-picker>
				</el-form-item>
			</el-col>
			<el-col :span="12">
				<el-button @click="handleSearch">查询</el-button>
			</el-col>
		</el-form>
		</el-row>
		<el-row class="progress">
			<el-col :span="6">
				<el-progress type="circle" :percentage="normalPercent" :color="colors"></el-progress>
				<div>正常：{{normal}}人</div>
			</el-col>
			<el-col :span="6">
				<el-progress type="circle" :percentage="latePercent" :color="colors"></el-progress>
				<div>迟到：{{late}}人</div>
			</el-col>
			<el-col :span="6">
				<el-progress type="circle" :percentage="leavePercent" :color="colors"></el-progress>
				<div>请假：{{leave}}人</div>
			</el-col>
			<el-col :span="6">
				<el-progress type="circle" :percentage="absencePercent" :color="colors"></el-progress>
				<div>缺勤：{{absence}}人</div>
			</el-col>
		</el-row>
		
		<!-- <el-progress type="circle" :percentage="25">2</el-progress>
		<el-progress type="circle" :percentage="100" status="success">3</el-progress>
		<el-progress type="circle" :percentage="70" status="warning">4</el-progress> -->
	</div>
</template>

<script>
export default {
	name: 'SingCount',

	data() {
		return {
			colors: [
          {color: '#f56c6c', percentage: 20},
          {color: '#e6a23c', percentage: 40},
          {color: '#5cb87a', percentage: 60},
          {color: '#1989fa', percentage: 80},
          {color: '#6f7ad3', percentage: 100}
        ],
				total: '',
				normal: '',
				normalPercent: 0,
				leave: '',
				leavePercent: 0,
				late: 0,
				latePercent: 0,
				absence: '',
				absencePercent: 0,
				date: '',
				childList: []
		};
	},

	mounted() {
		this.getRecordInfo()
	},

	methods: {
		handleSearch() {
			this.getRecordInfo()
		},
		getRecordInfo() {
			this.request.post('api/teacher/getRecordInfo',{
				teacher_id: this.$store.state.user.user_id,
				date: this.date
			}).then(res => {
				console.log(res)
				this.childList = res.data;
				this.total = this.childList.length;
				this.normal = this.childList.filter(item => item.sign_time != null && item.start_time != null).length;
				this.normalPercent = this.normal / this.total * 100;

				this.leave = this.childList.filter(item => item.start_time != null).length;
				this.leavePercent = this.leave / this.total * 100;

				this.absence = this.childList.filter(item => item.sign_time == null && item.start_time == null).length;
				this.absencePercent = this.absence / this.total * 100;
				
				// this.studentArray = res.data[0].class;
			})
		},
	},
};
</script>

<style lang="less">
.count{
	width: calc(100vw - 300px);
	padding: 20px 40px;
}
.progress{
	div{
		font-weight: bold;
		font-size: 20px;
	}
}

.el-form-item__content{
	.el-date-editor{
		width: 100%;
	}
}
</style>