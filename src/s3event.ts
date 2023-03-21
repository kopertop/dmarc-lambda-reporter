import type { S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';

import { parseAttachment } from './parse-attachment';
import { parseEmail } from './parser';
import { processDMARCFile } from './process-file';

const s3 = new S3();

/**
 * Process an S3 Event (Saved file to S3)
 * @param event S3Event
 */
export async function handleS3Event(event: S3Event) {
	for (const record of event.Records) {
		if (record.s3) {
			const s3Resp = await s3.getObject({
				Bucket: record.s3.bucket.name,
				Key: record.s3.object.key,
			}).promise();
			if (s3Resp.Body) {
				const resp = await parseEmail(s3Resp.Body.toString());
				if (resp.attachments) {
					for (const attachment of resp.attachments) {
						const attachmentData = await parseAttachment(
							attachment.content,
							attachment.contentType,
						);
						if (attachmentData) {
							await processDMARCFile(attachmentData);
						}
					}
				}
			}
		}
	}
}
