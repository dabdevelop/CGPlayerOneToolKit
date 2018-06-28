"use strict";

// Step 0: Configure Network and Path
var Nebulas = require("nebulas"),
    Account = Nebulas.Account,
    Neb = Nebulas.Neb,
    Utils = Nebulas.Utils,
    Unit = Nebulas.Unit,
    neb = new Neb();

var rpcURL = "https://mainnet.nebulas.io";
var chainId = 0;
var dappAddress = 'n1sr4JA4e9QPB4opLk2Kjmp8NkP6GGoAmnt';

neb.setRequest(new Nebulas.HttpRequest(rpcURL));
var path = "./accounts/";

var fromAddress;

var playerNum = 0;
var circulation = 0;

var buyOrder = [];
var sellOrder = [];
var burnOrder = [];
var order = {};
var players = {};
var playersId = {};
var bounty = {};
var playersData = {};  //{account:{balance:0, buy: 0, sell: 0, burn: 0, avg: 0}}
var playersData1 = {};  //{account:{balance:0, buy: 0, sell: 0, burn: 0, avg: 0}}
var allBounty = 1500;   // 头号玩家独享500 NAS, 所有玩家按CGT数量分享 1500NAS;

var sent = [];
var total = 10000;
var lastSend = -1;

var nonce = -1;


var lowerLimit = 0;

var test = false;
var confirmBatchTransfer = true;

const fs = require('fs');

var passphrase = "password";

// transferRemain();

transferAll();


function checkTransfer(){
    if(lastSend < sent.length){
        lastSend = sent.length;
    } else {
        console.log('正在重新启动发送程序' + ' (' + sent.length + '/' + total +')');
        nonce = -1;
        transferAll();
    }
}

setInterval(checkTransfer, 60000);


//snapshot();
// calculateBalance();


