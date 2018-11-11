// pages/device/device.js
const app = getApp()
var _discoveryStarted = false

function _page() {
  var pages = getCurrentPages()
  return pages[pages.length - 1]
}

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

function ab2string(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return String.fromCharCode(bit)
    }
  )
  var s = hexArr.join('');
  return s;
}

/*
  data: {
    devices: [],
    connected: false,
    chs: [],
  },
*/

function openBluetoothAdapter() {
  wx.openBluetoothAdapter({
    success: (res) => {
      console.log('openBluetoothAdapter success', res)
      startBluetoothDevicesDiscovery()
    },
    fail: (res) => {
      if (res.errCode === 10001) {
        wx.onBluetoothAdapterStateChange(function (res) {
          console.log('onBluetoothAdapterStateChange', res)
          if (res.available) {
            startBluetoothDevicesDiscovery()
          }
        })
      }
    }
  })
}

function getBluetoothAdapterState() {
  wx.getBluetoothAdapterState({
    success: (res) => {
      console.log('getBluetoothAdapterState', res)
      if (res.discovering) {
       onBluetoothDeviceFound()
      } else if (res.available) {
        startBluetoothDevicesDiscovery()
      }
    }
  })
}

function startBluetoothDevicesDiscovery() {
  if (_discoveryStarted) {
    return
  }
  _discoveryStarted = true
  wx.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: true,
    success: (res) => {
      console.log('startBluetoothDevicesDiscovery success', res)
      onBluetoothDeviceFound()
    },
  })
}

function stopBluetoothDevicesDiscovery() {
  wx.stopBluetoothDevicesDiscovery()
}

function onBluetoothDeviceFound() {
  wx.onBluetoothDeviceFound((res) => {
    var that = _page()
    res.devices.forEach(device => {
      if (!device.name && !device.localName) {
        return
      }
      //console.log(device.name, device.deviceId)
      const foundDevices = that.data.devices
      const idx = inArray(foundDevices, 'deviceId', device.deviceId)
      const data = {}
      if (idx === -1) {
        data[`devices[${foundDevices.length}]`] = device
      } else {
        data[`devices[${idx}]`] = device
      }
      that.setData(data)
    })
  })
}

function createBLEConnection(device) {
  const deviceId = device.deviceId
  const name = device.name
  wx.createBLEConnection({
    deviceId,
    success: (res) => {
      _page().setData({
        connected: true,
        name,
        deviceId,
      })
      getBLEDeviceServices(deviceId)
    }
  })
  stopBluetoothDevicesDiscovery()
}

function closeBLEConnection() {
  var that = _page()
  wx.closeBLEConnection({
    deviceId: that.data.deviceId
  })
  that.setData({
    connected: false,
    chs: [],
    canWrite: false,
  })
}

function getBLEDeviceServices(deviceId) {
  wx.getBLEDeviceServices({
    deviceId,
    success: (res) => {
      for (let i = 0; i < res.services.length; i++) {
        if (res.services[i].isPrimary) {
          getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
          return
        }
      }
    }
  })
}

function getBLEDeviceCharacteristics(deviceId, serviceId) {
  wx.getBLEDeviceCharacteristics({
    deviceId,
    serviceId,
    success: (res) => {
      let that = _page()
      console.log('getBLEDeviceCharacteristics success', res.characteristics)
      for (let i = 0; i < res.characteristics.length; i++) {
        let item = res.characteristics[i]
        if (item.properties.read) {
          wx.readBLECharacteristicValue({
            deviceId,
            serviceId,
            characteristicId: item.uuid,
          })
        }
        if (item.properties.write) {
          that.setData({
            canWrite: true
          })
          that._deviceId = deviceId
          that._serviceId = serviceId
          that._characteristicId = item.uuid
          writeBLECharacteristicValue()
        }
        if (item.properties.notify || item.properties.indicate) {
          wx.notifyBLECharacteristicValueChange({
            deviceId,
            serviceId,
            characteristicId: item.uuid,
            state: true,
          })
        }
      }
    },
    fail(res) {
      console.error('getBLEDeviceCharacteristics', res)
    }
  })
  // 操作之前先监听，保证第一时间获取数据
  wx.onBLECharacteristicValueChange((characteristic) => {
    var that = _page()
    const idx = inArray(that.data.chs, 'uuid', characteristic.characteristicId)
    const data = {}
    //console.log('characteristic',characteristic)
    if (idx === -1) {
      data[`chs[${that.data.chs.length}]`] = {
        uuid: characteristic.characteristicId,
        value: ab2string(characteristic.value)
      }
    } else {
      data[`chs[${idx}]`] = {
        uuid: characteristic.characteristicId,
        value: ab2string(characteristic.value)
      }
    }
    // data[`chs[${that.data.chs.length}]`] = {
    //   uuid: characteristic.characteristicId,
    //   value: ab2hex(characteristic.value)
    // }
    that.setData(data, ()=> {
      that.update();
    })
  })
}

function writeBLECharacteristicValue() {
  // 向蓝牙设备发送一个0x00的16进制数据
  let buffer = new ArrayBuffer(1)
  let dataView = new DataView(buffer)
  let that = _page()
  dataView.setUint8(0, Math.random() * 255 | 0)
  wx.writeBLECharacteristicValue({
    deviceId: that._deviceId,
    serviceId: that._deviceId,
    characteristicId: that._characteristicId,
    value: buffer,
  })
}

function closeBluetoothAdapter() {
  wx.closeBluetoothAdapter()
  _discoveryStarted = false
}

module.exports = {
  openBluetoothAdapter: openBluetoothAdapter,
  createBLEConnection: createBLEConnection
}