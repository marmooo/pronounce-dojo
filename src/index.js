const gameTime = 120;
let problems = [];
let left = [];
let right = [];
let replied = false;
let answer = "Gopher";
let firstRun = true;
let englishVoices = [];
let correctCount = incorrectCount = 0;
const tmpCanvas = document.createElement("canvas");
let endAudio, incorrectAudio, correctAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("mp3/end.mp3"),
    loadAudio("mp3/incorrect1.mp3"),
    loadAudio("mp3/correct3.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    endAudio = audioBuffers[0];
    incorrectAudio = audioBuffers[1];
    correctAudio = audioBuffers[2];
  });
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function (resolve) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      speechSynthesis.addEventListener("voiceschanged", function () {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
    }
  });
  allVoicesObtained.then((voices) => {
    englishVoices = voices.filter((voice) => voice.lang == "en-US");
  });
}
loadVoices();

function loopVoice(text, n) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = "en-US";
  for (let i = 0; i < n; i++) {
    speechSynthesis.speak(msg);
  }
}

function respeak() {
  loopVoice(answer, 1);
}

function resizeFontSize(node) {
  // https://stackoverflow.com/questions/118241/
  function getTextWidth(text, font) {
    // re-use canvas object for better performance
    // const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = tmpCanvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  function getTextRect(text, fontSize, font, lineHeight) {
    const lines = text.split("\n");
    const fontConfig = fontSize + "px " + font;
    let maxWidth = 0;
    for (let i = 0; i < lines.length; i++) {
      const width = getTextWidth(lines[i], fontConfig);
      if (maxWidth < width) {
        maxWidth = width;
      }
    }
    return [maxWidth, fontSize * lines.length * lineHeight];
  }
  function getPaddingRect(style) {
    const width = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const height = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    return [width, height];
  }
  const style = getComputedStyle(node);
  const font = style.fontFamily;
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) / fontSize;
  // overflow: hidden; がないと動かない
  const nodeRect = [node.parentNode.offsetWidth, node.parentNode.offsetHeight];
  const textRect = getTextRect(node.innerText, fontSize, font, lineHeight);
  const paddingRect = getPaddingRect(style);

  // https://stackoverflow.com/questions/46653569/
  // Safariで正確な算出ができないので誤差ぶんだけ縮小化 (10%)
  const rowFontSize = fontSize * (nodeRect[0] - paddingRect[0]) / textRect[0] *
    0.90;
  const colFontSize = fontSize * (nodeRect[1] - paddingRect[1]) / textRect[1] *
    0.90;
  if (colFontSize < rowFontSize) {
    node.style.fontSize = colFontSize + "px";
  } else {
    node.style.fontSize = rowFontSize + "px";
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function nextProblem() {
  let problem = problems[getRandomInt(0, problems.length - 1)];
  if (Math.random() > 0.5) {
    left = problem.slice(0, 2);
    right = problem.slice(2, 4);
  } else {
    left = problem.slice(2, 4);
    right = problem.slice(0, 2);
  }
  if (Math.random() > 0.5) {
    problem = problem.slice(0, 2);
  } else {
    problem = problem.slice(2, 4);
  }
  const [en, ja] = problem;
  const input = document.getElementById("cse-search-input-box-id");
  input.value = ja;
  answer = en;
  if (localStorage.getItem("voice") != 0) {
    loopVoice(answer, 3);
  }
  replied = false;
}

function initProblems() {
  const grade = document.getElementById("grade").selectedIndex;
  fetch(grade + ".csv").then((response) => response.text()).then((csv) => {
    problems = [];
    csv.split("\n").forEach((line) => {
      if (!line) return;
      problems.push(line.split(","));
    });
  });
}
initProblems();

function searchByGoogle(event) {
  event.preventDefault();
  const input = document.getElementById("cse-search-input-box-id");
  const element1 = google.search.cse.element.getElement("result1");
  const element2 = google.search.cse.element.getElement("result2");
  nextProblem();
  if (input.value == "") {
    element1.clearAllResults();
    element2.clearAllResults();
  } else {
    element1.execute(left[1]);
    element2.execute(right[1]);
  }
  if (firstRun) {
    document.getElementById("aa1").remove();
    document.getElementById("aa2").remove();
    firstRun = false;
  }
  document.getElementById("en1").textContent = left[0];
  document.getElementById("ja1").textContent = left[1];
  document.getElementById("en2").textContent = right[0];
  document.getElementById("ja2").textContent = right[1];
  return false;
}

function scoring() {
  playPanel.classList.add("d-none");
  scorePanel.classList.remove("d-none");
  document.getElementById("correct").textContent = correctCount;
  document.getElementById("total").textContent = correctCount + incorrectCount;
}

let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  timeNode.innerText = gameTime + "秒 / " + gameTime + "秒";
  gameTimer = setInterval(function () {
    const arr = timeNode.innerText.split("秒 /");
    const t = parseInt(arr[0]);
    if (t > 0) {
      timeNode.innerText = (t - 1) + "秒 /" + arr[1];
    } else {
      clearInterval(gameTimer);
      playAudio(endAudio);
      scoring();
    }
  }, 1000);
}

let countdownTimer;
function countdown() {
  clearTimeout(countdownTimer);
  gameStart.classList.remove("d-none");
  playPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.innerText = 3;
  countdownTimer = setInterval(function () {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.innerText) > 1) {
      const t = parseInt(counter.innerText) - 1;
      counter.style.backgroundColor = colors[t];
      counter.innerText = t;
    } else {
      clearTimeout(countdownTimer);
      gameStart.classList.add("d-none");
      playPanel.classList.remove("d-none");
      correctCount = incorrectCount = 0;
      startGameTimer();
    }
  }, 1000);
}

function selectReply() {
  const reply = this.firstElementChild.textContent;
  if (firstRun || replied) {
    loopVoice(reply, 1);
  } else {
    if (answer == reply) {
      correctCount += 1;
      playAudio(correctAudio);
    } else {
      incorrectCount += 1;
      playAudio(incorrectAudio);
    }
    replied = true;
  }
  document.getElementById("searchButton").classList.add("animate__heartBeat");
}

[...document.getElementById("problems").getElementsByClassName("aa")].forEach(
  (aa) => {
    resizeFontSize(aa);
    window.addEventListener("resize", function () {
      resizeFontSize(aa);
    });
  },
);
document.getElementById("searchButton").addEventListener(
  "animationend",
  function () {
    this.classList.remove("animate__heartBeat");
  },
);

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("restartButton").onclick = countdown;
document.getElementById("startButton").onclick = countdown;
document.getElementById("respeak").onclick = respeak;
document.getElementById("cse-search-box-form-id").onsubmit = searchByGoogle;
document.getElementById("choice1").onclick = selectReply;
document.getElementById("choice2").onclick = selectReply;
document.getElementById("grade").onchange = initProblems;
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
