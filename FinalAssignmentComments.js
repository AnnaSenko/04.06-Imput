const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "37i9dQZF1E4m0uHm6DE1DC";
const container = document.querySelector('div[data-js="tracks"]');

function fetchPlaylist(token, playlistId) {
  console.log("token: ", token);

  fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, { // making a GET request to the Spotify API 
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json()) //Processing the server response
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

function addTracksToPage(tracks) { //a function that takes one parameter tracks (a list of tracks)
  const container = document.querySelector('[data-js="tracks"]');

  tracks.forEach((item, index) => {
    const track = item.track;
    const trackElement = document.createElement('div'); //A new div element with the track class is created for each track in the list
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
  const items = document.querySelectorAll('.track'); // Gets all elements with the track class from the DOM 
  let currentBall = null; // a variable that will be used to animate the ball 

  items.forEach((item, index) => {
    item.addEventListener("click", (event) => { // Adds an event listener for each track. 
      items.forEach(track => track.classList.remove('highlighted')); //Removes the highlighted class from all tracks.
      item.classList.add('highlighted'); // Highlight only the selected track

      const trackImageElement = item.querySelector('img[data-original-src]'); //Gets the album image for the selected track.
      const currentTrackImageElement = document.querySelector('[data-js="current"] img');

      currentTrackImageElement.src = trackImageElement.dataset.originalSrc; // Changes the image of the current track to the image of the selected track.

      const playIcon = item.querySelector('img[src="./img/play.png"]'); // Changes the play.png icon to wave.png and adds an animation class for the clicked track.
      if (playIcon) {
        playIcon.src = './img/wave.png';
        playIcon.classList.add('animated-wave');
      }

      items.forEach(track => { //Changes the wave.png icon back to play.png for all other tracks, removing the animation class.
        if (track !== item) {
          const otherPlayIcon = track.querySelector('img[src="./img/wave.png"]');
          if (otherPlayIcon) {
            otherPlayIcon.src = './img/play.png';
            otherPlayIcon.classList.remove('animated-wave');
          }
        }
      });

      const playerImage = document.querySelector('.playerTrack');// Change the photo nomusic.png to music.png
      if (playerImage.src.includes('nomusic.png')) {
        playerImage.src = './img/music.png';
      }

      // Stops the animation of the current ball and removes it from the DOM.
      if (currentBall) {
        stopBallAnimation(currentBall);
        currentBall.remove();
      }

      // Creates a new ball and adds it to the DOM.
      currentBall = document.createElement('img');
      currentBall.src = './img/ball.png';
      currentBall.classList.add('moving-ball'); 
      playerImage.parentElement.appendChild(currentBall);

      // Starts the animation of a new ball.
      startBallAnimation(currentBall);

      const playButtonImage = document.querySelector('[data-js="play"] img');
      const pauseButtonImage = document.querySelector('[data-js="pause"] img');

      if (playButtonImage.src.includes('noplay.png')) { // Change the photo noplay.png to play.png and nopause.png to pause.png      
        playButtonImage.src = './img/play.png';
      }
      if (pauseButtonImage.src.includes('nopause.png')) {
        pauseButtonImage.src = './img/pause.png';
      }

      // Selects an audio source and starts playback.
      const audio = document.querySelector("[data-js='current-track']");
      audio.src = "https://p.scdn.co/mp3-preview/398665ccd5df24f5b67d2cd96f7ad8586ad8632a?cid=67b411e20d594f30bf7a8d3bbde54285";
      audio.play();
      startWaveAnimation(); // Starts the wave animation for the current track.
    });
  });

  listenForLikeClick();
}

function startBallAnimation(ball, startPosition = 0) {
  const playerImage = document.querySelector('.playerTrack'); //Find an element with the .playerTrack class in the DOM and store it in the playerImage variable 
  const maxPosition = playerImage.clientWidth - 10; // Calculating the maximum ball position given the size

  let position = startPosition;
  ball.style.left = `${position}px`; // Sets the initial style for the ball

  // The ball moves 5 pixels to the right every 500ms. 
  const animationInterval = setInterval(() => { // the function is run once per defined interval
    position += 5; // changed by 5 pixels
    if (position > maxPosition) { // If it reaches the maximum position, it resets to the starting position (0).
      position = 0;
    }
    ball.style.left = `${position}px`; //// Updates the style for the new position
    ball.dataset.currentPosition = position; //Keeps the current position
  }, 500);

  ball.dataset.animationInterval = animationInterval; // Save the interval to allow stopping the animation later.
}

function stopBallAnimation(ball) {
  if (ball) {
    clearInterval(ball.dataset.animationInterval); // stop the animation and fix the ball in a certain position
    ball.dataset.animationInterval = ''; //indicates that the animation has been stopped and there is no active interval.
  }
}

function listenForLikeClick() { 
  const likeButtons = document.querySelectorAll('.like'); //Get all elements in the document that have the like class

  likeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation(); //prevents further propagation of the current event up the DOM
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

const playButton = document.querySelector("[data-js='play']"); //Getting a link to the buttons
const pauseButton = document.querySelector("[data-js='pause']");

playButton.addEventListener("click", () => {
  audio.play();
  startWaveAnimation();

  // Continuation of ball animation
  const ball = document.querySelector('.moving-ball'); //finding the first element in a document with the moving-ball class
  if (ball) { // If the element exists, the current position of the interval animation is set 
    /*The data-current-position value stores the current horizontal position of the ball in pixels. 
    The parseInt function converts this value from a string to an integer, 
    and the second argument 10 indicates that the decimal system is used.*/ 
    const currentPosition = parseInt(ball.dataset.currentPosition, 10) || 0; 
    const animationInterval = ball.dataset.animationInterval;
    if (!animationInterval) {//If the interval is not running (animationInterval is not set)
      startBallAnimation(ball, currentPosition); //  the ball animation starts
    }
  }
});

pauseButton.addEventListener("click", () => {
  audio.pause();
  stopWaveAnimation();

  // Stop the ball animation
  const ball = document.querySelector('.moving-ball');
  if (ball) { //If the element exists, the ball animation stops and the spacing is cleared.
    clearInterval(ball.dataset.animationInterval);
    ball.dataset.animationInterval = '';
  }
});

function startWaveAnimation() {
  const currentTrack = document.querySelector('.highlighted'); //Getting the first element on a page with the .highlighted class
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