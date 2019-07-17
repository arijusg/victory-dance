// ============================== Parameters =======================================
const youtubeVideoId = 'Dkk9gvTmCXY'
const organisationName = ''
const projectName = ''
const username = ''
const personalToken = ''
const deployCheckInterval = 5000
const playerHeight = '1080'
const playerWidth = '1920'

// ==================================================================================

let player
let isPlayerPlaying = false

function installYoutubePlayer () {
    loadYoutubePlayerIFrame()
}

function loadYoutubePlayerIFrame () {
    let tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    let firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
}

function initilialisePlayer () {
    // eslint-disable-next-line no-undef
    player = new YT.Player('player', {
        height: playerHeight,
        width: playerWidth,
        playerVars: { 'autoplay': 0, 'controls': 0 },
        videoId: youtubeVideoId,
        events: {
            'onStateChange': onPlayerStateChange
        }
    })
}

// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady () {
    initilialisePlayer()
}

function onPlayerStateChange (event) {
    // eslint-disable-next-line no-undef
    if (event.data === YT.PlayerState.PLAYING) {
        isPlayerPlaying = true
        // eslint-disable-next-line no-undef
    } else if (event.data === YT.PlayerState.ENDED) {
        isPlayerPlaying = false
        hidePlayer()
    }
}

function showPlayer () {
    let element = document.getElementById('player')
    element.style.display = 'block'
}

function hidePlayer () {
    let element = document.getElementById('player')
    element.style.display = 'none'
}

function playVideo () {
    if (!isPlayerPlaying) {
        console.log('======================================= PLAY =======================================')
        isPlayerPlaying = true
        showPlayer()
        player.playVideo()
    }
}

installYoutubePlayer()

function checkForProdDeploys () {
    const minStartedTime = new Date()
    minStartedTime.setHours(minStartedTime.getHours() - 1)

    const url = `https://vsrm.dev.azure.com/${organisationName}/${projectName}/_apis/release/deployments?deploymentStatus=succeeded&minStartedTime=${minStartedTime.toISOString()}&api-version=5.0`

    const headers = new Headers()
    headers.set('Authorization', 'Basic ' + btoa(username + ':' + personalToken))

    fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.value.length >= 0) {
                const validProdDeployments = data.value.filter(x => {
                    if (x.releaseEnvironment.name === 'prod' && x.completedOn) {
                        let completedOn = Date.parse(x.completedOn)
                        let minCompletedOn = new Date(Date.now())
                        minCompletedOn.setMilliseconds(minCompletedOn.getMilliseconds() - deployCheckInterval)

                        if (completedOn > minCompletedOn) {
                            return true
                        }
                    }
                    return false
                })
                if (validProdDeployments.length > 0) {
                    playVideo()
                }
            }
        })
}

setInterval(checkForProdDeploys, deployCheckInterval)
