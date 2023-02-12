const express = require('express')
const router = express.Router();
const formidable = require('formidable')
const path = require('path');
const fs = require('fs')
const Orm = require('../models/DB').Orm
var sd = require('silly-datetime');

const orm = new Orm()

let jsonWrite = (res, code, msg, data) => {
	let ret = {code,  msg, data }
	res.json(ret);
}

// $route   POST api/user/uploadAvatar
// @desc    shop图片上传
// access   public
// const dir = path.resolve(__dirname, '../public/images/case');

router.post('/uploadAvatar', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		
	}); 
})

// $route   GET api/admin/getUser
// @desc    获取所有admin
// access   public
router.get('/getUser', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('user')
		.eq('role', 0)
		.select('id');
		results = JSON.parse(JSON.stringify(results))
		jsonWrite(res, '200', '获取数据成功', results);
		return;
	}); 
})



// $route   POST api/admin/getUserById
// @desc    获取所有admin
// access   public
router.post('/getUser', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		form.parse(req, async (err, fields, files) => {
			if (err) {
				jsonWrite(res, '405', '服务器请求出错', err);
				return;
			}
			let result1 = await orm.table('user')
			.eq('id', fields.user_id)
			.select('nickname', 'avatar', 'role');
			let result2 = await orm.table('user_auths')
			.eq('user_id', fields.user_id)
			.select('user_id', 'identity_type', 'identifier', 'credential', 'create_time');
			let result3 = await orm.table('user_info')
			.eq('user_id', fields.user_id)
			.select('real_name', 'identity_card_type', 'identity_card_no', 'phone', 'email', 'gender','province', 'city', 'area', 'address','student_no','class_no', 'modified_time');
			result1 = JSON.parse(JSON.stringify(result1))
			result2 = JSON.parse(JSON.stringify(result2))
			result3 = JSON.parse(JSON.stringify(result3))
			const results = [{...result1[0], ...result2[0], ...result3[0]}]
			jsonWrite(res, '200', '获取数据成功', results);
			return;
		})
	}); 
})

// $route   POST api/admin/getLeave
// @desc    查询请假记录
// access   public
router.post('/getLeave', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('leave_info')
		.eq('user_id', fields.user_id)
		// .limit((fields.pageNum - 1) * fields.pageSize, fields.pageSize)
		.select();
		results = JSON.parse(JSON.stringify(results))
		jsonWrite(res, '200', '查询成功！', results);
	})
})


// $route   GET api/admin/getStudent
// @desc    获取所有学生
// access   public
router.get('/getStudent', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('student')
		.eq('status', '1')
		.select();
		results = JSON.parse(JSON.stringify(results))
		jsonWrite(res, '200', '获取数据成功', results);
		return;
	}); 
})


// $route   GET api/admin/updateStudent
// @desc    更新学生信息
// access   public
router.post('/updateStudent', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let tmp = fields;
		delete tmp.id;
		let results = await orm.table('student')
		.eq('student_no', tmp.student_no)
		.update({
			...tmp
		});
		jsonWrite(res, '200', '更新成功', results);
		return;
	}); 
})


// $route   GET api/admin/getTeacher
// @desc    获取所有老师
// access   public
router.get('/getTeacher', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let results1 = await orm.table('user')
		.eq('role', '2')
		.eq('status', '1')
		.select();
		results1 = JSON.parse(JSON.stringify(results1))
		 
		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('user_auths')
				.eq('user_id', item.id)
				.select();
				results2 = JSON.parse(JSON.stringify(results2));

				let results3 = await orm.table('user_info')
				.eq('user_id', item.id)
				.select();
				results3 = JSON.parse(JSON.stringify(results3));

				return {...results2[0],...results3[0], ...item};
			});
			return Promise.all( promises );
		}

		const child = await getChild(results1);
		jsonWrite(res, '200', '获取数据成功', child)
	}); 
})



// $route   GET api/admin/updateTeacher
// @desc    获取所有老师
// access   public
router.post('/updateTeacher', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let results1 = await orm.table('user')
		.eq('id', fields.user_id)
		.update({nickname: fields.nickname, status: fields.status});
		results1 = JSON.parse(JSON.stringify(results1))
		 
		let results2 = await orm.table('user_auths')
		.eq('id', fields.user_id)
		.update({identifier: fields.identifier, credential: fields.credential, create_time: fields.create_time});
		results2 = JSON.parse(JSON.stringify(results2))

		let results3 = await orm.table('user_info')
		.eq('id', fields.user_id)
		.update({identity_card_no: fields.identity_card_no});
		results3 = JSON.parse(JSON.stringify(results3))
	
		jsonWrite(res, '200', '获取数据成功', [])
	}); 
})


