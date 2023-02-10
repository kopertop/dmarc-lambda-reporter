import { promisify } from 'util';
import { lookup } from 'whois';

const whoisLookup = promisify(lookup);

export async function whois(ip: string) {
	const resp = await whoisLookup(ip);
	const output: any = {};
	if (resp) {
		for (const line of resp.split(/[\r\n]+/g)) {
			const trimmedLine = line.trim();
			// Ignore lines that start with a #
			if (trimmedLine.length > 0 && trimmedLine[0] !== '#') {
				const lineParts = trimmedLine.match(/^([a-z]+):[\s\t]* (.+)$/i);
				if (lineParts?.[1]) {
					if (!output[lineParts[1]]) {
						output[lineParts[1]] = [lineParts[2]];
					} else {
						output[lineParts[1]].push(lineParts[2]);
					}
				}
			}
		}
	}
	return output;
}
