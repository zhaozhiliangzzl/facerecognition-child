const express = require('express')
const app = express()
var path = require("path")

app.use('/public', express.static('public'));


// CORS跨域
app.use((req, res, next) => {
	//判断路径
	if(req.path !== '/' && !req.path.includes('.')){
		res.set({
			'Access-Control-Allow-Credentials': true, //允许后端发送cookie
			'Access-Control-Allow-Origin': req.headers.origin || '*', //任意域名都可以访问,或者基于我请求头里面的域
			'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type', //设置请求头格式和类型
			'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',//允许支持的请求方式
			'Content-Type': 'application/json; charset=utf-8' || 'multipart/form-data'//默认与允许的文本格式json和编码格式
		})
	}
	req.method === 'OPTIONS' ? res.status(204).end() : next()
})

const userControllers = require('./controllers/userControllers')
const studentControllers = require('./controllers/studentControllers')
const parentControllers = require('./controllers/parentControllers')
const teacherControllers = require('./controllers/teacherControllers')
const adminControllers = require('./controllers/adminControllers')
const msgControllers = require('./controllers/msgControllers')
app.use('/api/student', studentControllers)
app.use('/api/parent', parentControllers)
app.use('/api/teacher', teacherControllers)
app.use('/api/admin', adminControllers)
app.use('/api/user', userControllers)
app.use('/api/msg', msgControllers)

app.listen(5000, () => console.log(`端口已启动====>5000`))