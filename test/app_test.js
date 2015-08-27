var chai = require("chai");
chai.use(require('chai-fuzzy'));
var should = chai.should();

describe('App', function () {
    it('can be imported', function () {
        var app = require('../index');
        should.exist(app);
    });
});



var BatchReporter = require('./../../batch-reporter-es').BatchReporter;
var E = require('./../lib/enum');

describe('Status Transformation', function () {
    it('properties init', function () {
        var batch = new BatchReporter();
        batch.queued('job-complete', 'job-complete queued');

        batch.getStatus('job-complete').status.should.be.equals(E.STATUS.QUEUED);
        batch.getStatus('job-complete').message.should.be.equals('job-complete queued');
        batch.getQueueStatus().current.should.be.like(
            {queued:1,processing:0,completed:0,consecutive_error:0,retry:0}
        );
        batch.getQueueStatus().cumulative.should.be.like(
            {queued:1,processing:0,completed:0,error:0,retry:0}
        );
    });

    it('queued', function () {
        var batch = new BatchReporter();
        batch.queued('job-complete');
        batch.queued('job-error');
        batch.queued('job-complete2');
        batch.queued('job-skip-processing');
        batch.getQueueStatus().current.should.be.like(
            {queued:4,processing:0,completed:0,consecutive_error:0,retry:0}
        );
        batch.getQueueStatus().cumulative.should.be.like(
            {queued:4,processing:0,completed:0,error:0,retry:0}
        );
    });

    it('queued -> processing', function () {
        var batch = new BatchReporter();
        batch.queued('job-complete');
        batch.queued('job-error');
        batch.queued('job-complete2');
        batch.queued('job-skip-processing');

        batch.processing('job-complete');
        batch.processing('job-error');
        batch.processing('job-complete2');

        batch.getQueueStatus().current.should.be.like(
            {queued:1,processing:3,completed:0,consecutive_error:0,retry:0}
        );
        batch.getQueueStatus().cumulative.should.be.like(
            {queued:4,processing:3,completed:0,error:0,retry:0}
        );
    });

    it('processing -> completed', function () {
        var batch = new BatchReporter();
        batch.queued('job-complete');
        batch.queued('job-error');
        batch.queued('job-complete2');
        batch.queued('job-skip-processing');

        batch.processing('job-complete');
        batch.processing('job-error');
        batch.processing('job-complete2');

        batch.completed('job-complete');

        batch.getQueueStatus().current.should.be.like(
            {queued:1,processing:2,completed:1,consecutive_error:0,retry:0}
        );
        batch.getQueueStatus().cumulative.should.be.like(
            {queued:4,processing:3,completed:1,error:0,retry:0}
        );
    });

    it('processing -> error', function () {
        var batch = new BatchReporter();
        batch.queued('job-complete');
        batch.queued('job-error');
        batch.queued('job-complete2');
        batch.queued('job-skip-processing');

        batch.processing('job-complete');
        batch.processing('job-error');
        batch.processing('job-complete2');

        batch.completed('job-complete');
        batch.error('job-error');

        batch.getQueueStatus().current.should.be.like(
            {queued:1,processing:1,completed:1,consecutive_error:1,retry:0}
        );
        batch.getQueueStatus().cumulative.should.be.like(
            {queued:4,processing:3,completed:1,error:1,retry:0}
        );
    });

    it('processing -> completed (consecutive error is reduced after complete)', function () {
        var batch = new BatchReporter();
        batch.queued('job-complete');
        batch.queued('job-error');
        batch.queued('job-complete2');
        batch.queued('job-skip-processing');

        batch.processing('job-complete');
        batch.processing('job-error');
        batch.processing('job-complete2');

        batch.completed('job-complete');
        batch.error('job-error');
        batch.completed('job-complete2');

        batch.getQueueStatus().current.should.be.like(
            {queued:1,processing:0,completed:2,consecutive_error:0,retry:0}
        );
        batch.getQueueStatus().cumulative.should.be.like(
            {queued:4,processing:3,completed:2,error:1,retry:0}
        );
    });

    it('error -> retry', function () {
        var batch = new BatchReporter();
        batch.queued('job-complete');
        batch.queued('job-error');
        batch.queued('job-complete2');
        batch.queued('job-skip-processing');

        batch.processing('job-complete');
        batch.processing('job-error');
        batch.processing('job-complete2');

        batch.completed('job-complete');
        batch.completed('job-complete2');

        batch.error('job-error');
        batch.retrying('job-error');

        batch.getQueueStatus().current.should.be.like(
            {queued:1,processing:0,completed:2,consecutive_error:1,retry:1}
        );
        batch.getQueueStatus().cumulative.should.be.like(
            {queued:4,processing:3,completed:2,error:1,retry:1}
        );
    });

    it('queued -> completed (skip processing)', function () {
        var batch = new BatchReporter();
        batch.queued('job-complete');
        batch.queued('job-error');
        batch.queued('job-complete2');
        batch.queued('job-skip-processing');

        batch.processing('job-complete');
        batch.processing('job-error');
        batch.processing('job-complete2');

        batch.completed('job-complete');
        batch.completed('job-complete2');

        batch.error('job-error');
        batch.retrying('job-error');

        batch.completed('job-skip-processing');

        batch.getQueueStatus().current.should.be.like(
            {queued:0,processing:0,completed:3,consecutive_error:0,retry:1}
        );
        batch.getQueueStatus().cumulative.should.be.like(
            {queued:4,processing:4,completed:3,error:1,retry:1}
        );
    });

    it('retry -> queued', function () {
        var batch = new BatchReporter();
        batch.queued('job-complete');
        batch.queued('job-error');
        batch.queued('job-complete2');
        batch.queued('job-skip-processing');

        batch.processing('job-complete');
        batch.processing('job-error');
        batch.processing('job-complete2');

        batch.completed('job-complete');
        batch.completed('job-complete2');

        batch.error('job-error');
        batch.retrying('job-error');

        batch.queued('job-error');

        batch.getQueueStatus().current.should.be.like(
            {queued:2,processing:0,completed:2,consecutive_error:1,retry:0}
        );
        batch.getQueueStatus().cumulative.should.be.like(
            {queued:5,processing:3,completed:2,error:1,retry:1}
        );
    });
});