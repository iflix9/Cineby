async function run() {
  const res = await fetch("http://localhost:3000/api/tmdb/search/multi?query=batman", {
    headers: {
      "cookie": "cineby-session=123",
      "referer": "http://localhost:3000/",
      "host": "localhost:3000"
    }
  });
  const data = await res.json();
  console.log("data results:", !!data.results, "length:", data.results ? data.results.length : 0);
  console.log("first result:", data.results ? data.results[0] : null);
}
run();
