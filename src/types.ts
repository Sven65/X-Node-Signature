export interface SignatureErrorDetails {
	header: string,
	payload: string
}

export interface SignatureErrorProps {
	message: string,
	detail: SignatureErrorDetails
}
