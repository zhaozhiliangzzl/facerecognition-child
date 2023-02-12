const express = require('express')
const router = express.Router();
const formidable = require('formidable')
const path = require('path');
const fs = require('fs')
const Orm = require('../models/DB').Orm
var sd = require('silly-datetime');

const orm = new Orm()

const jsonWrite = (res, code, msg, data) => {
	let ret = {code,  msg, data }
	res.json(ret);
}

// $route   GET api/teacher/getStudentList
// @desc    获取全部学生
// access   public
router.post('/getStudentList', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('child_teacher')
		.eq('status', '1')
		.eq('teacher_id', fields.teacher_id)
		.select();
		results = JSON.parse(JSON.stringify(results))
		jsonWrite(res, '200', '获取数据成功', results)
		return;
	})
})

// $route   POST api/teacher/updateStudent
// @desc    获取全部学生
// access   public
router.post('/updateStudent', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {

		let results1 = await orm.table('child_teacher')
		.eq('teacher_id', fields.teacher_id)
		.update({'status': 2});

		let results = await orm.table('student')
		.select();
		results = JSON.parse(JSON.stringify(results));
		let student_list = results.filter(item => item.class == fields.studentList)

		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('child_teacher')
				.insert({'teacher_id': fields.teacher_id, 'child_id': item.student_no, 'class': item.class});
				results2 = JSON.parse(JSON.stringify(results2));
				return results2;
			});
			return Promise.all( promises );
		}

		const child = await getChild(student_list);
		jsonWrite(res, '200', '更新成功！', []);

		// results1 = JSON.parse(JSON.stringify(results1));
		// fields.studentList.forEach(async (item) => {
		// 	let result2 = await orm.table('child_teacher')
		// 	.insert({'teacher_id': fields.teacher_id, 'child_id': item});
		// })
		// jsonWrite(res, '200', '更新成功', [])
		return;
	})
})

// $route   POST api/teacher/getClassStudentList
// @desc    获取班级学生
// access   public
router.post('/getClassStudentList', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('child_teacher')
		.eq('status', 1)
		.eq('teacher_id', fields.teacher_id)
		.select('child_id');
		results = JSON.parse(JSON.stringify(results));
		jsonWrite(res, '200', '获取班级学生成功', results)
		return;
	})
})

// $route   POST api/teacher/getLeaveRecord
// @desc    获取学生请假列表
// access   public
router.post('/getLeaveRecord', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {

		let results1 = await orm.table('child_teacher')
		.eq('status', '1')
		.eq('teacher_id', fields.teacher_id)
		.select();
		results1 = JSON.parse(JSON.stringify(results1))

		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('student')
				.eq('student_no', item.child_id)
				.select();
				results2 = JSON.parse(JSON.stringify(results2));

				let results3 = await orm.table('leave_info')
				.eq('student_no', item.child_id)
				.select();
				results3 = JSON.parse(JSON.stringify(results3));
				if (results3.length != 0) return {...results2[0], ...results3[0], ...item};

				return '';
			});
			return Promise.all( promises );
		}

		let child = await getChild(results1);
		child = child.filter(item => item != '')
		jsonWrite(res, '200', '获取数据成功', child)
		return;
	})
})

// $route   POST api/teacher/updateLeaveRecord
// @desc    更新用户请假表
// access   public
router.post('/updateLeaveRecord', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		console.log(fields)
		let tmp = JSON.parse(JSON.stringify(fields));
		delete tmp.id;
		let results = await orm.table('leave_info')
		.eq('student_no', fields.student_no)
		.update({'status': fields.status, status_userid: fields.status_userid, status_username: fields.status_username});
		results = JSON.parse(JSON.stringify(results));
		if (results.affectedRows) jsonWrite(res, '200', '更新成功！', [])
		return
	})
})

// $route   POST api/teacher/getSignRecord
// @desc    查询请假表
// access   public
router.post('/getSignRecord', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('sign_info')
		.eq('sign_userid', fields.child_id)
		.select('sign_time', 'out_time', 'is_sign', 'is_out');
		results = JSON.parse(JSON.stringify(results));
		jsonWrite(res, '200', '查询成功！', results)
		return
	})
})


// $route   GET api/teacher/getStudentList
// @desc    获取全部学生
// access   public
router.post('/getStudentListInfo', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		let results1 = await orm.table('child_teacher')
		.eq('status', '1')
		.eq('teacher_id', fields.teacher_id)
		.select();
		results1 = JSON.parse(JSON.stringify(results1))

		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('student')
				.eq('student_no', item.child_id)
				.select();
				results2 = JSON.parse(JSON.stringify(results2));

				let results3 = await orm.table('sign_info')
				.eq('sign_userid', item.child_id)
				.select();
				if (results3.length == 0) {
					return {...results2[0], sign_time: null, out_time: null, is_sign: null,is_out: null , ...item};
				}
				results3 = JSON.parse(JSON.stringify(results3));
				return {...results2[0],...results3[0], ...item};
			});
			return Promise.all( promises );
		}

		const child = await getChild(results1);

		jsonWrite(res, '200', '获取数据成功', child)
		return;
	})
})


// $route   POST api/teacher/getRecordInfo
// @desc    获取全部学生
// access   public
router.post('/getRecordInfo', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		if (fields.date == '') fields.date = sd.format(new Date(), 'YYYY-MM-DD');
		else fields.date = fields.date.split('T')[0]

		let results1 = await orm.table('child_teacher')
		.eq('status', '1')
		.eq('teacher_id', fields.teacher_id)
		.select();
		results1 = JSON.parse(JSON.stringify(results1))

		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('student')
				.eq('student_no', item.child_id)
				.select();
				results2 = JSON.parse(JSON.stringify(results2));

				let results3 = await orm.table('sign_info')
				.likeRight('sign_time', fields.date)
				.eq('sign_userid', item.child_id)
				.select();
				
				results3 = JSON.parse(JSON.stringify(results3));

				let results4 = await orm.table('leave_info')
				.gt('end_time', fields.date)
				.lt('start_time', fields.date)
				.eq('student_no', item.child_id)
				.eq('status', '2')
				.select('start_time', 'end_time');
				results4 = JSON.parse(JSON.stringify(results4));
				let res1 = '', res2 = '';
				if (results3.length == 0) {
					res1 = {sign_time: null, out_time: null, is_sign: null,is_out: null};
				} else {
					res1 = {...results3[0]}
				}
				if (results4.length == 0) res2 = {start_time: null,end_time: null};
				else res2 = {...results4[0]}
				return {...results2[0],...res1,...res2, ...item};
			});
			return Promise.all( promises );
		}

		const child = await getChild(results1);

		jsonWrite(res, '200', '获取数据成功', child)
		return;
	})
})


module.exports = router
