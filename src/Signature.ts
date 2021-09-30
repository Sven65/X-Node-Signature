import crypto from 'crypto'
import { SignatureError } from './SignatureError'

import scmp from 'scmp'

type SignatureScheme = 'v1'

export const generatePayloadString = (payload: Record<string, any>): string => JSON.stringify(payload, null, 2).replace(/\r/gmi, '')

export class Signature {
	static EXPECTED_SCHEME: SignatureScheme = 'v1'

	private static parseHeader = (header: string, scheme: string) => {
		if (typeof header !== 'string') {
			return null
		}
	
		return header.split(',').reduce(
			(accum: {timestamp: number, signatures: string[]}, item) => {
				const kv = item.split('=')
	
				if (kv[0] === 't') {
					accum.timestamp = parseInt(kv[1], 10)
				}
	
				if (kv[0] === scheme) {
					accum.signatures.push(kv[1])
				}
	
				return accum
			},
			{
				timestamp: -1,
				signatures: [],
			},
		)
	}

	private static computeSignature(payload: string, secret: string): string {
		return crypto
			.createHmac('sha256', secret)
			.update(payload, 'utf8')
			.digest('hex')
	}

	/**
	 * Verifies that a header matches the payload
	 * @param payload The payload string to verify
	 * @param header The header to validate
	 * @param secret The secret the header should have been created with
	 * @param tolerance The timestamp tolerance
	 * @returns If the header is valid for the payload
	 */
	static verifyHeader(payload: string | Buffer, header: string | Buffer, secret: string, tolerance=300): boolean  {
		payload = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload

		if (Array.isArray(header)) {
			throw new Error('Unexpected: An array was passed as a header, which should not be possible for the signature header.')
		}
		
		header = Buffer.isBuffer(header) ? header.toString('utf8') : header
		

		const details = this.parseHeader(header, this.EXPECTED_SCHEME)

		if (!details || details.timestamp === -1) {
			throw new SignatureError({
				message: 'Unable to extract timestamp and signatures from header',
				detail: {
					header,
					payload,
				},
			})
		}
	
		if (!details.signatures.length) {
			throw new SignatureError({
				message: 'No signatures found with expected scheme',
				detail: {
					header,
					payload,
				},
			})
		}
	
		const expectedSignature = this.computeSignature(
			`${details.timestamp}.${payload}`,
			secret,
		)
		
	
		const signatureFound = !!details.signatures.filter((value) =>
			scmp(Buffer.from(value), Buffer.from(expectedSignature)),
		).length

	
		if (!signatureFound) {			
			throw new SignatureError({
				message: 'No signatures found matching the expected signature for payload.',
				detail: {
					header,
					payload,
				},
			})
		}
	
		const timestampAge = Math.floor(Date.now() / 1000) - details.timestamp
	
		if (tolerance > 0 && timestampAge > tolerance) {
			throw new SignatureError({
				message: 'Timestamp outside the tolerance zone',
				detail: {
					header,
					payload,
				},
			})
		}
	
		return true
	}

	/**
	 * Generates a signature for a payload
	 * @param payload The payload to generate a signature for
	 * @param secret The secret to generate the signature with
	 * @param timestamp Timestamp for when the signature is created
	 * @returns The generated signature
	 */
	static generateHeader(payload: string | Record<string, any>, secret: string, timestamp?: number): string {
		if (typeof payload === 'object') {
			payload = generatePayloadString(payload)
		}

		const signatureTimestamp = Math.floor(timestamp ?? Date.now() / 1000)
		const signature = this.computeSignature(`${signatureTimestamp}.${payload}`, secret)

		const generatedHeader = [
			`t=${signatureTimestamp}`,
			`${this.EXPECTED_SCHEME}=${signature}`
		].join(',')

		return generatedHeader
	}
}
