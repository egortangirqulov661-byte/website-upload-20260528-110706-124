(function () {
  window.setupMoviePlayer = function (source) {
    var holder = document.querySelector("[data-player]");
    if (!holder) {
      return;
    }
    var video = holder.querySelector("video");
    var startButton = holder.querySelector("[data-player-start]");
    var errorBox = holder.querySelector("[data-player-error]");
    var hls = null;

    function showError() {
      if (errorBox) {
        errorBox.textContent = "视频暂时无法播放";
        errorBox.classList.add("show");
      }
    }

    function hideOverlay() {
      if (startButton) {
        startButton.classList.add("hidden");
      }
    }

    function attemptPlay() {
      hideOverlay();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          video.addEventListener("canplay", function ready() {
            video.removeEventListener("canplay", ready);
            video.play().catch(function () {});
          });
        });
      }
    }

    if (!video || !source) {
      showError();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          showError();
          if (hls) {
            hls.destroy();
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      showError();
    }

    if (startButton) {
      startButton.addEventListener("click", attemptPlay);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        attemptPlay();
      }
    });

    video.addEventListener("play", hideOverlay);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
