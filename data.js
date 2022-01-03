const fs = require('fs')
var moment = require('moment');

// 時間,田區,機具名稱,SSID,溫度(°C),溼度(%),光度(PAR),土壤溼度
class Sensor {
  constructor(fsContent) {
    this.lines = fsContent.substring(1).split(/\r*\n/);
    var keyList = this.lines[0].split(',');
    this.key = {}
    this.data = [];
    this.lines.splice(0, 1);
    // set keyList
    for (var i = 0; i < keyList.length; i++) {
      this.key[keyList[i]] = i;
    }
    // set data
    for (var i = 0; i < this.lines.length; i++) {
      var line = this.lines[i].split(',');
      var strDate = line[0];
      var timestamp = this.toTimestamp(strDate);
      this.data.push([timestamp].concat(line));
    }
  }

  between(startDate, endDate) {
    var stTmp = this.toTimestamp(startDate);
    var edTmp = this.toTimestamp(endDate);
    this.filterData = [];
    for (var i = 0; i < this.data.length; i++) {
      var row = this.data[i];
      if (row[0] > edTmp) {
        break;
      }
      else if (row[0] >= stTmp) {
        this.filterData.push(row);
      }
    }
    return this;
  }

  size() {
    return this.filterData.length;
  }

  getArray(key) {
    var data = [];
    var idx = this.key[key] + 1;
    for (var i = 0; i < this.filterData.length; i++) {
      data.push(this.filterData[i][idx]);
    }
    return data;
  }

  getMax(key) {
    var idx = this.key[key] + 1;
    var max = Number.NEGATIVE_INFINITY;
    for (var i = 0; i < this.filterData.length; i++) {
      var val = this.filterData[i][idx];
      max = val > max ? val : max;
    }
    return max;
  }

  toTimestamp(strDate) {
    return parseInt(moment(strDate).format("x"));
  }

  toDate(timestap) {
    return moment(timestap).format('yyyy-MM-DD HH:mm:ss');
  }
}



function generateData(st, ed, sensors) {
  var maxArray = [];
  var min = Number.MAX_VALUE;
  var max = Number.MIN_VALUE;
  for (var i = 0; i < sensors.length; i++) {
    var val = sensors[i].between(st, ed).getMax('溫度(°C)');
    min = val < min ? val : min;
    max = val > max ? val : max;
    maxArray.push(val);
  }
  for (var i = 0; i < maxArray.length; i++) {
    maxArray[i] = parseInt((maxArray[i] - min) * 100)
  }
  console.log(maxArray)
}


// 時間,田區,機具名稱,SSID,溫度(°C),溼度(%),光度(PAR),土壤溼度
//ss.between('2021-12-01 00:00:00', '2021-12-01 00:10:00').get('溫度')
// 某段時間內的筆數，
var files = ['A.csv', 'B.csv', 'C.csv', 'D.csv', 'E.csv', 'F.csv', 'G.csv'];
//var files = ['A.csv', 'B.csv', 'C.csv'];
var st = '2021-12-01 00:00:00';
var ed = '2021-12-01 23:20:00';
var sensors = [];
for (var i = 0; i < files.length; i++) {
  console.log("creatxe sensor:", files[i]);
  sensors.push(new Sensor(fs.readFileSync(files[i], 'utf8')));
}

generateData(st, ed, sensors);
