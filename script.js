const startButton = document.getElementById("start-test");
const downloadValue = document.getElementById("download-value");
const uploadValue = document.getElementById("upload-value");
const latencyValue = document.getElementById("latency-value");
const downloadStatus = document.getElementById("download-status");
const uploadStatus = document.getElementById("upload-status");
const latencyStatus = document.getElementById("latency-status");
const capabilityGrid = document.getElementById("capability-grid");

const capabilityData = [
  {
    title: "Email & browsing",
    description: "Everyday browsing, email, and social feeds.",
    minSpeed: 1,
  },
  {
    title: "HD streaming",
    description: "Stream 720p-1080p video on one device.",
    minSpeed: 5,
  },
  {
    title: "4K streaming",
    description: "Smooth 4K video and rich media.",
    minSpeed: 25,
  },
  {
    title: "Cloud gaming",
    description: "Responsive gameplay with low latency.",
    minSpeed: 20,
  },
  {
    title: "Video calls",
    description: "HD calls with clear audio and video.",
    minSpeed: 3,
  },
  {
    title: "Multiple devices",
    description: "Several devices streaming simultaneously.",
    minSpeed: 50,
  },
];

const formatSpeed = (value) => `${value.toFixed(1)} Mbps`;
const formatLatency = (value) => `${Math.round(value)} ms`;

const renderCapabilities = (speed) => {
  capabilityGrid.innerHTML = "";
  capabilityData.forEach((capability) => {
    const tag = document.createElement("span");
    const meetsSpeed = speed >= capability.minSpeed;
    tag.className = `tag ${meetsSpeed ? "good" : "ok"}`;
    tag.textContent = meetsSpeed ? "Ready" : "Limited";

    const card = document.createElement("div");
    card.className = "capability";

    const title = document.createElement("h3");
    title.textContent = capability.title;

    const description = document.createElement("p");
    description.textContent = capability.description;

    const requirement = document.createElement("p");
    requirement.textContent = `Suggested: ${capability.minSpeed}+ Mbps`;

    card.append(tag, title, description, requirement);
    capabilityGrid.append(card);
  });
};

const measureLatency = async () => {
  const start = performance.now();
  const response = await fetch("https://speed.cloudflare.com/__down?bytes=10000", {
    cache: "no-store",
  });
  await response.arrayBuffer();
  return performance.now() - start;
};

const measureDownload = async () => {
  const downloadSize = 5000000;
  const start = performance.now();
  const response = await fetch(
    `https://speed.cloudflare.com/__down?bytes=${downloadSize}&_=${Date.now()}`,
    { cache: "no-store" }
  );
  await response.arrayBuffer();
  const duration = (performance.now() - start) / 1000;
  return (downloadSize * 8) / (duration * 1000000);
};

const measureUpload = async () => {
  const uploadSize = 2000000;
  const payload = new Uint8Array(uploadSize);
  const start = performance.now();
  await fetch("https://speed.cloudflare.com/__up", {
    method: "POST",
    body: payload,
  });
  const duration = (performance.now() - start) / 1000;
  return (uploadSize * 8) / (duration * 1000000);
};

const runSpeedTest = async () => {
  startButton.disabled = true;
  downloadStatus.textContent = "Testing download speed...";
  uploadStatus.textContent = "Waiting for download";
  latencyStatus.textContent = "Measuring latency...";

  try {
    const latency = await measureLatency();
    latencyValue.textContent = formatLatency(latency);
    latencyStatus.textContent = "Latency measured";

    const download = await measureDownload();
    downloadValue.textContent = formatSpeed(download);
    downloadStatus.textContent = "Download complete";

    uploadStatus.textContent = "Testing upload speed...";
    const upload = await measureUpload();
    uploadValue.textContent = formatSpeed(upload);
    uploadStatus.textContent = "Upload complete";

    const overall = Math.min(download, upload);
    renderCapabilities(overall);
  } catch (error) {
    downloadStatus.textContent = "Unable to reach test server";
    uploadStatus.textContent = "Check your network settings";
    latencyStatus.textContent = "Test failed";
  } finally {
    startButton.disabled = false;
  }
};

startButton.addEventListener("click", runSpeedTest);

renderCapabilities(0);
