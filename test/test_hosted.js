async function testHosted() {
  const base = "http://localhost:3000";

  const checks = [
    { name: "Root API Index (JSON)", path: "/" },
    { name: "Health Diagnostics", path: "/api/health" },
    { name: "Shows Catalog", path: "/api/shows?page=1&limit=2" },
    { name: "Featured Shows", path: "/api/shows/featured" },
    { name: "Show Details (Tomb Raider King)", path: "/api/shows/6ac246ece5982ebccecc0573" },
    { name: "Season Episodes", path: "/api/shows/6ac246ece5982ebccecc0573/season/6ac24766e5982ebccecc064f/episodes" },
    { name: "Movies Catalog", path: "/api/movies?page=1&limit=2" },
    { name: "Featured Movies", path: "/api/movies/featured" },
    { name: "Movie Details (Doraemon)", path: "/api/movies/6aca1a5e2a93c344ad8f584b" },
    { name: "Unified Search (q=naruto)", path: "/api/search?q=naruto&limit=2" },
    { name: "Device TV Code", path: "/api/device/code", method: "POST" },
    { name: "Popularity Trending (Fallback)", path: "/api/popularity/trending?limit=2&period=week&fallback=true" }
  ];

  console.log("=== TESTING PURE REST API AT http://localhost:3000 ===\n");
  let passed = 0;

  for (const c of checks) {
    const start = Date.now();
    try {
      const opts = { method: c.method || "GET" };
      if (c.method === "POST") {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify({});
      }
      const res = await fetch(base + c.path, opts);
      const latency = Date.now() - start;
      const json = await res.json();
      const isOk = res.ok && json.success !== false;

      console.log(`[${isOk ? "PASS" : "FAIL"}] ${c.name.padEnd(35)} -> HTTP ${res.status} (${latency}ms)`);
      if (isOk) passed++;
    } catch (e) {
      console.log(`[ERR ] ${c.name.padEnd(35)} -> ${e.message}`);
    }
  }

  console.log(`\n=== SUMMARY: ${passed}/${checks.length} ENDPOINTS PASSED ===`);
}

testHosted();