function calculateBalance(){
    order = require('./order.json');
    buyOrder = order.buyOrder;
    sellOrder = order.sellOrder;
    burnOrder = order.burnOrder;
    for(var i in buyOrder){
        if(typeof players[buyOrder[i].account] === 'undefined'){
            playersId[buyOrder[i].account] = buyOrder[i].playerId;
            players[buyOrder[i].account] = 0;
            playersData[buyOrder[i].account] = {balance:0, buy: 0, sell: 0, burn: 0, avg: 0};
            playersData[buyOrder[i].account]['balance'] = 0;
            playersData[buyOrder[i].account]['buy'] = 0;
            playersData[buyOrder[i].account]['sell'] = 0;
            playersData[buyOrder[i].account]['burn'] = 0;
        }
        players[buyOrder[i].account] += parseFloat(buyOrder[i].amount);
        playersData[buyOrder[i].account]['balance'] += parseFloat(buyOrder[i].amount);
        playersData[buyOrder[i].account]['buy'] += parseFloat(buyOrder[i].value);
        if( playersData[buyOrder[i].account]['balance'] > 0){
            playersData[buyOrder[i].account]['avg'] = (playersData[buyOrder[i].account]['buy'] - playersData[buyOrder[i].account]['sell'] - playersData[buyOrder[i].account]['burn']) / playersData[buyOrder[i].account]['balance'];
        }
    }

    for(var i in sellOrder){
        if(typeof players[sellOrder[i].account] === 'undefined'){
            playersId[sellOrder[i].account] = sellOrder[i].playerId;
            players[sellOrder[i].account] = 0;
            playersData[sellOrder[i].account] = {balance:0, buy: 0, sell: 0, burn: 0, avg: 0};
            playersData[sellOrder[i].account]['balance'] = 0;
            playersData[sellOrder[i].account]['buy'] = 0;
            playersData[sellOrder[i].account]['sell'] = 0;
            playersData[sellOrder[i].account]['burn'] = 0;
        }
        players[sellOrder[i].account] -= parseFloat(sellOrder[i].amount);
        playersData[sellOrder[i].account]['balance'] -= parseFloat(sellOrder[i].amount);
        playersData[sellOrder[i].account]['sell'] += parseFloat(sellOrder[i].value);
        if( playersData[sellOrder[i].account]['balance'] > 0){
            playersData[sellOrder[i].account]['avg'] = (playersData[sellOrder[i].account]['buy'] - playersData[sellOrder[i].account]['sell'] - playersData[sellOrder[i].account]['burn']) / playersData[sellOrder[i].account]['balance'];
        }
    }

    for(var i in burnOrder){
        if(typeof players[burnOrder[i].account] === 'undefined'){
            playersId[burnOrder[i].account] = burnOrder[i].playerId;
            players[burnOrder[i].account] = 0;
            playersData[burnOrder[i].account] = {balance:0, buy: 0, sell: 0, burn: 0, avg: 0};
            playersData[burnOrder[i].account]['balance'] = 0;
            playersData[burnOrder[i].account]['buy'] = 0;
            playersData[burnOrder[i].account]['sell'] = 0;
            playersData[burnOrder[i].account]['burn'] = 0;
        }
        players[burnOrder[i].account] -= parseFloat(burnOrder[i].amount);
        playersData[burnOrder[i].account]['balance'] -= parseFloat(burnOrder[i].amount);
        playersData[burnOrder[i].account]['burn'] += parseFloat(burnOrder[i].value);
        if( playersData[burnOrder[i].account]['balance'] > 0){
            playersData[burnOrder[i].account]['avg'] = (playersData[burnOrder[i].account]['buy'] - playersData[burnOrder[i].account]['sell'] - playersData[burnOrder[i].account]['burn']) / playersData[burnOrder[i].account]['balance'];
        }
    }

    var items = Object.keys(players).map(function(key) {
        return [key, players[key]];
    });

    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    items.slice(0, items.length);



    //for(var i in items){
    //    if(i == 0){
    //        bounty[items[i][0]] = items[i][1] / circulation * allBounty + 500;
    //    } else {
    //        bounty[items[i][0]] = items[i][1] / circulation * allBounty;
    //    }
    //}
    //
    //fs.writeFileSync("./bounty.json", JSON.stringify(bounty), function(err) {
    //    if(err) {
    //        return console.log(err);
    //    }
    //});
    //
    //fs.writeFileSync("./bounty.txt", JSON.stringify(bounty), function(err) {
    //    if(err) {
    //        return console.log(err);
    //    }
    //});
    //
    //fs.writeFileSync("./bounty_log.json", JSON.stringify(bounty), function(err) {
    //    if(err) {
    //        return console.log(err);
    //    }
    //});

    for(var i in items){
        playersData1[items[i][0]] = playersData[items[i][0]];
        playersData1[items[i][0]].playerId = playersId[items[i][0]];
        items[i][1] = parseInt(items[i][1]);
        items[i][2] = playersId[items[i][0]];
    }

    fs.writeFileSync("./players.json", JSON.stringify(items), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    fs.writeFileSync("./players.txt", JSON.stringify(items), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    fs.writeFileSync("./cg_data.json", JSON.stringify(playersData1), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    fs.writeFileSync("./cg_data.txt", JSON.stringify(playersData1), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    fs.writeFileSync("./players_id.txt", JSON.stringify(playersId), function(err) {
        if(err) {
            return console.log(err);
        }
    });

}

function snapshot(){
    getPlayerNum(function(result){
        playerNum = parseInt(result);
        console.log(playerNum);
        getCirculation(function(result){
            circulation = parseInt(Unit.fromBasic(result, 'nas'));
            console.log(circulation);
            getBuyOrder(function(){
                getSellOrder(function(){
                    getBurnOrder(function(){
                        order['buyOrder'] = buyOrder;
                        order['sellOrder'] = sellOrder;
                        order['burnOrder'] = burnOrder;

                        fs.writeFileSync("./order.json", JSON.stringify(order), function(err) {
                        if(err) {
                            return console.log(err);
                            }
                        });

                        calculateBalance();
                    });
                });
            });
        });
    });
}


function transferAll(){
    if(test){
        neb.setRequest(new Nebulas.HttpRequest("https://testnet.nebulas.io"));
    }
    var r = require("./bounty.json");

    var user = []; // [{address: address1, value: value1},{address: address2, value: value2}]
    for(var key in r) {
        if(r.hasOwnProperty(key)) {
            user.push({address: key, value: r[key]});
        }
    }
    total = user.length;
    const fs = require('fs');
    fs.writeFileSync("./user.json", JSON.stringify(user), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    var f = function(index){
        if(index < user.length){
            try{
                transfer(passphrase, user[index], index, f);
            } catch (e){
                console.log(e);
                index ++;
                if(index < user.length) {
                    transfer(passphrase, user[index], index, f);
                }
            }
            //transfer(passphrase, user[index], index, f);
        }
    };

    if(confirmBatchTransfer){
        var start = 0;
        while(user[start].value <  0.0001){
            if(!sent.includes(start))
            sent.push(start);
            //console.log('跳过: ' + user[start].address);
            start ++;
        }
        if(start < user.length) {
            neb.api.getNebState().then((nebstate) => {
                chainId = nebstate.chain_id;
                transfer(passphrase, user[start], start, f);
            });
        }
    }
}

function transferRemain(){
    if(test){
        neb.setRequest(new Nebulas.HttpRequest("https://testnet.nebulas.io"));
    }
    var r = require("./bounty.json");

    var user = []; // [{address: address1, value: value1},{address: address2, value: value2}]
    for(var key in r) {
        if(r.hasOwnProperty(key)) {
            user.push({address: key, value: r[key]});
        }
    }

    var f = function(index){
        if(index == user.length){ return }
        while(user[index].value == 0){
            index ++;
        }
        var waitInterval;
        function wait(){
            clearInterval(waitInterval);
            transfer(passphrase, user[index], index, f);
        }
        if(index < user.length){
            waitInterval = setInterval(wait, 5000);
        }
    };

    if(confirmBatchTransfer){
        var start = 0;
        while(user[start].value == 0){
            start ++;
        }
        if(start < user.length) {
            transfer(passphrase, user[start], start, f);
        }
    }
}



function transfer(passphrase, user, index, callback){
    if(!sent.includes(index)){
        sent.push(index);
    } else {
        return callback(index + 1);
    }
    var toAddress = user.address;
    var value = parseInt(user.value * 10000) / 10000;
    if(value < 0.0001){
        return callback(index + 1);
    }
    var accounts = require(path + "accounts.json");
    var key = JSON.stringify(require(path + accounts[0] + ".json"));
    var acc = new Account();
    acc = acc.fromKey(key, passphrase, true);
    fromAddress = acc.getAddressString();
    neb.api.getAccountState(fromAddress).then((accstate) => {
        if(Unit.fromBasic(accstate.balance, "nas").toNumber() > 0.1){
            try {
                console.log(fromAddress + " 准备发送 " + value + " NAS 给 " + toAddress + ' (' + sent.length + '/' + total +')');
                let _value = Unit.nasToBasic(value);
                _value = parseInt(_value);
                if(nonce < 0){
                    nonce = parseInt(accstate.nonce);
                }
                nonce ++;
                let _nonce = nonce;
                //let _nonce = parseInt(accstate.nonce) + 1;
                let _to = toAddress;
                //generate transfer information
                var Transaction = Nebulas.Transaction;
                var tx = new Transaction({
                    chainID: 1,
                    from: acc,
                    to: _to,
                    value: _value,
                    nonce: _nonce,
                    gasPrice: 10000000,
                    gasLimit: 30000
                });
                tx.signTransaction();
                //send a transfer request to the NAS node
                neb.api.sendRawTransaction({
                    data: tx.toProtoString()
                }).then((result) => {
                    //console.log("Transfer " + toAddress + " " + value);
                    console.log(fromAddress + " 正在发送 " + value + " NAS 给 " + toAddress + ' (' + sent.length + '/' + total +')');
                    const fs = require('fs');
                    var balance = require("./bounty.json");
                    balance[toAddress] = 0;
                    fs.writeFileSync("./bounty.json", JSON.stringify(balance), function(err) {
                        if(err) {
                            return console.log(err);
                        }
                    });
                    let txhash = result.txhash;
                    let trigger = setInterval(() => {
                        try{
                            neb.api.getTransactionReceipt({hash: txhash}).then((receipt) => {
                                //console.log('Pending transaction ...');
                                if (receipt.status != 2) //not in pending
                                {
                                    //console.log(JSON.stringify(receipt));
                                    clearInterval(trigger);
                                    if (receipt.status == 1) //success
                                    {
                                        const fs = require('fs');
                                        var receiptJson = {};
                                        try {
                                            receiptJson = require("./receipt.json");
                                        } catch (err){
                                            console.log("Has no receipt file.");
                                        }
                                        receiptJson[receipt.to] = parseFloat(Unit.fromBasic(receipt.value, 'nas'));
                                        receiptJson['sent'] += parseFloat(Unit.fromBasic(receipt.value, 'nas'));
                                        fs.writeFileSync("./receipt.json", JSON.stringify(receiptJson), function(err) {
                                            if(err) {
                                                return console.log(err);
                                            }
                                        });
                                        console.log( fromAddress + " 发送 " + value + " NAS 给 " + toAddress + " 成功" + ' (' + sent.length + '/' + total +')');
                                        callback(index + 1);
                                    } else {
                                        console.log( fromAddress + " 发送 " + value + " NAS 给 " + toAddress + " 失败" + ' (' + sent.length + '/' + total +')');
                                    }
                                }
                            });
                        } catch(err){
                            console.log(err);
                            clearInterval(trigger);
                            callback(index + 1);
                        }
                    }, 10000);
                });

            } catch (err) {
                console.log( fromAddress + " 发送 " + value + " NAS 给 " + toAddress + " 失败, 尝试重新发送!");
                callback(index);
                //console.log(err.message);
            }
        } else {
            console.log("Escape " + fromAddress + " balance less than " + lowerLimit + " NAS.");
        }
    });


}



function innerCall(fun, args, value, callback) {
    let params = {};
    var accounts = require(path + "accounts.json");
    var key = JSON.stringify(require(path + accounts[0] + ".json"));
    var acc = new Account();
    acc = acc.fromKey(key, passphrase, true);
    params.from = acc;
    params.to = dappAddress;
    params.gasPrice = Utils.toBigNumber(1000000);
    params.gasLimit = Utils.toBigNumber(20000000);
    params.value = value;
    // prepare contract
    params.contract = {
        "function": fun,
        "args": JSON.stringify(args)
    };
    console.log(params.from.getAddressString() + ' call ' + params.to + ' @ ' + fun + ": " + JSON.stringify(args) + ' with value: ' + value + ' time: ' + (new Date().toLocaleString()));
    callback(params);
}

function getPlayerNum(callback){
    var fun = 'playerNum';
    var args = [];
    innerCall(fun, args, 0, function(params){
        neb.api.call(params.from.getAddressString(), params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
                return;
            }
            try{
                result = JSON.parse(result);
                callback(result);
            }catch (err){
                //result is the error message
                console.log("error:" + err.message)
            }

        }).catch(function (err) {
            console.log("error:" + err.message)
        });

    });

}

function getCirculation(callback){
    var fun = 'circulation';
    var args = [];
    innerCall(fun, args, 0, function(params){
        neb.api.call(params.from.getAddressString(), params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
                return;
            }
            try{
                result = JSON.parse(result);
                callback(result);
            }catch (err){
                //result is the error message
                console.log("error:" + err.message)
            }

        }).catch(function (err) {
            console.log("error:" + err.message)
        });

    });
}

function getBuyOrderByIndex(index, callback){
    var fun = 'getBuyOrder';
    var args = [];
    args.push(index);
    innerCall(fun, args, 0, function(params){
        neb.api.call(params.from.getAddressString(), params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
                return;
            }
            try{
                result = JSON.parse(result);
                buyOrder = buyOrder.concat(result);
                callback();
            }catch (err){
                //result is the error message
                console.log("error:" + err.message)
            }
        }).catch(function (err) {
            console.log("error:" + err.message)
        });

    });
}

