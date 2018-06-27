
var _ = require('lodash');
var order = require('./order.json');

var buyOrder = order.buyOrder;
var sellOrder = order.sellOrder;
//var buyAndSell = order.buyOrder.concat(order.sellOrder);

var interval = 3600;

var orderBuySell = [];

// 1. 排序
// 2. 计算每个时间区间的5个值 [1416182400000,7.204,7.232,7.037,7.072,889594.5]
// 3. 画图

for(var i in buyOrder){
    orderBuySell.push({time: buyOrder[i].timeSeconds, orderId: buyOrder[i].orderId, type: buyOrder[i].type});
}

for(var i in sellOrder){
    orderBuySell.push({time: sellOrder[i].timeSeconds, orderId: sellOrder[i].orderId, type: sellOrder[i].type});
}

//console.log(orderBuySell);


orderBuySell.sort(function(a, b)
{
    if(a[0] === b[0])
    {
        if(a[2] === b[2]){
            return a[1] - b[1];
        }
        return a[2] - b[2];
    }
    return a[0] - b[0];
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
var groupTime = null;
var groupCount = 0;
var groupedData = _.groupBy(orderBuySell, function(d) {
    // no need to do this if eventDateTime is already a Date object
    var time = new Date(d.time * 1000);

    // you can remove this condition and initialize groupTime with [0].eventDateTime
    if (!groupTime) groupTime = new Date(time.getTime() + interval);
    if(time - groupTime <= interval){
        return groupCount;
    } else {
        groupTime = time;
        groupCount ++;
        return groupCount;
    }
    //return time - groupTime <= interval ? groupTime : groupTime = time;
});

var data = [];

for (var key in groupedData) {
    data.push(groupedData[key]);
}

var timeStart = data[0][0] * 1000;
var timeEnd = new Date().getMilliseconds();
var num = (timeEnd - timeStart) / interval;

var openPrice = 0;
var highPrice = 0;
var lowPrice = 0;
var closePrice = 0;

var dataK = [];

var index = 0;
for(var i = 0; i < num; i++){
    if(i == 0){
        var oId = data[0][1];
        var typ = data[0][2];
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
        for(var j = 1; j < data[0].length; j++){
            if(highPrice < data[0][j].price){
                highPrice = data[0][j].price;
            }
            if(lowPrice > data[0][j].price){
                lowPrice = data[0][j].price;
            }
            closePrice = data[0][j].price
        }

        if(i > 0){

        }
    }
    //if(data[index][0])
}


//
//
//
console.log(data);

