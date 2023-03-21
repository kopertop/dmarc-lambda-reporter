import type { APIGatewayEvent, S3Event } from 'aws-lambda';

import { handleMailgunEvent } from './mailgun';
import { handleS3Event } from './s3event';

function isS3Event(event: any): event is S3Event {
	return Boolean(event?.Records != null);
}

/**
 * Process either an S3 PutObject event, or a Mailgun Webook
 *
 * @param event S3Event or Mailgun Webhook
 */
export async function handler(event: S3Event | APIGatewayEvent) {
	if (isS3Event(event)) {
		return handleS3Event(event);
	}
	return handleMailgunEvent(event);
}
