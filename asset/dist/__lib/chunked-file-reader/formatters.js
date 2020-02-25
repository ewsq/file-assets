"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csvtojson_1 = __importDefault(require("csvtojson"));
const utils_1 = require("@terascope/utils");
// This function takes the raw data and breaks it into records, getting rid
// of anything preceding the first complete record if the data does not
// start with a complete record.
function _toRecords(rawData, delimiter, slice) {
    // Since slices with a non-zero chunk offset grab the character
    // immediately preceding the main chunk, if one of those chunks has a
    // delimiter as the first or second character, it means the chunk starts
    // with a complete record. In this case as well as when the chunk begins
    // with a partial record, splitting the chunk into an array by its
    // delimiter will result in a single garbage record at the beginning of
    // the array. If the offset is 0, the array will never start with a
    // garbage record
    let outputData = rawData;
    if (rawData.endsWith(delimiter)) {
        // Get rid of last character if it is the delimiter since that will
        // just result in an empty record.
        outputData = rawData.slice(0, -delimiter.length);
    }
    if (slice.offset === 0) {
        return outputData.split(delimiter);
    }
    return outputData.split(delimiter).slice(1);
}
// No parsing, leaving to reader or a downstream op.
function raw(incomingData, logger, opConfig, metadata, slice) {
    const data = _toRecords(incomingData, opConfig.line_delimiter, slice);
    return data.map((record) => {
        try {
            return utils_1.DataEntity.make({ data: record }, metadata);
        }
        catch (err) {
            if (opConfig._dead_letter_action === 'log') {
                logger.error(err, 'Bad record:', record);
            }
            else if (opConfig._dead_letter_action === 'throw') {
                throw err;
            }
            return null;
        }
    });
}
exports.raw = raw;
function csv(incomingData, logger, opConfig, metadata, slice) {
    const csvParams = Object.assign({
        delimiter: opConfig.field_delimiter,
        headers: opConfig.fields,
        trim: true,
        noheader: true,
        ignoreEmpty: opConfig.ignore_empty || false,
        output: 'json'
    }, opConfig.extra_args);
    let foundHeader = false;
    const data = _toRecords(incomingData, opConfig.line_delimiter, slice);
    async function call(record) {
        try {
            let parsedLine = await csvtojson_1.default(csvParams)
                .fromString(record).then((parsedData) => parsedData[0]);
            // csvToJson trim applied inconsistently so implemented this function
            Object.keys(parsedLine).forEach((key) => {
                parsedLine[key] = parsedLine[key].trim();
            });
            // Check for header row. Assumes there would only be one header row in a slice
            if (opConfig.remove_header && !foundHeader
                && Object.keys(parsedLine)
                    .sort().join() === Object.values(parsedLine).sort().join()) {
                foundHeader = true;
                parsedLine = null;
            }
            if (parsedLine) {
                return utils_1.DataEntity.fromBuffer(JSON.stringify(parsedLine), opConfig, metadata);
            }
            return null;
        }
        catch (err) {
            if (opConfig._dead_letter_action === 'log') {
                logger.error(err, 'Bad record:', record);
            }
            else if (opConfig._dead_letter_action === 'throw') {
                throw err;
            }
            return null;
        }
    }
    return Promise.all(data.map(call));
}
exports.csv = csv;
// tsv is just a specific case of csv
function tsv(incomingData, logger, opConfig, metadata, slice) {
    return csv(incomingData, logger, opConfig, metadata, slice);
}
exports.tsv = tsv;
function json(incomingData, logger, opConfig, metadata) {
    const data = JSON.parse(incomingData);
    if (Array.isArray(data)) {
        return data.map((record) => {
            try {
                return utils_1.DataEntity.fromBuffer(JSON.stringify(record), opConfig, metadata);
            }
            catch (err) {
                if (opConfig._dead_letter_action === 'log') {
                    logger.error(err, 'Bad record:', record);
                }
                else if (opConfig._dead_letter_action === 'throw') {
                    throw err;
                }
                return null;
            }
        });
    }
    try {
        return [utils_1.DataEntity.fromBuffer(JSON.stringify(data), opConfig, metadata)];
    }
    catch (err) {
        if (opConfig._dead_letter_action === 'log') {
            logger.error(err, 'Bad record:', data);
        }
        else if (opConfig._dead_letter_action === 'throw') {
            throw err;
        }
        return null;
    }
}
exports.json = json;
function ldjson(incomingData, logger, opConfig, metadata, slice) {
    const data = _toRecords(incomingData, opConfig.line_delimiter, slice);
    return data.map((record) => {
        try {
            return utils_1.DataEntity.fromBuffer(record, opConfig, metadata);
        }
        catch (err) {
            if (opConfig._dead_letter_action === 'log') {
                logger.error(err, 'Bad record:', record);
            }
            else if (opConfig._dead_letter_action === 'throw') {
                throw err;
            }
            return null;
        }
    });
}
exports.ldjson = ldjson;
//# sourceMappingURL=formatters.js.map