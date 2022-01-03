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

class HeatMap {
    constructor(map, sensors) {
        this.map = map;
        this.sensors = sensors;
        this.heatmap = new google.maps.visualization.HeatmapLayer({
            data: [],
            map: this.map,
            radius: 80,
            opacity: 0.6
        });
    }
    
    setKey(key) {
        this.key = key;
    }

    generateData(st, ed) {
        var maxArray = [];
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for (var i = 0; i < this.sensors.length; i++) {
            var val = this.sensors[i].between(st, ed).getMax(this.key);
            min = val < min ? val : min;
            max = val > max ? val : max;
            maxArray.push(val);
        }
        for (var i = 0; i < maxArray.length; i++) {
            maxArray[i] = parseInt((maxArray[i] - min) * 100 + 1)
        }
        return maxArray;
    }

    between(st, ed) {
        this.sensorHeat = [];
        this.sensorData = this.generateData(st, ed);
        console.log("sensorData:", this.sensorData);
        for (var i = 0; i < this.sensors.length; i++) {
            this.sensorHeat.push({
                location: this.sensors[i].latlng,
                weight: this.sensorData[i]
            });
        }
        this.heatmap.setData(this.sensorHeat);
        return [st, ed];
    }

    startDate(stDate, midMin) {
        this.stDate = stDate;
        this.midMin = midMin;
        var timestamp = this.toTimestamp(stDate) + (midMin * 60 * 1000);
        this.edDate = this.toDate(timestamp);
        return this.between(stDate, this.edDate);
    }

    next() {
        var stTimestamp = this.toTimestamp(this.stDate) + this.midMin * 60 * 1000;
        this.stDate = this.toDate(stTimestamp);
        this.edDate = this.toDate(stTimestamp + this.midMin * 60 * 1000);
        return this.between(this.stDate, this.edDate);
    }

    loop(times, delay) {
        var self = this;
        var cId = setInterval(() => {
            showDate.innerHTML = self.next()[0];
            if (--times == 0) {
                clearInterval(cId);
            }
        }, delay);
    }

    toTimestamp(strDate) {
        return parseInt(moment(strDate).format("x"));
    }

    toDate(timestap) {
        return moment(timestap).format('yyyy-MM-DD HH:mm:ss');
    }

    show() {
        this.heatmap.setMap(this.map);
    }

    hide() {
        this.heatmap.setMap(null);
    }
}