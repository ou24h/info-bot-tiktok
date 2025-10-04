const fetch = require('node-fetch');
const fs = require('fs');

const languages = JSON.parse(fs.readFileSync('./languages.json', 'utf8'));
const countries = JSON.parse(fs.readFileSync('./countries.json', 'utf8'));

async function scrapeTikTok(username) {
  const url = `https://www.tiktok.com/@${username}?isUniqueId=true&isSecured=true`;

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await response.text();

    const extract = (regex) => {
      const match = html.match(regex);
      return match ? match[1] : 'Not Found';
    };

    const rawRegion = (() => {
        const match = html.match(/"region":"([^"]+)"/);
        return match ? match[1] : 'Not Found';
    })();
    const regionObj = countries.find(c => c.code === rawRegion);
    const region = regionObj ? `${regionObj.name} ${regionObj.emoji}` : rawRegion;

    const rawLang = extract(/"language":"([^"]+)"/);
    const langObj = languages.find(l => l.code === rawLang);
    const language = langObj ? langObj.name : rawLang;

    const data = {
      id: extract(/"id":"(\d+)"/),
      uniqueId: extract(/"uniqueId":"([^"]+)"/),
      nickname: extract(/"nickname":"([^"]+)"/),
      avatar: extract(/"avatarLarger":"([^"]+)"/),
      signature: extract(/"signature":"([^"]*)"/),
      private: extract(/"privateAccount":(true|false)/),
      verified: extract(/"secret":(true|false)/),
      language,
      region,
      followerCount: extract(/"followerCount":(\d+)/),
      followingCount: extract(/"followingCount":(\d+)/),
      likes: extract(/"heartCount":(\d+)/),
      videos: extract(/"videoCount":(\d+)/),
    };

    return `
ID: ${data.id}
Username: ${data.uniqueId}
Nickname: ${data.nickname}
Bio: ${data.signature}

Private Account: ${data.private}
Verified Badge: ${data.verified}
Language: ${data.language}
Region: ${data.region}

Followers: ${data.followerCount}
Following: ${data.followingCount}
Likes: ${data.likes}
Videos: ${data.videos}

Avatar: ${data.avatar}
    `.trim();
  } catch (err) {
    return '❌ حدث خطأ أثناء جلب البيانات.';
  }
}


module.exports = scrapeTikTok;

