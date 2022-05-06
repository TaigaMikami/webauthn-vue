import { AttestationFormat } from "../helpers/decodeAttestationObject";
import convertCertBufferToPEM from "../helpers/convertCertBufferToPEM";

type RootCertIdentifier = AttestationFormat | 'mds';

class SettingsService {
  // Certificates are stored as PEM-formatted strings
  private pemCertificates: Map<RootCertIdentifier, string[]>;

  constructor() {
    this.pemCertificates = new Map();
  }

  /**
   * Set potential root certificates for attestation formats that use them. Root certs will be tried
   * one-by-one when validating a certificate path.
   *
   * Certificates can be specified as a raw `Buffer`, or as a PEM-formatted string. If a
   * `Buffer` is passed in it will be converted to PEM format.
   */
  setRootCertificates(opts: {
    identifier: RootCertIdentifier;
    certificates: (Buffer | string)[];
  }): void {
    const { identifier, certificates } = opts;

    const newCertificates: string[] = [];
    for (const cert of certificates) {
      if (cert instanceof Buffer) {
        newCertificates.push(convertCertBufferToPEM(cert));
      } else {
        newCertificates.push(cert);
      }
    }

    this.pemCertificates.set(identifier, newCertificates);
  }

  /**
   * Get any registered root certificates for the specified attestation format
   */
  getRootCertificates(opts: { identifier: RootCertIdentifier }): string[] {
    const { identifier } = opts;
    return this.pemCertificates.get(identifier) ?? [];
  }
}

const settingsService = new SettingsService();

export default settingsService;
