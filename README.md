#Batch Reporter (with Elasticsearch)
[![Build Status](https://travis-ci.org/komsit37/batch-reporter-es.svg)](https://travis-ci.org/komsit37/batch-reporter-es)

easily track batch job status in elasticsearch/kibana

```
npm install batch-reporter-es
```

```javascript  
var Promise = require('bluebird');
var CONFIG = require('config');
var BatchReporterEs = require('batch-reporter-es').BatchReporterEs;
var batch = new BatchReporterEs(CONFIG.ELASTICSEARCH_HOST, 'test-index', 'batch1');

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
```


```  
info: status no=0, id=job1, retry=0, message=queueing job1
info: status no=1, id=job2, retry=0, message=msg bla bla
info: status no=1, id=job2, retry=0, message=msg bla bla, status=QUEUED, start=Tue Sep 01 2015 23:15:19 GMT+0900 (JST)
info: status no=1, id=job2, retry=0, message=done, status=PROCESSING, start=Tue Sep 01 2015 23:15:19 GMT+0900 (JST), processing_time=1.004
info: status no=0, id=job1, retry=0, message=some error log, status=QUEUED, processing_time=NaN
info: status-final start=Tue Sep 01 2015 23:15:19 GMT+0900 (JST), queued=0, processing=0, completed=1, consecutive_error=1, retry=0, queued=2, processing=1, completed=1, error=1, retry=0, result=success, run_time=3, speed=0.3333333333333333

```

![Created in Kibana](https://github.com/komsit37/batch-reporter-es/blob/master/resources/sample_dashboard.png "Sample Dashboard in Kibana")
