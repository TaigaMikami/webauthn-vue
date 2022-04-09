export default function utf8StringToBuffer(value: string): ArrayBuffer {
  return new TextEncoder().encode(value);
}
