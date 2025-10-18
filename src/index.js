import { createWorker } from "https://cdn.jsdelivr.net/npm/emoji-particle@0.0.4/+esm";

const playPanel = document.getElementById("playPanel");
const countPanel = document.getElementById("countPanel");
const scorePanel = document.getElementById("scorePanel");
const searchButton = document.getElementById("searchButton");
const gameTime = 120;
const emojiParticle = initEmojiParticle();
const maxParticleCount = 10;
let gameTimer;
let problems = [];
let left = [];
let right = [];
let replied = false;
let answer = "Gopher";
let firstRun = true;
let englishVoices = [];
let consecutiveWins = 0;
let correctCount = 0;
let incorrectCount = 0;
const tmpCanvas = document.createElement("canvas");
let audioContext;
const audioBufferCache = {};
loadVoices();
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function createAudioContext() {
  if (globalThis.AudioContext) {
    return new globalThis.AudioContext();
  } else {
    console.error("Web Audio API is not supported in this browser");
    return null;
  }
}

function unlockAudio() {
  if (audioContext) {
    audioContext.resume();
  } else {
    audioContext = createAudioContext();
    loadAudio("end", "mp3/end.mp3");
    loadAudio("correct", "mp3/correct3.mp3");
    loadAudio("incorrect", "mp3/incorrect1.mp3");
  }
  document.removeEventListener("click", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}

async function loadAudio(name, url) {
  if (!audioContext) return;
  if (audioBufferCache[name]) return audioBufferCache[name];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache[name] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Loading audio ${name} error:`, error);
    throw error;
  }
}

function playAudio(name, volume) {
  if (!audioContext) return;
  const audioBuffer = audioBufferCache[name];
  if (!audioBuffer) {
    console.error(`Audio ${name} is not found in cache`);
    return;
  }
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  if (volume) gainNode.gain.value = volume;
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start();
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", () => {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  const jokeVoices = [
    // "com.apple.eloquence.en-US.Flo",
    "com.apple.speech.synthesis.voice.Bahh",
    "com.apple.speech.synthesis.voice.Albert",
    // "com.apple.speech.synthesis.voice.Fred",
    "com.apple.speech.synthesis.voice.Hysterical",
    "com.apple.speech.synthesis.voice.Organ",
    "com.apple.speech.synthesis.voice.Cellos",
    "com.apple.speech.synthesis.voice.Zarvox",
    // "com.apple.eloquence.en-US.Rocko",
    // "com.apple.eloquence.en-US.Shelley",
    // "com.apple.speech.synthesis.voice.Princess",
    // "com.apple.eloquence.en-US.Grandma",
    // "com.apple.eloquence.en-US.Eddy",
    "com.apple.speech.synthesis.voice.Bells",
    // "com.apple.eloquence.en-US.Grandpa",
    "com.apple.speech.synthesis.voice.Trinoids",
    // "com.apple.speech.synthesis.voice.Kathy",
    // "com.apple.eloquence.en-US.Reed",
    "com.apple.speech.synthesis.voice.Boing",
    "com.apple.speech.synthesis.voice.Whisper",
    "com.apple.speech.synthesis.voice.Deranged",
    "com.apple.speech.synthesis.voice.GoodNews",
    "com.apple.speech.synthesis.voice.BadNews",
    "com.apple.speech.synthesis.voice.Bubbles",
    // "com.apple.voice.compact.en-US.Samantha",
    // "com.apple.eloquence.en-US.Sandy",
    // "com.apple.speech.synthesis.voice.Junior",
    // "com.apple.speech.synthesis.voice.Ralph",
  ];
  allVoicesObtained.then((voices) => {
    englishVoices = voices
      .filter((voice) => voice.lang == "en-US")
      .filter((voice) => !jokeVoices.includes(voice.voiceURI));
  });
}

function loopVoice(text, n) {
  speechSynthesis.cancel();
  text = new Array(n).fill(`${text}.`).join(" ");
  const msg = new globalThis.SpeechSynthesisUtterance(text);
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

function respeak() {
  loopVoice(answer, 1);
}

function initEmojiParticle() {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed",
    pointerEvents: "none",
    top: "0px",
    left: "0px",
  });
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  document.body.appendChild(canvas);

  const offscreen = canvas.transferControlToOffscreen();
  const worker = createWorker();
  worker.postMessage({ type: "init", canvas: offscreen }, [offscreen]);

  globalThis.addEventListener("resize", () => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    worker.postMessage({ type: "resize", width, height });
  });
  return { canvas, offscreen, worker };
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
    const width = parseFloat(style.paddingLeft) +
      parseFloat(style.paddingRight);
    const height = parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom);
    return [width, height];
  }
  const style = getComputedStyle(node);
  const font = style.fontFamily;
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) / fontSize;
  // overflow: hidden; がないと動かない
  const nodeRect = [node.parentNode.offsetWidth, node.parentNode.offsetHeight];
  const textRect = getTextRect(node.textContent, fontSize, font, lineHeight);
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
  searchButton.disabled = true;
  setTimeout(() => {
    searchButton.disabled = false;
  }, 2000);
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
  loopVoice(answer, 3);
  replied = false;
}

async function initProblems() {
  const grade = document.getElementById("grade").selectedIndex;
  const response = await fetch("data/" + grade + ".csv");
  const csv = await response.text();
  problems = [];
  csv.split("\n").forEach((line) => {
    if (!line) return;
    problems.push(line.split(","));
  });
}

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
    const searchResults = document.getElementById("problems")
      .getElementsByClassName("searchResults");
    [...searchResults].forEach((node) => node.classList.remove("d-none"));
    firstRun = false;
  }
  document.getElementById("en1").textContent = left[0];
  document.getElementById("ja1").textContent = left[1];
  document.getElementById("en2").textContent = right[0];
  document.getElementById("ja2").textContent = right[1];
  return false;
}

function scoring() {
  document.getElementById("correct").textContent = correctCount;
  document.getElementById("total").textContent = correctCount + incorrectCount;
}

function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  gameTimer = setInterval(() => {
    const t = parseInt(timeNode.textContent);
    if (t > 0) {
      timeNode.textContent = t - 1;
    } else {
      clearInterval(gameTimer);
      playAudio("end");
      playPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
      scoring();
    }
  }, 1000);
}

function countdown() {
  loopVoice("Ready", 1); // unlock
  countPanel.classList.remove("d-none");
  playPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.textContent = 3;
  const timer = setInterval(() => {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearTimeout(timer);
      correctCount = incorrectCount = 0;
      consecutiveWins = 0;
      countPanel.classList.add("d-none");
      playPanel.classList.remove("d-none");
      startGameTimer();
      searchButton.classList.add("animate__heartBeat");
    }
  }, 1000);
}

function startGame() {
  initTime();
  countdown();
}

function initTime() {
  document.getElementById("time").textContent = gameTime;
}

function selectReply(event) {
  const id = event.currentTarget.id.slice(-1)[0];
  const reply = document.getElementById("en" + id).textContent;
  if (firstRun || replied) {
    loopVoice(reply, 1);
  } else {
    if (answer == reply) {
      correctCount += 1;
      consecutiveWins += 1;
      for (let i = 0; i < Math.min(consecutiveWins, maxParticleCount); i++) {
        emojiParticle.worker.postMessage({
          type: "spawn",
          options: {
            particleType: "popcorn",
            originX: Math.random() * emojiParticle.canvas.width,
            originY: Math.random() * emojiParticle.canvas.height,
          },
        });
      }
      playAudio("correct", 0.3);
    } else {
      incorrectCount += 1;
      consecutiveWins = 0;
      playAudio("incorrect", 0.3);
    }
    replied = true;
  }
  searchButton.classList.add("animate__heartBeat");
}

function resizeAA() {
  aas.forEach((aa) => {
    resizeFontSize(aa);
  });
}

await initProblems();

const aas = [
  ...document.getElementById("problems").getElementsByClassName("aa"),
];
searchButton.addEventListener("animationend", (event) => {
  event.target.classList.remove("animate__heartBeat");
});

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("restartButton").onclick = startGame;
document.getElementById("startButton").onclick = startGame;
document.getElementById("respeak").onclick = respeak;
document.getElementById("cse-search-box-form-id").onsubmit = searchByGoogle;
document.getElementById("choice1").onclick = selectReply;
document.getElementById("choice2").onclick = selectReply;
document.getElementById("grade").onchange = initProblems;
document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });
document.getElementById("searchButton").addEventListener("click", () => {
  globalThis.removeEventListener("resize", resizeAA);
});
globalThis.addEventListener("resize", resizeAA);
