目的：
=====
  透過傳感器收集的數據，產生動態熱區圖，可以知道熱障礙最大的區域


### index.js
  + Sensor (存放傳感器的csv檔案數據)
  + HeatMap (繪製熱區圖，使用 Google Map 和相關 API)

### 範例程式
heatMap = new HeatMap(map, sensors);

// 設定要分析的數據，目前是使用溫度，也可以換成傳感器提供的其他數據，例如土壤濕度
heatMap.setKey('溫度(°C)');
//heatMap.setKey('土壤溼度');
//heatMap.setKey('光度(PAR)');

// 產生動態圖，起始日期、收集資料時間(分鐘)
heatMap.startDate('2021-12-01 00:00:00', 5 /*min*/ );

// 動態顯示一天的熱區圖，每張圖間隔0.5秒
heatMap.loop(5*12*24, 500);
