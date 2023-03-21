import type { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import Busboy from 'busboy';

import { parseAttachment } from './parse-attachment';
import { processDMARCFile } from './process-file';

const s3 = new S3();

/**
 * Process a mailgun webhook
 *
 * @param event APIGatewayEvent from Mailgun
 */
export function handleMailgunEvent(event: APIGatewayEvent) {
	return new Promise((accept) => {
		const headers: any = {};
		// Busboy sucks at handling headers, so we need to normalize them all
		for (const key in event.headers) {
			const val = event.headers[key];
			headers[key] = val;
			headers[key.toLowerCase()] = val;
		}
		const req = new Busboy({ headers });
		const params: any = {};
		let files = 0;
		req.on('field', (fieldname, val) => {
			params[fieldname] = val;
		});
		req.on('file', async (fieldname, file, filename, encoding, mimetype) => {
			files += 1;
			console.log({
				fieldname,
				filename,
				encoding,
				mimetype,
			});
			const data = await parseAttachment(file, mimetype);
			// Allow saving this to S3 if there is a process.env.S3_BUCKET passed in
			if (process.env.S3_BUCKET && data?.policy) {
				await s3.putObject({
					Bucket: process.env.S3_BUCKET,
					Key: `${data.policy.domain}/${data.org}/${data.date}.json`,
					Body: JSON.stringify(data),
				}).promise();
			}
			await processDMARCFile(data);
			files -= 1;
			if (files === 0) {
				accept({
					statusCode: 200,
					body: 'OK',
				});
			}
		});
		req.on('finish', async () => {
			let contentMap = {};
			params.content_url_ids = {};
			if (params['content-id-map']) {
				contentMap = JSON.parse(params['content-id-map']);
				for (const key in contentMap) {
					const val = contentMap[key];
					params.content_url_ids[val] = key;
				}
			}
			if (files === 0) {
				accept({
					statusCode: 200,
					body: 'OK',
				});
			}
		});

		if (event.isBase64Encoded) {
			req.write(Buffer.from(event.body, 'base64'));
		} else {
			req.write(event.body);
		}
		req.end();
	});
}
