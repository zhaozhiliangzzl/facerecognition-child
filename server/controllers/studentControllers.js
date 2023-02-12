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


module.exports = router
