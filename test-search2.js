async function run() {
  const res = await fetch("http://localhost:3000/api/tmdb/search/multi?query=batman", {
    headers: {
      "cookie": "cineby-session=123",
      "referer": "http://localhost:3000/",
      "host": "localhost:3000"
    }
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response starts with:", text.substring(0, 100));
}
run();
