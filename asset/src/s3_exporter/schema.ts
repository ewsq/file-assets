import { ConvictSchema } from '@terascope/job-components';
import { S3ExportConfig } from './interfaces';
import { fileReaderSchema } from '../__lib/common-schema';

export default class Schema extends ConvictSchema<S3ExportConfig> {
    build(): Record<string, any> {
        return fileReaderSchema;
    }
}
