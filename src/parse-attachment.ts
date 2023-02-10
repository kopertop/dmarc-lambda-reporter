import {
	Readable,
	Writable,
} from 'stream';
import unzip from 'unzipper';
import { parseString } from 'xml2js';
import zlib from 'zlib';

const types = [
	'application/zip',
	'application/x-zip-compressed',
	'application/gzip',
	'application/x-gzip',
	'application/xml',
];

export async function parseAttachment(attach: Readable, contentType: string) {
	if (types.includes(contentType)) {
		return new Promise((accept) => {
			const xmlArray = [];
			const file = new Writable({
				write(chunk, encoding, callback) {
					xmlArray.push(chunk);
					callback();
				},
			});
			switch (contentType) {
				case types[0]:
				case types[1]:
					attach.pipe(unzip.Parse()).on('entry', (entry) => {
						entry.pipe(file);
					});
					break;
				case types[2]:
				case types[3]:
				case types[4]:
					console.log('Parse via zlib', contentType);
					attach.pipe(zlib.createUnzip()).pipe(file);
					break;
				default:
					console.log(`Unknow attachment content-type: ${contentType}`);
			}
			file.on('finish', () => {
				parseString(xmlArray.join(''), (error, xml) => {
					accept({
						org: xml.feedback.report_metadata.map((item) => item.org_name.join(' ')).join(' '),
						reports: xml.feedback.record,
						date: xml.feedback.report_metadata[0].date_range[0].end[0],
						policy: xml.feedback.policy_published[0],
					});
				});
			});
		});
	}
	console.log(`Unknow attachment content-type: ${contentType}`);
	return null;
}