function getBuyOrder(callback){
    var fun = 'buyOrderIndex';
    var args = [];
    innerCall(fun, args, 0, function(params){
        neb.api.call(params.from.getAddressString(), params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
                return;
            }
            try{
                var index = JSON.parse(result);
                var i = 0;
                var f = function(){
                    i ++;
                    if(i <= index){
                        getBuyOrderByIndex(i, f);
                    } else {
                        callback()
                    }
                };

                getBuyOrderByIndex(i, f);

            }catch (err){
                //result is the error message
                console.log("error:" + err.message)
            }
        }).catch(function (err) {
            console.log("error:" + err.message)
        });

    });
}

function getSellOrderByIndex(index, callback){
    var fun = 'getSellOrder';
    var args = [];
    args.push(index);
    innerCall(fun, args, 0, function(params){
        neb.api.call(params.from.getAddressString(), params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
                return;
            }
            try{
                result = JSON.parse(result);
                sellOrder = sellOrder.concat(result);
                callback();
            }catch (err){
                //result is the error message
                console.log("error:" + err.message)
            }
        }).catch(function (err) {
            console.log("error:" + err.message)
        });

    });
}

function getSellOrder(callback){
    var fun = 'sellOrderIndex';
    var args = [];
    innerCall(fun, args, 0, function(params){
        neb.api.call(params.from.getAddressString(), params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
                return;
            }
            try{
                var index = JSON.parse(result);
                var i = 0;
                var f = function(){
                    i ++;
                    if(i <= index){
                        getSellOrderByIndex(i, f);
                    } else {
                        callback();
                    }
                };
                getSellOrderByIndex(i, f);
            }catch (err){
                //result is the error message
                console.log("error:" + err.message)
            }
        }).catch(function (err) {
            console.log("error:" + err.message)
        });

    });
}

