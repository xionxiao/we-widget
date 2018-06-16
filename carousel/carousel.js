function swiperChange(e) {
  this.setData({
    'carousel_data.swiperCurrent': e.detail.current
  }) 
}

module.exports.swiperChange = swiperChange;