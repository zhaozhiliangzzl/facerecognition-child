<template>
    <el-card shadow="always" style="width: 100%; margin: 10px 20px">
      <el-form :model="userInfo" ref="userInfo" label-width="100px" class="demo-ruleForm userInfoForm">
        <el-form-item class="header">
            <el-upload
                action=""
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="uploadImg">
            <div v-show="progressFlag" class="head-img">
                <el-progress type="circle" :percentage="progressPercent"></el-progress>
            </div>
            <el-avatar v-show="!progressFlag" :size="90" @error="errorHandler">
                <img :src="userInfo.avatar || require('@/assets/img/avatar.png')"/>
            </el-avatar>
                </el-upload>
            <div class="nickname">
                <span>{{ userInfo.nickname }}</span>
            </div>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item label="用户昵称">
            <el-input v-model="userInfo.nickname"></el-input>
        </el-form-item>
				<el-form-item label="班级">
					<el-select
						v-model="studentArray"
						filterable
						allow-create
						default-first-option
						placeholder="请选择班级">
						<el-option
							v-for="(item, index) in class_info"
							:key="index"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
        </el-form-item>
        <!-- <el-form-item label="用户ID">
            <el-input v-model="userInfo.user_id" :disabled="true"></el-input>
        </el-form-item> -->
        <el-form-item label="账号">
            <el-input v-model="userInfo.identifier"></el-input>
        </el-form-item>
				<el-form-item label="密码">
            <el-input v-model="userInfo.credential"></el-input>
        </el-form-item>
        <el-form-item label="性别">
            <el-select v-model="userInfo.gender" placeholder="请选择">
                <el-option label="男" :value=1 key='1'></el-option>
                <el-option label="女" :value=2 key='2'></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="真实名字">
            <el-input v-model="userInfo.real_name"></el-input>
        </el-form-item>
        <!-- <el-form-item label="登录类型">
            <el-input v-model="userInfo.identity_type" :disabled="true"></el-input>
        </el-form-item> -->
        <el-form-item label="证件类型">
            <el-select v-model="userInfo.identity_card_type" placeholder="请选择">
                <el-option label="身份证" :value=1 key='1'></el-option>
                <el-option label="护照" :value=2 key='2'></el-option>
            </el-select>
        </el-form-item>
         <el-form-item label="证件号">
            <el-input v-model="userInfo.identity_card_no"></el-input>
        </el-form-item>
				<el-form-item label="所在地址" class="address">
            <el-cascader
                size="large"
                :options="options"
                v-model="selectedOptions"
                @change="handleChange">
            </el-cascader>
            <el-input v-model="userInfo.address" class="address-input"></el-input>
        </el-form-item>
        <el-form-item class="submitBtn">
            <el-button type="primary" @click="submitForm" >提交</el-button>
            <el-button @click="resetForm">重置</el-button>
        </el-form-item>
    </el-form>
    </el-card>
</template>

