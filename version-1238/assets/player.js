(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var stage = document.querySelector(".player-stage");
    var video = document.getElementById("main-player");
    var button = document.querySelector(".play-control");
    var message = document.querySelector(".player-message");

    if (!stage || !video || !button) {
      return;
    }

    var videoUrl = stage.getAttribute("data-video") || "";
    var attached = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function attachStream() {
      if (attached || !videoUrl) {
        return;
      }

      attached = true;
      stage.classList.add("is-ready");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        return;
      }

      if (globalThis.Hls && globalThis.Hls.isSupported()) {
        hlsInstance = new globalThis.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(globalThis.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage("播放加载失败，请稍后重试");
          }
        });
        return;
      }

      video.src = videoUrl;
    }

    function startPlayback() {
      attachStream();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setMessage("点击视频控件即可开始播放");
        });
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      startPlayback();
    });

    stage.addEventListener("click", function (event) {
      if (event.target === stage) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      stage.classList.add("is-playing");
      setMessage("");
    });

    video.addEventListener("pause", function () {
      stage.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