// $route   GET api/admin/getParent
// @desc    获取所有家长
// access   public
router.get('/getParent', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let results1 = await orm.table('user')
		.eq('role', '1')
		.eq('status', '1')
		.select();
		results1 = JSON.parse(JSON.stringify(results1))
		 
		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('user_auths')
				.eq('user_id', item.id)
				.select();
				results2 = JSON.parse(JSON.stringify(results2));

				let results3 = await orm.table('user_info')
				.eq('user_id', item.id)
				.select();
				results3 = JSON.parse(JSON.stringify(results3));

				return {...results2[0],...results3[0], ...item};
			});
			return Promise.all( promises );
		}

		const child = await getChild(results1);
		jsonWrite(res, '200', '获取数据成功', child)
	}); 
})



// $route   POST api/admin/updateParent
// @desc    更新家长信息
// access   public
router.post('/updateParent', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let results1 = await orm.table('user')
		.eq('id', fields.user_id)
		.update({nickname: fields.nickname, status: fields.status});
		results1 = JSON.parse(JSON.stringify(results1))
		 
		let results2 = await orm.table('user_auths')
		.eq('user_id', fields.user_id)
		.update({identifier: fields.identifier, credential: fields.credential, create_time: fields.create_time});
		results2 = JSON.parse(JSON.stringify(results2))

		let results3 = await orm.table('user_info')
		.eq('user_id', fields.user_id)
		.update({identity_card_no: fields.identity_card_no});
		results3 = JSON.parse(JSON.stringify(results3))
	
		jsonWrite(res, '200', '获取数据成功', [])
	}); 
})



// $route   POST api/admin/getLeaveRecord
// @desc    获取学生请假列表
// access   public
router.get('/getLeaveRecord', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {

		let results1 = await orm.table('leave_info')
		.select();
		results1 = JSON.parse(JSON.stringify(results1));
		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('student')
				.eq('student_no', item.student_no)
				.select();
				results2 = JSON.parse(JSON.stringify(results2));
				return {...results2[0], ...item};
			});
			return Promise.all( promises );
		}
		const child = await getChild(results1);
		jsonWrite(res, '200', '获取数据成功', child)
		return;
	})
})


// $route   POST api/admin/getSignRecord
// @desc    获取学生考勤
// access   public
router.get('/getSignRecord',async (req, res) => {
	let results1 = await orm.table('student')
		.eq('status', '1')
		.select();
		results1 = JSON.parse(JSON.stringify(results1));

		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('sign_info')
				.eq('sign_userid', item.student_no)
				.select();
				results2 = JSON.parse(JSON.stringify(results2));
				if (results2.length == 0) return {sign_time: null, out_time: null, is_sign: null, is_out: null, ...item};
				results2[0].sign_time = sd.format(results2[0].sign_time, 'YYYY-MM-DD HH:mm:ss');
				results2[0].out_time = sd.format(results2[0].out_time, 'YYYY-MM-DD HH:mm:ss');
				return {...results2[0], ...item};
			});
			return Promise.all( promises );
		}
		const child = await getChild(results1);
		jsonWrite(res, '200', '获取数据成功', child)
		return;
})


// $route   POST api/admin/updateSignRecord
// @desc    更新学生请假列表
// access   public
router.post('/updateSignRecord', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let tmp = fields;
		delete tmp.id;
		if (tmp.sign_time) tmp.is_sign = 1;
		if (tmp.out_time) tmp.is_out = 2;
		
		let results1 = await orm.table('sign_info')
		.eq('sign_userid', tmp.student_no)
		.select();
		results1 = JSON.parse(JSON.stringify(results1));
		if(results1.length) {
			let results = await orm.table('sign_info')
			.eq('sign_userid', tmp.student_no)
			.update({'sign_time': tmp.sign_time, 'is_sign': tmp.is_sign, 'out_time': tmp.out_time, 'is_out': tmp.is_out});
			results = JSON.parse(JSON.stringify(results));
		} else{
			let results = await orm.table('sign_info')
			.insert({'sign_userid': tmp.student_no,'sign_time': tmp.sign_time, 'is_sign': tmp.is_sign, 'out_time': tmp.out_time, 'is_out': tmp.is_out});
			results = JSON.parse(JSON.stringify(results));
		}

		jsonWrite(res, '200', '更新成功', [])
		return;
	})
})


// $route   POST api/admin/delSignRecord
// @desc    删除学生签到信息
// access   public
router.post('/delSignRecord', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		console.log(fields);
		let results = await orm.table('sign_info')
		.eq('sign_userid', fields.student_no)
		.delete();
		results = JSON.parse(JSON.stringify(results));
		if (results?.affectedRows) jsonWrite(res, '200', '删除成功！', []);
		return;
	})
})


// $route   POST api/admin/delLeaveRecord
// @desc    删除学生请假信息
// access   public
router.post('/delLeaveRecord', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('leave_info')
		.eq('id', fields.id)
		.delete();
		results = JSON.parse(JSON.stringify(results));
		if (results?.affectedRows) jsonWrite(res, '200', '删除成功！', []);
		return;
	})
})

module.exports = router