import { OpConfig } from '@terascope/job-components';
import { Compression } from '../__lib/compression';
import { Format } from '../__lib/parser';

export interface FileExporterConfig extends OpConfig {
    path: string;
    extension: string;
    compression: Compression;
    field_delimiter: string;
    line_delimiter: string;
    fields: string[];
    file_per_slice: boolean;
    include_header: boolean;
    format: Format;
}
