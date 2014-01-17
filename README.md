pid-io-stats-stream
===================

get a stream of io stats for a running proces. 

depends on procfs which is a linux feature see https://github.com/soldair/node-procfs-stats#hope to contribute ideas for making this work on more systems.

```js

var pidstats = require('pid-io-stats-stream')
var stream = pidstats(process.pid);

stream.on('data',function(obj){
  console.log(obj);
});

```

pidstats(pid,[interval,[winSize]])
-------------------------------------------------

- pid - the process id
- interval - the polling interval in ms - optional defaults to 1000
- winSize - if a winSize is provided the result will be a windowed average of windowSize samples - optional defaults to off


more information on these kernel stats
--------------------------------------


from http://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/tree/Documentation/filesystems/proc.txt?id=HEAD#n1432


3.3  /proc/<pid>/io - Display the IO accounting fields
-------------------------------------------------------

This file contains IO statistics for each running process

Example
-------

test:/tmp # dd if=/dev/zero of=/tmp/test.dat &
[1] 3828

test:/tmp # cat /proc/3828/io
rchar: 323934931
wchar: 323929600
syscr: 632687
syscw: 632675
read_bytes: 0
write_bytes: 323932160
cancelled_write_bytes: 0


Description
-----------

rchar
-----

I/O counter: chars read
The number of bytes which this task has caused to be read from storage. This
is simply the sum of bytes which this process passed to read() and pread().
It includes things like tty IO and it is unaffected by whether or not actual
physical disk IO was required (the read might have been satisfied from
pagecache)


wchar
-----

I/O counter: chars written
The number of bytes which this task has caused, or shall cause to be written
to disk. Similar caveats apply here as with rchar.


syscr
-----

I/O counter: read syscalls
Attempt to count the number of read I/O operations, i.e. syscalls like read()
and pread().


syscw
-----

I/O counter: write syscalls
Attempt to count the number of write I/O operations, i.e. syscalls like
write() and pwrite().


read_bytes
----------

I/O counter: bytes read
Attempt to count the number of bytes which this process really did cause to
be fetched from the storage layer. Done at the submit_bio() level, so it is
accurate for block-backed filesystems. <please add status regarding NFS and
CIFS at a later time>


write_bytes
-----------

I/O counter: bytes written
Attempt to count the number of bytes which this process caused to be sent to
the storage layer. This is done at page-dirtying time.


cancelled_write_bytes
---------------------

The big inaccuracy here is truncate. If a process writes 1MB to a file and
then deletes the file, it will in fact perform no writeout. But it will have
been accounted as having caused 1MB of write.
In other words: The number of bytes which this process caused to not happen,
by truncating pagecache. A task can cause "negative" IO too. If this task
truncates some dirty pagecache, some IO which another task has been accounted
for (in its write_bytes) will not be happening. We _could_ just subtract that
from the truncating task's write_bytes, but there is information loss in doing
that.


Note
----

At its current implementation state, this is a bit racy on 32-bit machines: if
process A reads process B's /proc/pid/io while process B is updating one of
those 64-bit counters, process A could see an intermediate result.


More information about this can be found within the taskstats documentation in
Documentation/accounting.
