var order = require('./order.json');

var buyOrder = order.buyOrder;
var sellOrder = order.sellOrder;

var startTime = new Date(1529906400000);
var endTime = new Date(1529974800000);
var basePrice = 0.023;
var playersData = {};  //{account:{balance:0, buy: 0, sell: 0, burn: 0, avg: 0}}

for(var i in buyOrder){
    var time = new Date(buyOrder[i].timeSeconds * 1000);
    if(startTime <= time && time <= endTime){
        if(typeof playersData[buyOrder[i].account] === 'undefined'){
            playersData[buyOrder[i].account] = {buy: 0, sell: 0, earn: 0, cost: 0};
        }
        playersData[buyOrder[i].account].cost +=  buyOrder[i].value;
        playersData[buyOrder[i].account].buy +=  buyOrder[i].amount;

    }
}

for(var i in sellOrder){
    var time = new Date(sellOrder[i].timeSeconds * 1000);
    if(startTime <= time && time <= endTime){
        if(typeof playersData[sellOrder[i].account] === 'undefined'){
            playersData[sellOrder[i].account] = {buy: 0, sell: 0, earn: 0, cost: 0};
        }
        playersData[sellOrder[i].account].earn +=  sellOrder[i].value;
        playersData[sellOrder[i].account].sell +=  sellOrder[i].amount;

    }
}

var total = 0;

for(var a in playersData){
    var refund = (playersData[a].sell - playersData[a].buy) * basePrice - (playersData[a].earn - playersData[a].cost);
    playersData[a].refund = refund > 0?refund:0;
    total += refund > 0?refund:0;
}

console.log(playersData);
console.log(total);