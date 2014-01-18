var test = require('tape');
var pidio = require('../')

test("can monitor",function(t){
  var stream = pidio(process.pid);
  
  var c = 0;
  stream.on('data',function(data){
    ++c;
    t.ok(data,'should have stats');
    console.log(data);
    if(c === 2) stream.end();
  }).on('end',function(){
    t.end();
  });

})