function getBurnOrderByIndex(index, callback){
    var fun = 'getBurnOrder';
    var args = [];
    args.push(index);
    innerCall(fun, args, 0, function(params){
        neb.api.call(params.from.getAddressString(), params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
                return;
            }
            try{
                result = JSON.parse(result);
                burnOrder = burnOrder.concat(result);
                callback();
            }catch (err){
                //result is the error message
                console.log("error:" + err.message)
            }
        }).catch(function (err) {
            console.log("error:" + err.message)
        });

    });
}

function getBurnOrder(callback){
    var fun = 'burnOrderIndex';
    var args = [];
    innerCall(fun, args, 0, function(params){
        neb.api.call(params.from.getAddressString(), params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
                return;
            }
            try{

                var index = JSON.parse(result);
                var i = 0;
                var f = function(){
                    i ++;
                    if(i <= index){
                        getBurnOrderByIndex(i, f);
                    } else {
                        callback();
                    }
                };
                getBurnOrderByIndex(i, f);
            }catch (err){
                console.log("error:" + err.message)
            }
        }).catch(function (err) {
            console.log("error:" + err.message)
        });

    });
}



function getTokenBalance(address, callback){
    var fun = 'balanceOf';
    var args = [];
    args.push(address);
    innerCall(fun, args, 0, function(params){
        neb.api.call(params.from.getAddressString(), params.to, params.value, 0, params.gasPrice, params.gasLimit, params.contract).then(function (resp) {
            var result = resp.result;
            if(result === 'null' || result === '""'){
                return;
            }
            try{
                var balance = JSON.parse(result);
                balance = parseFloat(Unit.fromBasic(balance, 'nas').toString(10)).toFixed(4);
                callback(balance);
            }catch (err){
                //result is the error message
                console.log("error:" + err.message)
            }
        }).catch(function (err) {
            console.log("error:" + err.message)
        });

    });
}