import { TimestreamWrite } from 'aws-sdk';
import chunk from 'chunk';

import { whois } from './whois';

const timestream = new TimestreamWrite();

export async function processDMARCFile(data: any) {
	console.log('Creating Log', new Date(data.date * 1000));
	const timeInSeconds = String(Math.round(data.date));
	const records: TimestreamWrite.Records = [];
	for (const report of data.reports) {
		for (const index in report.row) {
			const row = report.row[index];
			const identifier = report.identifiers[index] || report.identifiers[0];
			const record = {
				MeasureName: data.policy.domain[0],
				MeasureValue: row.count[0],
				MeasureValueType: 'BIGINT',
				Time: timeInSeconds,
				TimeUnit: 'SECONDS',
				Dimensions: [
					{ Name: 'org', Value: data.org, DimensionValueType: 'VARCHAR' },
					{ Name: 'source_ip', Value: row.source_ip[0], DimensionValueType: 'VARCHAR' },
					{ Name: 'disposition', Value: row.policy_evaluated[0].disposition[0], DimensionValueType: 'VARCHAR' },
					{ Name: 'dkim', Value: row.policy_evaluated[0].dkim[0], DimensionValueType: 'VARCHAR' },
					{ Name: 'spf', Value: row.policy_evaluated[0].spf[0], DimensionValueType: 'VARCHAR' },
					{ Name: 'header_from', Value: identifier.header_from[0], DimensionValueType: 'VARCHAR' },
				],
			};
			if (row.source_ip[0]) {
				try {
					const whoisResp = await whois(row.source_ip[0]);
					for (const prop of ['OrgName', 'OrgId']) {
						if (whoisResp?.[prop]?.[0]) {
							record.Dimensions.push({
								Name: prop,
								Value: whoisResp[prop][0],
								DimensionValueType: 'VARCHAR',
							});
						}
					}
				} catch (e) {
					console.log(`ERROR Looking up ${row.source_ip[0]}`, e);
				}
			}
			records.push(record);
		}
	}
	// Batch the uploads in chunks of no more than 100 records
	for (const recordChunk of chunk(records, 100)) {
		await timestream.writeRecords({
			DatabaseName: process.env.TIMESTREAM_DATABASE || 'DMARC',
			TableName: process.env.TIMESTREAM_TABLE || 'reports',
			Records: recordChunk,
		}).promise().catch((e) => {
			console.error('ERROR Writing to Timestream', e, JSON.stringify(recordChunk));
		});
	}
}
