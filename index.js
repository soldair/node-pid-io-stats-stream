
var through = require('through');
var procfs = require('procfs-stats');
var avg = require('./avg'),undef;

module.exports = function(pid,interval,winSize){
  var ps = procfs(pid);
  // sample disk io
  var s = through();

  var store = {};

  winSize = winSize||1;
  interval = interval||1000;
  var lastValue;

  var stop = intrSample(function(lastValue,cb){
    ps.io(function(err,stats){
      if(lastValue) {
        var o = subtractValues(stats,lastValue);
        s.write(winSize>1?avgWinValues(store,o,winSize):o);      
      }
      cb(false,stats);
    });
  },function(err){
    // stopped.
    if(err) s.emit('error',err);
  },interval);

  s.on('end',function(){
    stop();
  });

  return s;
}


function intrSample(ev,done,intr){
  var lastValue;
  var stopped = false;
  (function fn(){
    console.log('sample?')
    if(stopped) return done();
    var t = Date.now();
    ev(lastValue,function(err,_lastValue){
      if(stopped || err) return done(err);
      lastValue = _lastValue;
      var e = Date.now()-t;
      setTimeout(function(){
        fn();
      },intr-e);
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
