const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "7fXKDSXrj7RljWC4QTixrd";
const container = document.querySelector('div[data-js="tracks"]');

function fetchPlaylist(token, playlistId) {
  console.log("token: ", token);

  fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.tracks && data.tracks.items) {
        data.tracks.items.forEach((item) => {
          console.log(item.track.name);
        });

        addTracksToPage(data.tracks.items);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function addTracksToPage(tracks) {
  const ul = document.createElement("ul");

  tracks.forEach((track) => {
    console.log("track: ", track);
    const li = document.createElement("li");
    li.classList.add("list-item");

    // Створення span, який містить назву альбому
    li.innerHTML = `<span class="album">Album: ${track.track.album.name}</span>`;

    if (track.track.album.name === "Ouest Side") {
      li.classList.add("highlighted");
    }

    // Створення span, який містить назву треку
    const trackSpan = document.createElement("span");
    trackSpan.textContent = `${track.track.name}`;
    trackSpan.classList.add("song");
    li.appendChild(trackSpan);

    // Створення span для часу пісні
    const durationSpan = document.createElement("span");
    durationSpan.textContent = formatDuration(track.track.duration_ms);
    durationSpan.classList.add("duration");
    li.appendChild(durationSpan);

    // Створення кнопки "Add"
    const addButton = document.createElement("button");
    addButton.textContent = "Add";
    addButton.classList.add("add-button");
    li.appendChild(addButton);

    ul.appendChild(li);
  });

  container.appendChild(ul);
}

// Форматування часу треку з мс в хвилини та секунди
function formatDuration(duration_ms) {
  const minutes = Math.floor(duration_ms / 6000);
  const seconds = ((duration_ms % 6000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

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
      console.log(data);
      if (data.access_token) {
        fetchPlaylist(data.access_token, PLAYLIST_ID);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
}
fetchAccessToken();