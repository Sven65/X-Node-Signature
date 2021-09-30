declare module 'scmp' {
	/**
	 * Does a constant-time Buffer comparison by not short-circuiting
	 * on first sign of non-equivalency.
	 *
	 * @param {Buffer} a The first Buffer to be compared against the second
	 * @param {Buffer} b The second Buffer to be compared against the first
	 * @return {Boolean}
	 */
	function scmp (a: Buffer, b: Buffer): boolean

	export = scmp
}
