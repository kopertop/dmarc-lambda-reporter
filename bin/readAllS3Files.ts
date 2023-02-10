import { S3 } from 'aws-sdk';

import { parseAttachment } from '../src/parse-attachment';
import { parseEmail } from '../src/parser';
import { processDMARCFile } from '../src/process-file';

const s3 = new S3();

// eslint-disable-next-line consistent-return
async function main(bucket: string, nextToken?: any) {
	const s3ListResp = await s3.listObjectsV2({
		Bucket: bucket,
		ContinuationToken: nextToken,
	}).promise();
	for (const item of s3ListResp.Contents) {
		const s3Resp = await s3.getObject({
			Bucket: bucket,
			Key: item.Key,
		}).promise();
		if (s3Resp?.Body) {
			const resp = await parseEmail(s3Resp.Body.toString());
			if (resp.attachments) {
				for (const attachment of resp.attachments) {
					const attachmentData = await parseAttachment(attachment.content, attachment.contentType);
					if (attachmentData) {
						await processDMARCFile(attachmentData).catch((e) => {
							console.error('ERROR Processing', item, e);
						});
					}
				}
			}
		}
	}
	if (s3ListResp.ContinuationToken) {
		return main(bucket, s3ListResp.ContinuationToken);
	}
}
main(process.argv[2]);
