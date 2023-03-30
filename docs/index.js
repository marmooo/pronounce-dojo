const playPanel=document.getElementById("playPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),gameTime=120;let problems=[],left=[],right=[],replied=!1,answer="Gopher",firstRun=!0,englishVoices=[],correctCount=0,incorrectCount=0;const tmpCanvas=document.createElement("canvas"),audioContext=new AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3"),loadAudio("incorrect","mp3/incorrect1.mp3"),loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}async function playAudio(b,c){const d=await loadAudio(b,audioBufferCache[b]),a=audioContext.createBufferSource();if(a.buffer=d,c){const b=audioContext.createGain();b.gain.value=c,b.connect(audioContext.destination),a.connect(b),a.start()}else a.connect(audioContext.destination),a.start()}async function loadAudio(a,c){if(audioBufferCache[a])return audioBufferCache[a];const d=await fetch(c),e=await d.arrayBuffer(),b=await audioContext.decodeAudioData(e);return audioBufferCache[a]=b,b}function unlockAudio(){audioContext.resume()}function loadVoices(){const a=new Promise(b=>{let a=speechSynthesis.getVoices();if(a.length!==0)b(a);else{let c=!1;speechSynthesis.addEventListener("voiceschanged",()=>{c=!0,a=speechSynthesis.getVoices(),b(a)}),setTimeout(()=>{c||document.getElementById("noTTS").classList.remove("d-none")},1e3)}}),b=["com.apple.speech.synthesis.voice.Bahh","com.apple.speech.synthesis.voice.Albert","com.apple.speech.synthesis.voice.Hysterical","com.apple.speech.synthesis.voice.Organ","com.apple.speech.synthesis.voice.Cellos","com.apple.speech.synthesis.voice.Zarvox","com.apple.speech.synthesis.voice.Bells","com.apple.speech.synthesis.voice.Trinoids","com.apple.speech.synthesis.voice.Boing","com.apple.speech.synthesis.voice.Whisper","com.apple.speech.synthesis.voice.Deranged","com.apple.speech.synthesis.voice.GoodNews","com.apple.speech.synthesis.voice.BadNews","com.apple.speech.synthesis.voice.Bubbles"];a.then(a=>{englishVoices=a.filter(a=>a.lang=="en-US").filter(a=>!b.includes(a.voiceURI))})}loadVoices();function loopVoice(b,c){speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(b);a.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],a.lang="en-US";for(let b=0;b<c;b++)speechSynthesis.speak(a)}function respeak(){loopVoice(answer,1)}function resizeFontSize(a){function m(b,c){const a=tmpCanvas.getContext("2d");a.font=c;const d=a.measureText(b);return d.width}function k(g,c,d,e){const b=g.split("\n"),f=c+"px "+d;let a=0;for(let c=0;c<b.length;c++){const d=m(b[c],f);a<d&&(a=d)}return[a,c*b.length*e]}function j(a){const b=parseFloat(a.paddingLeft)+parseFloat(a.paddingRight),c=parseFloat(a.paddingTop)+parseFloat(a.paddingBottom);return[b,c]}const b=getComputedStyle(a),l=b.fontFamily,c=parseFloat(b.fontSize),i=parseFloat(b.lineHeight)/c,h=[a.parentNode.offsetWidth,a.parentNode.offsetHeight],d=k(a.textContent,c,l,i),e=j(b),f=c*(h[0]-e[0])/d[0]*.9,g=c*(h[1]-e[1])/d[1]*.9;g<f?a.style.fontSize=g+"px":a.style.fontSize=f+"px"}function getRandomInt(a,b){return a=Math.ceil(a),b=Math.floor(b),Math.floor(Math.random()*(b-a)+a)}function nextProblem(){const b=document.getElementById("searchButton");b.disabled=!0,setTimeout(()=>{b.disabled=!1},2e3);let a=problems[getRandomInt(0,problems.length-1)];Math.random()>.5?(left=a.slice(0,2),right=a.slice(2,4)):(left=a.slice(2,4),right=a.slice(0,2)),Math.random()>.5?a=a.slice(0,2):a=a.slice(2,4);const[c,d]=a,e=document.getElementById("cse-search-input-box-id");e.value=d,answer=c,loopVoice(answer,3),replied=!1}function initProblems(){const a=document.getElementById("grade").selectedIndex;fetch("data/"+a+".csv").then(a=>a.text()).then(a=>{problems=[],a.split("\n").forEach(a=>{if(!a)return;problems.push(a.split(","))})})}initProblems();function searchByGoogle(c){c.preventDefault();const d=document.getElementById("cse-search-input-box-id"),a=google.search.cse.element.getElement("result1"),b=google.search.cse.element.getElement("result2");return nextProblem(),d.value==""?(a.clearAllResults(),b.clearAllResults()):(a.execute(left[1]),b.execute(right[1])),firstRun&&(document.getElementById("aa1").remove(),document.getElementById("aa2").remove(),firstRun=!1),document.getElementById("en1").textContent=left[0],document.getElementById("ja1").textContent=left[1],document.getElementById("en2").textContent=right[0],document.getElementById("ja2").textContent=right[1],!1}function scoring(){playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),document.getElementById("correct").textContent=correctCount,document.getElementById("total").textContent=correctCount+incorrectCount}let gameTimer;function startGameTimer(){clearInterval(gameTimer);const a=document.getElementById("time");gameTimer=setInterval(()=>{const b=parseInt(a.textContent);b>0?a.textContent=b-1:(clearInterval(gameTimer),playAudio("end"),scoring())},1e3)}let countdownTimer;function countdown(){initTime(),clearTimeout(countdownTimer),countPanel.classList.remove("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const a=document.getElementById("counter");a.textContent=3,countdownTimer=setInterval(()=>{const b=["skyblue","greenyellow","violet","tomato"];if(parseInt(a.textContent)>1){const c=parseInt(a.textContent)-1;a.style.backgroundColor=b[c],a.textContent=c}else clearTimeout(countdownTimer),countPanel.classList.add("d-none"),playPanel.classList.remove("d-none"),correctCount=incorrectCount=0,startGameTimer(),document.getElementById("searchButton").classList.add("animate__heartBeat")},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function selectReply(b){const c=b.target.id.slice(-1)[0],a=document.getElementById("en"+c).textContent;firstRun||replied?loopVoice(a,1):(answer==a?(correctCount+=1,playAudio("correct")):(incorrectCount+=1,playAudio("incorrect")),replied=!0),document.getElementById("searchButton").classList.add("animate__heartBeat")}[...document.getElementById("problems").getElementsByClassName("aa")].forEach(a=>{resizeFontSize(a),window.addEventListener("resize",()=>{resizeFontSize(a)})}),document.getElementById("searchButton").addEventListener("animationend",a=>{a.target.classList.remove("animate__heartBeat")}),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("restartButton").onclick=countdown,document.getElementById("startButton").onclick=countdown,document.getElementById("respeak").onclick=respeak,document.getElementById("cse-search-box-form-id").onsubmit=searchByGoogle,document.getElementById("choice1").onclick=selectReply,document.getElementById("choice2").onclick=selectReply,document.getElementById("grade").onchange=initProblems,document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})