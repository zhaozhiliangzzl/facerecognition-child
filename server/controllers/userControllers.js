const express = require('express')
const router = express.Router();
const formidable = require('formidable')
const path = require('path');
const fs = require('fs')
const Orm = require('../models/DB').Orm
const sd = require('silly-datetime');
const config = require('../config');
var AipFaceClient = require("baidu-aip-sdk").face;
var HttpClient = require("baidu-aip-sdk").HttpClient;

const orm = new Orm()

let jsonWrite = (res, code, msg, data) => {
	let ret = {code,  msg, data }
	res.json(ret);
}

// $route   POST api/user/login
// @desc    登录验证
// access   public
router.post('/login', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		if (err) {
			jsonWrite(res, '405', '服务器请求出错', err);
			return;
		}
		if (!fields.isvalidate) {
			jsonWrite(res, '-2', '验证码错误，请重新输入！', []);
			return;
		}
		let results = await orm.table('user_auths')
														.eq('identifier', fields.identifier)
														.select('user_id', 'identity_type', 'identifier', 'credential');
		results = JSON.parse(JSON.stringify(results))
		if (results?.length === 0) {
				jsonWrite(res, '-1', '该账号尚未注册，请注册后登录！', []);
				return;
		}
		if(results[0]?.credential == fields.credential) {
			let results2 = await orm.table('user')
														.eq('id', results[0].user_id)
														.eq('status', '1')
														.ne('role', '0')
														.select('nickname', 'avatar', 'role');
			results2 = JSON.parse(JSON.stringify(results2));
			if (results2?.length === 0) {
				jsonWrite(res, '-1', '没有找到用户信息，请重试！', []);
				return;
			}
			results = {...results[0], ...results2[0]}
			jsonWrite(res, '200', '登陆成功！', results);
		} else {
				jsonWrite(res, '0', '密码错误，请重新输入！', [])
		}
		return;
	})
});

// $route   POST api/user/register
// @desc    注册
// access   public
router.post('/register', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		if (err) {
			jsonWrite(res, '405', '服务器请求出错', err);
			return;
		}
		let results = await orm.table('user_auths')
														 .eq('identifier', fields.identifier)
														 .select('user_id', 'identity_type', 'identifier', 'credential');
		results = JSON.parse(JSON.stringify(results))
		if (results?.length != 0) {
			jsonWrite(res, '-1', '该账号已注册，请登录！', []);
			return;
		}
		let user = await orm.table('user')
			.insert({'nickname': fields.nickname , 'avatar': '', 'role': fields.userRole, 'status': '1'});
		let user_auths = await orm.table('user_auths')
			.insert({'user_id': user?.insertId, 'identity_type': '1', 'identifier': fields.identifier, 'credential': fields.credential});
		let user_info = await orm.table('user_info')
		.insert({'user_id': user?.insertId});
		
		if (user?.affectedRows && user_auths?.affectedRows && user_info?.affectedRows) {
			jsonWrite(res, '200', '注册成功！', fields);
			return;
		}
	})
});

// $route   POST api/user/getCase
// @desc    获取案件信息
// access   public
router.post('/getCase', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		if (err) {
			jsonWrite(res, '405', '服务器请求出错', err);
			return;
		}
		const results = await orm.table('case_info')
													.eq('user_id', fields?.user_id)
													.eq('status', 1)
													.like('case_code', fields?.case_code)
													.like('car_code', fields?.car_code)
													.like('report_name', fields?.report_name)
													.orderByDesc('report_time')
													.limit((fields.pageNum - 1) * fields.pageSize, fields.pageSize)
													.select();
		jsonWrite(res, '200', '获取数据成功成功！', results);
		return;
	})
})

