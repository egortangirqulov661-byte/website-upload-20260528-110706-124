function setupMoviePlayer(playUrl) {
  document.addEventListener("DOMContentLoaded", function () {
    var video = document.querySelector(".player-video");
    var cover = document.querySelector(".player-cover");
    var button = document.querySelector(".player-start");
    var ready = false;
    var hlsInstance = null;

    if (!video || !playUrl) {
      return;
    }

    function loadVideo() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playUrl;
      } else if (window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playUrl;
      }
    }

    function begin(event) {
      if (event) {
        event.preventDefault();
      }
      loadVideo();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }
    if (cover) {
      cover.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}
