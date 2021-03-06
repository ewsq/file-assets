import json2csv from 'json2csv';
import { OpConfig, DataEntity } from '@terascope/job-components';

export interface FileConfig {
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

export interface ReaderFileConfig extends FileConfig {
    size: number;
    connection: string;
    remove_header: boolean;
    ignore_empty: boolean;
    extra_args: CSVOptions;
}

export type CSVOptions = json2csv.Options<any>;

export interface ChunkedConfig extends ReaderFileConfig, Pick<OpConfig, '_encoding' | '_dead_letter_action'> {
    tryFn: (fn:(msg: any) => DataEntity) => (input: any) => DataEntity | null;
    rejectFn: (input: unknown, err: Error) => never | null;
}

export interface ChunkedSenderConfig extends ChunkedConfig {
    workerId: string;
    _key?: string;
}

export enum Format {
    json = 'json',
    ldjson = 'ldjson',
    raw = 'raw',
    tsv = 'tsv',
    csv = 'csv',
}

export enum FileSenderType {
    file = 'file',
    s3 = 's3',
    hdfs = 'hdfs'
}

export interface Offsets {
    length: number;
    offset: number;
}

export interface CSVConfig {
    fields: string[];
    include_header: boolean;
    line_delimiter: string;
    field_delimiter: string;
    format: Format;
}

export enum Compression {
    none = 'none',
    lz4 = 'lz4',
    gzip = 'gzip'
}

export interface NameOptions {
    filePath: string;
    filePerSlice?: boolean;
    extension?: string;
}

export interface SlicedFileResults extends Offsets {
    path: string;
    total: number;
}

export interface SliceConfig {
    file_per_slice: boolean;
    format: Format;
    size: number;
    line_delimiter: string;
}

export interface FileSliceConfig extends SliceConfig {
    path: string;
}

export type FetcherFn = (slice: SlicedFileResults) => Promise<string>
