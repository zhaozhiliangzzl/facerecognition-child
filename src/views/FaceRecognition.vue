<template>
	<div class="face">
		<div class="camera_outer">
			<el-button @click="getCompetence">开启摄像头</el-button>
			<!-- <button @click="stopNavigator">关闭摄像头</button> -->
			<video v-if="cameraFlag" id="videoCamera" :width="videoWidth" :height="videoHeight" autoplay @click="setImage"></video>
			<canvas style="display:none;" id="canvasCamera" :width="videoWidth" :height="videoHeight" ></canvas>
			<span v-if="cameraFlag" class="bg_r_img" @click="setImage"></span>
			<div v-if="!cameraFlag" class="img_bg_camera">
				<img :src="imgSrc" alt="" class="tx_img">
				<div class="img_btn_camera">
					<span>{{validTip}}</span>
					<img v-if="validTip === '验证中'" src="../assets/img/loading.svg" alt="" class="loding_img">
				</div>
			</div>
			<div v-else class="cameraFlag" style="font-weight: bold;">请保持脸在取景框内</div>
 
  </div>
	</div>
</template>

<script>
import Util from '../utils/utils.js';
export default {
	data() {
		return {
			videoWidth: 540,
      videoHeight: 350,
      imgSrc: '',
      thisCancas: null,
      thisContext: null,
      thisVideo: null,
      validTip: '验证中',
			cameraFlag: true,
			startFlag: false,
			hrefUrl: ''
		}
	},
	methods:{
			/*
     *@function  调用权限
     *****************************************/
    getCompetence () {
      var _this = this
			// this.cameraFlag = true;
			this.startFlag = true;
      this.thisCancas = document.getElementById('canvasCamera')
      this.thisContext = this.thisCancas.getContext('2d')
      this.thisVideo = document.getElementById('videoCamera')
      // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {}
      }
      // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
      // 使用getUserMedia，因为它会覆盖现有的属性。
      // 这里，如果缺少getUserMedia属性，就添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
          // 首先获取现存的getUserMedia(如果存在)
          var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia
          // 有些浏览器不支持，会返回错误信息
          // 保持接口一致
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
          }
          // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
          return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject)
          })
        }
      }
      var constraints = { audio: false, video: { width: this.videoWidth, height: this.videoHeight, transform: 'scaleX(-1)' } }
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        // 旧的浏览器可能没有srcObject
        if ('srcObject' in _this.thisVideo) {
          _this.thisVideo.srcObject = stream
        } else {
          // 避免在新的浏览器中使用它，因为它正在被弃用。
          _this.thisVideo.src = window.URL.createObjectURL(stream)
        }
        _this.thisVideo.onloadedmetadata = function (e) {
          _this.thisVideo.play()
        }
      }).catch(err => {
        console.log(err)
      })
    },
    /*
     *@function  绘制图片
     *****************************************/
    setImage () {
			if (!this.startFlag) return;
      var _this = this
			this.cameraFlag = false
			this.startFlag = false
      // 点击，canvas画图
      _this.thisContext.drawImage(_this.thisVideo, 0, 0, _this.videoWidth, _this.videoHeight)
      // 获取图片base64链接
      var image = this.thisCancas.toDataURL('image/png')
      _this.imgSrc = image
      this.$emit('refreshDataList', this.imgSrc)
			this.stopNavigator()
			this.upload()
    },
    /*
     *@function  base64转文件
     *****************************************/
    dataURLtoFile (dataurl, filename) {
      var arr = dataurl.split(',')
      var mime = arr[0].match(/:(.*?);/)[1]
      var bstr = atob(arr[1])
      var n = bstr.length
      var u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    },
		upload() {
			this.hrefUrl = this.$route.query.uid;
			this.request.post('api/user/faceRecognition', {
				uid: this.hrefUrl,
				image: this.imgSrc,
				imageType: 'BASE64'
			}).then(res => {
				if (res.code == 200) this.$message.success(res.msg);
				else this.$message(res.msg);
				this.validTip = res.msg;
			})
		},
    /*
     *@function  关闭摄像头
     *****************************************/
    stopNavigator () {
      this.thisVideo.srcObject.getTracks()[0].stop()
    }
	},
	mounted () {
    // this.getCompetence()
  },
	created() {
		
	},
  beforeDestroy () {
    this.stopNavigator()
  }
}
</script>

<style lang="less" scoped>
.face{
	width: 100vw;
	height: 100vh;
	background-color: #ecf0f3;
	display: flex;
	justify-content: center;
	align-items: center;
}
.camera_outer{
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	height: 480px;
	margin:0 auto;
	position: relative;
	// border: 1px solid red;
	button{
		position: absolute;
		top: 0;
	}
	.bg_r_img{
		position: absolute;
		width: 300px;
		height: 300px;
		border: 5px dashed rgb(114, 114, 114);
		border-radius: 15px;
		background-clip: padding-box;
	}
	video{
		// border: 1px solid red;
		
	}
	.img_bg_camera{
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		font-weight: bold;
		margin-top: 10px;
		.loding_img{
			width: 24px;
			height: 24px;
			vertical-align:middle;
		}
		span{
			vertical-align:middle;
		}
	}
}
	// .crumbs-register {
	// 	background-color: #324157;
	// 	height: 50px;
	// 	line-height: 50px;
	// }
	// .register-title {
	// 	line-height: 50px;
	// 	margin: 0 auto;
  //   	width: 50px;
  //   	font-size: 16px;
	// }	
	// .userContent {
  //       position: absolute;
  //       top: 50%;
  //       left: 50%;
  //       transform: translate(-50%, -60%);
	// 	width: 480px;
	// 	margin: 0 auto;
	// 	padding: 35px 35px 10px 35px;
  //       border-radius: 20px;
  //       box-shadow: 13px 13px 20px #cbced1, -13px -13px 20px #fff;
	// }
	// .register-form-input /deep/ .el-input__inner{
	// 	border: 0px;
	// }
	// .register-btn{
	// 	display: flex;
	// 	justify-content: center;
	// }
	// .register-btn /deep/ .el-form-item__content{
	// 	margin-left: 0px !important;
	// }
	// .register-btn button{
	// 	margin-top: 20px;
	// 	width: 200px;
	// 	flex: 1;
	// }
// 	.camera_outer{
//   position: relative;
//   overflow: hidden;
//   background: url("../assets/img/logo.png") no-repeat center;
//   background-size: 100%;
//   video,canvas,.tx_img{
//     -moz-transform:scaleX(-1);
//     -webkit-transform:scaleX(-1);
//     -o-transform:scaleX(-1);
//     transform:scaleX(-1);
//   }
//   .btn_camera{
//     position: absolute;
//     bottom: 4px;
//     left: 0;
//     right: 0;
//     height: 50px;
//     background-color: rgba(0,0,0,0.3);
//     line-height: 50px;
//     text-align: center;
//     color: #ffffff;
//   }
//   .bg_r_img{
//     position: absolute;
//     bottom: 0;
//     left: 0;
//     right: 0;
//     top: 0;
//   }
//   .img_bg_camera{
//     position: absolute;
//     bottom: 0;
//     left: 0;
//     right: 0;
//     top: 0;
//     img{
//       width: 100%;
//       height: 100%;
//     }
//     .img_btn_camera{
//       position: absolute;
//       bottom: 0;
//       left: 0;
//       right: 0;
//       height: 50px;
//       line-height: 50px;
//       text-align: center;
//       background-color: rgba(0,0,0,0.3);
//       color: #ffffff;
//       .loding_img{
//         width: 50px;
//         height: 50px;
//       }
//     }
//   }
// }

</style>