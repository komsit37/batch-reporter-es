#Batch Reporter (with Elasticsearch)
[![Build Status](https://travis-ci.org/komsit37/batch-reporter-es.svg)](https://travis-ci.org/komsit37/batch-reporter-es)

easily track batch job status in elasticsearch/kibana

two version
var batch = require('./../../batch-reporter-es').BatchReporter;  
* just a queue

var batch = require('./../../batch-reporter-es').BatchReporterEs;  
* queue with elasticsearch index builtin