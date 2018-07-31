function getDateTime() {
  const date = new Date();
  const DAY_OF_WEEK = ['日', '一', '二', '三', '四', '五', '六']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = date.getDay()
  const hour = date.getHours()
  const year = date.getFullYear()
  var timeOfDay = "早"
  if (hour > 0 && hour < 11)
    timeOfDay = "早"
  if (hour >= 11 && hour < 14)
    timeOfDay = "午"
  if (hour >= 14 && hour < 23)
    timeOfDay = "晚"

  return {
    dayOfWeek: DAY_OF_WEEK[dayOfWeek],
    timeOfDay: timeOfDay,
    isoDate: [year, month, day].join('-')
  }
}

function onTapDayOfWeek(e, context = null) {
  if (!context) context = this
  context.setData({
    "calendar.dayOfWeek": e.currentTarget.id
  });
}

function onTapTimeOfDay(e, context = null) {
  if (!context) context = this
  context.setData({
    "calendar.timeOfDay": e.currentTarget.id
  });
}

function _safecall(func, param) {
  typeof(func) == 'function' && func(param)
}

function popup(title, content, confirm, cancel) {
  wx.showModal({
    title: title,
    content: content,
    showCancel: Boolean(cancel),
    success: function (res) {
      if (res.confirm) {
        console.log('用户点击确定')
        _safecall(confirm)
      } else if (res.cancel) {
        console.log('用户点击取消')
        _safecall(cancel)
      }
    }
  })
}

function toast(title) {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: 2000
  })
}

function isValidNumber(num, range_low, range_high) {
  if (isNaN(num)) return false
  var n = parseFloat(num)
  return n > range_low && n < range_high
}

function _push(list, recipe) {
  if (list.length > 6) {
    list.pop()
  }
  list.unshift(recipe)
}

function addHistory(recipe) {
  var history = getApp().globalData.history
  _push(history, recipe)
}

function addFavorite(recipe) {
  var fav = getApp().globalData.favorite
  _push(fav, recipe)
}

module.exports = {
  initCalendar: getDateTime,
  onTapDayOfWeek: onTapDayOfWeek,
  onTapTimeOfDay: onTapTimeOfDay,
  isValidNumber: isValidNumber,
  addHistory: addHistory,
  addFavorite: addFavorite,
  toast: toast,
  popup: popup,
}
