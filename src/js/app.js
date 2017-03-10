import axios from 'axios'
import classnames from 'classnames'

// Model
const twitchApi = 'https://api.twitch.tv/kraken'
const streamsLink = `${twitchApi}/streams`
const twitchLink = 'https://www.twitch.tv'
const userLink = `${twitchApi}/users`
const noImageLink = 'https://upload.wikimedia.org/wikipedia/commons/d/d5/No_sign.svg'
const headers = {'client-id': process.env.REACT_APP_ClIENT_ID}
const filters = {all: 'all', online: 'online', offline: 'offline'}
let currentFilter = filters.all

const validateStatus = status => (status >= 200 && status < 300) || status === 404
const queryParams = (channel) => ({channel})

// View
const rows = document.querySelector('ul')

const displayState = {
  true: 'Online',
  false: 'Offline',
  'Not Found': 'Not Registered'
}

const channelView = (result) => {
  if (result.error) {
    return `
      <li class="not-registered">
        <span>      
          <img class="logo" src="${noImageLink}" alt="image unavailable">
        </span> 
        <span>      
          ${result.displayName}
        </span>       
        <span class=${classnames({'no-status': result.error})}>      
          ${displayState[result.error]}
        </span>
      </li>`
  }

  const status = classnames({
    'online': result.online,
    'offline': !result.online
  })

  return `
    <li class=${status}>
      <span>
        <img class="logo" src="${result.logo}" alt="channel logo">
      </span>
      <span>      
        <a href="${twitchLink}/${result.displayName}" target="_blank">
          ${result.displayName}
        </a>
      </span>
      <span class=${`${status}-status`}>      
        ${displayState[result.online]}
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
  const {data} = await axios.get(`${userLink}/${channels}`, {headers, validateStatus})
  return {
    displayName: data.display_name || channels,
    online: false,
    logo: data.logo,
    error: data.error
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

const stateFilter = (item) => {
  switch (currentFilter) {
    case filters.online :
      return item.online
    case filters.offline:
      return !item.online || item.error
    default:
      return true
  }
}

const displayChannels = (channels) => {
  return channels
    .filter(stateFilter)
    .reduce((prev, next) => prev + channelView(next), '')
}

// initialize
const init = async () => {
  try {
    const channels = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp",
      "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"]
    const results = await getChannels(channels)
    rows.innerHTML = displayChannels(results)
  } catch (e) {
    console.log(e)
  }
}

init()
