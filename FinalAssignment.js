const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "37i9dQZF1E4m0uHm6DE1DC";
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
      <img src="./img/play.png" alt="Play Icon" data-original-src="${track.album.images[0].url}">
      <div class="track-info">
        <div class="album">${track.album.name}</div>
        <div class="song">
          <div class="name">${track.name}</div>
          <div class="time">${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}</div>
        </div> 
      </div>
      <img src="./img/star.png" class="like" alt="Like">
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
      items.forEach(track => track.classList.remove('highlighted')); 
      item.classList.add('highlighted'); 

      const trackImageElement = item.querySelector('img[data-original-src]'); 
      const currentTrackImageElement = document.querySelector('[data-js="current"] img');

      currentTrackImageElement.src = trackImageElement.dataset.originalSrc; 

      const playIcon = item.querySelector('img[src="./img/play.png"]'); 
      if (playIcon) {
        playIcon.src = './img/wave.png';
        playIcon.classList.add('animated-wave');
      }

      items.forEach(track => { 
        if (track !== item) {
          const otherPlayIcon = track.querySelector('img[src="./img/wave.png"]');
          if (otherPlayIcon) {
            otherPlayIcon.src = './img/play.png';
            otherPlayIcon.classList.remove('animated-wave');
          }
        }
      });

      const playerImage = document.querySelector('.playerTrack');
      if (playerImage.src.includes('nomusic.png')) {
        playerImage.src = './img/music.png';
      }

      // Stops the animation of the current ball 
      if (currentBall) {
        stopBallAnimation(currentBall);
        currentBall.remove();
      }

      // Creates a new ball and adds it to the DOM.
      currentBall = document.createElement('img');
      currentBall.src = './img/ball.png';
      currentBall.classList.add('moving-ball'); 
      playerImage.parentElement.appendChild(currentBall);

      startBallAnimation(currentBall);

      const playButtonImage = document.querySelector('[data-js="play"] img');
      const pauseButtonImage = document.querySelector('[data-js="pause"] img');

      if (playButtonImage.src.includes('noplay.png')) {       
        playButtonImage.src = './img/play.png';
      }
      if (pauseButtonImage.src.includes('nopause.png')) {
        pauseButtonImage.src = './img/pause.png';
      }

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
  const maxPosition = playerImage.clientWidth - 10; 

  let position = startPosition;
  ball.style.left = `${position}px`; 

  // The ball moves 5 pixels to the right every 500ms. 
  const animationInterval = setInterval(() => { 
    position += 5; 
    if (position > maxPosition) { 
      position = 0;
    }
    ball.style.left = `${position}px`; 
    ball.dataset.currentPosition = position; 
  }, 500);

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
        event.target.src = './img/frame.png';
      } else {
        event.target.src = './img/star.png';
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

  // Continuation of ball animation
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

  // Stop the ball animation
  const ball = document.querySelector('.moving-ball');
  if (ball) { 
    clearInterval(ball.dataset.animationInterval);
    ball.dataset.animationInterval = '';
  }
});

function startWaveAnimation() {
  const currentTrack = document.querySelector('.highlighted'); 
  if (currentTrack) {
    const playIcon = currentTrack.querySelector('img[src="./img/wave.png"]');
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