import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		name: 'Layout',
    redirect: '/home',
		show: true, 
		component: () => import('../views/Layout.vue'),
		children: [
			{
				path: '/home',
        name: 'Home',
				title: '首页',
				meta: {
					roles: [1, 2, 3]
				},
				show: true,
        component: () => import('../views/Home.vue')
			},
			// 学生
			{
        path: '/student/userInfo',
        name: 'userInfo',
				title: '个人信息',
				meta: {
					roles: [0]
				},
				show: true,
        component: () => import('../views/student/UserInfo.vue')
      },
			// 家长
			{
        path: '/parent/userInfo',
        name: 'userInfo',
				title: '个人信息',
				meta: {
					roles: [1]
				},
				show: true,
        component: () => import('../views/parent/UserInfo.vue')
      },
			{
				path: '',
				name: 'Manage',
				title: '接送管理',
				meta: {
					roles: [1]
				},
				// redirect: '/parent/SingRecord',
				component: () => import('../views/parent/Manage.vue'),
				show: true,
				children: [
					{
						path: '/parent/SingRecord',
						name: 'SingRecord',
						title: '考勤记录',
						meta: {
							roles: [1]
						},
						show: true,
						component: () => import('../views/parent/SingRecord.vue')
					},
					{
						path: '/parent/PickRecord',
						name: 'SingRecord',
						title: '接送查看',
						meta: {
							roles: [1]
						},
						show: true,
						component: () => import('../views/parent/PickRecord.vue')
					},
				]
			},
			{
        path: '/parent/LeaveRecord',
        name: 'LeaveRecord',
				title: '请假记录',
				meta: {
					roles: [1]
				},
				show: true,
        component: () => import('../views/parent/LeaveRecord.vue')
      },
			// 老师
			{
        path: '/teacher/userInfo',
        name: 'userInfo',
				title: '个人信息',
				meta: {
					roles: [2]
				},
				show: true,
        component: () => import('../views/teacher/UserInfo.vue')
      },
			{
				path: '',
				name: 'Manage',
				title: '接送管理',
				meta: {
					roles: [2]
				},
				show: true,
        component: () => import('../views/teacher/Manage.vue'),
				children: [
					{
						path: '/teacher/SingCount',
						name: 'SingRecord',
						title: '班级考勤统计',
						meta: {
							roles: [2]
						},
						show: true,
						component: () => import('../views/teacher/SingCount.vue')
					},
					{
						path: '/teacher/SingRecord',
						name: 'SingRecord',
						title: '班级考勤记录',
						meta: {
							roles: [2]
						},
						show: true,
						component: () => import('../views/teacher/SingRecord.vue')
					},
				]
			},
			{
        path: '/teacher/LeaveRecord',
        name: 'LeaveRecord',
				title: '请假审核',
				meta: {
					roles: [2]
				},
				show: true,
        component: () => import('../views/teacher/LeaveRecord.vue')
      },
			// 管理员
			{
        path: '/admin/userInfo',
        name: 'userInfo',
				title: '个人信息',
				meta: {
					roles: [3]
				},
				show: true,
        component: () => import('../views/admin/UserInfo.vue')
      },
			{
        path: '/admin/SingRecord',
        name: 'SingRecord',
				title: '考勤记录',
				meta: {
					roles: [3]
				},
				show: true,
        component: () => import('../views/admin/SingRecord.vue')
      },
			{
        path: '/admin/LeaveRecord',
        name: 'LeaveRecord',
				title: '请假记录',
				meta: {
					roles: [3]
				},
				show: true,
        component: () => import('../views/admin/LeaveRecord.vue')
      },
			{
        path: '',
        name: 'User',
				title: '信息管理',
				meta: {
					roles: [3]
				},
				show: true,
        component: () => import('../views/admin/Manage.vue'),
				children: [
					{
						path: '/admin/classInfo',
						name: 'classInfo',
						title: '孩子信息',
						meta: {
							roles: [3]
						},
						show: true,
						component: () => import('../views/admin/classInfo.vue')
					},
					{
						path: '/admin/parentInfo',
						name: 'parentInfo',
						title: '家长信息',
						meta: {
							roles: [3]
						},
						show: true,
						component: () => import('../views/admin/parentInfo.vue')
					},
					{
						path: '/admin/teacherInfo',
						name: 'teacherInfo',
						title: '老师信息',
						meta: {
							roles: [3]
						},
						show: true,
						component: () => import('../views/admin/teacherInfo.vue')
					},
				]
      },
		]
	},
	{
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
	{
    path: '/faceRecognition',
    name: 'FaceRecognition',
    component: () => import('../views/FaceRecognition.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 挂载路由导航守卫
// to 将要访问的路径  from 代表从哪个路径跳转而来  next()放行  next('/login')强制跳转
router.beforeEach((to, from, next) => {
  // 1.如果访问的是登录页login放行
  if (to.path === '/login') return next()
  // 如果要注册，则去注册
  if (to.path === '/register') return next()
	// 人脸识别
  if (to.path === '/faceRecognition') return next()
  // 2.获取token
  const tokenStr = window.localStorage.userInfo
  // 3.tokenStr不存在强制跳转到登录页login
  if (tokenStr == undefined) return next('/login')
 
	next()
})

export default router
