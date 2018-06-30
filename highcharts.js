
var _ = require('lodash');
var order = require('./order.json');

var buyOrder = order.buyOrder;
var sellOrder = order.sellOrder;
//var buyAndSell = order.buyOrder.concat(order.sellOrder);

var orderBuySell = [];

// 1. 排序
// 2. 计算每个时间区间的5个值 [1416182400000,7.204,7.232,7.037,7.072,889594.5]
// 3. 画图

for(var i in buyOrder){
    orderBuySell.push({time: buyOrder[i].timeSeconds, orderId: buyOrder[i].orderId, type: buyOrder[i].type});
}

for(var j in sellOrder){
    orderBuySell.push({time: sellOrder[j].timeSeconds, orderId: sellOrder[j].orderId, type: sellOrder[j].type});
}

//console.log(orderBuySell);


orderBuySell.sort(function(a, b)
{
    if(a.timeSeconds == b.timeSeconds){
        return a.orderId - b.orderId;
    } else {
        return a.timeSeconds - b.timeSeconds;
    }

});

//var result = _(orderBuySell)
//    .groupBy('time')
//    .map(function(items, time) {
//        return {
//            time: time,
//            orderId: _.map(items, 'orderId'),
//            type: _.map(items, 'type')
//
//        };
//    }).value();

//console.log(result);

//console.log(orderBuySell);
//

var startTime = new Date(1528416000000);
var interval = 86400000;
var groupTime = startTime;
var groupIndex = 0;
var groupedData = _.groupBy(orderBuySell, function(d) {
    // no need to do this if eventDateTime is already a Date object
    var time = new Date(d.time * 1000);

    // you can remove this condition and initialize groupTime with [0].eventDateTime
    if(time - groupTime <= interval){
        return groupIndex;
    } else {
        groupTime = new Date(groupTime.getTime() + interval);
        groupIndex ++;
        return groupIndex;
    }
    //return time - groupTime <= interval ? groupTime : groupTime = time;
});

//console.log(groupedData);


var data = [];

for (var key in groupedData) {
    data.push(groupedData[key]);
}

var endTime = new Date();
var openPrice = 0;
var highPrice = 0;
var lowPrice = 0;
var closePrice = 0;
var volume = 0;

var dataK = [];


for(var i = 0; i <= groupIndex; i++){

    if(i == 0){

        var oId = data[i][0].orderId;
        var typ = data[i][0].type;
        var o;
        if(typ == 0){
            o = buyOrder[oId];
        } else {
            o = sellOrder[oId];
        }

        openPrice = o.price;
        highPrice = openPrice;
        lowPrice = openPrice;
        closePrice = openPrice;
        volume = 0;

        for(var j = 1; j < data[i].length; j++){
            oId = data[i][j].orderId;
            typ = data[i][j].type;
            if(typ == 0){
                o = buyOrder[oId];
            } else {
                o = sellOrder[oId];
            }
            if(highPrice < o.price){
                highPrice = o.price;
            }
            if(lowPrice > o.price){
                lowPrice = o.price;
            }
            closePrice = o.price;
            volume += o.amount;
        }
        dataK.push([startTime.getTime(), parseFloat(openPrice.toFixed(3)), parseFloat(highPrice.toFixed(3)), parseFloat(lowPrice.toFixed(3)), parseFloat(closePrice.toFixed(3)), parseFloat(volume.toFixed(3))]);
    }

    if(i > 0){
        openPrice = dataK[i - 1][4];
        highPrice = dataK[i - 1][4];
        lowPrice = dataK[i - 1][4];
        closePrice = dataK[i - 1][4];
        volume = 0;
        for(var j = 0; j < data[i].length; j++){
            oId = data[i][j].orderId;
            typ = data[i][j].type;
            if(typ == 0){
                o = buyOrder[oId];
            } else {
                o = sellOrder[oId];
            }
            if(highPrice < o.price){
                highPrice = o.price;
            }
            if(lowPrice > o.price){
                lowPrice = o.price;
            }
            closePrice = o.price;
            volume += o.amount;
        }
        dataK.push([startTime.getTime() + interval * i, parseFloat(openPrice.toFixed(3)), parseFloat(highPrice.toFixed(3)), parseFloat(lowPrice.toFixed(3)), parseFloat(closePrice.toFixed(3)), parseFloat(volume.toFixed(1))]);
    }
}


//
//
//
console.log(dataK);

