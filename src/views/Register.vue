<template>
	<div class="register">
		<div class="userContent">
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-form-item prop="nickname" label="用户名">
					<el-input class="register-form-input" v-model="form.nickname" placeholder="请输入用户名"></el-input>
				</el-form-item>
				<el-form-item prop="identifier" label="账号">
					<el-input class="register-form-input" v-model="form.identifier" placeholder="请输入账号"></el-input>
				</el-form-item>
				<el-form-item prop="credential" label="密码">
					<el-input class="register-form-input" v-model="form.credential" type="password" placeholder="请输入密码"></el-input>
				</el-form-item>
				<el-form-item prop="checkCredential" label="确认密码">
					<el-input class="register-form-input" v-model="form.checkCredential" type="password" placeholder="请再次输入密码"></el-input>
				</el-form-item>
				<el-form-item label="角色" prop="userRole">
					<el-radio-group v-model="form.userRole">
						<!-- <el-radio label="0">学生</el-radio> -->
						<el-radio label="1">家长</el-radio>
						<el-radio label="2">老师</el-radio>
						<el-radio label="3">管理员</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item class="register-btn">
					<el-button type="primary" @click="onSubmit('form')">注册</el-button>
					<el-button @click="onCancle()">返回</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
import Util from '../utils/utils.js';
export default {
	data() {
		var validatePass = (rule, value, callback) => {
			if(value === '') {
				callback(new Error('请输入密码'));
			} else if(!Util.RegExp.credentialReg.test(this.form.credential)) {
				callback(new Error('密码长度8~12位，必须包含数字、字母、特殊字符中的两种'))
			} else {
				if(this.form.checkCredential !== '') {
					this.$refs.form.validateField('checkCredential');
				}
				callback();
			}
		};
		var validatePass2 = (rule, value, callback) => {
			if(value === '') {
				callback(new Error('请再次输入密码'));
			} else if(!Util.RegExp.credentialReg.test(this.form.checkCredential)) {
				callback(new Error('密码长度8~12位，必须包含数字、字母、特殊字符中的两种'))
			} else if (value !== this.form.credential) {
				callback(new Error('两次输入的密码不一致'));
			} else {
				callback();
			}
		};
		return {
			form: {
				nickname: '',
				identifier: '',					
				credential: '',
				checkCredential: '',
				userRole: '',
				email: '',
				phone: '',
				card: '',
				birth: '',
				sex: ''
			},
			rules: {
				nickname: [
						{ required: true, message: '请输入用户名', trigger: 'blur' }
				],
				identifier: [
						{ required: true, message: '请输入账号', trigger: 'blur' }
				],
				credential: [
						{ required: true, validator: validatePass, trigger: 'change' }
				],
				checkCredential: [
						{ required: true, validator: validatePass2, trigger: 'change' }
				],
				userRole : [
					{ required: true, message: '请选择角色', trigger: 'blur' }
				]
			}
		}
			},
			methods:{
				onSubmit(formName) {
					const self = this;			
					self.$refs[formName].validate((valid) => {
						if (valid) {
							self.request.post('api/user/register', JSON.stringify(self.form))
							.then(function(res) {
							self.$message.success(res.msg + '3秒后跳转至登录页')
								self.$store.commit('updateUser', res.data)
								setTimeout(() => {
										self.$router.push('/login');
								}, 3000)
							}).then(function(error) {
								console.log(error);
							})
							} else {
								console.log('error submit!!');
								return false;
							}
					});
				},
				onCancle() {
					this.$router.push('/login');
		},
	}
}
</script>

<style scoped>
	.register{
		width: 100vw;
		height: 100vh;
		/* background-color: #ecf0f3; */
			background: url('./../assets/img/bag.jpeg') no-repeat;
			background-size:100% 100%;
			-moz-background-size:100% 100%;
	}
	.crumbs-register {
		background-color: #324157;
		height: 50px;
		line-height: 50px;
	}
	.register-title {
		line-height: 50px;
		margin: 0 auto;
    	width: 50px;
    	font-size: 16px;
	}	
	.userContent {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -60%);
		width: 480px;
		margin: 0 auto;
		padding: 35px 35px 10px 35px;
		border-radius: 20px;
		/* box-shadow: 13px 13px 20px #cbced1, -13px -13px 20px #fff; */
		opacity: 0.75;
		background-color: #fff;
	}
	.userContent:hover{
		opacity: 1;
	}
	.register-form-input /deep/ .el-input__inner{
		/* border: 0px; */
		border: 1px solid #DCDFE6;
	}
	.register-btn{
		display: flex;
		justify-content: center;
	}
	.register-btn /deep/ .el-form-item__content{
		margin-left: 0px !important;
	}
	.register-btn button{
		margin-top: 20px;
		width: 200px;
		flex: 1;
	}
</style>