const http = require('http');
const httpProxy = require('http-proxy');
const { URL } = require('url');
const { searchMusic, getLyricForMusic } = require('./upstream/netease');

process.on('uncaughtException', (e) => { console.error(e) });
process.on('unhandledRejection', (e) => { throw e });

const proxy = httpProxy.createProxyServer({});

const server = http.createServer(async (request, response) => {
  const { method, url } = request;
  console.log(method, url);
  const respondWith = async (code, data) => {
    response.writeHead(code);
    if (data) await new Promise(r => response.write(data, 'utf-8', r));
    response.end();
  };
  if (url.startsWith('/')) {
    return respondWith(200, 'lyric-proxy-server is running');
  }
  const { origin, searchParams, pathname } = new URL(url);
  try {
    // Fake domain for lyric downloading
    if (origin === 'http://lyric.com') {
      const id = pathname.slice(1);
      console.log(`Fetching lyric for track ${id}`);
      const lyric = await getLyricForMusic(id);
      console.log(`Sending lyric for track ${id}:\n${lyric}`);
      return respondWith(200, lyric);
    }
    // AirPlay 3 for Windows
    else if (origin === 'http://lyric.airplayme.com' && pathname === '/0.2/') {
      const title = searchParams.get('ti');
      const artist = searchParams.get('ar');
      const tracks = (await searchMusic(title, artist)).map(track => ({ ...track, album_cover: [track.cover.replace(/^https?:\/\//, '')], lyric: [{ url: `http://lyric.com/${track.id}` }] }));
      const data = JSON.stringify({ err_code: 0, tracks });
      console.log(`Sending ${tracks.length} search results for: ${title} - ${artist}:`, data);
      return respondWith(200, data);
    }
    // Meizu MX Series
    else if (origin === 'http://music.meizu.com' && pathname === '/service/api/searchLrc.jsonp') {
      const title = searchParams.get('p0');
      const artist = searchParams.get('p1');
      const tracks = (await searchMusic(title, artist)).map(track => ({ mTitle: track.title, mAlbum: track.album, mArtist: track.artist, mCover: track.cover, lrcUrl: `http://lyric.com/${track.id}` }));
      const data = JSON.stringify({ reply: tracks });
      console.log(`Sending ${tracks.length} search results for: ${title} - ${artist}:`, data);
      return respondWith(200, data);
    }
    // Other requests
    else {
      proxy.web(request, response, { target: `http://localhost:${process.env.PORT || 8187}` });
    }
  } catch (e) {
    console.error(e);
    return respondWith(500);
  }
});

module.exports = server;
