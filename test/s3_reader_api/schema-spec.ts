import 'jest-extended';
import { newTestJobConfig, WorkerTestHarness } from 'teraslice-test-harness';
import { ValidatedJobConfig, TestClientConfig, Logger } from '@terascope/job-components';
import { S3ReaderFactoryAPI } from '../../asset/src/s3_reader_api/interfaces';

describe('S3 Reader API Schema', () => {
    let harness: WorkerTestHarness;

    const clientConfig: TestClientConfig = {
        type: 's3',
        config: {},
        create(_config: any, _logger: Logger, _settings: any) {
            return { client: {} };
        },
        endpoint: 'default'
    };

    const clients = [clientConfig];

    async function makeTest(apiConfig: Partial<S3ReaderFactoryAPI> = {}) {
        const apiName = 's3_reader_api';

        const config = Object.assign(
            { _name: apiName },
            apiConfig
        );

        const testJob: Partial<ValidatedJobConfig> = {
            analytics: true,
            apis: [config],
            operations: [
                { _op: 's3_reader', api_name: apiName },
                { _op: 'noop' },
            ],
        };

        const job = newTestJobConfig(testJob);

        harness = new WorkerTestHarness(job, { clients });
        await harness.initialize();
    }

    afterEach(async () => {
        if (harness) await harness.shutdown();
    });

    describe('when validating the schema', () => {
        it('should throw an error if no path is specified', async () => {
            await expect(makeTest({})).toReject();
        });
    });
});
