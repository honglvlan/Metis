/**
 * 最终上传到cos的URL
 * 把以下字段配置成自己的cos相关信息，详情可看API文档 https://www.qcloud.com/document/product/436/6066
 * REGION: cos上传的地区
 * APPID: 账号的appid
 * BUCKET_NAME: cos bucket的名字
 * DIR_NAME: 上传的文件目录
 */
var config = require('../config.js');
var cosUrl = "https://" + config.cos_region + ".file.myqcloud.com/files/v2/" + config.cos_appid + "/" + config.cos_bucket_name + config.cos_dir_name;

//填写自己的鉴权服务器地址
var cosSignatureUrl = config.host + '/v1/qc_cos/config?cos_path=' + config.cos_dir_name;

/**
 * 上传方法
 * filePath: 上传的文件路径
 * fileName： 上传到cos后的文件名
 * jwt: 鉴权服务器需要的 jwt
 */
function upload(filePath, fileName, that) {
    var data;

    // 鉴权获取签名
    wx.request({
        url: cosSignatureUrl,
        header: {
            Authorization: 'JWT' + ' ' + that.data.jwt.access_token
        },
        success: function (cosRes) {

            // 签名
            var signature = cosRes.data.sign;

            // 头部带上签名，上传文件至COS
            var uploadTask = wx.uploadFile({
                url: cosUrl + '/' + fileName,
                filePath: filePath,
                header: {
                    'Authorization': signature
                },
                name: 'filecontent',
                formData: {
                    op: 'upload'
                },
                success: function (uploadRes) {
                    var upload_res = JSON.parse(uploadRes.data)
                    var files = that.data.files;
                    files.push(upload_res.data.source_url);
                    that.setData({
                        upload_res: upload_res,
                        files: files,
                        test_image: upload_res.data.source_url
                    })
                },
                fail: function (e) {
                    console.log('e', e)
                }
            });
            uploadTask.onProgressUpdate((res) => {
                that.setData({
                    upload_progress: res.progress
                })
                if (res.progress === 100){
                    that.setData({
                        upload_progress: 0
                    })
                }
            })
        }
    })
    return data
}

module.exports = upload