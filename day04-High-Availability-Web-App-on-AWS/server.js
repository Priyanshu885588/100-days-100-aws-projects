const http = require("http");
const os = require("os");

const PORT = process.env.PORT || 3000;

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};

const formatBytes = (bytes) => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  return (bytes / 1024).toFixed(2) + " KB";
};

const getNetworkIp = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "0.0.0.0";
};

const getCpuUsage = () => {
  const cpus = os.cpus();
  const avg =
    cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length;
  return avg.toFixed(1);
};

const getServerInfo = () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPct = ((usedMem / totalMem) * 100).toFixed(1);

  return {
    // From env — you set these
    serverName: process.env.SERVER_NAME || "Server A",
    instanceId: process.env.INSTANCE_ID || "i-xxxxxxxxxxxxxxxxx",
    az: process.env.AZ || "us-east-1a",
    region: process.env.REGION || "us-east-1",
    environment: process.env.ENVIRONMENT || "production",
    serverColor: process.env.SERVER_COLOR || "cyan", // 'cyan' or 'purple'

    // Live from OS
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    nodeVersion: process.version,
    pid: process.pid,
    ppid: process.ppid,
    cpuCount: os.cpus().length,
    cpuModel: os.cpus()[0].model.trim(),
    cpuSpeed: os.cpus()[0].speed,
    cpuUsage: getCpuUsage(),
    loadAvg: os
      .loadavg()
      .map((l) => l.toFixed(2))
      .join(" · "),
    totalMem: formatBytes(totalMem),
    freeMem: formatBytes(freeMem),
    usedMem: formatBytes(usedMem),
    memPct,
    networkIp: getNetworkIp(),
    uptime: formatUptime(os.uptime()),
    procUptime: formatUptime(process.uptime()),
    timestamp: new Date().toISOString(),
    localTime: new Date().toLocaleTimeString("en-US", { hour12: false }),
  };
};

const html = (info) => {
  const isA = info.serverColor === "cyan";
  const accent = isA ? "#00d4ff" : "#a78bfa";
  const accentDim = isA ? "rgba(0,212,255,0.12)" : "rgba(167,139,250,0.12)";
  const accentBorder = isA ? "rgba(0,212,255,0.25)" : "rgba(167,139,250,0.25)";
  const glow = isA ? "rgba(0,212,255,0.15)" : "rgba(167,139,250,0.15)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="refresh" content="20">
<title>${info.serverName} // ${info.az}</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

:root {
  --bg:       #04060d;
  --panel:    #080c14;
  --border:   #0f1929;
  --border2:  #162035;
  --accent:   ${accent};
  --adim:     ${accentDim};
  --aborder:  ${accentBorder};
  --aglow:    ${glow};
  --green:    #10b981;
  --yellow:   #f59e0b;
  --red:      #ef4444;
  --text:     #cdd6f4;
  --muted:    #3d5068;
  --muted2:   #243447;
  --mono:     'JetBrains Mono', monospace;
  --display:  'Orbitron', sans-serif;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--mono);
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 100vh;
  position: relative;
}

/* ── Scanline overlay ── */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.07) 2px,
    rgba(0,0,0,0.07) 4px
  );
  pointer-events: none;
  z-index: 100;
}

/* ── Grid dots ── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}

/* ══════════════════════════════
   LEFT PANEL — Server Info
══════════════════════════════ */
.left {
  position: relative;
  z-index: 1;
  background: var(--panel);
  border-right: 1px solid var(--border2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Ambient glow top-left */
.left::before {
  content: '';
  position: absolute;
  top: -80px; left: -80px;
  width: 400px; height: 400px;
  background: radial-gradient(circle, var(--aglow) 0%, transparent 70%);
  pointer-events: none;
}

/* ── Left Header ── */
.left-header {
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--border2);
  flex-shrink: 0;
}

.server-eyebrow {
  font-size: 9px;
  letter-spacing: 0.3em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.server-eyebrow::before {
  content: '';
  display: inline-block;
  width: 18px; height: 1px;
  background: var(--muted);
}

.server-name {
  font-family: var(--display);
  font-size: 34px;
  font-weight: 900;
  color: var(--accent);
  letter-spacing: 0.05em;
  line-height: 1;
  text-shadow: 0 0 30px var(--aglow), 0 0 60px var(--aglow);
  margin-bottom: 10px;
}

.instance-id {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.08em;
}

.instance-id span {
  color: var(--accent);
  opacity: 0.7;
}

/* ── Status bar ── */
.status-bar {
  padding: 10px 28px;
  background: rgba(0,0,0,0.3);
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--muted);
}

.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
}

