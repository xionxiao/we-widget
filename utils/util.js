function _page() {
  var pages = getCurrentPages()
  return pages[pages.length - 1]
}

function getDateTime() {
  const date = new Date();
  const DAY_OF_WEEK = ['日', '一', '二', '三', '四', '五', '六']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const day_of_week = date.getDay()
  const hour = date.getHours()
  const year = date.getFullYear()
  var time_of_day = "早"
  if (hour > 0 && hour < 11)
    time_of_day = "早"
  if (hour >= 11 && hour < 14)
    time_of_day = "午"
  if (hour >= 14 && hour < 23)
    time_of_day = "晚"

  return {
    date: date,
    dayOfWeek: DAY_OF_WEEK[day_of_week],
    timeOfDay: time_of_day,
    isoDate: [year, month, day].join('-')
  }
}

function getCalendarDate(calendar) {
  console.log(calendar.isoDate)
  console.log(calendar)
  const DAY_OF_WEEK = ['日', '一', '二', '三', '四', '五', '六']
  var oldDate = new Date(calendar.date)
  var day = oldDate.getDay()
  day = day ? day : 7
  var index = DAY_OF_WEEK.indexOf(calendar.dayOfWeek)
  index = index ? index : 7
  console.log('index', index, 'day', day)
  day = oldDate.getDate() + index - day
  var newDate = new Date(oldDate.getFullYear(), oldDate.getMonth(), day)
  console.log(newDate)
  var calendar_date = [newDate.getFullYear(), newDate.getMonth()+1, newDate.getDate()].join('-')
  console.log(calendar_date)
  return calendar_date
}

function onTapDayOfWeek(e, context = null) {
  if (!context) context = _page()
  context.setData({
    "calendar.dayOfWeek": e.currentTarget.id
  });
}

function onTapTimeOfDay(e, context = null) {
  if (!context) context = _page()
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

function showLoading(next) {
  _page().setData({
    showLoading: true
  }, () => _safecall(next))
}

function cancelLoading(next) {
  _page().setData({
    showLoading: false
  }, () => _safecall(next))
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
  wx.setStorage({
    key: 'history',
    data: history,
  })
}

function addFavorite(recipe) {
  var fav = getApp().globalData.favorite
  _push(fav, recipe)
  wx.setStorage({
    key: 'favorite',
    data: fav,
  })
}

module.exports = {
  initCalendar: getDateTime,
  getCalendarDate: getCalendarDate,
  onTapDayOfWeek: onTapDayOfWeek,
  onTapTimeOfDay: onTapTimeOfDay,
  isValidNumber: isValidNumber,
  addHistory: addHistory,
  addFavorite: addFavorite,
  showLoading: showLoading,
  cancelLoading: cancelLoading,
  toast: toast,
  popup: popup,
}
