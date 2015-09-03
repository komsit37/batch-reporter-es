var logger = require('winston');
var E = require('./enum');

function createQueue(){
    return {
        start: new Date(),
            current:{
        queued: 0,
            processing: 0,
            completed: 0,
            consecutive_error: 0,
            retry: 0
    },
        cumulative:{
            queued: 0,
                processing: 0,
                completed: 0,
                error: 0,
                retry: 0
        }
    }
}

// Constructor
function BatchReporter() {
    this.queue = createQueue();
    this.statusInfo = {};
    this.statusCount = 0;
}
//status
BatchReporter.prototype.queued =     function(id, msg) {return this._logProgress(E.STATUS.QUEUED, id, msg)};
BatchReporter.prototype.processing = function(id, msg) {return this._logProgress(E.STATUS.PROCESSING, id, msg)};
BatchReporter.prototype.completed =  function(id, msg) {return this._logProgress(E.STATUS.COMPLETED, id, msg)};
BatchReporter.prototype.error =      function(id, msg) {return this._logProgress(E.STATUS.ERROR, id, msg)};
BatchReporter.prototype.retrying =   function(id, msg) {return this._logProgress(E.STATUS.RETRYING, id, msg)};

//results
BatchReporter.prototype.success =    function() {return this._logResult(E.RESULT.SUCCESS)};
BatchReporter.prototype.fail =       function() {return this._logResult(E.RESULT.FAIL)};

//methods
BatchReporter.prototype.getStatus =       function(id) {return this.statusInfo[id]};
BatchReporter.prototype.getQueueStatus =  function() {return this.queue};

//private
BatchReporter.prototype._logProgress = function(newStatus, id, msg) {
    if (!this.getStatus(id)){
        this.statusInfo[id] = {
            no: this.statusCount++,
            id: id,
            retry: 0
        };
    }
    var s = this.getStatus(id);

    if (msg) s.message = msg;

    if (newStatus === E.STATUS.PROCESSING) s.start = new Date();
    if (newStatus === E.STATUS.RETRYING) s.retry += 1;
    if (newStatus === E.STATUS.COMPLETED ||
        newStatus === E.STATUS.ERROR){
        s.processing_time = ((new Date()) - s.start)/1000;
    }

    if (s.status === E.STATUS.ERROR)
        logger.error(E.TYPE.STATUS, s);
    else
        logger.info(E.TYPE.STATUS, s);

    //todo: enforce status transform here, so we don't need hack logics (i.e. prohibit queued -> completed/error)
    this._updateCurrentQueue(s.status, newStatus);
    this._updateCumulativeQueue(s.status, newStatus);

    s.status = newStatus;
    return {status: s, queue: this.queue};
};

//result can be logged only once
BatchReporter.prototype._logResult = function(result) {
    var queue = this.queue;
    if (!queue.result) {
        queue.result = result;

        queue.run_time = Math.floor(((new Date) - queue.start) / (1000));
        queue.speed = queue.cumulative.completed / queue.run_time;
        logger.info(E.TYPE.STATUS_FINAL, queue);

        return {queue: queue};
    }
};

BatchReporter.prototype._updateCurrentQueue = function(currentStatus, newStatus) {
    var current = this.queue.current;
    switch (newStatus) {
        case E.STATUS.QUEUED:
            if (currentStatus === E.STATUS.RETRYING) current.retry--;
            current.queued++;
            break;
        case E.STATUS.PROCESSING:
            if (currentStatus === E.STATUS.RETRYING) current.retry--;
            current.queued--;
            current.processing++;
            break;
        case E.STATUS.COMPLETED:
            if (currentStatus === E.STATUS.PROCESSING) current.processing--;
            if (currentStatus === E.STATUS.QUEUED) current.queued--;
            current.completed++;
            current.consecutive_error = Math.max(0, current.consecutive_error - 1);   //remove consecutive error if completed successfully
            break;
        case E.STATUS.ERROR:
            if (currentStatus === E.STATUS.PROCESSING) current.processing--;
            if (currentStatus === E.STATUS.QUEUED) current.queued--;
            current.consecutive_error++;
            break;
        case E.STATUS.RETRYING:
            //if (previousStatus === E.STATUS.ERROR) queue.current.consecutive_error--;
            current.retry++;
            //not sure why i tried to remove consecutive_error here?
            //queue.current.consecutive_error = Math.max(0, queue.current.consecutive_error-1);   //remove consecutive error for retry case, because it's from the same id
            break;
    }
};

BatchReporter.prototype._updateCumulativeQueue = function(currentStatus, newStatus){
    var cumulative = this.queue.cumulative;
    switch (newStatus) {
        case E.STATUS.QUEUED:
            cumulative.queued++;
            break;
        case E.STATUS.PROCESSING:
            cumulative.processing++;
            break;
        case E.STATUS.COMPLETED:
            if (currentStatus === E.STATUS.QUEUED) cumulative.processing++;
            cumulative.completed++;
            break;
        case E.STATUS.ERROR:
            cumulative.error++;
            break;
        case E.STATUS.RETRYING:
            cumulative.retry++;
            break;
    }
};


// export the class
module.exports = BatchReporter;