.dot.green { background: var(--green); box-shadow: 0 0 6px var(--green); animation: pulse 2s infinite; }
.dot.accent { background: var(--accent); box-shadow: 0 0 6px var(--accent); }
.dot.yellow { background: var(--yellow); }

@keyframes pulse {
  0%,100% { opacity:1; }
  50%      { opacity:0.3; }
}

/* ── Scrollable content ── */
.left-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  scrollbar-width: thin;
  scrollbar-color: var(--border2) transparent;
}

/* ── Section ── */
.section-head {
  font-size: 9px;
  letter-spacing: 0.25em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-head::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border2);
}

/* ── Stat rows ── */
.stat-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 10px;
  background: rgba(255,255,255,0.018);
  border-left: 2px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}

.stat-row:hover {
  background: rgba(255,255,255,0.035);
  border-left-color: var(--accent);
}

.stat-row:first-child { border-radius: 6px 6px 0 0; }
.stat-row:last-child  { border-radius: 0 0 6px 6px; }

.stat-k {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 7px;
}

.stat-k::before {
  content: '›';
  color: var(--muted2);
  font-size: 12px;
}

.stat-v {
  font-size: 11px;
  color: var(--text);
  font-weight: 500;
  text-align: right;
}

.stat-v.accent { color: var(--accent); }
.stat-v.green  { color: var(--green); }
.stat-v.yellow { color: var(--yellow); }

/* ── Bar ── */
.bar-wrap { margin-top: 4px; }

.bar-meta {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: var(--muted);
  margin-bottom: 5px;
}

.bar-track {
  height: 3px;
  background: var(--border2);
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #fff));
  box-shadow: 0 0 8px var(--accent);
}

/* ── Timestamp footer ── */
.left-footer {
  padding: 12px 28px;
  border-top: 1px solid var(--border);
  font-size: 9px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}

.refresh-countdown {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ══════════════════════════════
   RIGHT PANEL — Project Info
══════════════════════════════ */
.right {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}

/* Ambient glow bottom-right */
.right::after {
  content: '';
  position: absolute;
  bottom: -100px; right: -100px;
  width: 500px; height: 500px;
  background: radial-gradient(circle, var(--aglow) 0%, transparent 65%);
  pointer-events: none;
}

/* ── Right Header ── */
.right-header {
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--border2);
  flex-shrink: 0;
}

.day-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  letter-spacing: 0.25em;
  color: var(--accent);
  background: var(--adim);
  border: 1px solid var(--aborder);
  padding: 5px 12px;
  border-radius: 2px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.project-title {
  font-family: var(--display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.04em;
  line-height: 1.4;
  margin-bottom: 6px;
}

.project-subtitle {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.08em;
}

/* ── Right body ── */
.right-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--border2) transparent;
}

/* ── Concept cards ── */
.concept-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.concept-card {
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}

.concept-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), transparent);
  opacity: 0.5;
}

.concept-card:hover {
  border-color: var(--aborder);
}

.concept-icon {
  font-size: 18px;
  margin-bottom: 8px;
  display: block;
}

.concept-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
  letter-spacing: 0.05em;
}

.concept-desc {
  font-size: 9px;
  color: var(--muted);
  line-height: 1.6;
  letter-spacing: 0.03em;
}

/* ── Terminal block ── */
.terminal {
  background: rgba(0,0,0,0.5);
  border: 1px solid var(--border2);
  border-radius: 8px;
  overflow: hidden;
}

