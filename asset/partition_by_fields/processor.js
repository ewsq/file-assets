'use strict';

const {
    BatchProcessor
} = require('@terascope/job-components');
const path = require('path');

class PartitionByFields extends BatchProcessor {
    addPath(record, opConfig) {
        const partitions = [];
        opConfig.fields.forEach((field) => {
            partitions.push(`${field}=${record[field].replace(/=/gi, '_')}`.replace(/\//gi, '_'));
        });
        record.setMetadata(
            'file:partition',
            path.join(
                opConfig.path,
                ...partitions,
                '/'
            )
        );

        return record;
    }

    async onBatch(slice) {
        return slice.map((record) => this.addPath(record, this.opConfig));
    }
}

module.exports = PartitionByFields;