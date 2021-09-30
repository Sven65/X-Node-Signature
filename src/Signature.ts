import crypto from 'crypto'
import { SignatureError } from './SignatureError'

import scmp from 'scmp'

type SignatureScheme = 'v1'

interface TestHeaderOptions {
	timestamp?: number
	scheme?: SignatureScheme
	signature?: string
	payload: string
	secret: string
}


const parseHeader = (header: string, scheme: string) => {
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

export const generatePayloadString = (payload: Record<string, any>): string => JSON.stringify(payload, null, 2).replace(/\r/gmi, '')


export class Signature {
	static EXPECTED_SCHEME: SignatureScheme = 'v1'

	private static _computeSignature(payload: string, secret: string): string {
		return crypto
			.createHmac('sha256', secret)
			.update(payload, 'utf8')
			.digest('hex')
	}

	static verifyHeader(payload: string | Buffer, header: string | Buffer, secret: string, tolerance=300): boolean  {
		payload = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload

		if (Array.isArray(header)) {
			throw new Error(
				'Unexpected: An array was passed as a header, which should not be possible for the signature header.',
			)
		}
		
		header = Buffer.isBuffer(header) ? header.toString('utf8') : header
		

		const details = parseHeader(header, this.EXPECTED_SCHEME)

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
	
		const expectedSignature = this._computeSignature(
			`${details.timestamp}.${payload}`,
			secret,
		)
		
	
		const signatureFound = !!details.signatures.filter(() =>
			scmp.bind(this, Buffer.from(expectedSignature)),
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

	static generateHeader(payload: any): string {
		return ""
	}

	static generateTestHeaderString(opts: TestHeaderOptions): string {
		opts.timestamp = Math.floor(opts.timestamp ?? Date.now() / 1000)
		opts.scheme = opts.scheme ?? this.EXPECTED_SCHEME
	
		opts.signature = opts.signature || this._computeSignature(
			opts.timestamp + '.' + opts.payload,
			opts.secret,
		)
	
		const generatedHeader = [
			't=' + opts.timestamp,
			opts.scheme + '=' + opts.signature,
		].join(',')
	
		return generatedHeader
	}
}
