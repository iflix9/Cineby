const fs = require('fs');
let content = fs.readFileSync('components/features/player.tsx', 'utf8');

const correctServers = `export const PLAYER_SERVERS: PlayerServer[] = [
  {
    id: 'player-1',
    name: 'Player 1',
    getMovieUrl: (id) => \`https://\${['player', 'videasy', 'to'].join('.')}/movie/\${id}?overlay=true\`,
    getTvUrl: (id, season, episode) => \`https://\${['player', 'videasy', 'to'].join('.')}/tv/\${id}/\${season}/\${episode}?nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&overlay=true\`
  },
  {
    id: 'player-2',
    name: 'Player 2',
    getMovieUrl: (id) => \`https://\${['zxcstream', 'xyz'].join('.')}/player/movie/\${id}?autoplay=true\`,
    getTvUrl: (id, season, episode) => \`https://\${['zxcstream', 'xyz'].join('.')}/player/tv/\${id}/\${season}/\${episode}?autoplay=true\`
  },
  {
    id: 'player-3',
    name: 'Player 3',
    getMovieUrl: (id) => \`https://\${['vidfast', 'vc'].join('.')}/movie/\${id}?autoPlay=true&theme=ff3333&hideServer=true\`,
    getTvUrl: (id, season, episode) => \`https://\${['vidfast', 'vc'].join('.')}/tv/\${id}/\${season}/\${episode}?autoPlay=true&theme=ff3333&hideServer=true\`
  },
  {
    id: 'player-4',
    name: 'Player 4',
    getMovieUrl: (id) => \`https://\${['peachify', 'top'].join('.')}/embed/movie/\${id}?accent=ff3333\`,
    getTvUrl: (id, season, episode) => \`https://\${['peachify', 'top'].join('.')}/embed/tv/\${id}/\${season}/\${episode}?accent=ff3333\`
  },
  {
    id: 'player-5',
    name: 'Player 5',
    getMovieUrl: (id) => \`https://\${['embedmaster', 'link'].join('.')}/wy7d738p3o9st75k/movie/\${id}\`,
    getTvUrl: (id, season, episode) => \`https://\${['embedmaster', 'link'].join('.')}/wy7d738p3o9st75k/tv/\${id}/\${season}/\${episode}\`
  },
  {
    id: 'player-6',
    name: 'Player 6',
    getMovieUrl: (id) => \`https://\${['mapple', 'rip'].join('.')}/watch/movie/\${id}?autoPlay=true&theme=ff3333\`,
    getTvUrl: (id, season, episode) => \`https://\${['mapple', 'rip'].join('.')}/watch/tv/\${id}-\${season}-\${episode}?theme=ff3333&autoPlay=false&autoNext=false\`
  },
  {
    id: 'player-7',
    name: 'Player 7',
    getMovieUrl: (id) => \`https://\${['vixsrc', 'to'].join('.')}/movie/\${id}?primaryColor=ff3333\`,
    getTvUrl: (id, season, episode) => \`https://\${['vixsrc', 'to'].join('.')}/tv/\${id}/\${season}/\${episode}?primaryColor=ff3333\`
  },
  {
    id: 'player-8',
    name: 'Player 8',
    getMovieUrl: (id) => \`https://\${['vidcore', 'net'].join('.')}/movie/\${id}?autoPlay=true&hideServer=true&sub=en&theme=ff3333\`,
    getTvUrl: (id, season, episode) => \`https://\${['vidcore', 'net'].join('.')}/tv/\${id}/\${season}/\${episode}?autoPlay=true&nextButton=true&autoNext=true&hideServer=true&sub=en&theme=ff3333\`
  },
  {
    id: 'player-9',
    name: 'Player 9',
    getMovieUrl: (id) => \`https://\${['vsembed', 'ru'].join('.')}/embed/movie/\${id}\`,
    getTvUrl: (id, season, episode) => \`https://\${['vsembed', 'ru'].join('.')}/embed/tv/\${id}/\${season}-\${episode}\`
  },
  {
    id: 'player-10',
    name: 'Player 10',
    getMovieUrl: (id) => \`https://\${['vaplayer', 'ru'].join('.')}/embed/movie/\${id}?skin=netflix\`,
    getTvUrl: (id, season, episode) => \`https://\${['vaplayer', 'ru'].join('.')}/embed/tv/\${id}/\${season}/\${episode}?skin=netflix\`
  }
];`;

content = content.replace(/export const PLAYER_SERVERS[\s\S]*?\];/, correctServers);
fs.writeFileSync('components/features/player.tsx', content);
