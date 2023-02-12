<template>
    <div class="wapper">
        <el-container>
        <el-header>
            <Header />
        </el-header>
        <el-container >
            <el-aside width="200px">
                <Asider />
            </el-aside>
            <el-container class="content">
                <!-- 表示当前页面的子路由会在router-view中显示 -->
                <router-view />
            </el-container>
        </el-container>
        </el-container>
    </div>
</template>

<script>
import Header from '../components/Header.vue'
import Asider from '../components/Asider.vue'
export default {
	name: 'Layout',
	data() {
		return {
			content: {
				padding: '5px 10px',
				backgroundColor: '#f0f2f5'
			}
		}
	},
	components: {
		Header,
		Asider
	}
}
</script>

<style lang="less" scoped> 
.el-header {
    background-color: #252a3d;
		background: url('./../assets/img/header.jpg') no-repeat center;
		background-size: 100%;
		height: 80px !important;
    line-height: 80px;
    position: fixed;
    z-index: 1;
    width: 100%;
}

.el-aside {
    line-height: 200px;
    box-shadow: 2px 0 6px rgb(0 21 41 / 35%);
    height: 100%;
    position: fixed;
    top: 80px;
    z-index: 1;
}

.content{
    // padding: 65px 5px 0 210px;
		width: 100%;
		padding: 10px 20px;
    background-color: #f0f2f5;
    z-index: 0;
    position: absolute;
    top: 80px;
    left: 200px;
    width: calc(100% - 200px);
		background: url('./../assets/img/content_copy.jpeg') no-repeat center;
		background-size: 100%,100%;
}
</style>
