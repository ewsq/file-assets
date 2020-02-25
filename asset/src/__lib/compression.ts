import { gzip, ungzip } from 'node-gzip';
// @ts-ignore
import { encode, decode } from 'lz4';

export enum Compression {
    none = 'none',
    lz4 = 'lz4',
    // eslint-disable-next-line no-shadow
    gzip = 'gzip'
}

export async function compress(compression: string, data: any) {
    switch (compression) {
        case 'lz4':
            return encode(data);
        case 'gzip':
            return gzip(data);
        case 'none':
            return data;
        default:
        // This shouldn't happen since the config schemas will protect against it
            throw new Error(`Unsupported compression: ${compression}`);
    }
}
// TODO: why is this backwards
export async function decompress(data: any, compression: string) {
    switch (compression) {
        case 'lz4':
            return decode(data).toString();
        case 'gzip':
            return ungzip(data).then((uncompressed: any) => uncompressed.toString());
        case 'none':
            return data.toString();
        default:
        // This shouldn't happen since the config schemas will protect against it
            throw new Error(`Unsupported compression: ${compression}`);
    }
}
