const {YOUTUBE_API_KEY} = process.env
const fs = require('fs').promises
const fetch = require('node-fetch')

//const Parser = require('rss-parser')
//const parser = new Parser()

//const Instagram = require('instagram-web-api')
//const client = new Instagram({username: INSTAGRAM_USER, password: INSTAGRAM_TOKEN})
//
//const NUM_OF_ARTICLES_TO_SHOW = 5
//const NUM_OF_PHOTOS_TO_SHOW = 4
const NUM_OF_VIDEOS_TO_SHOW = 4

//const LATEST_ARTICLE_PLACEHOLDER = "%{{latest_articles}}%"
const LATEST_YOUTUBE_VIDEOS = "%{{latest_youtube}}%"
//const LATEST_INSTAGRAM_PHOTO = "%{{latest_instagram}}%"
// const LATEST_TWEET_PLACEHOLDER = "%{{latest_tweet}}%"

//const getPhotosFromInstagram = async () => {
//  await client.login()
//  const { user } = await client.getPhotosByUsername({username: 'midu.dev', first: NUM_OF_PHOTOS_TO_SHOW})
//  const {edge_owner_to_timeline_media: {page_info, edges}} = user
//  return edges
//}

const getLatestYoutubeVideos = () => {
  return fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PL4DDrIrz67NApBMkJ4WLqxslYk-D4uJwt&maxResults=${NUM_OF_VIDEOS_TO_SHOW}&key=${YOUTUBE_API_KEY}`)
    .then(res => res.json())
    .then(videos => videos.items)
}

//const generateInstagramHTML = ({shortcode, thumbnail_src}) => `
//<a href='https://www.instagram.com/p/${shortcode}/' target='_blank'>
//  <img width='20%' src='${thumbnail_src}' alt='Instagram photo' />
//</a>`

const generateYoutubeHTML = ({title, videoId}) => `
<a href='https://youtu.be/${videoId}' target='_blank'>
  <img width='30%' src='https://img.youtube.com/vi/${videoId}/mqdefault.jpg' alt='${title}' />
</a>`


;(async () => {
  const [template, videos] = await Promise.all([
    fs.readFile('./README.md.tpl', { encoding: 'utf-8' }),
    //parser.parseURL('#'),
    getLatestYoutubeVideos(),
    //getPhotosFromInstagram()
  ])

  // create latest article markdown
  //const latestArticlesMarkdown = articles.slice(0, NUM_OF_ARTICLES_TO_SHOW)
  //  .map(({title, link}) => `- [${title}](${link})`)
  //  .join('\n')

  // create latest youtube videos channel
  const latestYoutubeVideos = videos
    .map(({snippet}) => {
      const {title, resourceId} = snippet
      const {videoId} = resourceId
      return generateYoutubeHTML({videoId, title})
    })
    .join('')

  // create latest photos from instagram
  //const latestInstagramPhotos = photos
  //  .map(({node}) => generateInstagramHTML(node))
  //  .join('')

  // replace all placeholders with info
  const newMarkdown = template
    //.replace(LATEST_ARTICLE_PLACEHOLDER, latestArticlesMarkdown)
    .replace(LATEST_YOUTUBE_VIDEOS, latestYoutubeVideos)
    //.replace(LATEST_INSTAGRAM_PHOTO, latestInstagramPhotos)

  await fs.writeFile('./README.md', newMarkdown)
})()