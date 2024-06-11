const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "7fXKDSXrj7RljWC4QTixrd";
const container = document.querySelector('div[data-js="tracks"]'); 

function fetchPlaylist(token, playlistId) {
    fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.tracks && data.tracks.items) {
            addTracksToPage(data.tracks.items);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

function addTracksToPage(tracks) {
    const container = document.querySelector('[data-js="tracks"]');

    tracks.forEach((item, index) => {
        const track = item.track;
        const trackElement = document.createElement('div');
        trackElement.classList.add('track');

        trackElement.innerHTML = `
            <img src="${track.album.images[0].url}" alt="Album Art">
            <div class="track-info">
              <div class="album">${track.album.name}</div>
                <div class="lineSong">
                    <div class="name">${track.name}</div>
                    <div class="time">${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}</div>
                    <div class="plays">${track.popularity}k</div>
                    <div class="add"><button>Add</button></div>
                </div>
            </div>
        `;

        container.appendChild(trackElement);
    });
}

function fetchAccessToken() {
    fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`,
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.access_token) {
            fetchPlaylist(data.access_token, PLAYLIST_ID);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

fetchAccessToken();