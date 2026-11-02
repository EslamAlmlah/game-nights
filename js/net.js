// The link between the two devices.
// Both devices join a private channel (named from the couple code) on several free public
// MQTT relays at once and send every message through all of them. Any relay both devices
// can reach is enough, which keeps it working when one service is blocked in a country.
// No WebRTC, no accounts. Ab Ahmad's device runs the live game while both are connected.

const RELAYS = [
  { name: "EMQX", url: "wss://broker.emqx.io:8084/mqtt" },
  { name: "HiveMQ", url: "wss://broker.hivemq.com:8884/mqtt" },
  { name: "Mosquitto", url: "wss://test.mosquitto.org:8081/mqtt" },
  { name: "EMQX 443", url: "wss://broker.emqx.io:443/mqtt" }
];

/* ---------- Minimal MQTT 3.1.1 client over WebSocket (QoS 0 only) ---------- */
const enc = new TextEncoder(), dec = new TextDecoder();
const mqStr = s => { const b = enc.encode(s); return [b.length >> 8, b.length & 255, ...b]; };
const mqLen = n => { const out = []; do { let d = n % 128; n = Math.floor(n / 128); if (n) d |= 128; out.push(d); } while (n); return out; };
const mqPacket = (type, body) => { const b = body instanceof Uint8Array ? body : Uint8Array.from(body); const h = [type, ...mqLen(b.length)]; const p = new Uint8Array(h.length + b.length); p.set(h); p.set(b, h.length); return p; };

class Relay {
  constructor(def, topic, onMsg, onState) {
    Object.assign(this, { def, topic, onMsg, onState, ready: false, buf: new Uint8Array(0), closed: false });
    this.connect();
  }
  connect() {
    if (this.closed) return;
    let ws;
    try { ws = new WebSocket(this.def.url, "mqtt"); } catch (e) { return this.later(); }
    ws.binaryType = "arraybuffer";
    this.ws = ws;
    const cid = ("gn" + uid()).slice(0, 23);
    ws.onopen = () => ws.send(mqPacket(0x10, [...mqStr("MQTT"), 4, 0x02, 0, 30, ...mqStr(cid)]));
    ws.onmessage = e => this.feed(new Uint8Array(e.data));
    ws.onclose = ws.onerror = () => { if (this.ws !== ws) return; this.ws = null; this.setReady(false); clearInterval(this.ping); this.later(); };
    this.ping = setInterval(() => { if (ws.readyState === 1) ws.send(Uint8Array.from([0xc0, 0])); }, 20000);
  }
  later() { if (!this.closed) { clearTimeout(this.retry); this.retry = setTimeout(() => this.connect(), 4000 + Math.random() * 4000); } }
  setReady(v) { if (this.ready !== v) { this.ready = v; this.onState(); } }
  feed(chunk) {
    const b = new Uint8Array(this.buf.length + chunk.length); b.set(this.buf); b.set(chunk, this.buf.length);
    let i = 0;
    while (i + 2 <= b.length) {
      let len = 0, mul = 1, j = i + 1, d;
      do { if (j >= b.length) { this.buf = b.slice(i); return; } d = b[j++]; len += (d & 127) * mul; mul *= 128; } while (d & 128);
      if (j + len > b.length) break;
      this.packet(b[i], b.subarray(j, j + len));
      i = j + len;
    }
    this.buf = b.slice(i);
  }
  packet(h, body) {
    const type = h >> 4;
    if (type === 2) { // CONNACK
      if (body[1] !== 0) return this.ws && this.ws.close();
      this.ws.send(mqPacket(0x82, [0, 1, ...mqStr(this.topic), 0]));
    } else if (type === 9) this.setReady(true); // SUBACK
    else if (type === 3) { // PUBLISH
      const tl = (body[0] << 8) | body[1];
      let p = 2 + tl; if ((h >> 1) & 3) p += 2;
      try { this.onMsg(JSON.parse(dec.decode(body.subarray(p)))); } catch (e) {}
    }
  }
  publish(text) {
    if (!this.ready || !this.ws || this.ws.readyState !== 1) return;
    const payload = enc.encode(text);
    const body = new Uint8Array([...mqStr(this.topic), ...payload]);
    this.ws.send(mqPacket(0x30, body));
  }
  close() { this.closed = true; clearTimeout(this.retry); clearInterval(this.ping); try { this.ws && this.ws.close(); } catch (e) {} this.ws = null; }
}

const codeTopic = code => {
  let h1 = 0x811c9dc5, h2 = 0x12345678;
  for (const c of String(code).trim().toLowerCase()) { const k = c.codePointAt(0); h1 = Math.imul(h1 ^ k, 16777619) >>> 0; h2 = Math.imul(h2 + k, 2654435761) >>> 0; }
  return "gamenight-mrb-za3tr/" + h1.toString(36) + h2.toString(36);
};