<script>
import { regionData } from 'element-china-area-data'
export default {
	name: 'UserInfo',
	data() {
			return {
					userInfo: {},
					fileList:[],
					progressFlag: false,
					progressPercent: 0,
					userInfoStorage: '',
					options: regionData,
					selectedOptions: [],
					studentArray: '',
					studentList:'',
					class_info: [
						{label: '小班', value: '小班'},
						{label: '中班', value: '中班'},
						{label: '大班', value: '大班'}
					]
			}
	},
	mounted() {

	},
	created(){
			this.load()
			this.getStudentList()
	},
	methods: {
		load() {
			this.request.post('api/user/getUserById', {
					user_id: this.$store.state.user.user_id
			}).then((res) => {
					this.$store.commit('updateUser', res.data[0])
					this.selectedOptions = [res.data[0].province, res.data[0].city, res.data[0].area]
					this.userInfo = res.data[0]
			}).catch(err => {
					console.log(err)
			})
		},
		getStudentList() {
			this.request.post('api/teacher/getStudentList',{
				teacher_id: this.$store.state.user.user_id
			}).then(res => {
				this.studentArray = res.data[0].class;
				console.log(this.studentArray)
			})
			// this.request.get('api/teacher/getStudentList').then(res => {
			// 	// this.studentList = res.data
			// 	res.data.forEach( item => {
			// 		this.request.post('api/user/getUserById', {
			// 				user_id: item.id
			// 		}).then((res) => {
			// 				this.studentList.push(res.data[0])
							
			// 		}).catch(err => {
			// 				console.log(err)
			// 		}).finally(() => {
							
			// 		})
			// 	});
			// }).finally(() => {
			// 	// this.getClassStudentList()
			// 	console.log(this.studentList)
			// })
		},
		// getClassStudentList() {
		// 	this.request.post('api/teacher/getClassStudentList',{
		// 		teacher_id: this.$store.state.user.user_id
		// 	}).then(res => {
		// 		this.studentArray = []
		// 		res.data.forEach(item => {
		// 			this.studentArray.push(item.child_id)
		// 		})
		// 	})
		// },
		errorHandler() {
			return true
		},
		uploadImg (f) {
			this.progressFlag = true
			let formData = new FormData()
			formData.append("file", f.file);
			this.request({
					url: 'api/user/uploadAvatar',
					method: 'POST',
					Headers: {
							"content-type": "multipart/form-data",
					},
					data: formData,
					onUploadProgress: (progressEvent) => {
									let num = progressEvent.loaded / progressEvent.total * 100 | 0;  //百分比
									// file.onProgress({})     //进度条
									this.progressPercent = num
							}
			}).then(res => {
					this.userInfo.avatar = res.url
					if (this.progressPercent === 100) {
							this.progressFlag = false
							this.progressPercent = 0
					}
			}).catch(error => {
					console.log(error)
			})
		},
		// 上传图片前的过滤
		beforeAvatarUpload (file) {
			const isJPG = file.type === 'image/jpeg'
			const isLt2M = (file.size / 1024 / 1024) < 2

			if (!isJPG) {
					this.$message.error('上传头像图片只能是 JPG 或者 PNG 格式!')
			}
			if (!isLt2M) {
					this.$message.error('上传头像图片大小不能超过 2MB!')
			}
			return isJPG && isLt2M
		},
		handleChange (value) {
			this.userInfo.province = value[0]
			this.userInfo.city = value[1]
			this.userInfo.area = value[2]
			// this.selectedOptions = value
		},
		submitForm() {
			console.log(this.studentArray)
			this.request.post('/api/user/updateUserById',{
					...this.userInfo
			}).then(async res => {
					// await this.getUserInfoById()
					await this.load()
				// location.reload();
				this.$message.success(res.msg)
			})
			this.request.post('api/teacher/updateStudent', {
				teacher_id: this.$store.state.user.user_id,
				studentList: this.studentArray
			}).then(res => {
				console.log(res)
			})
		},
		resetForm() {
				this.load()
		},
	
	}
}
</script>

<style lang="less">
.userInfoForm{
    .nickname{
        display: flex;
        align-items: center;
        flex-direction: column;
        margin-left: 20px;
        font-size: 20px;
    }
    .header{
        .el-form-item__content{
            display: flex;
            img{
                position: relative;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%);
            }
        }
    }
    .el-divider--horizontal{
        margin: 0px 0px 5px;
    }
    .balance{
        display: flex;
        align-items: center;
        i.el-icon-coin{
            width: 30px;
            height: 30px;
            color: white;
            background-color: #fc5531;
            border-radius: 50%;
            box-sizing: border-box;
            padding: 7px;
            margin-right: 10px;
        }
        span{
            color: #fc5531;
        }
        .el-button{
            background-color: #fc5531;
            border-color: #fc5531;
            margin-left: 85px;
            span{
                color: white;
            }
        }
    }
    .el-form-item{
        margin-bottom: 15px;
        width: 70%;
    }
    .head-img{
        .el-progress-circle{
            width: 90px !important;
            height: 90px !important;
        }
    }
    .address{
        .el-cascader.el-cascader--large{
            width: 250px;
            margin-right: 10px;
        }
        .address-input{
            width: calc(100% - 260px);
        }
    }
    .el-select{
        width: 100%;
    }
    .submitBtn{
        display: flex;
        justify-content: center;
    }
}

</style>