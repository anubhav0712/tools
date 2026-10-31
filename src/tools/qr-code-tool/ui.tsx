import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Link,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Lock,
  Contact,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeQrCodeTool } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { QrCodeToolInput, QrCodeToolOutput, QrPayloadType } from './definition';

export const QrCodeToolUI: React.FC<
  ToolComponentProps<QrCodeToolInput, QrCodeToolOutput>
> = ({ tool, initialInput }) => {
  const [payloadType, setPayloadType] = useState<QrPayloadType>(
    initialInput?.payloadType || 'wifi'
  );

  // Wi-Fi form state
  const [wifiSsid, setWifiSsid] = useState<string>('Guest_Network');
  const [wifiPassword, setWifiPassword] = useState<string>('SuperSecretPass123');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // Text/URL state
  const [rawText, setRawText] = useState<string>(
    'https://github.com/anubhav0712/tools'
  );

  // 2FA state
  const [totpIssuer, setTotpIssuer] = useState<string>('GitHub');
  const [totpAccount, setTotpAccount] = useState<string>('developer@corp.net');
  const [totpSecret, setTotpSecret] = useState<string>('HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ');

  // vCard state
  const [vcardName, setVcardName] = useState<string>('Alex Morgan');
  const [vcardPhone, setVcardPhone] = useState<string>('+1 555-0199');
  const [vcardEmail, setVcardEmail] = useState<string>('alex.morgan@company.io');

  // Styling
  const [foregroundHex, setForegroundHex] = useState<string>(
    initialInput?.foregroundHex || '#0F172A'
  );
  const [backgroundHex, setBackgroundHex] = useState<string>(
    initialInput?.backgroundHex || '#FFFFFF'
  );

  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number>(0);

  const getActivePayloadString = (): string => {
    if (payloadType === 'wifi') {
      return `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPassword};;`;
    }
    if (payloadType === 'otp_auth') {
      return `otpauth://totp/${encodeURIComponent(totpIssuer)}:${encodeURIComponent(totpAccount)}?secret=${totpSecret}&issuer=${encodeURIComponent(totpIssuer)}`;
    }
    if (payloadType === 'vcard') {
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
    }
    return rawText;
  };

  const [output, setOutput] = useState<QrCodeToolOutput>(() =>
    executeQrCodeTool({
      payloadType,
      content: getActivePayloadString(),
      foregroundHex,
      backgroundHex,
    })
  );

  useEffect(() => {
    const payload = getActivePayloadString();
    const start = performance.now();
    const res = executeQrCodeTool({
      payloadType,
      content: payload,
      foregroundHex,
      backgroundHex,
    });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [
    payloadType,
    wifiSsid,
    wifiPassword,
    wifiAuth,
    rawText,
    totpIssuer,
    totpAccount,
    totpSecret,
    vcardName,
    vcardPhone,
    vcardEmail,
    foregroundHex,
    backgroundHex,
  ]);

  const handleDownloadSvg = () => {
    if (!output.svgMarkup) return;
    const blob = new Blob([output.svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode_${payloadType}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!output.svgMarkup) return;
    const canvas = document.createElement('canvas');
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([output.svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `qrcode_${payloadType}.png`;
      a.click();
    };
    img.src = url;
  };

  const handleCopySvg = async () => {
    if (!output.svgMarkup) return;
    await navigator.clipboard.writeText(output.svgMarkup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell
      tool={tool}
      onReset={() => {
        setWifiSsid('');
        setWifiPassword('');
        setRawText('');
      }}
      executionTimeMs={execTime}
      inputData={{ payloadType }}
    >
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* Payload Type Selector Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200">
          <button
            type="button"
            onClick={() => setPayloadType('wifi')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              payloadType === 'wifi'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Wi-Fi Network</span>
          </button>

          <button
            type="button"
            onClick={() => setPayloadType('text')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              payloadType === 'text'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Link / Text</span>
          </button>

          <button
            type="button"
            onClick={() => setPayloadType('otp_auth')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              payloadType === 'otp_auth'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>2FA Auth Seed</span>
          </button>

          <button
            type="button"
            onClick={() => setPayloadType('vcard')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              payloadType === 'vcard'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Contact className="w-4 h-4" />
            <span>Contact vCard</span>
          </button>
        </div>

        {/* Workspace: Form on Left, QR Code on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Parameters */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
              <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Configure {payloadType === 'wifi' ? 'Wi-Fi Credentials' : payloadType === 'otp_auth' ? '2FA Seed' : payloadType === 'vcard' ? 'vCard Information' : 'Content'}
              </h3>

              {/* Wi-Fi Form */}
              {payloadType === 'wifi' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyHomeWifi"
                      className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Network password"
                      className="px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs font-medium text-slate-600">Security:</span>
                    {(['WPA', 'WEP', 'nopass'] as const).map((auth) => (
                      <button
                        key={auth}
                        type="button"
                        onClick={() => setWifiAuth(auth)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                          wifiAuth === auth
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {auth === 'nopass' ? 'Open' : auth}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Plain Text / URL Form */}
              {payloadType === 'text' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">URL or Plain Text</label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="https://example.com or any text..."
                    rows={4}
                    className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
                  />
                </div>
              )}

              {/* 2FA Form */}
              {payloadType === 'otp_auth' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Issuer (Service Name)</label>
                    <input
                      type="text"
                      value={totpIssuer}
                      onChange={(e) => setTotpIssuer(e.target.value)}
                      placeholder="e.g. GitHub, AWS, Google"
                      className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Account Username / Email</label>
                    <input
                      type="text"
                      value={totpAccount}
                      onChange={(e) => setTotpAccount(e.target.value)}
                      placeholder="user@example.com"
                      className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Secret Seed Key (Base32)</label>
                    <input
                      type="text"
                      value={totpSecret}
                      onChange={(e) => setTotpSecret(e.target.value)}
                      placeholder="JBSWY3DPEHPK3PXP"
                      className="px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* vCard Form */}
              {payloadType === 'vcard' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                    <input
                      type="text"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      placeholder="+1 555-0199"
                      className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="text"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      placeholder="alex.morgan@company.io"
                      className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Color Customization */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-700">QR Styling:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <span>Foreground:</span>
                  <input
                    type="color"
                    value={foregroundHex}
                    onChange={(e) => setForegroundHex(e.target.value)}
                    className="w-7 h-7 rounded-lg border border-slate-200 p-0.5 cursor-pointer"
                  />
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <span>Background:</span>
                  <input
                    type="color"
                    value={backgroundHex}
                    onChange={(e) => setBackgroundHex(e.target.value)}
                    className="w-7 h-7 rounded-lg border border-slate-200 p-0.5 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Hero QR Code Output */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-5 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Scannable QR Code
            </span>

            {/* QR SVG Render Container */}
            <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center max-w-[280px] w-full aspect-square">
              {output.isValid && output.svgMarkup ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: output.svgMarkup }}
                />
              ) : output.error ? (
                <span className="text-xs text-rose-600 font-medium px-4">{output.error}</span>
              ) : (
                <span className="text-xs text-slate-400">Enter details to generate QR code</span>
              )}
            </div>

            {/* Download Buttons */}
            <div className="flex items-center gap-2.5 w-full max-w-xs">
              <Button
                variant="primary"
                size="md"
                onClick={handleDownloadPng}
                disabled={!output.svgMarkup}
                className="flex-1 text-xs font-semibold gap-1.5 h-10 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleDownloadSvg}
                disabled={!output.svgMarkup}
                className="flex-1 text-xs font-semibold gap-1.5 h-10"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Vector SVG</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySvg}
              disabled={!output.svgMarkup}
              className="text-xs text-indigo-600 gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'SVG Markup Copied' : 'Copy SVG Markup'}</span>
            </Button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Wi-Fi passwords, personal phone numbers, and 2FA authentication seeds are encoded directly in your browser. No third-party QR tracking URLs or cloud servers are ever contacted.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
