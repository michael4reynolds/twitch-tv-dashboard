import axios from 'axios'
import classnames from 'classnames'
import v from 'voca'

// Model
const twitchApi = 'https://api.twitch.tv/kraken'
const streamsLink = `${twitchApi}/streams`
const twitchLink = 'https://www.twitch.tv'
const userLink = `${twitchApi}/users`
const noImageLink = 'https://upload.wikimedia.org/wikipedia/commons/d/d5/No_sign.svg'
const headers = {'client-id': process.env.REACT_APP_ClIENT_ID}
const filters = {all: 'all', online: 'online', offline: 'offline'}
let currentFilter = filters.all
let results
let defaultChannels = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp",
  "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"]

const validateStatus = status => (status >= 200 && status < 300) || status === 404 || status === 422
const queryParams = (channel) => ({channel})

// View
const rows = document.querySelector('ul')
const btnAll = document.getElementById('view-all')
const btnOnline = document.getElementById('view-online')
const btnOffline = document.getElementById('view-offline')
const searchForm = document.querySelector('.search-bar form')
const searchText = document.getElementById('search-text')

const displayState = {
  true: 'Online',
  false: 'Offline',
  'Not Found': 'Not Registered',
  'Unprocessable Entity': 'Unresolved'
}

const channelView = (result) => {
  if (result.error) {
    return `
      <li class="not-registered">
        <div class="logo-container">
          <img class="logo" src="${noImageLink}" alt="image unavailable">
        </div>
        <div class="details-container">
          <span>      
            ${result.displayName}
          </span>       
          <span class=${classnames({'no-status': result.error})}>      
            ${displayState[result.error]}
          </span>
        </div>
      </li>`
  }

  const status = classnames({
    'online': result.online,
    'offline': !result.online
  })

  return `
    <li class=${status}>
      <div class="logo-container">
        <span>
          <img class="logo" src="${result.logo}" alt="channel logo">
        </span>
      </div>
      <div class="details-container">      
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
      </div>
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
  return +data._total ? getOnlineUser(data) : getOfflineUser(channels)
}

const getChannels = async (channels) => {
  let values = !v.isBlank(channels) ? channels.split(',') : defaultChannels
  let details = values.map(async (channel) => {
    return await getChannelData(channel.trim())
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

const refreshDisplay = () => {
  rows.innerHTML = displayChannels(results)
}
const setFilter = async (e, filter) => {
  let buttons = Array.from(document.querySelectorAll('[class$=selected]'))
  buttons.forEach(el => el.className = '')

  currentFilter = filter
  e.target.className = classnames('selected')
  await refreshDisplay()
}

const submitForm = async (e) => {
  if (e) e.preventDefault()
  results = await getChannels(searchText.value.replace(/(\w+)\s+/gi, '$1, '))
  refreshDisplay()
}

// initialize
const init = async () => {
  try {
    btnAll.className += 'selected'
    btnAll.onclick = (e) => setFilter(e, filters.all)
    btnOnline.onclick = (e) => setFilter(e, filters.online)
    btnOffline.onclick = (e) => setFilter(e, filters.offline)
    searchForm.addEventListener('submit', submitForm)

    await submitForm()
  } catch (e) {
    console.log(e)
  }
}

init()
