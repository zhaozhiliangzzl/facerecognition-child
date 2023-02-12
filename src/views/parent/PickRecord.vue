<template>
	<div>
		<el-row><h2>{{nowTime}}</h2></el-row>
		<el-row v-for="(item, index) in tableData" :key="index">
			<el-col :span="24"><h3>您的孩子：{{item.name}}</h3></el-col>
			<el-col :span="24" v-if="item.out_time">
				<template>
						您的孩子于{{ formatTime(item.out_time) }}已入校
					</template>
			</el-col>
			<el-col :span="24" v-if="item.sign_time">
				<template>
						您的孩子于{{ formatTime(item.sign_time) }}被接走
					</template>
			</el-col>
			<el-col :span="24" v-else>您的孩子今日未入校</el-col>
			<br/>
		</el-row>
	</div>
</template>

<script>
import Util from '@/utils/utils.js';
export default {
	name: 'PickRecord',

	data() {
		return {
			tiemEq: '',
			nowTime: '',
			childData: [],
			tableData: []
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
	},

	created() {
		this.getTimer();
		this.getChildList();
	},

	methods: {
		getTimer() {
			this.tiemEq = setInterval(() => {
					/* 时间 */
					this.nowTime = Util.timeNow();
			}, 1000);
		},
		getChildList() {
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
		load() {
			this.childData.forEach(async (item, index) => {
				let studentTmp = '', signTmp = '';
				await this.request.post('api/parent/getNowSignRecord', {
					child_id: item.student_no
				}).then(res => {
					if (!res.data.length) signTmp = {'sign_time': null, 'out_time': null, 'is_sign': null, 'is_out': null}
					else signTmp = res.data[0]
				})
				this.tableData.push({...item, ...signTmp})
			})
		},
	},

		// vue生命周期
	beforeDestroy() {
		/* 关闭页面销毁所有定时器 */
		clearInterval(this.tiemEq);
	}

};
</script>

<style lang="less" scoped>

</style>