.terminal-bar {
  background: var(--border2);
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.t-dot { width: 8px; height: 8px; border-radius: 50%; }
.t-dot.r { background: #ff5f57; }
.t-dot.y { background: #febc2e; }
.t-dot.g { background: #28c840; }

.terminal-label {
  margin-left: 8px;
  font-size: 9px;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.terminal-body {
  padding: 14px 18px;
  font-size: 11px;
  line-height: 2;
}

.t-line { display: flex; gap: 10px; }
.t-prompt { color: var(--accent); opacity: 0.6; user-select: none; }
.t-cmd { color: var(--text); }
.t-out { color: var(--green); padding-left: 20px; }
.t-comment { color: var(--muted); font-size: 10px; padding-left: 20px; }

/* ── ALB flow diagram ── */
.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 18px 0;
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.flow-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  z-index: 1;
}

.flow-box {
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text);
  white-space: nowrap;
}

.flow-box.alb {
  border-color: var(--aborder);
  color: var(--accent);
  background: var(--adim);
}

.flow-box.active {
  border-color: rgba(16,185,129,0.4);
  color: var(--green);
  background: rgba(16,185,129,0.08);
}

.flow-label {
  font-size: 8px;
  color: var(--muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.flow-arrow {
  font-size: 14px;
  color: var(--muted2);
  flex-shrink: 0;
}

/* ── Stack tags ── */
.stack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stag {
  font-size: 10px;
  padding: 5px 12px;
  border-radius: 3px;
  border: 1px solid var(--border2);
  color: var(--muted);
  background: var(--panel);
  letter-spacing: 0.05em;
  transition: border-color 0.2s, color 0.2s;
}

.stag:hover {
  border-color: var(--aborder);
  color: var(--accent);
}

.stag.hi {
  border-color: var(--aborder);
  color: var(--accent);
  background: var(--adim);
}

/* ── Right footer ── */
.right-footer {
  padding: 12px 28px;
  border-top: 1px solid var(--border);
  font-size: 9px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}

/* ── Cursor blink ── */
.cursor {
  display: inline-block;
  width: 8px; height: 13px;
  background: var(--accent);
  animation: curblink 1s step-end infinite;
  vertical-align: middle;
  margin-left: 3px;
}

@keyframes curblink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0; }
}

@media (max-width: 900px) {
  body { grid-template-columns: 1fr; grid-template-rows: auto auto; overflow: auto; }
  html, body { height: auto; }
  .left, .right { overflow: visible; }
  .left-body, .right-body { overflow: visible; }
}
</style>
</head>
<body>

<!-- ════════════════════════════
     LEFT — Server Info
════════════════════════════ -->
<div class="left">
  <div class="left-header">
    <div class="server-eyebrow">active instance</div>
    <div class="server-name">${
      info.serverName
    }<span class="cursor"></span></div>
    <div class="instance-id"><span>//</span> ${info.instanceId}</div>
  </div>

  <div class="status-bar">
    <div class="status-item"><div class="dot green"></div> HEALTHY</div>
    <div class="status-item"><div class="dot accent"></div> ${info.az}</div>
    <div class="status-item"><div class="dot yellow"></div> ${info.region}</div>
    <div class="status-item"><div class="dot green"></div> PORT ${PORT}</div>
  </div>

  <div class="left-body">

    <!-- Identity -->
    <div>
      <div class="section-head">identity</div>
      <div class="stat-block">
        <div class="stat-row"><span class="stat-k">hostname</span><span class="stat-v accent">${
          info.hostname
        }</span></div>
        <div class="stat-row"><span class="stat-k">instance id</span><span class="stat-v accent">${
          info.instanceId
        }</span></div>
        <div class="stat-row"><span class="stat-k">region</span><span class="stat-v">${
          info.region
        }</span></div>
        <div class="stat-row"><span class="stat-k">az</span><span class="stat-v green">${
          info.az
        }</span></div>
        <div class="stat-row"><span class="stat-k">environment</span><span class="stat-v">${
          info.environment
        }</span></div>
        <div class="stat-row"><span class="stat-k">private ip</span><span class="stat-v">${
          info.networkIp
        }</span></div>
      </div>
    </div>

    <!-- CPU -->
    <div>
      <div class="section-head">processor</div>
      <div class="stat-block">
        <div class="stat-row"><span class="stat-k">model</span><span class="stat-v" style="font-size:9px;max-width:55%;text-align:right">${
          info.cpuModel
        }</span></div>
        <div class="stat-row"><span class="stat-k">cores</span><span class="stat-v">${
          info.cpuCount
        } vCPU</span></div>
        <div class="stat-row"><span class="stat-k">speed</span><span class="stat-v">${
          info.cpuSpeed
        } MHz</span></div>
        <div class="stat-row"><span class="stat-k">usage</span><span class="stat-v ${
          parseFloat(info.cpuUsage) > 80 ? "yellow" : "green"
        }">${info.cpuUsage}%</span></div>
        <div class="stat-row"><span class="stat-k">load avg</span><span class="stat-v">${
          info.loadAvg
        }</span></div>
        <div class="stat-row"><span class="stat-k">arch</span><span class="stat-v">${
          info.arch
        }</span></div>
      </div>
    </div>

    <!-- Memory -->
    <div>
      <div class="section-head">memory</div>
      <div class="stat-block">
        <div class="stat-row"><span class="stat-k">total</span><span class="stat-v">${
          info.totalMem
        }</span></div>
        <div class="stat-row"><span class="stat-k">used</span><span class="stat-v ${
          parseFloat(info.memPct) > 80 ? "yellow" : "accent"
        }">${info.usedMem}</span></div>
        <div class="stat-row"><span class="stat-k">free</span><span class="stat-v green">${
          info.freeMem
        }</span></div>
        <div class="stat-row"><span class="stat-k">utilisation</span><span class="stat-v">${
          info.memPct
        }%</span></div>
      </div>
      <div class="bar-wrap" style="margin-top:10px;">
        <div class="bar-meta"><span>memory pressure</span><span>${
          info.memPct
        }%</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${
          info.memPct
        }%"></div></div>
      </div>
    </div>

    <!-- Runtime -->
    <div>
      <div class="section-head">runtime</div>
      <div class="stat-block">
        <div class="stat-row"><span class="stat-k">node.js</span><span class="stat-v accent">${
          info.nodeVersion
        }</span></div>
        <div class="stat-row"><span class="stat-k">platform</span><span class="stat-v">${
          info.platform
        }</span></div>
        <div class="stat-row"><span class="stat-k">kernel</span><span class="stat-v" style="font-size:9px">${
          info.release
        }</span></div>
        <div class="stat-row"><span class="stat-k">pid</span><span class="stat-v">${
          info.pid
        }</span></div>
        <div class="stat-row"><span class="stat-k">ppid</span><span class="stat-v">${
          info.ppid
        }</span></div>
        <div class="stat-row"><span class="stat-k">process uptime</span><span class="stat-v green">${
          info.procUptime
        }</span></div>
        <div class="stat-row"><span class="stat-k">system uptime</span><span class="stat-v">${
          info.uptime
        }</span></div>
      </div>
    </div>

  </div>

  <div class="left-footer">
    <span>LAST UPDATED · ${info.timestamp}</span>
    <span class="refresh-countdown">⟳ AUTO-REFRESH · 20s</span>
  </div>
</div>


<!-- ════════════════════════════
     RIGHT — Project Info
════════════════════════════ -->
<div class="right">
  <div class="right-header">
    <div class="day-badge">▸ 100 Days of Cloud · Day 05</div>
    <div class="project-title">HIGH AVAILABILITY<br>WEB APP ON AWS</div>
    <div class="project-subtitle">ALB + 2× EC2 // MULTI-AZ // FAILOVER // STICKY SESSIONS</div>
  </div>

  <div class="right-body">

    <!-- Flow diagram -->
    <div>
      <div class="section-head">traffic flow</div>
      <div class="flow-diagram">
        <div class="flow-node">
          <div class="flow-box">🌐 INTERNET</div>
          <div class="flow-label">port 80</div>
        </div>
        <div class="flow-arrow">──▶</div>
        <div class="flow-node">
          <div class="flow-box alb">⚖ ALB</div>
          <div class="flow-label">round-robin</div>
        </div>
        <div class="flow-arrow">──▶</div>
        <div class="flow-node">
          <div class="flow-box active">● ${info.serverName}</div>
          <div class="flow-label">${info.az}</div>
        </div>
      </div>
    </div>

    <!-- Concepts -->
    <div>
      <div class="section-head">concepts in this demo</div>
      <div class="concept-grid">
        <div class="concept-card">
          <span class="concept-icon">⚖️</span>
          <div class="concept-name">Load Balancing</div>
          <div class="concept-desc">ALB distributes incoming HTTP traffic across both EC2 instances using round-robin.</div>
        </div>
        <div class="concept-card">
          <span class="concept-icon">🔁</span>
          <div class="concept-name">High Availability</div>
          <div class="concept-desc">Two instances across two AZs — if one AZ fails, traffic automatically routes to the other.</div>
        </div>
        <div class="concept-card">
          <span class="concept-icon">📌</span>
          <div class="concept-name">Sticky Sessions</div>
          <div class="concept-desc">ALB cookie pins a user to the same instance. Toggle it on the Target Group to see the difference.</div>
        </div>
        <div class="concept-card">
          <span class="concept-icon">❤️</span>
          <div class="concept-name">Health Checks</div>
          <div class="concept-desc">ALB polls GET / every 30s. Unhealthy targets are drained and removed automatically.</div>
        </div>
        <div class="concept-card">
          <span class="concept-icon">🛡️</span>
          <div class="concept-name">Security Groups</div>
          <div class="concept-desc">EC2 SG only allows traffic from the ALB SG — no direct internet access to instances.</div>
        </div>
        <div class="concept-card">
          <span class="concept-icon">📐</span>
          <div class="concept-name">Horizontal Scaling</div>
          <div class="concept-desc">Add more EC2s to the Target Group to scale out. No downtime, no config changes.</div>
        </div>
      </div>
    </div>

    <!-- Run command -->
    <div>
      <div class="section-head">launch command</div>
      <div class="terminal">
        <div class="terminal-bar">
          <div class="t-dot r"></div>
          <div class="t-dot y"></div>
          <div class="t-dot g"></div>
          <span class="terminal-label">ec2-user@${info.hostname} ~ bash</span>
        </div>
        <div class="terminal-body">
          <div class="t-line"><span class="t-prompt">$</span><span class="t-cmd">export SERVER_NAME="Server A"</span></div>
          <div class="t-line"><span class="t-prompt">$</span><span class="t-cmd">export AZ="us-east-1a"</span></div>
          <div class="t-line"><span class="t-prompt">$</span><span class="t-cmd">export REGION="us-east-1"</span></div>
          <div class="t-line"><span class="t-prompt">$</span><span class="t-cmd">export INSTANCE_ID="$(curl -s http://169.254.169.254/latest/meta-data/instance-id)"</span></div>
          <div class="t-line"><span class="t-prompt">$</span><span class="t-cmd">node server.js</span></div>
          <div class="t-out">✓ Server running on port 3000</div>
          <div class="t-comment"># Change SERVER_COLOR to "purple" for Server B</div>
        </div>
      </div>
    </div>

    <!-- Stack -->
    <div>
      <div class="section-head">stack</div>
      <div class="stack-tags">
        <span class="stag hi">AWS ALB</span>
        <span class="stag hi">EC2 t2.micro</span>
        <span class="stag hi">Node.js</span>
        <span class="stag">Amazon Linux 2</span>
        <span class="stag">Target Groups</span>
        <span class="stag">Security Groups</span>
        <span class="stag">Multi-AZ</span>
        <span class="stag">HTTP/1.1</span>
        <span class="stag">Health Checks</span>
        <span class="stag">KodeKloud Lab</span>
      </div>
    </div>

  </div>

  <div class="right-footer">
    <span>PID ${info.pid} · ${info.networkIp}</span>
    <span>${info.localTime} · ${info.az}</span>
  </div>
</div>

</body>
</html>`;
};

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`OK ${process.env.SERVER_NAME}`);
    return;
  }
  const info = getServerInfo();
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html(info));
});

server.listen(PORT, () => {
  console.log(`✓ Server running → http://localhost:${PORT}`);
  console.log(
    `  SERVER_NAME  : ${process.env.SERVER_NAME || "Server A (default)"}`
  );
  console.log(`  AZ           : ${process.env.AZ || "us-east-1a (default)"}`);
  console.log(
    `  REGION       : ${process.env.REGION || "us-east-1 (default)"}`
  );
  console.log(`  INSTANCE_ID  : ${process.env.INSTANCE_ID || "not set"}`);
  console.log(
    `  SERVER_COLOR : ${process.env.SERVER_COLOR || "cyan (default)"}`
  );
});
