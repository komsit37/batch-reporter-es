//var Promise = require('bluebird');
var CONFIG = require('config');
var BatchReporterEs = require('./../index').BatchReporterEs;
var batch = new BatchReporterEs(CONFIG.ELASTICSEARCH_HOST, 'test', 'batch1', 'debug', 60000);

//if we log final status just before calling process.exit(), the program will quit before index finishes, thus
//need to wait for promise before quitting

//batch.fail().then(function(){process.exit(1)});
batch.queued('id1').then(function(){process.exit(1)});
//batch.queued('id1', '');
//process.exit(1);
//setTimeout(function(){process.exit(1);}, 10000);