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
  };
  if (origin !== 'http://lyric.airplayme.com') {
    if (url.startsWith('/')) {
      return respondWith(200, 'podez-proxy-server is running');
    }
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
      const searchRes = await (await fetch(`https://music.163.com/api/search/get?type=1&s=${encodeURIComponent(`${title} ${artist}`)}`)).json();
      const detailRes = await (await fetch(`https://music.163.com/api/song/detail?ids=[${searchRes.result.songs.map(song => song.id).join(',')}]`)).json();
      const tracks = searchRes.result.songs.map((song, index) => ({
        title: song.name,
        album: song.album.name,
        artist: song.artists.map(artist => artist.name).join(', '),
        album_cover: [detailRes.songs[index].album.picUrl.replace(/^https?:\/\//, '')],
        lyric: [{ url: `http://lyric.airplayme.com/lrc/${song.id}` }],
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
    console.error(e);
    return respondWith(500);
  }
});

server.listen(process.env.PORT || 8187);
