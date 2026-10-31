import type { ToolDefinition } from '../../core/types';
import { executeQrCodeTool } from './engine';
import { QrCodeToolUI } from './ui';

export type QrPayloadType = 'text' | 'wifi' | 'otp_auth' | 'vcard';

export interface QrCodeToolInput {
  payloadType: QrPayloadType;
  content: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  foregroundHex?: string;
  backgroundHex?: string;
  sizePx?: number;
  margin?: number;
}

export interface QrCodeToolOutput {
  isValid: boolean;
  error?: string;
  svgMarkup: string;
  payloadString: string;
  matrixSize: number;
}

export const qrCodeTool: ToolDefinition<QrCodeToolInput, QrCodeToolOutput> = {
  metadata: {
    id: 'qr-code-tool',
    name: 'Private QR Code Generator',
    category: 'visual',
    description: 'Generate high-resolution QR codes for Wi-Fi networks, 2FA auth seeds, and contact cards with zero cloud tracking.',
    keywords: ['qr', 'qrcode', 'wifi', 'totp', '2fa', 'vcard', 'generator', 'security'],
    version: '1.0.0',
    icon: 'QrCode',
    persistableInUrl: false, // Wi-Fi passwords and 2FA seeds should NEVER persist in URL hash!
  },
  examples: [
    {
      title: 'Home Wi-Fi Network',
      description: 'Instant connection QR code for guests',
      input: {
        payloadType: 'wifi',
        content: 'WIFI:S:Guest_Network;T:WPA;P:SuperSecretPass123;;',
        errorCorrectionLevel: 'M',
        foregroundHex: '#0F172A',
        backgroundHex: '#FFFFFF',
      },
    },
    {
      title: 'Simple Web Link',
      description: 'Deep link to website or portfolio',
      input: {
        payloadType: 'text',
        content: 'https://github.com/anubhav0712/tools',
        errorCorrectionLevel: 'M',
        foregroundHex: '#4F46E5',
        backgroundHex: '#FFFFFF',
      },
    },
  ],
  execute: executeQrCodeTool,
  Component: QrCodeToolUI,
};
