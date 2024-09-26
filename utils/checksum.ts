import crypto from 'crypto';

export function getChecksum(requestData: any, apiEndPoint: string, saltKey: string, saltIndex: string) {
  const base64Body = Buffer.from(JSON.stringify(requestData)).toString('base64');
  const checksum = `${crypto.createHash('sha256').update(base64Body + apiEndPoint + saltKey).digest('hex')}###${saltIndex}`;
  return { base64Body, checksum };
}