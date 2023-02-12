let utils = {
	RegExp: {
			emailReg : /^[a-z0-9A-Z]+([-|_|\.]+[a-z0-9A-Z]+)*@([a-z0-9A-Z]+[-|\.])+[a-zA-Z]{2,5}$/,
			idCardReg : /^(([1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4})|([1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|(X|x))))$/,
			phoneReg : /^1[34578]\d{9}$/,
			credentialReg: /((?=.*[a-z])(?=.*\d)|(?=[a-z])(?=.*[#@!~%^&*])|(?=.*\d)(?=.*[#@!~%^&*]))[a-z\d#@!~%^&*]{8,12}/
	},
	creditLevel(val) {
			switch(val) {
					case 1:
							return '极好'
							break
					case 2:
							return '良好'
							break
					case 3:
							return '一般'
							break
					case 4:
							return '较差'
							break
					case 5:
							return '很差'
							break
					default:
							break
			}
	},
	sexJudge(val) {
			switch(val){
					case 1:
							return '男'
							break
					case 2:
							return '女'
					default:
							break
			}
	},
	creditGradeTag(val) {
			switch(val){
					case 1:
							return 'success'
							break
					case 2:
							return ''
							break
					case 3:
							return 'info'
							break
					case 4:
							return 'warning'
							break
					case 5:
							return 'danger'
							break
					default:
							break 
			}
	},
	userType(val) {
		switch(val) {
			case 0:
				return '学生';
				break;
			case 1:
				return '家长';
				break;
			case 2:
				return '老师';
				break;
			case 3:
				return '管理员';
				break;
			default:
				break;
		}
	},
	statusType(val) {
		switch(val) {
			case 1:
				return '待审核';
				break;
			case 2:
				return '同意';
				break;
			case 3:
				return '拒绝';
				break;
			default:
				break;
		}
	},
	timeNow() {
    let vWeek, vWeek_s, year, month, day, hours, minutes, seconds;
    vWeek = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    let date = new Date();
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
    hours = date.getHours();
    hours = hours > 9 ? hours : "0" + hours;
    minutes = date.getMinutes();
    minutes = minutes > 9 ? minutes : "0" + minutes;
    seconds = date.getSeconds();
    seconds = seconds > 9 ? seconds : "0" + seconds;
    vWeek_s = date.getDay();
    let time = year + "年" + month + "月" + day + "日" + "\t" + hours + ":" + minutes + ":" + seconds;
    return time
	},
	format (fmt) { 
			var o = { 
				"M+" : this.getMonth()+1,                 //月份 
				"d+" : this.getDate(),                    //日 
				"h+" : this.getHours(),                   //小时 
				"m+" : this.getMinutes(),                 //分 
				"s+" : this.getSeconds(),                 //秒 
				"q+" : Math.floor((this.getMonth()+3)/3), //季度 
				"S"  : this.getMilliseconds()             //毫秒 
		}; 
		if(/(y+)/.test(fmt)) {
						fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
		}
			for(var k in o) {
				if(new RegExp("("+ k +")").test(fmt)){
							fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
					}
			}
		return fmt; 
	},
	toStorage (num, digits) {
			digits = digits || 2
			if (num < 1024) {
				return num + 'B'
			}
			num = (num * 1000 / 1024)
			const si = [
				{ value: 1E18, symbol: 'E' },
				{ value: 1E15, symbol: 'P' },
				{ value: 1E12, symbol: 'T' },
				{ value: 1E9, symbol: 'G' },
				{ value: 1E6, symbol: 'M' },
				{ value: 1E3, symbol: 'K' }
			]
			for (let i = 0; i < si.length; i++) {
				if (num >= si[i].value) {
					return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') +
						si[i].symbol + 'B'
				}
			}
		},
		tableLossData() {
			const data = [
				{'loss_type': 1, 'loss_project': '前保险杠皮', 'loss_amount': 1, 'loss_account': 2700, 'checked': false},
				{'loss_type': 1, 'loss_project': '前保险杠拖车钩盖板', 'loss_amount': 1, 'loss_account': 70, 'checked': false},
				{'loss_type': 1, 'loss_project': '前保险杠饰条', 'loss_amount': 1, 'loss_account': 120, 'checked': false},
				{'loss_type': 1, 'loss_project': '前保险杠下格栅', 'loss_amount': 1, 'loss_account': 235, 'checked': false},
				{'loss_type': 1, 'loss_project': '前保险杠骨架', 'loss_amount': 1, 'loss_account': 350, 'checked': false},
				{'loss_type': 1, 'loss_project': '后保险杠皮', 'loss_amount': 1, 'loss_account': 810, 'checked': false},
				{'loss_type': 1, 'loss_project': '中网', 'loss_amount': 1, 'loss_account': 1350, 'checked': false},
				{'loss_type': 1, 'loss_project': '发动机罩', 'loss_amount': 1, 'loss_account': 3500, 'checked': false},
				{'loss_type': 1, 'loss_project': '前挡风玻璃', 'loss_amount': 1, 'loss_account': 1080, 'checked': false},
				{'loss_type': 1, 'loss_project': '左前叶子板', 'loss_amount': 1, 'loss_account': 870, 'checked': false},
				{'loss_type': 1, 'loss_project': '左前门', 'loss_amount': 1, 'loss_account': 2350, 'checked': false},
				{'loss_type': 1, 'loss_project': '行李箱盖', 'loss_amount': 1, 'loss_account': 1780, 'checked': false},
				{'loss_type': 2, 'loss_project': '前保险杠全喷', 'loss_amount': 1, 'loss_account': 900, 'checked': false},
				{'loss_type': 2, 'loss_project': '前保险杠半喷', 'loss_amount': 1, 'loss_account': 480, 'checked': false},
				{'loss_type': 2, 'loss_project': '前保险杠修复（大）', 'loss_amount': 1, 'loss_account': 300, 'checked': false},
				{'loss_type': 2, 'loss_project': '前保险杠修复（中）', 'loss_amount': 1, 'loss_account': 150, 'checked': false},
				{'loss_type': 2, 'loss_project': '前保险杠修复（小）', 'loss_amount': 1, 'loss_account': 100, 'checked': false},
				{'loss_type': 2, 'loss_project': '左前叶子板全喷', 'loss_amount': 1, 'loss_account': 480, 'checked': false},
				{'loss_type': 2, 'loss_project': '左前门全喷', 'loss_amount': 1, 'loss_account': 900, 'checked': false},
				{'loss_type': 2, 'loss_project': '左前门半喷', 'loss_amount': 1, 'loss_account': 480, 'checked': false},
				{'loss_type': 2, 'loss_project': '前保险杠拆装', 'loss_amount': 1, 'loss_account': 50, 'checked': false},
			]
			return data;
		},
		
		/**
		 * 图片大小校验
		 * @param {file} file el-upload文件对象
		 * @param {number} size 限制的文件大小(kb) 默认10M
		 */
	validImgUpload (file, size) {
			size = +size || 10240
			const isSizeOut = file.size / 1024 > size
			if (isSizeOut) {
				Message.error('上传图片大小不能超过' + toStorage(size * 1024))
			}
			return !isSizeOut
		},
		
		/**
		 * 创建唯一的字符串
		 * @return {string} ojgdvbvaua40
		 */
	createUniqueString () {
			const timestamp = +new Date() + ''
			const randomNum = parseInt((1 + Math.random()) * 65536) + ''
			return (+(randomNum + timestamp)).toString(32)
		}
}



export default utils