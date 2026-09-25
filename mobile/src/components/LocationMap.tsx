import { createElement, useMemo, useCallback, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  /** Optional label (title) shown on hover/selection. */
  label?: string;
}

interface Props {
  pins: MapPin[];
  /** Center of the map: [lat, lng]. */
  center: [number, number];
  /** Whether tapping the map drops a pin (seller mode) vs. read-only browse. */
  interactive?: boolean;
  /** Called with [lat, lng] when the user drops a pin (interactive mode). */
  onPinDropped?: (lat: number, lng: number) => void;
  /** Selected pin id (browse mode) to highlight. */
  selectedId?: string;
  /** Called when a pin is tapped in browse mode. */
  onPinSelected?: (id: string) => void;
  height?: number;
}

/**
 * A web/native-compatible interactive OpenStreetMap. Uses Leaflet from the
 * OpenStreetMap tile layer inside an HTML document:
 *   - web    → iframe (react-native-webview has no web build)
 *   - native → WebView
 * Tapping in interactive mode drops a single draggable marker; in browse mode
 * every pin is rendered and tapping a pin reports its id back.
 */
export default function LocationMap({
  pins,
  center,
  interactive = false,
  onPinDropped,
  selectedId,
  onPinSelected,
  height = 240,
}: Props) {
  const [clat, clng] = center;

  const html = useMemo(() => {
    const pinsJson = JSON.stringify(pins);
    const interactiveJson = JSON.stringify(interactive);
    const selectedJson = JSON.stringify(selectedId ?? null);
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;}</style>
</head>
<body>
<div id="map"></div>
<script>
var pins = ${pinsJson};
var interactive = ${interactiveJson};
var selectedId = ${selectedJson};
var map = L.map('map', { center: [${clat}, ${clng}], zoom: 12, scrollWheelZoom: true });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap',
  maxZoom: 19
}).addTo(map);

var markers = {};
pins.forEach(function (p) {
  var m = L.marker([p.lat, p.lng]).addTo(map);
  if (p.label) m.bindTooltip(p.label);
  markers[p.id] = m;
  if (p.id === selectedId) m.openPopup();
  m.on('click', function () {
    window.__notify('select', p.id);
  });
});

var dropMarker = null;
if (interactive) {
  map.on('click', function (e) {
    var ll = e.latlng;
    if (dropMarker) { dropMarker.setLatLng(ll); }
    else { dropMarker = L.marker(ll, { draggable: true }).addTo(map); }
    dropMarker.on('dragend', function () {
      var p = dropMarker.getLatLng();
      window.__notify('drop', p.lat, p.lng);
    });
    window.__notify('drop', ll.lat, ll.lng);
  });
}

function send(msg) {
  var str = JSON.stringify(msg);
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(str);
  } else {
    window.parent.postMessage(str, '*');
  }
}
window.__notify = function (type, a, b) {
  send({ type: type, id: typeof a === 'string' ? a : null, lat: typeof a === 'number' ? a : null, lng: typeof b === 'number' ? b : null });
};
</script>
</body>
</html>`;
  }, [pins, clat, clng, interactive, selectedId]);

  const handleMessage = useCallback(
    (raw: string) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'drop' && typeof msg.lat === 'number' && typeof msg.lng === 'number') {
          onPinDropped?.(msg.lat, msg.lng);
        } else if (msg.type === 'select' && typeof msg.id === 'string') {
          onPinSelected?.(msg.id);
        }
      } catch {
        /* ignore non-JSON messages */
      }
    },
    [onPinDropped, onPinSelected],
  );

  // On web, the iframe posts messages to window.parent via postMessage, so we
  // bridge them here with a window 'message' listener (WebView.onMessage only
  // exists on native).
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (ev: MessageEvent) => {
      if (typeof ev.data === 'string') handleMessage(ev.data);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [handleMessage]);

  if (Platform.OS === 'web') {
    // react-native-webview has no web build → render an equivalent iframe.
    return createElement('iframe', {
      srcDoc: html,
      style: { border: 0, width: '100%', height },
    });
  }

  return (
    <View style={{ width: '100%', height, borderRadius: 12, overflow: 'hidden' }}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        onMessage={(e) => handleMessage(e.nativeEvent.data)}
        scrollEnabled={false}
        originWhitelist={['*']}
      />
    </View>
  );
}
