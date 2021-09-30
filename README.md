# X-Node-Signature
Payload signature validation and generation for node.js

[![npm package](https://nodei.co/npm/x-node-signature.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/x-node-signature/)

## Super simple to use

X-Node-Signature is designed to be very simple to use.

### To generate a signature:

```ts
import Signature from 'X-Node-Signature'

const secret = "8e1138dbb41c5726420bd0c909ecb9a70ea01eff"
const payload = {hello: "world"}

const generatedSignature = Signature.generateHeader(payload, secret)
```


### To validate a signature

```ts
import Signature from 'X-Node-Signature'

const secret = "8e1138dbb41c5726420bd0c909ecb9a70ea01eff"
const signature = "t=1632994609,v1=51835061c251fe1d328ac0fffccebe05e38e198d82ee3c3fdd66973cb9160845"
const payload = '{\n  "hello": "world"\n}'

try {
	const isValid = Signature.verifyHeader(payload, signature, secret)
	// Signature is valid
} catch(e) {
	// Signature is invalid
}
```
