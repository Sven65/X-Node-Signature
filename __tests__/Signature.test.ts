import { Signature } from "../src/Signature"

const secret = "8e1138dbb41c5726420bd0c909ecb9a70ea01eff"
const payload = {hello: "world"}

describe('Signature', () => {
	describe('parseHeader()', () => {
		it('Should parse a valid header', () => {
			const header = "t=1632994609,v1=22a8bcdc6bf94abbe664910a4ee885f0a3f859a8c0d50f80e539618938960c08"

			const parsedData = Signature['parseHeader'](header, 'v1')

			expect(parsedData).not.toBe(null)

			const { timestamp, signatures } = parsedData!

			expect(timestamp).toBe(1632994609)
			expect(signatures).toContain('22a8bcdc6bf94abbe664910a4ee885f0a3f859a8c0d50f80e539618938960c08')
		})
	})

	describe('verifyHeader()', () => {
		describe('When the payload is a string', () => {
			describe('When the signature is valid', () => {
				it('Should return true', () => {
					const currentPayload = 'Secret Message'
					const header = "t=1632994609,v1=22a8bcdc6bf94abbe664910a4ee885f0a3f859a8c0d50f80e539618938960c08"
					const isValid = Signature.verifyHeader(currentPayload, header, secret, Number.MAX_SAFE_INTEGER)
			
					expect(isValid).toBe(true)
				})
			})

			describe('When the signature is invalid', () => {
				it('Should throw error', () => {
					const currentPayload = 'Secret Message'
					const header = "t=1632994609,v1=22a8bcdc6bf94abbe664910a4ee885f0a3f859a8c0d50f80e539618938960c09"

					expect(() => {
						Signature.verifyHeader(currentPayload, header, secret, Number.MAX_SAFE_INTEGER)
					}).toThrowError('No signatures found matching the expected signature for payload.')
				})
			})

			describe('When the signature timestamp is outside tolerance', () => {
				it('Should throw an error', () => {
					const currentPayload = 'Secret Message'
					const header = "t=1632994609,v1=22a8bcdc6bf94abbe664910a4ee885f0a3f859a8c0d50f80e539618938960c08"
					
					expect(() => {
						Signature.verifyHeader(currentPayload, header, secret)
					}).toThrowError('Timestamp outside the tolerance zone')
				})
			})
		})
	})

	describe('Header Generation', () => {
		describe('When the payload is an object', () => {
			it('Should generate a valid header', () => {
				const header = Signature.generateHeader(payload, secret, 1632994609)
		
				expect(header).toBe("t=1632994609,v1=51835061c251fe1d328ac0fffccebe05e38e198d82ee3c3fdd66973cb9160845")
			})
		})

		describe('When the payload is a string', () => {
			it('Should generate a valid header', () => {
				const header = Signature.generateHeader('Secret Message', secret, 1632994609)

				expect(header).toBe("t=1632994609,v1=22a8bcdc6bf94abbe664910a4ee885f0a3f859a8c0d50f80e539618938960c08")
			})
		})
	})
})