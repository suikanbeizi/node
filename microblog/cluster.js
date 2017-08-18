/**
 * Created by apple on 17/8/10.
 */
//利用多核资源，又有实现故障恢复的服务器
var cluster = require('cluster');
var os = require('os');

//获取cpu数量
var numCPUs = os.cpus().length;

var workers = [];

if(cluster.isMaster) {
    //主进程分支
    cluster.on('death', function (worker) {
        //当一个工作进行结束时，重启工作进行
        delete worders[worker.pid];
        worker = cluster.fork();
        worders[worder.pid] = worker;
    });
    for (var i = 0; i < numCPUs; i += 1) {
        var worker = cluster.fork();
        workers[worker.pid] = worker;
    }
}else{
        //工作进行分支，启动服务器
        var app = require('./app');
        app.listen(3000);
}
//当主进行被终止时，关闭所有工作进程
process.on('SIGTERM',function(){
   for(var pid in workers){
       process.kill(pid);
   }
   process.exit(0);
});
