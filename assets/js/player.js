import { H as Hls } from "./hls.js";

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function attachNative(video, source) {
    video.src = source;
    return Promise.resolve();
}

function attachHls(video, source) {
    return new Promise(function (resolve, reject) {
        if (!Hls || !Hls.isSupported()) {
            reject(new Error("当前浏览器不支持 HLS 播放"));
            return;
        }

        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            resolve();
        });
        hls.on(Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
                reject(new Error(data.details || "HLS 播放源加载失败"));
            }
        });

        video.__hlsInstance = hls;
    });
}

function setupPlayer(card) {
    var video = card.querySelector("video[data-hls-src]");
    var button = card.querySelector("[data-player-start]");

    if (!video || !button) {
        return;
    }

    var source = video.dataset.hlsSrc;
    var isAttached = false;

    function showError(error) {
        button.hidden = false;
        button.innerHTML = "<span>!</span><strong>播放源加载失败</strong>";
        button.title = error.message || String(error);
        card.classList.remove("is-playing");
    }

    function startPlayback() {
        var attachPromise;

        if (!source) {
            showError(new Error("未找到播放源"));
            return;
        }

        button.disabled = true;
        button.innerHTML = "<span>…</span><strong>加载中</strong>";

        if (!isAttached) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                attachPromise = attachNative(video, source);
            } else {
                attachPromise = attachHls(video, source);
            }
            isAttached = true;
        } else {
            attachPromise = Promise.resolve();
        }

        attachPromise
            .then(function () {
                card.classList.add("is-playing");
                button.hidden = true;
                return video.play();
            })
            .catch(function (error) {
                showError(error);
            })
            .finally(function () {
                button.disabled = false;
            });
    }

    button.addEventListener("click", startPlayback);
}

ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
});
