var Promise = require('bluebird');
var CONFIG = require('config');
var BatchReporterEs = require('./../index').BatchReporterEs;
var batch = new BatchReporterEs(CONFIG.ELASTICSEARCH_HOST, 'test', 'batch1');

Promise.delay(0).then(function(){
    batch.queued('job1', 'queueing job1');
    return batch.queued('job2', 'msg bla bla');
}).delay(100).then(function(){
    return batch.processing('job2');
}).delay(1000).then(function(){
    return batch.completed('job2', 'done');
}).delay(1000).then(function(){
    return batch.error('job1', 'some error log');
}).delay(1000).then(function(){
    return batch.success();
});
