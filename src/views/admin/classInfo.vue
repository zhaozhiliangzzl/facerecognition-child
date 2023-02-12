<template style="width: 100%">
	<div style="width: 100%">
		<el-dialog :title="dialogTitle" 
				:visible.sync="dialogFormVisible" 
				:modal="true"
				append-to-body
				:close-on-click-modal="true"
				:lock-scroll="true"
				custom-class="addcasedialog">
				<el-form :model="formData" label-position="right" label-width="80px">
					<el-form-item label="姓名">
						<el-input v-model="formData.name" :disabled="disabled"></el-input>
					</el-form-item>
					<el-form-item label="学号">
						<el-input v-model="formData.student_no" :disabled="disabled"></el-input>
					</el-form-item>
					<el-form-item label="班级">
							<el-input v-model="formData.class" :disabled="disabled"></el-input>
					</el-form-item>
					<el-form-item label="创建时间">
						<el-date-picker :disabled="disabled" v-model="formData.create_time" type="datetime" placeholder="选择时间"></el-date-picker>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
						<el-button @click="dialogFormVisible = false">取 消</el-button>
						<el-button type="primary" @click="handleSure" :disabled="disabled">确 定</el-button>
				</div>
		</el-dialog>

		<el-card class="box-card">
			<el-table :data="tableData" style="width: 100%" v-loading="loading">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column label="序号" type="index" width="200"></el-table-column>
				<el-table-column prop="class" label="班级" width="200"></el-table-column>
				<el-table-column prop="student_no" label="学号" width="200"></el-table-column>
				<el-table-column prop="name" label="姓名" width="200"></el-table-column>
				<el-table-column label="创建时间" width="200">
					<template slot-scope="scope">
						{{ formatTime(scope.row.create_time) }}
					</template>
				</el-table-column>
				<el-table-column
					fixed="right"
						label="操作"
						width="200">
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
	</div>
</template>

<script>
export default {
	name: 'ClassInfo',

	data() {
		return {
			dialogTitle: '学生信息',
			dialogFormVisible: false,
			formData: {},
			tableData: [],
			disabled: true,
			loading: false
		};
	},

	mounted() {
		this.load()
	},

	computed: {
		formatTime() {
			return (val) => {
        return val.replace("T", " ").slice(0,19)
      }
		},
	},

	methods: {
		load() {
			this.request.get('api/admin/getStudent').then(res => {
				this.tableData = res.data;
			})
		},
		handleShow(val) {
			this.dialogFormVisible = true;
			this.disabled = true;
			this.formData = val
		},
		handleEdit(val) {
			this.dialogFormVisible = true;
			this.disabled = false;
			this.formData = val;
		},
		handleSure() {
			this.request.post('api/admin/updateStudent', {
				...this.formData
			}).then(res => {
				if (res.code == 200) {
					this.$message.success(res.msg)
					this.dialogFormVisible =false
					this.load();
				}
			})
		},
		handleDel(val) {
			this.formData = val;
			this.request.post('api/admin/updateStudent', {
				...this.formData,
				status: 2
			}).then(res => {
				if (res.code == 200) {
					this.$message.success(res.msg)
					this.dialogFormVisible =false
					this.load();
				}
			})
		}
	},
};
</script>

<style lang="less" >
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