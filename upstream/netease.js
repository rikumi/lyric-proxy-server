const fetch = require('node-fetch');

exports.searchMusic = async (title, artist) => {
  const searchRes = await (await fetch(`https://music.163.com/api/search/get?type=1&s=${encodeURIComponent(`${title} - ${artist}`)}`)).json();
  const detailRes = await (await fetch(`https://music.163.com/api/song/detail?ids=[${searchRes.result.songs.map(track => track.id).join(',')}]`)).json();
  return searchRes.result.songs.map((track, index) => ({
    id: track.id,
    title: track.name,
    album: track.album.name,
    artist: track.artists.map(artist => artist.name).join(', '),
    cover: detailRes.songs[index].album.picUrl,
  }));
};

exports.getLyricForMusic = async (id) => {
  const { lyric = '' } = await (await fetch(`https://music.163.com/api/song/media?id=${id}`)).json();
  return lyric.replace(/^\[\w+:.*?]$/mg, '').trim();
};
