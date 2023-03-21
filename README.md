# dmarc-lambda-reporter
Parses DMARC Email Reports received from Amazon SES and stores them into AWS Timestream for analysis.

## Installation
This function can process an S3Event from an SES store, or a Mailgun webhook. In both cases, it will
store the results of the DMARC attachments it parses into TimeStream.

In all cases, you must set up the permissions and events to a lambda function `dmarc-reporter` to
use `npm run deploy`

## Environment Variables

**TIMESTREAM_DATABASE** The `DatabaseName` to store the DMARC logs to (default is `DMARC`)
**TIMESTREAM_TABLE** The `TableName` to store the DMARC logs to (default is `reports`)
**S3_BUCKET** If set, this bucket will be used to store the raw DMARC attachments that come in via a
Mailgun Webhook
