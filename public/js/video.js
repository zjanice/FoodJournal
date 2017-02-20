/* globals Dom7 */ 
(function(fj, $){
  'use strict';

  fj.Video = function() {
    let cameras = [];
    let currCameraIndex = 0;
    let constraints = {
        audio: true,
        video: {
          deviceId: ""
        }
      };
    let videoCanvas = $('video#gum');


    this.initialize = function() {
      return enumerateDevices()
        .then(startVideo);
    };

    this.flipCamera = function() {
      currCameraIndex += 1; 
      if (currCameraIndex >= cameras.length) {
        currCameraIndex = 0;
      }

      if (window.stream) {
        window.stream.getVideoTracks()[0].stop();
      }
      return startVideo();
    };

    function enumerateDevices() {
      return navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
          devices.forEach(function(device) {
            console.log(device);
            if (device.kind === "videoinput") {
              cameras.push(device.deviceId);
            }
          });
          console.log(cameras);
        });
    }

    function startVideo() {
      constraints.video.deviceId = cameras[currCameraIndex];
      return navigator.mediaDevices.getUserMedia(constraints)
        .then(handleSuccess).catch(handleError);
    }

    function handleSuccess(stream) {
      videoCanvas[0].srcObject = stream;
      window.stream = stream;
    }
    
    function handleError(error) {
      alert(error);
    }




    /*
    var mediaRecorder;
    var recordedBlobs;

    var gumVideo = document.querySelector('video#gum');
    var recordedVideo = document.querySelector('video#recorded');

    var recordButton = document.querySelector('button#record');
    var playButton = document.querySelector('button#play');
    var downloadButton = document.querySelector('button#download');

    recordButton.onclick = toggleRecording;
    playButton.onclick = play;
    downloadButton.onclick = download;

// window.isSecureContext could be used for Chrome
    var isSecureOrigin = location.protocol === 'https:' ||
      location.hostname === 'localhost';
    if (!isSecureOrigin) {
      alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
        '\n\nChanging protocol to HTTPS');
      location.protocol = 'HTTPS';
    }

    var front = false;
    document.getElementById('flip-button').onclick = function() { 
      front = !front; 
      var constraints = {
        audio: true,
        video: {
          facingMode: (front? "user" : "environment")
        }
      };
      navigator.mediaDevices.getUserMedia(constraints).
        then(handleSuccess).catch(handleError);
    };

    let frontCamera = "";
    let backCamera = "";

    var constraints = {
      audio: true,
      video: {
        deviceId: { exact: frontCamera }
      }
    };


    navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        devices.forEach(function(device) {
          alert(JSON.stringify(device));
          if (device.label.includes("front")) {
            frontCamera = device.deviceId;
            alert("Front Camera: " + frontCamera);
          } else if (device.label.includes("back")) {
            backCamera = device.deviceId;
            constraints.video.deviceId.exact = backCamera;

            navigator.mediaDevices.getUserMedia(constraints).
              then(handleSuccess).catch(handleError);

            alert("Back Camera: " + backCamera);
          }
        });
      });


    function handleSuccess(stream) {
      recordButton.disabled = false;
      console.log('getUserMedia() got stream: ', stream);
      window.stream = stream;
      if (window.URL) {
        gumVideo.src = window.URL.createObjectURL(stream);
      } else {
        gumVideo.src = stream;
      }
    }

    function handleError(error) {
  // console.log('navigator.getUserMedia error: ', error);
      alert(error);
    }

    function handleSourceOpen() {
      console.log('MediaSource opened');
      sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
      console.log('Source buffer: ', sourceBuffer);
    }

    recordedVideo.addEventListener('error', function(ev) {
      console.error('MediaRecording.recordedMedia.error()');
      alert('Your browser can not play\n\n' + recordedVideo.src + 
        '\n\n media clip. event: ' + JSON.stringify(ev));
    }, true);

    function handleDataAvailable(event) {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    }

    function handleStop(event) {
      console.log('Recorder stopped: ', event);
    }

    function toggleRecording() {
      if (recordButton.textContent === 'Start Recording') {
        startRecording();
      } else {
        stopRecording();
        recordButton.textContent = 'Start Recording';
        playButton.disabled = false;
        downloadButton.disabled = false;
      }
    }

    function startRecording() {
      recordedBlobs = [];
      var options = {mimeType: 'video/webm;codecs=vp9'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: 'video/webm;codecs=vp8'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.log(options.mimeType + ' is not Supported');
          options = {mimeType: 'video/webm'};
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log(options.mimeType + ' is not Supported');
            options = {mimeType: ''};
          }
        }
      }
      try {
        mediaRecorder = new MediaRecorder(window.stream, options);
      } catch (e) {
        console.error('Exception while creating MediaRecorder: ' + e);
        alert('Exception while creating MediaRecorder: ' + 
          e + '. mimeType: ' + options.mimeType);
        return;
      }
      console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
      recordButton.textContent = 'Stop Recording';
      playButton.disabled = true;
      downloadButton.disabled = true;
      mediaRecorder.onstop = handleStop;
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(10); // collect 10ms of data
      console.log('MediaRecorder started', mediaRecorder);
    }

    function stopRecording() {
      mediaRecorder.stop();
      console.log('Recorded Blobs: ', recordedBlobs);
      recordedVideo.controls = true;
    }

    function play() {
      var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
      recordedVideo.src = window.URL.createObjectURL(superBuffer);
    }

    function download() {
      var blob = new Blob(recordedBlobs, {type: 'video/webm'});
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'test.webm';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    }
//---------------------------CHANGE PROMPT- ----------------------------------
// var prompts = ["How is your meal? (size, appearance, flavour, texture)?",
//              "How is your eating environment? (setting, temperature, music, lighting, service)?",
//              "How are you feeling about your eating?"];
// var count = 0;
// function changeText() {
//     $("#prompt").text(prompts[count]);
//     count < 3 ? count++ : count = 0;
// }
// setInterval(changeText, 5000);

    (function() {
      var prompts = $(".prompts");
      var promptIndex = -1;
      function showNextPrompt() {
        ++promptIndex;
        prompts.eq(promptIndex % prompts.length)
          .fadeIn(3000)
          .delay(1000)
          .fadeOut(3000, showNextPrompt);
      }
      showNextPrompt();
    })();



//---------------------------GO FULL SCREEN ----------------------------------
// var goFS = document.getElementById("goFS");
// goFS.addEventListener("click", function() {
//     var videoElement = document.getElementById("gum");
//     videoElement.webkitRequestFullscreen();
// }, false);


//---------------------------COUNT DOWN --- ----------------------------------
// var promptButton = document.getElementById("prompt");
// var counter = 3;
// var newElement = document.createElement("p");
// newElement.innerHTML = "Point camera to the food";
// var id;
//
// promptButton.parentNode.replaceChild(newElement, promptButton);
//
// id = setInterval(function() {
//     counter--;
//     if(counter < 0) {
//         newElement.parentNode.replaceChild(promptButton, newElement);
//         clearInterval(id);
//     } else {
//       newElement.innerHTML = "Point camera to the food";
//         // newElement.innerHTML = "Point camera to the food" + counter.toString() + " seconds.";
//     }
// }, 1000);
//
    */


  };
})(window.fj = window.fj || {}, Dom7);