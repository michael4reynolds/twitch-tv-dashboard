import axios from 'axios'

// Model
const twitchApi = 'https://api.twitch.tv/kraken'
const streams = `${twitchApi}/streams`
// const channels = `${twitchApi}/channels`
const twitchLink = 'https://www.twitch.tv'
const headers = {'client-id': process.env.REACT_APP_ClIENT_ID}

const queryParams = (channel) => ({channel})

// View
const isOnline = document.querySelector('p span')
const link = document.querySelector('a')

// Controller
const getIsOnline = async (channels) => {
  const {data} = await axios.get(streams, {
    headers: headers,
    params: queryParams(channels)
  })
  return !!+data._total
}

// initialize
const init = () => {
  try {
    let channels = 'freecodecamp'
    getIsOnline(channels).then(online => {
      link.href = `${twitchLink}/${channels}`
      isOnline.innerText = `online: ${online}`
    })
  } catch (e) {
    console.log(e)
  }
}

init()
