var elasticsearch = require('elasticsearch');
var E = require('./enum');
var BatchReporter = require('./batch-reporter');

function BatchReporterEs(es_host, es_index, subject, es_log_level) {
    this.es_index = es_index;
    this.subject = subject;
    this.es = new elasticsearch.Client({
        host: es_host,
        log: es_log_level
    });
    this.batch = new BatchReporter();
}

//status
BatchReporterEs.prototype.queued =     function(id, msg) {return this._logProgress(E.STATUS.QUEUED, id, msg)};
BatchReporterEs.prototype.processing = function(id, msg) {return this._logProgress(E.STATUS.PROCESSING, id, msg)};
BatchReporterEs.prototype.completed =  function(id, msg) {return this._logProgress(E.STATUS.COMPLETED, id, msg)};
BatchReporterEs.prototype.error =      function(id, msg) {return this._logProgress(E.STATUS.ERROR, id, msg)};
BatchReporterEs.prototype.retrying =   function(id, msg) {return this._logProgress(E.STATUS.RETRYING, id, msg)};

//results
BatchReporterEs.prototype.success =    function() {return this._logResult(E.RESULT.SUCCESS)};
BatchReporterEs.prototype.fail =       function() {return this._logResult(E.RESULT.FAIL)};

//methods
BatchReporterEs.prototype.getStatus =       function(id) {return this.batch.getStatus(id)};
BatchReporterEs.prototype.getQueueStatus =  function() {return this.batch.getQueueStatus()};


BatchReporterEs.prototype._logProgress = function(newStatus, id, msg) {
    var status_queue = this.batch._logProgress(newStatus, id, msg);

    this.es.index({index: this.es_index,
        type: E.TYPE.STATUS,
        id: status_queue.status.id,
        body: {
            timestamp: new Date(),
            subject: this.subject,
            status: status_queue.status
        }
    });

    this.es.index({index: this.es_index,
        type: E.TYPE.QUEUE,
        body: {
            timestamp: new Date(),
            subject: this.subject,
            queue: status_queue.queue
        }
    });
};

BatchReporterEs.prototype._logResult = function(result) {
    var queueObj = this.batch._logResult(result);
    if (queueObj){
        this.es.index({
            index: this.es_index,
            type: E.TYPE.STATUS_FINAL,
            body: {
                timestamp: new Date(),
                subject: this.subject,
                queue: queueObj.queue
            }
        });
    }
};

// export the class
module.exports = BatchReporterEs;