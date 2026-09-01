async function run() {
  const res = await fetch("http://localhost:3000/api/tmdb/search/multi?query=lost&include_adult=false&page=1");
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Results count:", data.results?.length);
  if (data.results && data.results.length > 0) {
    console.log("First result:", data.results[0].name || data.results[0].title);
  }
}
run();
