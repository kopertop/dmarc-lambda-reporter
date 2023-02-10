import { simpleParser } from 'mailparser';

export async function parseEmail(data: Buffer | string) {
	return simpleParser(data);
}