// $route   POST api/user/getCaseTotal
// @desc    获取案件信息
// access   public
router.post('/getCaseTotal', (req, res) => {
	const form = formidable({})
	form.parse(req, async (err, fields, files) => {
		if (err) {
			jsonWrite(res, '405', '服务器请求出错', err);
			return;
		}
		const results = await orm.table('case_info')
													.eq('user_id', fields?.user_id)
													.eq('status', 1)
													.like('case_code', fields?.case_code)
													.like('car_code', fields?.car_code)
													.like('report_name', fields?.report_name)
													.orderByDesc('accident_time')
													.count();
		jsonWrite(res, '200', '获取数据成功成功！', results);
		return;
	})
})

// $route   POST api/user/insertCase
// @desc    新增案件
// access   public
router.post('/insertCase', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		if (err) {
			jsonWrite(res, '405', '服务器请求出错', err);
			return;
		}
		let results = await orm.table('case_info')
		.insert({'user_id': fields.user_id, 'case_code': fields.case_code, 'car_code': fields.car_code, 'report_name': fields.report_name, 'accident_time': fields.accident_time, 'report_time': fields.report_time, 'report_phone': fields.report_phone, 'province': fields.province, 'city': fields.city, 'area': fields.area, 'address': fields.address, 'case_describe': fields.case_describe, 'case_url': fields.case_url })
		results = JSON.parse(JSON.stringify(results))
		if (results?.affectedRows) {
			jsonWrite(res, '200', '案件添加成功！', []);
		}
		return;
	})
})

// $route   POST api/user/uploadCase
// @desc    shop图片上传
// access   public
// const dir = path.resolve(__dirname, '../public/images/case');

router.post('/uploadCase', (req, res) => {
	const form = formidable({});
	form.encoding = 'utf-8' // 编码
	form.uploadDir = "../public/images/tmp"     //设置上传目录
	form.keepExtensions = true;     //保留后缀
	let targetDir = path.resolve(__dirname, '../public/images/case/');
  // 检查目标目录，不存在则创建
  fs.access(targetDir, function(err){
    if(err){
      fs.mkdirSync(targetDir);
    }
    _fileParse();
  });
	 // 文件解析与保存
	 function _fileParse() {
    form.parse(req, async (err, fields, files) => {
      if (err) {
				jsonWrite(res, '405', '服务器请求出错', err);
				return;
			}
			let oldPath = files.file.filepath; //获取文件路径 ~/public/images/<随机生成的文件名>.<扩展名>
			let fileName = new Date().getTime() + '-' + files.file.originalFilename;
			var targetFile = path.join(targetDir, fileName);
			//移动文件
			fs.rename(oldPath, targetFile, (err) => {
				if (err) throw Error;
				res.json({
						code: '200',
						msg: 'upload success',
						url: 'http://127.0.0.1:5000/public/images/case/' + fileName
				});
			})
    }); 
	}
})

// $route   POST api/user/getUserById
// @desc    获取该用户信息
// access   public
router.post('/getUserById', (req, res) => {
	const form = formidable({});
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
})

// $route   POST api/user/uploadAvatar
// @desc    shop图片上传
// access   public
// const dir = path.resolve(__dirname, '../public/images/case');

router.post('/uploadAvatar', (req, res) => {
	const form = formidable({});
	form.encoding = 'utf-8' // 编码
	form.uploadDir = "../public/images/tmp"     //设置上传目录
	form.keepExtensions = true;     //保留后缀
	let targetDir = path.resolve(__dirname, '../public/images/avatar/');
  // 检查目标目录，不存在则创建
  fs.access(targetDir, function(err){
    if(err){
      fs.mkdirSync(targetDir);
    }
    _fileParse();
  });
	 // 文件解析与保存
	 function _fileParse() {
    form.parse(req, async (err, fields, files) => {
      if (err) {
				jsonWrite(res, '405', '服务器请求出错', err);
				return;
			}
			let oldPath = files.file.filepath; //获取文件路径 ~/public/images/<随机生成的文件名>.<扩展名>
			let fileName = new Date().getTime() + '-' + files.file.originalFilename;
			var targetFile = path.join(targetDir, fileName);
			//移动文件
			fs.rename(oldPath, targetFile, (err) => {
				if (err) throw Error;
				res.json({
						code: '200',
						msg: 'upload success',
						url: 'http://127.0.0.1:5000/public/images/avatar/' + fileName
				});
			})
    }); 
	}
})


