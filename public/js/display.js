// all functions related to

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
  const minutes = parseInt(seconds / 60)
  seconds = seconds % 60
  return stopwatch = Math.floor(minutes) + " minutes & " + Math.floor(seconds) + " seconds.";
}

function hideFlashcardDisplay() {
  setTimeout(function() {
    document.getElementById('flashcardDisplay').classList.add("hidden");
  }, 500)
};

function createStatsCard() {
  setTimeout(function() {
    const statsCard = document.createElement("div");
    statsCard.setAttribute("class", "statsCard");

    const title = document.createElement("h4");
    title.setAttribute("id", "statsTitle");
    title.innerHTML = "Statistics";

    const count = document.createElement("h4");
    count.setAttribute("id", "statsCount");
    count.innerHTML = "You got " + correctCount + " correct and " + incorrectCount + " incorrect.";

    const totalNumber = document.createElement("h4");
    totalNumber.setAttribute("id", "statsTotal");
    totalNumber.innerHTML = "Out of a total of " + totalNumberOfFlashcards

    const timerBlurb = document.createElement("h4");
    timerBlurb.setAttribute("id", "statsTimerBlurb");
    timerBlurb.innerHTML = "You completed this library in:"

    const timer = document.createElement("h4");
    timer.setAttribute("id", "statsTimer");
    timer.innerHTML = stopwatch;

    statsCard.appendChild(title);
    statsCard.appendChild(totalNumber);
    statsCard.appendChild(count);
    statsCard.appendChild(timerBlurb);
    statsCard.appendChild(timer)

    const flashcardDisplayDiv = document.getElementById("flashcardDisplay");

    document.getElementById("displaySection").insertBefore(statsCard, flashcardDisplayDiv);

  }, 500)
};

function waitForClick() {
  return new Promise(function(resolve, reject) {
    // an array of check button elements (correct and incorrect)
    checkButtons = document.getElementsByClassName("check")

    for (i = 0; i < checkButtons.length; i++) {

      checkButtons[i].addEventListener("click", function() {
        resolve();
      })
    }
  })
};

function flipAndHide() {
  document.getElementById('flashcardInner').classList.toggle("flip");
  document.getElementById('flipButton').classList.toggle("hidden");
  document.getElementById('correctButton').classList.toggle("hidden");
  document.getElementById('incorrectButton').classList.toggle("hidden");
  document.getElementById('checkMessage').classList.toggle("hidden");
  document.getElementById('hintDiv').classList.toggle("hidden");
};
