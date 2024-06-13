const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "7fXKDSXrj7RljWC4QTixrd";
const container = document.querySelector('div[data-js="tracks"]');

function fetchPlaylist(token, playlistId) {
  console.log("token: ", token);

  fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
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
  let currentBall = null;

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
        playIcon.classList.add('animated-wave');
      }

      // Якщо інше зображення вже змінене, повертаємо його назад
      items.forEach(track => {
        if (track !== item) {
          const otherPlayIcon = track.querySelector('img[src="./wave.png"]');
          if (otherPlayIcon) {
            otherPlayIcon.src = './play.png';
            otherPlayIcon.classList.remove('animated-wave');
          }
        }
      });

      // Змінюємо фото nomusic.png на music.png
      const playerImage = document.querySelector('.playerTrack');
      if (playerImage.src.includes('nomusic.png')) {
        playerImage.src = './music.png';
      }

      // Зупиняємо поточну анімацію та видаляємо м'яч
      if (currentBall) {
        stopBallAnimation(currentBall);
        currentBall.remove();
      }

      // Додаємо нову анімацію ball.png
      currentBall = document.createElement('img');
      currentBall.src = './ball.png';
      currentBall.classList.add('moving-ball');
      playerImage.parentElement.appendChild(currentBall);

      // Запуск нової анімації
      startBallAnimation(currentBall);

      // Змінюємо фото noplay.png на play.png і nopause.png на pause.png
      const playButtonImage = document.querySelector('[data-js="play"] img');
      const pauseButtonImage = document.querySelector('[data-js="pause"] img');

      if (playButtonImage.src.includes('noplay.png')) {
        playButtonImage.src = './play.png';
      }
      if (pauseButtonImage.src.includes('nopause.png')) {
        pauseButtonImage.src = './pause.png';
      }

      // Почати програвання аудіо з початку
      const audio = document.querySelector("[data-js='current-track']");
      audio.src = "https://p.scdn.co/mp3-preview/398665ccd5df24f5b67d2cd96f7ad8586ad8632a?cid=67b411e20d594f30bf7a8d3bbde54285";
      audio.play();
      startWaveAnimation();
    });
  });

  listenForLikeClick();
}

function startBallAnimation(ball, startPosition = 0) {
  const playerImage = document.querySelector('.playerTrack');
  const maxPosition = playerImage.clientWidth - 10; // враховуючи розмір ball.png

  let position = startPosition;
  ball.style.left = `${position}px`;

  const animationInterval = setInterval(() => {
    position += 10; // змінено на 10 пікселів
    if (position > maxPosition) {
      position = 0;
    }
    ball.style.left = `${position}px`;
    ball.dataset.currentPosition = position; // Оновлюємо поточну позицію
  }, 1000);

  // Збережемо інтервал для подальшого очищення
  ball.dataset.animationInterval = animationInterval;
}

function stopBallAnimation(ball) {
  if (ball) {
    clearInterval(ball.dataset.animationInterval);
    ball.dataset.animationInterval = '';
  }
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
  startWaveAnimation();

  // Продовження анімації м'яча
  const ball = document.querySelector('.moving-ball');
  if (ball) {
    const currentPosition = parseInt(ball.dataset.currentPosition, 10) || 0;
    const animationInterval = ball.dataset.animationInterval;
    if (!animationInterval) {
      startBallAnimation(ball, currentPosition);
    }
  }
});

pauseButton.addEventListener("click", () => {
  audio.pause();
  stopWaveAnimation();

  // Зупинка анімації м'яча
  const ball = document.querySelector('.moving-ball');
  if (ball) {
    clearInterval(ball.dataset.animationInterval);
    ball.dataset.animationInterval = '';
  }
});

function startWaveAnimation() {
  const currentTrack = document.querySelector('.highlighted');
  if (currentTrack) {
    const playIcon = currentTrack.querySelector('img[src="./wave.png"]');
    if (playIcon) {
      playIcon.classList.add('animated-wave');
    }
  }
}

function stopWaveAnimation() {
  const animatedIcons = document.querySelectorAll('.animated-wave');
  animatedIcons.forEach(icon => {
    icon.classList.remove('animated-wave');
  });
}