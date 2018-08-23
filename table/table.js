function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

// 生成列
// col 列对象
// data_name 数据字段名
// data 数据
// lines 最大列数目，如果数据小于lines，自动补value
// value 为空时默认值
// putExtra 增加额外信息函数，参数 i: 第i行, obj: 行对象
function formCol(col, data_name, data, lines, value, putExtra) {
  //console.log(data_name, data)
  lines = !lines ? 1 : lines
  value = !value ? " " : value
  if (!isFunction(putExtra)) {
    putExtra = function (i, obj) {
      return obj
    }
  }
  if (!col.items) {
    col['items'] = []
  }
  // 非数组
  if (!Array.isArray(data)) {
    col.items.push(putExtra(col.items.length, {
      name: !data[data_name] ? value : data[data_name]
    }))
    for (var j = 1; j < lines; j++) {
      col.items.push(putExtra(col.items.length, {
        name: value
      }))
    }
  } else {
    for (var p = 0; p < lines; p++) {
      col.items.push(putExtra(col.items.length, {
        name: !data[p][data_name] ? value : data[p][data_name]
      }))
    }
  }
  return col
}

module.exports.formCol = formCol;