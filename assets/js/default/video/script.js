var hls = [];
jQuery(document).ready(function () {

  /** single video post page check if video element exist then initialize its content */
  var singleVideo = jQuery('#media-player');
  if (singleVideo.length) {
    var singlePlayer = createPlayer(singleVideo.get(0));
    var currentUrl = window.location.pathname;
    jQuery("body .post-module__content").on("click", "a", function (event) {
      if (this.pathname.toLowerCase() === currentUrl.toLowerCase()) {
        event.preventDefault();
        var time = getTimeFromUrl(this.search);
        if (time > 0) {
          singlePlayer.currentTime = time;
        }
      }
    });
  }

  /** replace wordpress shortcode with custom player*/
  jQuery('.media-player > video').each(function () {
    createPlayer(jQuery(this).get(0));
  });
  /** replace wordpress shortcode with custom player*/
  jQuery('.audio-player > audio').each(function () {
    createPlayer(jQuery(this).get(0), 'audio');
  });

  jQuery("body").on("click", ".plyr .player__quality-item", function () {
    var id = jQuery(this).attr("data-id");
    var value = jQuery(this).attr("value");
    var videoId = jQuery(this).parents(".plyr").find(".plyr__video-wrapper > video").attr('id');

    jQuery(this).siblings().attr("aria-checked", "false");
    jQuery(this).attr("aria-checked", "true");
    jQuery(this).parents(".plyr__menu__container").find("div[id$=home] > div[role=menu]  button:nth-child(2) .plyr__menu__value").html(value);
    hls[videoId].currentLevel = parseInt(id, 10);
  });

});

function streamAuto(streamObject, playerRoot = "") {
  if (!playerRoot) {
    return;
  }
  var defaultQualities = playerRoot.find("div[id$=quality] > div[role=menu] > *");

  if (defaultQualities.length) {
    defaultQualities.remove();
  }

  var qualityMenu = playerRoot.find("div[id$=quality] > div[role=menu]");
  var hlsQualities = streamObject.levels;

  if (typeof hlsQualities !== "undefined" && hlsQualities.constructor === Array) {
    var checked;
    var badge;
    playerRoot.find("div[id$=home] > div[role=menu]  button:nth-child(2) .plyr__menu__value").html("auto");
    playerRoot.find("div[id$=home] > div[role=menu]  button:nth-child(2)").removeAttr('hidden');
    jQuery.each(hlsQualities, function (index, quality) {
      if (index === streamObject.currentLevel) {
        checked = "true";
      }
      if (quality.height === 1080) {
        badge = "FHD";
      } else if (quality.height === 720) {
        badge = "HD";
      } else if (quality.height === 480) {
        badge = "SD";
      } else {
        badge = "";
      }
      qualityMenu.prepend(createButton(index, checked, quality.height, quality.height, badge));
    });
    qualityMenu.prepend(createButton(-1, "true", "auto", "auto", ""));
  }
}

function loadHls(video) {
  var id = video.id;
  var hlSource = video.getAttribute('data-src');
  if (Hls.isSupported() && hlSource) {
    hls[id] = new Hls({
      startPosition: -1,
      startLevel: -1,
      maxLoadingDelay: 6,
      maxBufferLength: 25,
      maxBufferSize: 90 * 1000 * 1000,
      maxBufferHole: 1,
      nudgeOffset: 0.2,
      nudgeMaxRetry: 10 });

    hls[id].attachMedia(video);
    hls[id].once(Hls.Events.MEDIA_ATTACHED, function () {
      this.loadSource(hlSource);
      this.once(Hls.Events.MANIFEST_PARSED, function (event, data) {
        var currentPlyr = jQuery("#" + id).parents(".plyr");
        streamAuto(this, currentPlyr);
      });
      this.on(Hls.Events.ERROR, function (event, data) {
        console.log(data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // try to recover network error
              console.log("fatal network error encountered, try to recover");
              this.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("fatal media error encountered, try to recover");
              this.recoverMediaError();
              break;
            default:
              console.log("cannot recover");
              break;}

        }
      });
    });
  }
}

function createButton(id, checked, value, text, badge) {
  var output = "";
  output += "<button data-plyr=\"quality\" data-id=\"" +
  id + "\" role=\"menuitemradio\" aria-checked=\"" + checked + "\" type=\"button\" class=\"plyr__control player__quality-item\" value=\"" +
  value + "\">";
  output += "<span class=\"plyr__quality-text\">" + text + "<span class=\"plyr__menu__value\">";
  if (badge) {
    output += "<span class=\"plyr__badge plyr__quality-badge\">" + badge + "</span>";
  }
  output += "</span></span></button>";
  return output;
}

function createPlayer(jsItem, type = "single") {
  var controls;
  if (type === "single") {
    controls = [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'settings',
    'pip',
    'fullscreen'];

  } else if (type === "audio") {
    controls = [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'settings'];

  } else if (type === "media-player") {
    controls = [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'settings',
    'fullscreen'];

  } else if (type === "carousel") {
    controls = [
    'play-large',
    'play',
    'progress',
    'fullscreen'];

  } else {
    controls = [
    'play-large',
    'play',
    'progress',
    'volume',
    'settings'];

  }

  var vPlayer = new Plyr(jsItem, {
    ratio: ['16:9'],
    clickToPlay: false,
    keyboard: { focused: true, global: true },
    controls: controls });


  loadHls(jsItem);


  vPlayer.on('loadeddata', function (event) {
    var mediaPlayer = jQuery("#media-player");
    if (mediaPlayer.length) {
      var time = getTimeFromUrl(location.search);
      console.log('Time', time);
      if (time > 0) {
        event.detail.plyr.currentTime = time;
      }
    }
  });

  vPlayer.on('exitfullscreen', function () {
    jQuery(this).removeClass('full-screen-stat');
  });

  vPlayer.on('enterfullscreen', function () {
    jQuery(this).addClass('full-screen-stat');
  });

  return vPlayer;
}

function getTimeFromUrl(url) {
  var time = 0;
  var urlParams = new URLSearchParams(url);
  if (urlParams.has('time')) {
    time = convertVideoTime(urlParams.get('time'));
  }

  return time;
}

function convertVideoTime(hms) {
  var split = hms.split(':');
  var seconds = 0;
  if (hms.length === 5) {
    seconds = +split[0] * 60 + +split[1];
  } else if (hms.length === 8) {
    seconds = +split[0] * 60 * 60 + +split[1] * 60 + +split[2];
  } else if (hms.length === 2) {
    seconds = hms;
  }
  return parseInt(seconds, 10);
}