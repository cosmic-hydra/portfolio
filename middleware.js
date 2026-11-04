// Vercel Routing Middleware: blocks visitors at Kristal Campus, Sompura
// (Sarjapura Road, Bengaluru 562125). Runs on Vercel before the cache, on every
// page request. A visitor gets a 403 if either rule matches:
//
//   1. their IP is in BLOCKED_IP_RANGES
//   2. Vercel's IP geolocation places them within RADIUS_METERS of the campus
//
// Nothing else is blocked: not VPN users in general, not the rest of 562125.
// A visitor on a VPN shows the VPN server's IP and location, so they can't be
// placed at the campus.

import { BlockList, isIP } from "node:net";

// ---- Settings -------------------------------------------------------------

// Exact IPs or CIDR ranges (IPv4 or IPv6), e.g. "203.0.113.7" or "203.0.113.0/24".
// The precise rule: add the campus network's public IP address(es) here.
const BLOCKED_IP_RANGES = [];

// Centre of Kristal Campus 10 as mapped in OpenStreetMap (way 334126262).
const CAMPUS = { latitude: 12.8661592, longitude: 77.7647011 };
const RADIUS_METERS = 200;

// ---------------------------------------------------------------------------

export const config = {
  // node:net needs the Node.js runtime; Vercel otherwise falls back to "edge".
  runtime: "nodejs",
  // Pages only: skip built assets, images and the favicon.
  matcher: ["/((?!assets/|media/|favicon\\.svg).*)"],
};

function ipType(ip) {
  const version = isIP(ip);
  return version === 4 ? "ipv4" : version === 6 ? "ipv6" : null;
}

function buildBlockList(entries) {
  const list = new BlockList();
  for (const raw of entries) {
    const entry = String(raw).trim();
    const [address, prefix] = entry.split("/");
    const type = ipType(address);
    try {
      if (!type) throw new Error("not an IP address");
      if (prefix === undefined) list.addAddress(address, type);
      else list.addSubnet(address, Number(prefix), type);
    } catch (error) {
      // A typo in the settings must not take the whole site down.
      console.warn(`[access-control] ignoring invalid IP range "${entry}": ${error.message}`);
    }
  }
  return list;
}

const blockedIps = buildBlockList(BLOCKED_IP_RANGES);

// On Vercel these headers are set by Vercel's edge and overwrite anything the
// client sends, so they can't be spoofed.
function clientIp(request) {
  const raw =
    request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0];
  const ip = raw?.trim().replace(/^::ffff:(?=\d+\.\d+\.\d+\.\d+$)/i, "");
  return ip && ipType(ip) ? ip : null;
}

// Great-circle distance in metres (haversine).
function distanceMeters(a, b) {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
}

function visitorLocation(request) {
  const latitude = Number.parseFloat(request.headers.get("x-vercel-ip-latitude") ?? "");
  const longitude = Number.parseFloat(request.headers.get("x-vercel-ip-longitude") ?? "");
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

function blockReason(request) {
  const ip = clientIp(request);
  if (ip && blockedIps.check(ip, ipType(ip))) return "ip-range";

  const location = visitorLocation(request);
  if (location && distanceMeters(location, CAMPUS) <= RADIUS_METERS) return "near-campus";

  return null;
}

const BLOCKED_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Access denied</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; box-sizing: border-box; font: 16px/1.5 system-ui, sans-serif; }
  main { max-width: 28rem; text-align: center; }
  h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
  p { margin: 0; opacity: .75; }
</style>
</head>
<body>
<main>
  <h1>Access denied</h1>
  <p>This site isn't available from your network.</p>
</main>
</body>
</html>`;

export default function middleware(request) {
  const reason = blockReason(request);
  if (!reason) {
    // Same as next() from @vercel/functions: continue to the site.
    return new Response(null, { headers: { "x-middleware-next": "1" } });
  }

  console.info(`[access-control] blocked ${clientIp(request) ?? "unknown IP"} (${reason})`);
  return new Response(BLOCKED_PAGE, {
    status: 403,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}
