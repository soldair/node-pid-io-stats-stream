
var through = require('through');
var procfs = require('procfs-stats');
var avg = require('./avg'),undef;

module.exports = function(pid,interval,winSize){
  var ps = procfs(pid);
  // sample disk io
  var s = through();

  var store = {};

  winSize = winSize||10;
  interval = interval||1000;
  var lastValue;

  var stop = intrSample(function(lastValue,cb){
    ps.io(function(err,stats){
      if(lastValue) {
        var o = subtractValues(lastValue);
        s.write(avgWinValues(store,o,win));      
      }
      cb(false,stats);
    });
  },function(err){
    // stopped.
    if(err) s.emit('error',err);
  })

  s.on('end',function(){
    stop();
  });

  return s;
}


function intrSample(ev,intr,done){
  var lastValue;
  var stopped = false;
  (function fn(){
    if(stopped) return done();
    var t = Date.now();
    ev(lastValue,function(err,lastValue){
      if(stopped || err) return done(err);
      
      var e = Date.now()-e;
      setTimeout(function(){
        fn();
      },interval-e);
    });
  }());

  return function(){
    stopped = true;
  }
}


function subtractValues(o1,o2){
  var keys = Object.keys(o1);
  var out = {},k;
  for(var i=0;i<keys.length;++i){
    k = keys[i];
    out[k] = o1[k]-o2[k];
  }
  return out;
}


function avgWinValues(store,o,win){
  var keys = Object.keys(o);
  var out = {};
  for(var i=0;i<keys.length;++i){
    k = keys[i];
    if(!store[k]) store[k] = [];
    out[k] = avg(store[k],o[k],win);
  }
  return out;
}