const Net = {
  status: "offline", open: false, isHost: false, relays: [], seen: new Set(), seenQ: [],
  myId: null, partnerId: null, lastSeen: 0, timer: null,
  local: new URLSearchParams(location.search).has("local"),

  setStatus(s) { if (this.status !== s) { this.status = s; UI.renderStatus(); } },
  liveRelays() { return this.relays.filter(r => r.ready).map(r => r.def.name); },

  start() {
    if (!App.code || !App.me) return;
    this.stop();
    this.myId = uid();
    this.isHost = false;
    const onEnv = env => this.receive(env);
    if (this.local) {
      // Two tabs in one browser, for testing.
      const bc = new BroadcastChannel("gn-" + codeTopic(App.code));
      this.relays = [{ def: { name: "local" }, ready: true, publish: t => bc.postMessage(t), close: () => bc.close() }];
      bc.onmessage = e => { try { onEnv(JSON.parse(e.data)); } catch (x) {} };
      setTimeout(() => this.post({ sys: "hi" }), 50);
    } else {
      const testRelay = new URLSearchParams(location.search).get("relay");
      const defs = testRelay ? [{ name: "test", url: testRelay }] : RELAYS;
      this.relays = defs.map(d => new Relay(d, codeTopic(App.code), onEnv, () => this.relayChanged()));
    }
    this.setStatus(this.local ? "waiting" : "connecting");
    clearInterval(this.timer);
    this.timer = setInterval(() => this.heartbeat(), 5000);
  },

  stop() {
    clearInterval(this.timer);
    this.relays.forEach(r => r.close());
    this.relays = []; this.open = false; this.partnerId = null; App.partner = null;
  },

  wake() {
    if (!this.relays.length) return this.start();
    this.relays.forEach(r => { if (r.ws === null && !r.closed && r.connect) r.connect(); });
    this.post({ sys: "hi" });
  },

  relayChanged() {
    const up = this.liveRelays().length;
    if (!this.open) this.setStatus(up ? "waiting" : "connecting");
    if (up) this.post({ sys: "hi" });
    UI.renderStatus();
  },

  heartbeat() {
    this.post({ sys: "ping" });
    if (this.open && Date.now() - this.lastSeen > 25000) this.lost();
    if (!this.open && !this.liveRelays().length && this.status !== "connecting") this.setStatus("connecting");
  },

  post(m) {
    const env = { id: uid(), from: this.myId, who: App.me, m };
    this.remember(env.id);
    const text = JSON.stringify(env);
    this.relays.forEach(r => r.publish(text));
  },

  remember(id) {
    this.seen.add(id); this.seenQ.push(id);
    if (this.seenQ.length > 500) this.seen.delete(this.seenQ.shift());
  },

  receive(env) {
    if (!env || !env.id || env.from === this.myId || this.seen.has(env.id)) return;
    this.remember(env.id);
    this.lastSeen = Date.now();
    if (!this.open || env.from !== this.partnerId) {
      // New partner, or the partner reloaded the page.
      this.open = true; this.partnerId = env.from; App.partner = env.who;
      this.isHost = App.me === "mrb" || env.who === App.me;
      this.setStatus("connected");
      this.post({ sys: "hi" });
      this.hello();
    }
    if (env.m && env.m.t) onMessage(env.m);
  },

  lost() {
    this.open = false; this.partnerId = null; App.partner = null; this.isHost = false;
    this.setStatus(this.liveRelays().length ? "waiting" : "connecting");
  },

  send(m) { if (this.open) this.post(m); },

  hello() {
    this.send({ t: "hello", who: App.me, now: Date.now(), store: App.store, live: this.isHost ? App.live : undefined });
  }
};

/* ---------- Connection check (More tab) ---------- */
function checkRelay(def, ms = 8000) {
  return new Promise(res => {
    const t0 = Date.now();
    let ws, done = false;
    const end = ok => { if (done) return; done = true; try { ws.close(); } catch (e) {} res({ name: def.name, ok, ms: Date.now() - t0 }); };
    try { ws = new WebSocket(def.url, "mqtt"); } catch (e) { return end(false); }
    ws.binaryType = "arraybuffer";
    ws.onopen = () => ws.send(mqPacket(0x10, [...mqStr("MQTT"), 4, 0x02, 0, 30, ...mqStr(("gnchk" + uid()).slice(0, 23))]));
    ws.onmessage = e => { const b = new Uint8Array(e.data); end(b[0] >> 4 === 2 && b[3] === 0); };
    ws.onerror = ws.onclose = () => end(false);
    setTimeout(() => end(false), ms);
  });
}
