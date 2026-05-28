(function () {
  window.attachMoviePlayer = function attachMoviePlayer(options) {
    const root = options.root;
    const video = options.video;
    const trigger = options.trigger;
    const stream = options.stream;
    const message = root ? root.querySelector(".player-message") : null;
    const Hls = window.Hls;
    let hls = null;
    let ready = false;

    if (!root || !video || !trigger || !stream) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("视频暂时无法加载，请稍后重试");
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
      } else {
        showMessage("视频暂时无法加载，请稍后重试");
      }
    }

    async function play() {
      prepare();
      try {
        trigger.classList.add("is-hidden");
        await video.play();
      } catch (error) {
        trigger.classList.remove("is-hidden");
      }
    }

    trigger.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        trigger.classList.remove("is-hidden");
      }
    });
    video.addEventListener("play", function () {
      trigger.classList.add("is-hidden");
    });
  };
})();
