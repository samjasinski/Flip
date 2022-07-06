function hintPopup() {
  var popup = document.getElementById("hintText");
  popup.classList.toggle("show");
}

function hintPopDown() {
  var popup = document.getElementById("hintText");
  popup.classList.toggle("show");
}

function stopwatch() {
  const endTimer = new Date();
  const timeDiffms = Math.abs(endTimer - startTimer);
  var seconds = timeDiffms / 1000;
  const minutes = parseInt(seconds/60)
  seconds = seconds % 60
  return stopwatch = Math.floor(minutes) + " minutes & " + Math.floor(seconds) + " seconds." ;
}
