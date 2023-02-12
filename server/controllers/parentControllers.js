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

// $route   POST api/parent/getChild
// @desc    查询所有孩子
// access   public
router.post('/getChild', (req, res) => {
	const form = formidable({})
	form.parse(req,async (err, fields, files) => {
		let results = await orm.table('child_parent')
		.eq('parent_id', fields.user_id)
		.select('child_id');
		results = JSON.parse(JSON.stringify(results))
		jsonWrite(res, '200', '查询成功', results);
	})
})

// $route   POST api/parent/getLeave
// @desc    查询请假记录
// access   public
router.post('/getLeave', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('leave_info')
		.eq('parent_id', fields.user_id)
		.limit((fields.pageNum - 1) * fields.pageSize, fields.pageSize)
		.select();
		results = JSON.parse(JSON.stringify(results))
		for(let i = 0;i < results.length; i++) {
			let start_time = results[i].start_time;
			let end_time = results[i].end_time;
			results[i].start_time = start_time.split('T')[0];
			results[i].end_time = end_time.split('T')[0];
		}
		jsonWrite(res, '200', '查询成功！', results);
	})
})

// $route   POST api/parent/getLeaveTotle
// @desc    查询请假记录数量
// access   public
router.post('/getLeaveTotle', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('leave_info')
		.eq('parent_id', fields.user_id)
		.count();
		results = JSON.parse(JSON.stringify(results))
		jsonWrite(res, '200', '查询成功！', results);
	})
})

// $route   POST api/parent/addLeave
// @desc    新增请假记录
// access   public
router.post('/addLeave', (req, res) => {
	const form = formidable({});
	const status = 1;
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('leave_info')
		.insert({
			...fields,
			status
		});
		results = JSON.parse(JSON.stringify(results))
		if (results.affectedRows) jsonWrite(res, '200', '请假新增成功！', []);
	})
})


// $route   POST api/parent/getSignRecord
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


// $route   POST api/parent/getNowSignRecord
// @desc    查询请假表
// access   public
router.post('/getNowSignRecord', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		const time = sd.format(new Date(), 'YYYY-MM-DD');
		let results = await orm.table('sign_info')
		.eq('sign_userid', fields.child_id)
		.likeRight('sign_time', time)
		.likeRight('out_time', time)
		.select('sign_time', 'out_time', 'is_sign', 'is_out');
		results = JSON.parse(JSON.stringify(results));
		jsonWrite(res, '200', '查询成功！', results)
		return
	})
})


// $route   PODT api/parent/getChildInfo
// @desc    获取用户的孩子
// access   public
router.post('/getChildInfo', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		console.log(fields)
		if (err) {
			jsonWrite(res, '405', '查询失败', []);
			return;
		}
		// let child = new Array();
		let results1 = await orm.table('child_parent')
		.eq('status', '1')
		.eq('parent_id', fields.parent_id)
		.select();
		results1 = await JSON.parse(JSON.stringify(results1));

		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('student')
				.eq('status', '1')
				.eq('id', item.child_id)
				.select();
				results2 = JSON.parse(JSON.stringify(results2));
				return {...results2[0], 'relationship': item.relationship};
			});
			return Promise.all( promises );
		}

		const child = await getChild(results1);
		jsonWrite(res, '200', '查询成功！', child);
		return;
	})
})


// $route   POST api/parent/addChild
// @desc    添加孩子
// access   public
router.post('/addChild', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		// 查询孩子是否注册
		let results2;
		let results1 = await orm.table('student')
		.eq('status', '1')
		.eq('student_no', fields.student_no)
		.select();
		results1 = JSON.parse(JSON.stringify(results1));
		if (results1.length === 0) {		//未注册
			results2 = await orm.table('student')
			.insert({'class': fields.class, 'name': fields.name, 'student_no': fields.student_no});
			results2 = JSON.parse(JSON.stringify(results2));
		}
		// 已有该孩子信息
		let results4 = await orm.table('child_parent')
		.eq('status', '1')
		.eq('child_id', results1.length === 0 ? results2.insertId : results1[0].id)
		.eq('parent_id', fields.parent_id)
		.select();
		results4 = JSON.parse(JSON.stringify(results4));
		if (results4.length !== 0) {
			jsonWrite(res, '405', '您孩子已经添加，请勿重复添加！', []);
			return;
		}
		// 尚未添加该孩子
		let results3 = await orm.table('child_parent')
		.insert({'parent_id': fields.parent_id, 'child_id': results1.length === 0 ? results2.insertId : results1[0].id, 'relationship': fields.relationship});
		results3 = JSON.parse(JSON.stringify(results3));
		if (results3.affectedRows) jsonWrite(res, '200', '孩子增加成功！', []);
		else jsonWrite(res, '405', '孩子增加失败！', []);
		return;
	})
})


// $route   POST api/parent/delChild
// @desc    删除孩子
// access   public
router.post('/delChild',(req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		
		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results1 = await orm.table('student')
				.eq('student_no', item.student_no)
				.update({'status': '2'});
				let results2 = await orm.table('child_parent')
				.eq('child_id', item.id)
				.update({'status': '2'});
				return {...results2[0], 'relationship': item.relationship};
			});
			return Promise.all( promises );
		}
		let results3 = JSON.parse(JSON.stringify(fields));
		const child = await getChild(results3.child_list);
		jsonWrite(res, '200', '删除成功！', []);
		return;
	})
})
module.exports = router