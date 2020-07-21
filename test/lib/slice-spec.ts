import 'jest-extended';
import { getOffsets, sliceFile } from '../../asset/src/__lib/slice';
import { Format } from '../../asset/src/__lib/interfaces';

describe('offses', () => {
    it('can be computed', () => {
        expect(getOffsets(10, 0, '\n')).toEqual([]);

        expect(getOffsets(10, 9, '\n')).toEqual([
            { offset: 0, length: 9 },
        ]);

        expect(getOffsets(10, 10, '\n')).toEqual([
            { offset: 0, length: 10 },
        ]);

        expect(getOffsets(10, 15, '\n')).toEqual([
            { offset: 0, length: 10 },
            { offset: 9, length: 6 },
        ]);

        expect(getOffsets(10, 20, '\n')).toEqual([
            { offset: 0, length: 10 },
            { offset: 9, length: 11 },
        ]);

        expect(getOffsets(10, 20, '\r\n')).toEqual([
            { offset: 0, length: 10 },
            { offset: 8, length: 12 },
        ]);

        expect(getOffsets(10, 21, '\r\n')).toEqual([
            { offset: 0, length: 10 },
            { offset: 8, length: 12 },
            { offset: 18, length: 3 },
        ]);
    });
});

describe('sliceFile', () => {
    it('if format is json, will return the entire file', () => {
        const slice = { path: 'some/path', size: 1000 };
        const config = {
            file_per_slice: false,
            line_delimiter: '\n',
            size: 500,
            format: Format.json
        };

        const expectedResults = {
            path: slice.path,
            total: slice.size,
            length: slice.size,
            offset: 0
        };

        expect(sliceFile(slice, config)).toMatchObject([expectedResults]);
    });

    it('if file_per_slice is true, will return the entire file', () => {
        const slice = { path: 'some/path', size: 1000 };
        const config = {
            file_per_slice: true,
            line_delimiter: '\n',
            size: 500,
            format: Format.ldjson
        };

        const expectedResults = {
            path: slice.path,
            total: slice.size,
            length: slice.size,
            offset: 0
        };

        expect(sliceFile(slice, config)).toMatchObject([expectedResults]);
    });

    it('if chunk up a file', () => {
        const slice = { path: 'some/path', size: 1000 };
        const config = {
            file_per_slice: false,
            line_delimiter: '\n',
            size: 300,
            format: Format.ldjson
        };

        const slice1 = {
            offset: 0, length: 300, path: 'some/path', total: 1000
        };
        const slice2 = {
            length: 301, offset: 299, path: 'some/path', total: 1000
        };
        const slice3 = {
            length: 301, offset: 599, path: 'some/path', total: 1000
        };
        const slice4 = {
            offset: 899, length: 101, path: 'some/path', total: 1000
        };

        const results = sliceFile(slice, config);

        expect(results).toBeArrayOfSize(4);

        expect(results[0]).toMatchObject(slice1);
        expect(results[1]).toMatchObject(slice2);
        expect(results[2]).toMatchObject(slice3);
        expect(results[3]).toMatchObject(slice4);
    });
});