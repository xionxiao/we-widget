const app = getApp();

function _page() {
  var pages = getCurrentPages()
  return pages[pages.length - 1]
}

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

function _post(uri, payload, success, fail) {
  wx.request({
    url: app.globalData.server + uri,
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      'Authorization': 'token ' + wx.getStorageSync("access-token")
    },
    data: payload,
    success: success,
    fail: fail
  })
}

function _post_json(uri, payload, success) {
  wx.request({
    url: app.globalData.server + uri,
    method: 'POST',
    header: {
      'content-type': 'application/json;charset=utf-8',
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

function authorize(app_type, success, error) {
  _post('/auth', { 'app': app_type }, res => {
    console.log('auth', res.data)
    if (res.data.token) {
      wx.setStorageSync('access-token', res.data.token)
      _safecall(success, res.data)
    } else {
      _safecall(error, res.data)
    }
  }, err => {
    _safecall(error, err)
  })
}

function login(app_type, tel, pwd, userInfo, success, error) {
  wx.login({
    success: (res) => {
      wx.request({
        url: app.globalData.server + '/login',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        data: {
          'tel': tel,
          'pwd': pwd,
          'code': res.code,
          'iv': userInfo.iv,
          'encryptedData': userInfo.encryptedData,
          'app': app_type,
        },
        success: res => {
          if (res.data.token) {
            console.log('login success', res.data)
            wx.setStorageSync('access-token', res.data.token)
            _safecall(success, res.data)
          } else {
            console.log('login failed')
            _safecall(error, res.data)
          }
        }
      })
    }
  })
}

function register(app_type, tel, pwd, school, userInfo, success, error) {
  wx.login({
    success: (res) => {
      wx.request({
        url: app.globalData.server + '/register',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        data: {
          'tel': tel,
          'pwd': pwd,
          'school': school,
          'code': res.code,
          'iv': userInfo.iv,
          'encryptedData': userInfo.encryptedData,
          'app': app_type,
        },
        success: res => {
          console.log('register', res.data)
          if (res.data.error) {
            console.log('register failed')
            _safecall(error, res.data)
          } else {
            console.log('register success', res.data)
            _safecall(success, res.data)
          }
        }
      })
    }
  })
}

function getVersion() {
  _get('/version', null, (res) => {
    console.log('version', res.data)
  });
}

function uploadAvatar(name, success, error) {
  wx.chooseImage({
    count: 1, // 默认9
    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      var tempFilePaths = res.tempFilePaths
      var tempFileSize = res.tempFiles[0].size;
      console.log(tempFileSize)
      if (tempFileSize < 600 * 1024) {
        _upload('avatar', {
          'name': name
        }, tempFilePaths[0], success)
      } else {
        console.log("avatar size is bigger than 600K")
        _safecall(error)
      }
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

function postBabyInfo(name, gender, school, class_name, height, weight, birthday, success, error) {
  var data = {
    'name': name,
    'gender': gender,
    'school': school,
    'class': class_name,
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

function getUserInfo(e, success, error) {
  if (e.detail.userInfo) {
    app.globalData.userInfo = e.detail.userInfo
    console.log('getUserInfo', e.detail)
    wx.setStorage({
      key: 'userInfo',
      data: e.detail.userInfo,
    })
    _page().setData({
      userInfo: e.detail.userInfo,
    }, () => {
      _safecall(success, e.detail)
    })
  } else {
    _safecall(error, e)
  }
}

function getMenu(name, success, error) {
  console.log('getMneu', name)
  _get('/menu', {
    'baby': name
  }, res => {
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
    _get('/recipe', {
      'name': name
    }, res => {
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
  _get('/joint', payload, res => {
    console.log('joint', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function postJointTable(payload, success, error) {
  _post_json('/joint', {
    'data': payload
  }, res => {
    console.log('joint', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function getPurchaseList(date, success, error) {
  _get('/purchase-list', {
    'date': date
  }, res => {
    console.log('purchase-list', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function getStockList(date, success, error) {
  _get('/stock-list', {
    'date': date
  }, res => {
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function postStockList(data, success, error) {
  _post_json('/stock-list', {
    'data': data
  }, res => {
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function getSchools(success, error) {
  _get('/school', {}, res => {
    console.log('school', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function getClasses(school, success, error) {
  _get('/classes', { 'school': school ? school : "" }, res => {
    console.log('classes', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function getStudents(success, error) {
  _get('/student', {}, res => {
    console.log('student', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function getKpi(date, success, error) {
  _get('/kpi', {}, res => {
    console.log('kpi', res.data)
    if (res.data.error) {
      _safecall(error, res.data)
    } else {
      _safecall(success, res.data)
    }
  })
}

function downloadImage(url, success, error) {
  console.log('download image:', url)
  wx.downloadFile({
    url: app.globalData.server + '/' + url,
    success: function (res) {
      console.log(res)
      if (res.statusCode == 200) {
        var filePath = res.tempFilePath
        console.log('saveing image', url)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            res.tempFilePath = filePath
            console.log('image saved')
            _safecall(success, res)
          },
          error: function (err) {
            _safecall(error, err)
          }
        })
      } else {
        _safecall(error, res)
      }
    },
    error: function (err) {
      _safecall(error, err)
    }
  })
}

module.exports = {
  authorize: authorize,
  getVersion: getVersion,
  getBabyInfo: getBabyInfo,
  postBabyInfo: postBabyInfo,
  getUserInfo: getUserInfo,
  getMenu: getMenu,
  getStep: getStep,
  getKpi: getKpi,
  uploadAvatar: uploadAvatar,
  getJointTable: getJointTable,
  postJointTable: postJointTable,
  downloadImage: downloadImage,
  getPurchaseList: getPurchaseList,
  getStockList: getStockList,
  postStockList: postStockList,
  getSchools: getSchools,
  getClasses: getClasses,
  getStudents: getStudents,
  register: register,
  login: login
}