const http = require('http');
const https = require('https');
const fetch = require('node-fetch');
const { URL } = require('url');

process.on('uncaughtException', (e) => { console.error(e) });
process.on('unhandledRejection', (e) => { throw e });

const server = http.createServer(async (request, response) => {
  const { method, url, headers } = request;
  console.log(method, url);
  const { origin, searchParams, pathname } = new URL(url);
  const respondWith = async (code, data) => {
    response.writeHead(code);
    if (data) await new Promise(r => response.write(data, 'utf-8', r));
    response.end();
  }
  if (origin !== 'http://lyric.airplayme.com') {
    const handler = origin.startsWith('https') ? https : http;
    const proxyReq = handler.request(url, { method, headers });
    request.pipe(proxyReq);
    const proxyRes = await new Promise(r => proxyReq.on('response', r));
    response.writeHead(proxyRes.statusCode, proxyRes.headers);
    console.log(`Proxying third-party request`);
    proxyRes.pipe(response);
    await new Promise(r => proxyRes.on('end', r));
    response.end();
    return;
  }
  try {
    if (pathname === '/0.2/') {
      const title = searchParams.get('ti');
      const artist = searchParams.get('ar');
      const searchRes = await (await fetch(`https://music.163.com/api/search/get?type=1&s=${encodeURIComponent(`${title} - ${artist}`)}`)).json();
      const { songs: songDetails } = await (await fetch(`https://music.163.com/api/song/detail?ids=[${searchRes.result.songs.map(song => song.id).join(',')}]`)).json();
      const tracks = await Promise.all(searchRes.result.songs.map(async (song, index) => {
        const { id: songId, name: songTitle, artists, album, duration } = song;
        const songDetail = songDetails[index];
        const artistsName = artists.map(artist => artist.name).join(', ');
        const albumName = album.name;
        return {
          title: songTitle,
          album: albumName,
          artist: artistsName,
          album_cover: [songDetail.album.picUrl.replace(/^https?:\/\//, '')],
          artist_image: [],
          lyric: [{
            editor: '',
            length: duration,
            url: `http://lyric.airplayme.com/lrc/${songId}`,
          }],
        };
      }));
      const data = JSON.stringify({ err_code: 0, tracks });
      console.log(`Sending ${tracks.length} search results for: ${title} - ${artist}:`, data);
      return respondWith(200, data);
    }
    if (/^\/lrc\/(\d+)/.test(pathname)) {
      const songId = RegExp.$1;
      const { lyric } = await (await fetch(`https://music.163.com/api/song/media?id=${songId}`)).json();
      console.log(`Sending lyric for songId ${songId}:\n${lyric}`);
      return respondWith(200, lyric);
    }
  } catch (e) {
    return respondWith(500);
  }
});

server.listen(8187);