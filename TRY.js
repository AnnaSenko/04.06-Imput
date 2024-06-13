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
  const container = document.querySelector('[data-js="tracks"]');

  tracks.forEach((item, index) => {
    const track = item.track;
    const trackElement = document.createElement('div');
    trackElement.classList.add('track');

    trackElement.innerHTML = `
      <img src="./play.png" alt="Play Icon" data-original-src="${track.album.images[0].url}">
      <div class="track-info">
        <div class="album">${track.album.name}</div>
        <div class="song">
          <div class="name">${track.name}</div>
          <div class="time">${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}</div>
        </div> 
      </div>
      <img src="./star.png" class="like" alt="Like">
    `;

    container.appendChild(trackElement);
  });

  listenForClick();
}

function listenForClick() {
  const items = document.querySelectorAll('.track');
  let imageChanged = false;

  items.forEach((item, index) => {
    item.addEventListener("click", (event) => {
      // Знімаємо виділення з усіх треків
      items.forEach(track => track.classList.remove('highlighted'));

      // Виділяємо натиснутий трек
      item.classList.add('highlighted');

      const trackImageElement = item.querySelector('img[data-original-src]');
      const currentTrackImageElement = document.querySelector('[data-js="current"] img');

      currentTrackImageElement.src = trackImageElement.dataset.originalSrc;

      // Змінюємо фото play.png на wave.png
      const playIcon = item.querySelector('img[src="./play.png"]');
      if (playIcon) {
        playIcon.src = './wave.png';
      }

      // Якщо інше зображення вже змінене, повертаємо його назад
      items.forEach(track => {
        if (track !== item) {
          const otherPlayIcon = track.querySelector('img[src="./wave.png"]');
          if (otherPlayIcon) {
            otherPlayIcon.src = './play.png';
          }
        }
      });

      if (!imageChanged) {
        const playerImage = document.querySelector('.playerTrack');
        if (playerImage.src.includes('nomusic.png')) {
          playerImage.src = './music.png';
          imageChanged = true;
        }
      }
    });
  });

  listenForLikeClick();
}

function listenForLikeClick() {
  const likeButtons = document.querySelectorAll('.like');

  likeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation(); 
      if (event.target.src.includes('star.png')) {
        event.target.src = './frame.png';
      } else {
        event.target.src = './star.png';
      }
    });
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

const audio = document.querySelector("[data-js='current-track']");
console.log("audio: ", audio);

const playButton = document.querySelector("[data-js='play']");
const pauseButton = document.querySelector("[data-js='pause']");

playButton.addEventListener("click", () => {
  audio.play();
});

pauseButton.addEventListener("click", () => {
  audio.pause();
}); 