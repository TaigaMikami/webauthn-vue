import { id_ce_keyDescription, KeyDescription } from "@peculiar/asn1-android";
import { AsnParser } from "@peculiar/asn1-schema";
import { Certificate } from "@peculiar/asn1-x509";
import convertCertBufferToPEM from "../../helpers/convertCertBufferToPEM";
import convertCOSEtoPKCS, { COSEALGHASH } from "../../helpers/convertCOSEtoPKCS";
import validateCertificatePath from "../../helpers/validateCertificatePath";
import verifySignature from "../../helpers/verifySignature";
import verifyAttestationWithMetadata from "../../metadata/verifyAttestationWithMetadata";
import MetadataService from "../../services/metadataService";
import { AttestationFormatVerifierOpts } from "../verifyRegistrationResponse";

/**
 * Verify an attestation response with fmt 'android-key'
 */
 export default async function verifyAttestationAndroidKey(
  options: AttestationFormatVerifierOpts,
): Promise<boolean> {
  const { authData, clientDataHash, attStmt, credentialPublicKey, aaguid, rootCertificates } =
    options;
  const { x5c, sig, alg } = attStmt;

  if (!x5c) {
    throw new Error('No attestation certificate provided in attestation statement (AndroidKey)');
  }

  if (!sig) {
    throw new Error('No attestation signature provided in attestation statement (AndroidKey)');
  }

  if (!alg) {
    throw new Error(`Attestation statement did not contain alg (AndroidKey)`);
  }

  // Check that credentialPublicKey matches the public key in the attestation certificate
  // Find the public cert in the certificate as PKCS
  const parsedCert = AsnParser.parse(x5c[0], Certificate);
  const parsedCertPubKey = Buffer.from(
    parsedCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
  );

  // Convert the credentialPublicKey to PKCS
  const credPubKeyPKCS = convertCOSEtoPKCS(credentialPublicKey);

  if (!credPubKeyPKCS.equals(parsedCertPubKey)) {
    throw new Error('Credential public key does not equal leaf cert public key (AndroidKey)');
  }

  // Find Android KeyStore Extension in certificate extensions
  const extKeyStore = parsedCert.tbsCertificate.extensions?.find(
    ext => ext.extnID === id_ce_keyDescription,
  );

  if (!extKeyStore) {
    throw new Error('Certificate did not contain extKeyStore (AndroidKey)');
  }

  const parsedExtKeyStore = AsnParser.parse(extKeyStore.extnValue, KeyDescription);

  // Verify extKeyStore values
  const { attestationChallenge, teeEnforced, softwareEnforced } = parsedExtKeyStore;

  if (!Buffer.from(attestationChallenge.buffer).equals(clientDataHash)) {
    throw new Error('Attestation challenge was not equal to client data hash (AndroidKey)');
  }

  // Ensure that the key is strictly bound to the caller app identifier (shouldn't contain the
  // [600] tag)
  if (teeEnforced.allApplications !== undefined) {
    throw new Error('teeEnforced contained "allApplications [600]" tag (AndroidKey)');
  }

  if (softwareEnforced.allApplications !== undefined) {
    throw new Error('teeEnforced contained "allApplications [600]" tag (AndroidKey)');
  }

  const statement = await MetadataService.getStatement(aaguid);
  if (statement) {
    try {
      await verifyAttestationWithMetadata(statement, credentialPublicKey, x5c);
    } catch (err) {
      throw new Error(`${(err as any).message} (AndroidKey)`);
    }
  } else {
    try {
      // Try validating the certificate path using the root certificates set via SettingsService
      await validateCertificatePath(x5c.map(convertCertBufferToPEM), rootCertificates);
    } catch (err) {
      throw new Error(`${(err as any).message} (AndroidKey)`);
    }
  }

  const signatureBase = Buffer.concat([authData, clientDataHash]);
  const leafCertPEM = convertCertBufferToPEM(x5c[0]);
  const hashAlg = COSEALGHASH[alg as number];

  return verifySignature(sig, signatureBase, leafCertPEM, hashAlg);
}
