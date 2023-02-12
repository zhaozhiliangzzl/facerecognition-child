<template>
  <div style="width: 80%">
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
        <el-form-item label="家长姓名">
            <el-input v-model="userInfo.real_name"></el-input>
        </el-form-item>
				<div v-for="(item, index) in childList" :key="index" class="child_list">
					<template v-if="childShow">
						<div class="childName"><span >孩子{{index + 1}}</span>
						<el-button @click="uploadFace(item.student_no)">上传人脸识别照片</el-button>
						</div>
						<el-form-item label="孩子姓名">
							<el-input v-model="item.name"></el-input>
						</el-form-item>
						<el-form-item label="亲子关系">
							<el-input v-model="item.relationship"></el-input>
						</el-form-item>
						<el-form-item label="班级">
							<el-input v-model="item.class"></el-input>
						</el-form-item>
						<el-form-item label="学号">
							<el-input v-model="item.student_no"></el-input>
						</el-form-item>
					</template>
				</div>
        <!-- <el-form-item label="登录类型">
            <el-input v-model="userInfo.identity_type" :disabled="true"></el-input>
        </el-form-item> -->
        
        <el-form-item class="submitBtn">
            <el-button type="primary" @click="submitForm" >提交</el-button>
            <el-button @click="resetForm">重置</el-button>
            <!-- <el-button @click="uploadFace">上传人脸识别照片</el-button> -->
            <el-button type="info" @click="addChild">添加孩子</el-button>
            <el-button type="warning" @click="delChild">删除孩子</el-button>
        </el-form-item>
    </el-form>
	</el-card>

	<el-dialog :title="addDialogTitle" 
		:visible.sync="addDialogVisible" 
		:modal="true"
		append-to-body
		:close-on-click-modal="true"
		:lock-scroll="true"
		custom-class="addcasedialog">
		<el-form :model="addChildForm" :label-position="labelPosition" label-width="80px" ref="addChildForm" :rules="rules" :hide-required-asterisk="true">
			<el-form-item label="姓名" prop="name">
				<el-input v-model="addChildForm.name" placeholder="姓名"></el-input>
			</el-form-item>
			<el-form-item label="亲子关系" prop="relationship">
				<el-select v-model="addChildForm.relationship" placeholder="亲子关系">
					<el-option v-for="(item, index) in relationshipList" :label="item.label" :value="item.value" :key="index"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="学号" class="student_no" prop="student_no">
				<el-input v-model="addChildForm.student_no"  placeholder="学号唯一，请谨慎输入"></el-input>
				<el-button @click="createNo">一键生成</el-button>
			</el-form-item>
			<el-form-item label="班级" prop="class">
				<el-select v-model="addChildForm.class" placeholder="班级">
					<el-option v-for="(item, index) in classList" :label="item.label" :value="item.value" :key="index"></el-option>
				</el-select>
			</el-form-item>
		</el-form>
			<div slot="footer" class="dialog-footer">
				<!-- <el-button @click="uploadFace">上传人脸识别照片</el-button> -->

				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="handleAddSure('addChildForm')">确 定</el-button>
			</div>
		</el-dialog>

		<el-dialog :title="delDialogTitle" 
			:visible.sync="delDialogVisible" 
			:modal="true"
			append-to-body
			:close-on-click-modal="true"
			:lock-scroll="true"
			custom-class="addcasedialog">
			<el-table :data="childTableData" style="width: 100%" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="55"></el-table-column>
					<el-table-column label="序号" type="index" width=""></el-table-column>
					<el-table-column prop="name" label="姓名" width=""></el-table-column>
					<el-table-column prop="student_no" label="学号" width=""></el-table-column>
					<el-table-column label="创建时间" width="">
						<template slot-scope="scope">
						{{ timeFormat(scope.row.create_time) }}
					</template>
					</el-table-column>
				</el-table>
			<div slot="footer" class="dialog-footer">
				<el-button @click="delDialogVisible = false">取 消</el-button>
				<el-button type="danger" @click="handleDelChild">删 除</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { provinceAndCityData, regionData, provinceAndCityDataPlus, regionDataPlus, CodeToText, TextToCode } from 'element-china-area-data'
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
			childList: [
				// {childName: '', relationship: '',class: '', studen_no: ''}
			],
			labelPosition: 'right',
			addDialogTitle: '新增孩子',
			addDialogVisible: false,
			childShow: false,
			addChildForm: {
				name: '',
				relationship: '',
				student_no: '',
				class: ''
			},
			relationshipList: [
				{label: '父子', value: '父子'},
				{label: '母子', value: '母子'}
			],
			classList: [
				{label: '小班', value: '小班'},
				{label: '中班', value: '中班'},
				{label: '大班', value: '大班'}
			],
			timer: '',
			delDialogTitle: '删除孩子',
			delDialogVisible: false,
			childTableData: [],
			delList: [],
			rules: {
				name: [
					{ required: true, message: '请输入孩子名称', trigger: 'blur' },
				],
				relationship: [
					{ required: true, message: '请选择亲子关系', trigger: 'blur' }
				],
				student_no: [
					{ required: true, message: '请输入学号', trigger: 'blur' }
				],
				class: [
					{ required: true, message: '请选择班级', trigger: 'blur' }
				]
			}
		}
	},

	computed: {
		timeFormat() {
			return (val) => {
        return val.replace("T", " ").slice(0,19)
      }
		}
	},

	watch: {
		
	},

	mounted() {
		
	},
	created(){
		this.load();
		this.getChildInfo();
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
			this.request.post('/api/user/updateUserById',{
					...this.userInfo
			}).then(async res => {
					// await this.getUserInfoById()
					await this.load()
				// location.reload();
				this.$message.success(res.msg)
			})
		},
		resetForm() {
				this.load()
		},
		uploadFace(val) {
			this.$router.push('/faceRecognition?uid=' + val);
		},
		createNo() {
			let no = new Date();
			this.addChildForm.student_no = no.getTime();
		},
		addChild() {
			this.addChildForm = {
				name: '',
				relationship: '',
				student_no: '',
				class: ''
			}
			this.addDialogVisible = true;
		},
		delChild() {
			this.childTableData = this.childList;
			this.delDialogVisible = true;
		},
		handleAddSure(formName) {
			this.$refs[formName].validate((valid) => {
				if (valid) {
					this.request.post('api/parent/addChild', {
						...this.addChildForm,
						parent_id: this.$store.state.user.user_id
					}).then(res => {
						if (res.code == 200) {
							this.load();
							this.getChildInfo();
							this.$message.success(res.msg)
							this.addDialogVisible = false;
						} else {
							this.$message.error(res.msg)
						}
					})
				}
			})
		},
		handleDelChild() {
			this.request.post('api/parent/delChild', {
				child_list: this.delList
			}).then(res => {
				if (res.code == 200) {
					this.load();
					this.getChildInfo();
					this.delDialogVisible = false;
					this.$message.success(res.msg);
				}
			})
		},
		getChildInfo() {
			this.request.post('api/parent/getChildInfo', {
				parent_id: this.$store.state.user.user_id
			}).then(res => {
				if (res.data.length) this.childShow = true;
				this.childList = res.data;
			})
		},
		handleSelectionChange(val) {
			this.delList = val;
		}
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
        // width: 70%;
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
			.el-form-item__content{
			margin-left: 0px !important;

			}
    }
}

.child_list{
	.childName{
		display: inline-block;
		margin-top: 25px;
		height: 50px;
		line-height: 50px;
		font-weight: bold;
		margin-left: 30px;
		vertical-align: middle;
		.el-button{
			margin-left: 30px;
		}
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

.student_no{
	width: 100%;
	display: inline-block;

	div{
    width: calc(100% - 105px);
		margin-right: 5px;
	}
}

</style>