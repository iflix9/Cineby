async function run() {
  const res = await fetch("http://localhost:3000/api/tmdb/search/multi?query=batman");
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text.substring(0, 100));
}
run();
