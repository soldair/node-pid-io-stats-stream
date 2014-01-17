
module.exports = function(arr,num,win){
  arr.push(num)
  if(!arr._total) arr._total = 0;
  arr._total += num;
  if(arr.length > win) {
    arr._total -= arr.shift();
  }
  return arr._total/arr.length;
}

