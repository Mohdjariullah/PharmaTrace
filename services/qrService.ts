import QRCode from 'qrcode';
import { QrCodePayload } from '@/types';

export function generateQrPayload(txSignature: string, batchId: string, medicineName: string, ownerAddress: string): string {
  const payload: QrCodePayload = {
    txSignature,
    batchId,
    medicineName,
    ownerAddress,
    timestamp: new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

export async function generateQrDataURL(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 400,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export function parseQrPayload(data: string): QrCodePayload | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed && 
        typeof parsed.txSignature === 'string' && 
        typeof parsed.batchId === 'string' && 
        typeof parsed.medicineName === 'string' &&
        typeof parsed.ownerAddress === 'string' &&
        typeof parsed.timestamp === 'string') {
      return parsed as QrCodePayload;
    }
    return null;
  } catch (error) {
    console.error('Error parsing QR payload:', error);
    return null;
  }
}

export function isBatchExpired(expDate: string): boolean {
  const today = new Date();
  const expiryDate = new Date(expDate);
  return today > expiryDate;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}