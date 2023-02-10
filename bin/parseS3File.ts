import { S3 } from 'aws-sdk';

import { parseAttachment } from '../src/parse-attachment';
import { parseEmail } from '../src/parser';
import { processDMARCFile } from '../src/process-file';

const s3 = new S3();

async function main(s3URL: string) {
	const s3URLParts = s3URL.match(/^(s3:\/\/)?([a-z0-9-.]+)\/(.+)/);
	if (!s3URLParts) {
		throw new Error(`Invalid URL: "${s3URL}"`);
	}
	const s3Resp = await s3.getObject({
		Bucket: s3URLParts[2],
		Key: s3URLParts[3],
	}).promise();
	if (s3Resp?.Body) {
		const resp = await parseEmail(s3Resp.Body.toString());
		if (resp.attachments) {
			for (const attachment of resp.attachments) {
				const attachmentData = await parseAttachment(attachment.content, attachment.contentType);
				if (attachmentData) {
					await processDMARCFile(attachmentData);
				}
			}
		}
		console.log(resp);
	}
}
main(process.argv[2]);
