var STATUS = {
    QUEUED: 'QUEUED',
    PROCESSING: 'PROCESSING',
    RETRYING: 'RETRYING',
    COMPLETED: 'COMPLETED',
    ERROR: 'ERROR'
};

var TYPE = {
    STATUS: 'status',
    STATUS_FINAL: 'status-final',
    QUEUE: 'queue'
};

var RESULT = {
    SUCCESS: 'success',
    FAIL: 'fail'
};

module.exports = {STATUS: STATUS, TYPE: TYPE, RESULT: RESULT};