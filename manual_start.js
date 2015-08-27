//var BatchReporter = require('./lib/batch-reporter');
var BatchReporterEs = require('./lib/batch-reporter-es');

var batch = new BatchReporterEs('test', 'queue-test');

batch.queued(1, 'job1', 'job1 queued');
batch.queued(2, 'job2', 'job2 queued');
batch.queued(3, 'job3', 'job3 queued');
console.log(batch.getQueueStatus());

batch.processing(1, 'job1', 'job1 processing');
batch.processing(2, 'job2', 'job2 processing');
batch.processing(3, 'job3', 'job3 processing');
console.log(batch.getQueueStatus());

batch.completed(1, 'job1', 'job1 completed');
batch.error(2, 'job2', 'job2 error');
batch.completed(3, 'job3', 'job3 completed');
console.log(batch.getQueueStatus());

console.log(batch.getStatus('job1'));
console.log(batch.getStatus('job2'));
console.log(batch.getStatus('job3'));
console.log(batch.getQueueStatus());

batch.success();