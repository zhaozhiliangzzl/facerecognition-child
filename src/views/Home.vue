<template>
  <div class="home">
		<h2>{{userType}} 您好！欢迎登录 {{title}}</h2>
		<el-dialog :title="delDialogTitle" 
			:visible.sync="dialogTableVisible" 
			:modal="true"
			append-to-body
			:close-on-click-modal="true"
			:before-close="closeDia"
			:lock-scroll="true"
			custom-class="addcasedialog"
			top="35vh">
			<el-row v-for="(item, index) in msgList" :key="index">
				<template>
					<el-col>
					<h3>{{item.from_name}}: {{item.msg}}</h3>
				</el-col>
				</template>
			</el-row>
		</el-dialog>

  </div>
</template>

<script>
import Util from '../utils/utils.js';
export default {
  name: 'Home',
	data() {
		return {
			title: '人脸识别幼儿接送系统',
			dialogTableVisible: false,
			delDialogTitle: '消息',
			msgList: [],
			msg: '',
			childData: [],
			tableData: []
		}
	},
	created(){
		if (this.$store.state.user.role == 1) {
			this.getChildList();
			this.getMsg();
		}
	},
	computed: {
		userType() {
			return Util.userType(this.$store.state.user.role)
		}
	},
	methods: {
		getChildList() {
			this.request.post('api/msg/getChildInfo', {
				parent_id: this.$store.state.user.user_id
			}).then(res => {
				this.childData = res.data;
			}).finally(() => {
				this.load();
			})
		},
		load() {
			this.childData.forEach(async (item, index) => {
				let studentTmp = '', signTmp = ''
				await this.request.post('api/msg/getSignRecord', {
					child_id: item.student_no
				}).then(res => {
					if (!res.data.length) signTmp = {'sign_time': null, 'out_time': null, 'is_sign': null, 'is_out': null}
					else signTmp = res.data[0]
					this.tableData.push({...item, ...signTmp})
				}).finally(() => {
					this.checkMsg({...item, ...signTmp});
				})
			})
		},
		checkMsg(val) {
			let date = new Date();
			let hours = date.getHours();
			let msgTime = window.localStorage.getItem('msgTime');
			if (msgTime) {
				if (msgTime == hours) return;
			}
			if(val.sign_time == null && hours > 10 && hours < 16) {
				window.localStorage.setItem('msgTime', hours)
				this.request.post('api/msg/checkMsg', {
					from_name: val.name,
					to_uid: this.$store.state.user.user_id,
					from_uid: val.student_no,
					msg: '您的孩子未签到，请及时关注'
				})
			}
			if (val.out_time == null && hours > 16) {
				this.request.post('api/msg/checkMsg', {
					from_name: val.name,
					to_uid: this.$store.state.user.user_id,
					from_uid: val.student_no,
					msg: '您的孩子未签退，请及时关注'
				})
			}
		},
		getMsg() {
			this.request.post('api/msg/getMsg', {
				to_uid: this.$store.state.user.user_id
			}).then(res => {
				this.msgList = res.data;
			}).finally(() => {
				if (this.msgList.length !== 0) this.dialogTableVisible = true;
			})
		},
		closeDia() {
			this.dialogTableVisible = false;
			this.request.post('api/msg/updateMsg', {
				msg_list: this.msgList
			}).then(res => {

			})
		}
	},
}
</script>

<style lang="less">
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
</style>