import { SignatureErrorDetails, SignatureErrorProps } from "./types"

export class SignatureError extends Error {
	detail: SignatureErrorDetails | undefined = undefined

	constructor({message, detail}: SignatureErrorProps, ...params: any[]) {
		// Pass remaining arguments (including vendor specific ones) to parent constructor
		super(...params)

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
		Error.captureStackTrace(this, SignatureError)
		}

		this.name = 'SignatureError'
		// Custom debugging information
		this.message = message
		this.detail = detail
	}
}