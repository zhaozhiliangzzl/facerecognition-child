<template>
    <el-menu
			class="el-menu-vertical-demo" 
			background-color="rgb(190, 190, 190)"
			text-color="black" active-text-color="#fff"
			router
			:default-active="defaultActive"
			@select="handleSelect"
			>

			<template v-for="(aside, index) in routes">
          <!-- 一级菜单（有子菜单） -->
          <el-submenu
            v-if="aside.children && aside.meta.roles.includes(routes.role)"
						v-show="aside.show"
            :index="aside.path || index.toString()"
            :key="index"
          >
            <template slot="title">
              <span class="icon"></span>
              <span>{{ aside.title }}</span>
            </template>
            <!-- 遍历二级菜单容器 -->
            <div v-for="(child, order) in aside.children" :key="order">
              <!-- 判断二级菜单（没有三级菜单）-->
              <el-menu-item
                v-if="!child.children"
                :index="child.path"
                :key="index + '-' + order"
              >
                {{ child.title }}
              </el-menu-item>
              <!-- 判断二级菜单（有三级菜单）-->
              <el-submenu v-else :index="child.title">
                <template slot="title">
                  <span>{{ child.title }}</span>
                </template>
                <el-menu-item
                  v-for="(childs, orders) in child.children"
                  :index="childs.path"
                  :key="index + '-' + order + '-' + orders"
                >
                  {{ childs.title }}
                </el-menu-item>
              </el-submenu>
            </div>
          </el-submenu>
          <!-- 一级菜单（无子菜单）-->
          <el-menu-item
            v-else-if="aside.meta.roles.includes(routes.role)"
						v-show="aside.show"
            :index="aside.path || index.toString()"
            :key="index"
          >
            <span class="icon"></span>
            {{ aside.title }}
          </el-menu-item>
        </template>

    </el-menu>
</template>

<script>

export default {
    name: 'Asider',
		data() {
			return {
				role: '',
				defaultActive: window.localStorage.getItem('activePath') || '/home', 
			}
		},
    created() {
			this.role = this.$store.state.user.role;
		},
		computed: {
			routes() {
				this.$router.options.routes[0].children.role = this.role
				return this.$router.options.routes[0].children
			},
		},
		methods: {
			load() {
				console.log(this.$router.options.routes)
			},
			handleSelect(key, path) {
				window.localStorage.setItem('activePath', key) // 用于记录激活的导航
			},
		}
}
</script>

<style scoped> 
.el-menu{
    border: 0px;
    height: 100%;
}

.is-active{
  background-color: #545c64 !important;
}

</style>
