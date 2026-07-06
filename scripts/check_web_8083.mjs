#!/usr/bin/env node
const port = Number(process.env.PORT || 8083);
const baseUrl = `http://localhost:${port}`;

async function fetchText(url) {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.text();
}

async function fetchOk(url) {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
}

const indexHtml = await fetchText(`${baseUrl}/?check=${Date.now()}`);
const bundlePath = indexHtml.match(/src="([^"]*\/_expo\/static\/js\/web\/[^"]+\.js)"/)?.[1];

if (!bundlePath) {
  throw new Error('Could not find Expo web bundle in index.html.');
}

const bundleUrl = new URL(bundlePath, baseUrl).toString();
const bundleText = await fetchText(bundleUrl);

const requiredMarkers = [
  'ui-icons/mood-sad-face-ui',
  'ui-icons/body-chest-ui',
  'ui-icons/record-mic-ui',
  'patterns/rora-thread-discovery-mascot-v1',
  'Rora is still learning your rhythm.',
];

const missingMarkers = requiredMarkers.filter((marker) => !bundleText.includes(marker));

if (missingMarkers.length > 0) {
  throw new Error(`8083 is not serving the latest expected bundle. Missing: ${missingMarkers.join(', ')}`);
}

const iconPath = bundleText.match(/\/assets\/assets\/figma\/today\/ui-icons\/mood-sad-face-ui\.[^"]+\.png/)?.[0];

if (!iconPath) {
  throw new Error('Could not find optimized mood icon asset in bundle.');
}

await fetchOk(new URL(iconPath, baseUrl).toString());

console.log(`OK: ${baseUrl} is serving the current Rora Mood web bundle.`);
console.log(`Bundle: ${bundlePath}`);
console.log(`Verified asset: ${iconPath}`);
