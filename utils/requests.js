/*
 * request.js
 * Copyright 2018-2020 Allen Xiao. All Rights Reserved
 * Licensed under MIT (https://github.com/xionxiao/we-widget/LICENSE)
 */

class Request {
  static DEBUG_REQUEST = false
  static config = {}

  constructor(baseURL) {
    this.baseURL = baseURL ? baseURL : Request.baseURL;
    this.config = Object.assign({}, Request.config)
    this.config['baseURL'] = baseURL || this.config['baseURL']
  }

  static encodeQueryString(params) {
    const ret = [];
    for (let p in params)
      ret.push(encodeURIComponent(p) + '=' + encodeURIComponent(params[p]));
    return ret.join('&');
  }

  static setConfig(key, value, config) {
    config = config || Request.config
    switch (key) {
      case 'baseURL':
        config.baseURL = value
        break
      default:
        if (config.hasOwnProperty(key) && typeof (value) == 'object') {
          Object.assign(config[key])
        } else {
          config[key] = value
        }
    }
    return config
  }

  setConfig(key, value) {
    Request.setConfig(key, value, this.config)
    return this
  }

  _formURL(url) {
    let config = this.config
    config['url'] = config['baseURL'] + url
    delete config['baseURL']

    if (config.hasOwnProperty('queryParam')) {
      config.url = config.url + '?' + Request.encodeQueryString(config['queryParam'])
      delete config['queryParam']
    }
  }

  request(method, url, data) {
    let promise = new Promise((resolve, reject) => {
      this.config['method'] = method
      this._formURL(url)
      if (data) {
        this.config['data'] = data
      }
      this.config.success = (res) => {
        if (res.statusCode != 200 || res.data.error) {
          Request.DEBUG_REQUEST && console.log(method, this.config.url, data, 'failed', res)
          reject(res)
        } else {
          Request.DEBUG_REQUEST && console.log(method, this.config.url, data, 'success', res)
          resolve(res.data)
        }
      }
      this.config.fail = err => {
        Request.DEBUG_REQUEST && console.log(method, this.config.url, data, 'failed', err)
        reject(err)
      }
      Request.DEBUG_REQUEST && console.log(method, url, 'config', this.config)
      this.task = wx.request(this.config)
    })
    return promise
  }

  get(url) {
    return this.request("GET", url)
  }

  post(url, data) {
    return this.request("POST", url, data)
  }

  put(url, data) {
    return this.request("PUT", url, data)
  }

  delete(url) {
    return this.request("DELETE", url)
  }
}

module.exports = {
  Request: Request,
}
