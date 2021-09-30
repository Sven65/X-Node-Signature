import { generatePayloadString, Signature } from "../src/Signature"

const secret = "8e1138dbb41c5726420bd0c909ecb9a70ea01eff"
const payload = {hello: "world"}

describe('Header generation', () => {
	it('Should generate a valid header', () => {
		const payloadString = generatePayloadString(payload)

		const header = Signature.generateTestHeaderString({
			payload: payloadString,
			secret,
			timestamp: 1632994609,
		})

		expect(header).toBe("t=1632994609,v1=51835061c251fe1d328ac0fffccebe05e38e198d82ee3c3fdd66973cb9160845")
	})
})