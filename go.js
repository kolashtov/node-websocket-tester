//config start
var num_connections = 50000;
var num_workers = 100;
//config end

var counter = 0;
const Pool = require('threads').Pool;

const pool = new Pool(num_workers);

const jobC = pool.run(
  function(input, done) {
	var sys = require('sys');

	var WebSocket = require('ws');
	var ws = new WebSocket('wss://asdasdasdasd/refresh/');

	ws.on('open', function open() {
		sys.debug('connected');
	});
	ws.on('error', function error(error) {
		sys.debug('error:' + error.message);
	});
	ws.on('close', function close(evnt) {
		if (evnt.wasClean) {
			sys.debug('Соединение закрыто чисто');
		} else {
			sys.debug('Обрыв соединения'); // например, "убит" процесс сервера
		}
		sys.debug('Код: ' + evnt.code + ' причина: ' + evnt.reason);
	});
	ws.on('message', function(data, flags) {

		var data2 = JSON.parse(data);
		var srv_time = Date.parse(data2['created_at'])/1000;
		var d = new Date();
		var local_time = d.getTime() / 1000;
		var latency = local_time-srv_time;
		sys.debug('Latency: ' + latency.toString()); 
		if(latency > 2) {
			sys.debug('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Latency: ' + latency.toString());
		}
	});
    
    	done(input+1);
  }
);

for (i=0; i<num_connections; i++) {
	jobC.send(counter);
}

jobC
  .on('done', function(job, ctr) {
    console.log('Job C hashed:', ctr);
    counter++;
  });

pool
  .on('done', function(job, message) {
    console.log('Job done:',  message);
//    console.log(job);
  })
  .on('error', function(job, error) {
    console.error('Job errored:', job);
  })
  .on('finished', function() {
    console.log('Everything done, shutting down the thread pool.');
    console.log('counter:', counter);
    //pool.killAll();
  });

console.log('counter:', counter);
