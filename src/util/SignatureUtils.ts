import * as ethUtil from 'ethereumjs-util';

import { ECSig } from 'set-protocol-utils';

/*
 * Ver batim copied, with slight modifications, from the wonderful dharma and 0x.js project codebase:
 * https://github.com/0xProject/0x.js
 */

export class SignatureUtils {
  /**
   * Given a data payload, signature, and a signer's address, returns true
   * if the given signature is valid.
   *
   * @param data                     Data payload
   * @param signature                Signature
   * @param signerAddress            The Signer's address
   * @return Whether or not the signature is valid.
   */
  public static isValidSignature(
    data: string,
    signature: ECSig,
    signerAddress: string,
  ): boolean {
    const messageHash = data;

    // In certain circumstances, the `eth_sign` API adds an Ethereum-specific prefix to
    // message payloads so we want to check both with and without the prefix to see if
    // it is a valid signature.
    // TODO: Review if there is a better way to validate signatures
    // without having to check two separate hashes
    const pfxMessageHash = SignatureUtils.addPersonalMessagePrefix(messageHash);

    const messageHashBuff = ethUtil.toBuffer(messageHash);
    const pfxMessageHashBuff = ethUtil.toBuffer(pfxMessageHash);

    try {
      const pubKey = ethUtil.ecrecover(
        messageHashBuff,
        Number(signature.v.toString()),
        ethUtil.toBuffer(signature.r),
        ethUtil.toBuffer(signature.s),
      );
      const pfxPubKey = ethUtil.ecrecover(
        pfxMessageHashBuff,
        Number(signature.v.toString()),
        ethUtil.toBuffer(signature.r),
        ethUtil.toBuffer(signature.s),
      );
      const retrievedAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(pubKey));
      const pfxRetrievedAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(pfxPubKey));
      return (retrievedAddress.toLowerCase() === signerAddress.toLowerCase() ||
        pfxRetrievedAddress.toLowerCase() === signerAddress.toLowerCase());
    } catch (err) {
      return false;
    }
  }

  /**
   * Applies an Ethereum-specific prefix to the message payload we intend on signing,
   * as per the `eth_sign` specification in the JSON-RPC wiki:
   *
   * https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
   *
   * This must *sometimes* be manually done by our libraries because certain signing
   * clients (e.g. Metamask) do not adhere to the `eth_sign` specification described
   * above.
   *
   * @param messageHashHex The raw hex message payload
   * @return Message hashed as per how certain clients (i.e. Metamask)
   *  expect to ingest messages in `eth_sign`
   */
  public static addPersonalMessagePrefix(messageHashHex: string): string {
      const messageHashBuffer = ethUtil.toBuffer(messageHashHex);
      const prefixedMessageHashBuffer = ethUtil.hashPersonalMessage(messageHashBuffer);

      return ethUtil.bufferToHex(prefixedMessageHashBuffer);
  }

  public static parseSignatureHexAsVRS(signatureHex: string): ECSig {
      const signatureBuffer = ethUtil.toBuffer(signatureHex);
      let v = signatureBuffer[0];
      if (v < 27) {
          v += 27;
      }
      const r = signatureBuffer.slice(1, 33);
      const s = signatureBuffer.slice(33, 65);
      const ECSig: ECSig = {
          v,
          r: ethUtil.bufferToHex(r),
          s: ethUtil.bufferToHex(s),
      };
      return ECSig;
  }

  public static parseSignatureHexAsRSV(signatureHex: string): ECSig {
      const { v, r, s } = ethUtil.fromRpcSig(signatureHex);
      const ECSig: ECSig = {
          v,
          r: ethUtil.bufferToHex(r),
          s: ethUtil.bufferToHex(s),
      };
      return ECSig;
  }

  public static convertToHexRSV(signature: ECSig): string {
      const { r, s, v } = signature;
      return ['0x', r, s, v.toString(16)].join('');
  }

  public static convertToHexVRS(signature: ECSig): string {
      const { v, r, s } = signature;
      return ['0x', v.toString(16), r, s].join('');
  }
}