// $route   POST api/user/updateUserById
// @desc    新增案件
// access   public
router.post('/updateUserById', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		if (err) {
			jsonWrite(res, '405', '服务器请求出错', err);
			return;
		}
		let result1 = await orm.table('user')
		.eq('id', fields.user_id)
		.update({'nickname': fields.nickname, 'avatar': fields.avatar});
		let result2 = await orm.table('user_auths')
		.eq('user_id', fields.user_id)
		.update({'identity_type': fields.identity_type, 'identifier': fields.identifier, 'credential': fields.credential});
		let result3 = await orm.table('user_info')
		.eq('user_id', fields.user_id)
		.update({'real_name': fields.real_name, 'identity_card_type': fields.identity_card_type, 'identity_card_no': fields.identity_card_no, 'phone': fields.phone, 'email': fields.email, 'gender': fields.gender, 'province': fields.province, 'city': fields.city, 'area': fields.area, 'address': fields.address, 'modified_time':  sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')});
		if (result1.affectedRows || result2.affectedRows || result3.affectedRows) jsonWrite(res, '200', '个人信息更新成功！', []);
		return;
	})
})


// $route   POST api/user/getLoss
// @desc    新增案件
// access   public
router.post('/getLoss', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		if (err) {
			jsonWrite(res, '405', '服务器请求出错', err);
			return;
		}
		let results = await orm.table('loss_info')
		.eq('case_code', fields.case_code)
		.select();
		results = JSON.parse(JSON.stringify(results))
		jsonWrite(res, '200', '获取信息成功', results);
		return;
	})
})

// $route   POST api/user/deleteCaseById
// @desc    新增案件
// access   public
router.post('/deleteCaseById', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		if (err) {
			jsonWrite(res, '405', '服务器请求出错', err);
			return;
		}
		fields?.deleteList.forEach(item => {
			let results = orm.table('case_info')
			.eq('id', item)
			.update({'status': 2});
			if (results.affectedRows) {
				jsonWrite(res, '405', '删除失败', []);
				return;
			}
		})
		jsonWrite(res, '200', '删除成功', []);
		return;
	})
})

// $route   POST api/user/insertLoss
// @desc    新增案件
// access   public
router.post('/insertLoss',async (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		if (err) {
			jsonWrite(res, '405', '服务器请求出错', err);
			return;
		}
		Object.keys(fields).forEach(async item => {
			if (fields[item]?.checked) {
				let results = await orm.table('loss_info')
				.insert({'case_code': fields.case_code, 'loss_project': fields[item].loss_project, 'loss_account': fields[item].loss_account, 'loss_amount': fields[item].loss_amount, 'loss_type': fields[item].loss_type});
				if (!results?.affectedRows) {
					jsonWrite(res, '405', '添加失败', []);
					return;
				}
			}
		})
		jsonWrite(res, '200', '定损成功', []);
		return;
	})
})

