import { TimestreamWrite } from 'aws-sdk';

const timestream = new TimestreamWrite();

export async function processDMARCFile(data: any) {
	console.log('Creating Log', new Date(data.date * 1000));
	const timeInSeconds = String(Math.round(data.date));
	const records: TimestreamWrite.Records = [];
	for (const report of data.reports) {
		for (const index in report.row) {
			const row = report.row[index];
			const identifier = report.identifiers[index] || report.identifiers[0];
			records.push({
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
			});
		}
	}
	await timestream.writeRecords({
		DatabaseName: 'DMARC',
		TableName: 'reports',
		Records: records,
	}).promise();
}
