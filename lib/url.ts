import dns from "node:dns/promises";
import net from "node:net";

export function normalizeUrl(input: string) {
  const raw = input.trim();
  const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Only HTTP and HTTPS websites are supported.");
  if (!url.hostname.includes('.') && url.hostname !== 'localhost') throw new Error("That doesn't look like a website.");
  url.hash = '';
  return url;
}

function isPrivateIp(ip: string) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const value = ip.toLowerCase();
  return value === '::1' || value === '::' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe8') || value.startsWith('fe9') || value.startsWith('fea') || value.startsWith('feb');
}

export async function assertPublicUrl(url: URL) {
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host === 'metadata.google.internal') throw new Error('Private addresses are not allowed.');
  if (net.isIP(host) && isPrivateIp(host)) throw new Error('Private addresses are not allowed.');
  const records = await dns.lookup(host, { all: true });
  if (!records.length || records.some(({ address }) => isPrivateIp(address))) throw new Error('This address cannot be analyzed.');
}