// $route   POST api/user/faceRecognition
// @desc    人脸识别
// access   public
let client = new AipFaceClient(config.APP_ID, config.API_KEY, config.SECRET_KEY);
router.post('/faceRecognition', (req, res) => {
	const form = formidable({});
	form.parse(req, async (err, fields, files) => {
		const image = fields.image.replace(/^data:image\/\w+;base64,/, '');
		const imageType = fields.imageType;
		const groupId = "20220514";
		const groupIdList = "20220514";
		const userId = fields.uid;
		const nowDay = sd.format(new Date(), 'YYYY-MM-DD');
		const nowDate = sd.format(new Date(), 'HH').toString();
		let results;
		if (userId) {
			await	client.search(image, imageType, groupIdList)
			.then(async function(result) {
				let results1 = JSON.parse(JSON.stringify(result));
				if (!results1.error_code) {
					jsonWrite(res, '200', '人脸识别照片已上传成功,请勿重复上传！', []);
					return;
				}
				await	client.addUser(image, imageType, groupId, userId).then(function(result) {
					let results2 = JSON.parse(JSON.stringify(result));
						if (results2.error_code == 0 || results.error_msg === 'face already exist') {
							jsonWrite(res, '200', '人脸识别照片上传成功！', []);
							return;
						}
				}).catch(function(err) {
						// 如果发生网络错误
						jsonWrite(res, '405', '人脸识别照片上传失败，请重新上传！', []);
						return;
				});
			});
		  
		} else {
			await	client.search(image, imageType, groupIdList)
			.then(async function(result) {
				results = JSON.parse(JSON.stringify(result));
				// console.log(results.result.user_list)
				if (results.result.user_list[0].score > 80) {
					let signIn = await orm.table('sign_info')
						.eq('sign_userid', results.result.user_list[0].user_id)
						.eq('is_sign', '1')
						.likeRight('sign_time', nowDay)
						.select();
						signIn = JSON.parse(JSON.stringify(signIn));
						console.log(signIn)
					if(nowDate > 14) {
						let updateRes = await orm.table('sign_info')
							.eq('id', signIn[0].id)
							.update({'out_time': sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'), 'is_out': '2' });
						jsonWrite(res, '200', '签退成功', []);

						// 签到成功，将消息发给父母
						let studentRes = await orm.table('student')
						.eq('status', '1')
						.eq('student_no', results.result.user_list[0].user_id)
						.select();
						studentRes = JSON.parse(JSON.stringify(studentRes));
						let parentRes = await orm.table('child_parent')
						.eq('status', '1')
						.eq('child_id', studentRes[0].id)
						.select();
						parentRes = JSON.parse(JSON.stringify(parentRes));
						const msgRes = await orm.table('message_info')
						.insert({'to_uid': parentRes[0].parent_id, 'from_uid': studentRes[0].student_no, 'from_name': studentRes[0].name,'msg': '爸爸妈妈我已经签退成功'});
					
						return;
					} else if(nowDate < 10) {
						if (signIn.length == 0) {
							let insertRes =await orm.table('sign_info')
							.insert({'sign_userid': results.result.user_list[0].user_id, 'sign_time': sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'), 'is_sign': '1' });
							console.log(insertRes)
							jsonWrite(res, '200', '签到成功', []);
							
							// 签到成功，将消息发给父母
							let studentRes = await orm.table('student')
							.eq('status', '1')
							.eq('student_no', results.result.user_list[0].user_id)
							.select();
							studentRes = JSON.parse(JSON.stringify(studentRes));
							let parentRes = await orm.table('child_parent')
							.eq('status', '1')
							.eq('child_id', studentRes[0].id)
							.select();
							parentRes = JSON.parse(JSON.stringify(parentRes));
							const msgRes = await orm.table('message_info')
							.insert({'to_uid': parentRes[0].parent_id, 'from_uid': studentRes[0].student_no, 'from_name': studentRes[0].name,'msg': '爸爸妈妈我已经签到成功'});
							return;
						} else {
							jsonWrite(res, '405', '您已签到成功，请勿重新签到', []);
						}
						return ;
					} else {
						jsonWrite(res, '200', '签到不在时间范围内', []);
						return;
					}
				} else {
					jsonWrite(res, '405', '人脸不匹配，请重试！', []);
					return;
				}
			}).catch(function(err) {
					// 如果发生网络错误
					jsonWrite(res, '405', '人脸识别照片上传失败，请重新上传！', []);
					return;
			});
		}
	})
})

module.exports = router