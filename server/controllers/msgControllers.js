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


// $route   POST api/msg/getMsg
// @desc    获取信息
// access   public
router.post('/getMsg', (req,res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('message_info')
		.eq('is_look', '1')
		.eq('to_uid', fields.to_uid)
		.select();
		results = JSON.parse(JSON.stringify(results));
		jsonWrite(res, '200', '查询成功！', results);
		return;
	})
})


// $route   POST api/msg/updateMsg
// @desc    更新信息
// access   public
router.post('/updateMsg', (req,res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {

		const getChild = (vegs) => {
			const promises = vegs.map(async item => {
				let results2 = await orm.table('message_info')
				.eq('id', item.id)
				.update({'is_look': '2'});
				results2 = JSON.parse(JSON.stringify(results2));
				return results2;
			});
			return Promise.all( promises );
		}

		const child = await getChild(fields.msg_list);
		jsonWrite(res, '200', '修改成功', []);
		return;
	})
})


// $route   PODT api/msg/getChildInfo
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


// $route   POST api/msg/getSignRecord
// @desc    查询请假表
// access   public
router.post('/getSignRecord', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		let results = await orm.table('sign_info')
		.eq('sign_userid', fields.child_id)
		.likeRight('sign_time', sd.format(new Date(), 'YYYY-MM-DD'))
		.likeRight('out_time', sd.format(new Date(), 'YYYY-MM-DD'))
		.select('sign_time', 'out_time', 'is_sign', 'is_out');
		results = JSON.parse(JSON.stringify(results));
		jsonWrite(res, '200', '查询成功！', results)
		return
	})
})


// $route   POST api/msg/checkMsg
// @desc    查询请假表
// access   public
router.post('/checkMsg', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		let results1 = await orm.table('message_info')
		.likeRight('create_time', sd.format(new Date(), 'YYYY-MM-DD'))
		.like('msg', '请及时关注')
		.eq('is_look', '1')
		.select();
		results1 = JSON.parse(JSON.stringify(results1));
		if (results1.length !== 0) {
			jsonWrite(res, '200', 'success', [])
		return;
		}
		let results = await orm.table('message_info')
		.insert({
			...fields
		});
		results = JSON.parse(JSON.stringify(results));
		jsonWrite(res, '200', 'success', results)
		return;
	})
})
module.exports = router