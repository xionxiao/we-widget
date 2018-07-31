const app = getApp();

function _safecall(func, param) {
  typeof (func) == 'function' && func(param)
}

function _get(uri, data, success) {
  wx.request({
    url: app.globalData.server + uri,
    method: 'GET',
    data: data,
    header: {
      'content-type': 'application/json;charset=utf-8',
      'Authorization': 'token ' + wx.getStorageSync("access-token")
    },
    success: success
  })
}

function _post(uri, payload, success) {
  wx.request({
    url: app.globalData.server + uri,
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      'Authorization': 'token ' + wx.getStorageSync("access-token")
    },
    data: payload,
    success: success
  })
}

function _upload(name, data, filePath, success) {
  wx.uploadFile({
    url: app.globalData.server + '/upload',
    filePath: filePath,
    name: name,
    header: {
      'content-type': 'multipart/form-data',
      'Authorization': 'token ' + wx.getStorageSync("access-token")
    },
    formData: data,
    success: success
  })
}

function authorize(code, iv, data, success, app_type, tel, pwd) {
  var payload = {
    'code': code,
    'iv': iv,
    'encryptedData': data,
    'app': app_type,
    'tel': tel,
    'pwd': pwd
  }
  wx.request({
    url: app.globalData.server + '/auth',
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data: payload,
    success: success
  })
}

function getVersion() {
  _get('/version', null, (res) => {
    console.log('version', res.data)
  });
}

function uploadAvatar(name, success) {
  wx.chooseImage({
    count: 1, // 默认9
    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      var tempFilePaths = res.tempFilePaths
      _upload('avatar', { 'name': name }, tempFilePaths[0], success)
    }
  })
}

function getBabyInfo(success, error) {
  _get('/baby', null, (res) => {
    console.log('baby', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      app.globalData.babies = res.data
      _safecall(success, res.data)
    } 
  });
}

function postBabyInfo(name, gender, school, height, weight, birthday, success, error) {
  var data = {
    'name': name,
    'gender': gender,
    'school': school,
    'weight': weight,
    'height': height,
    'birthday': birthday,
  }
  _post('/baby', data, (res) => {
    console.log('create baby', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function getMenu(name='', success, error) {
  _get('/menu', {'name':name}, res => {
    console.log('menu', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      app.globalData.menus[name] = res.data
      _safecall(success, res.data)
    }
  })
}

function getStep(name, success, error) {
  if (app.globalData.steps[name]) {
    _safecall(success, app.globalData.steps[name])
  } else {
    _get('/recipe', {'name':name}, res => {
      console.log('recipe', res.data)
      if (res.data.error) {
        _safecall(error, res.data)
      } else {
        app.globalData.steps[res.data['名称']] = res.data
        _safecall(success, res.data)
      }
    })
  }
}

function getJointTable(payload, success, error) {
  _post('/joint', payload, res => {
    console.log('joint', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

module.exports = {
  authorize: authorize,
  getVersion: getVersion,
  getBabyInfo: getBabyInfo,
  postBabyInfo: postBabyInfo,
  getMenu: getMenu,
  getStep: getStep,
  uploadAvatar: uploadAvatar,
  getJointTable: getJointTable
}