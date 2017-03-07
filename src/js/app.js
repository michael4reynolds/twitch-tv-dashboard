import axios from 'axios'

// Model
const twitchApi = 'https://api.twitch.tv/kraken'
const streamsLink = `${twitchApi}/streams`
const userLink = `${twitchApi}/users`
const headers = {'client-id': process.env.REACT_APP_ClIENT_ID}

const queryParams = (channel) => ({channel})

// View
const link = document.querySelector('a')

const channelView = (result) => {
  return `
    <li>
      <span>      
        ${result.displayName}
      </span>
      <span>      
        ${result.logo}
      </span>
      <span>      
        ${result.online}
      </span>
      <span>      
        ${result.game || ''}
      </span>
      <span>      
        ${result.status || ''}
      </span>
    </li>`
}

// Controller
const getOnlineUser = async (data) => {
  return {
    displayName: data.streams[0].channel.display_name,
    online: true,
    logo: data.streams[0].channel.logo,
    game: data.streams[0].game,
    status: data.streams[0].channel.status
  }
}

const getOfflineUser = async (channels) => {
  const {data} = await axios.get(`${userLink}/${channels}`, {headers: headers})
  return {
    displayName: channels,
    online: false,
    logo: data.logo
  }
}

const getChannelData = async (channels) => {
  const {data} = await axios.get(streamsLink, {
    headers: headers,
    params: queryParams(channels)
  })
  return !!+data._total ? getOnlineUser(data) : getOfflineUser(channels)
}

const getChannels = async (channels) => {
  let details = channels.map(async (channel) => {
    return await getChannelData(channel)
  })
  return await Promise.all(details)
}

const displayChannels = (channels) => {
  return channels.reduce((prev, next) => {
    return prev + channelView(next)
  }, '')
}

// initialize
const init = async () => {
  try {
    const channels = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp",
      "habathcx", "RobotCaleb", "noobs2ninjas"]
    const results = await getChannels(channels)
    link.innerHTML = displayChannels(results)
  } catch (e) {
    console.log(e)
  }
}

init()
