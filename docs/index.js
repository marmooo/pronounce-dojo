const playPanel=document.getElementById("playPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),searchButton=document.getElementById("searchButton"),gameTime=120;let gameTimer,problems=[],left=[],right=[],replied=!1,answer="Gopher",firstRun=!0,englishVoices=[],correctCount=0,incorrectCount=0;const tmpCanvas=document.createElement("canvas"),audioContext=new globalThis.AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3"),loadAudio("incorrect","mp3/incorrect1.mp3"),loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}async function playAudio(e,t){const s=await loadAudio(e,audioBufferCache[e]),n=audioContext.createBufferSource();if(n.buffer=s,t){const e=audioContext.createGain();e.gain.value=t,e.connect(audioContext.destination),n.connect(e),n.start()}else n.connect(audioContext.destination),n.start()}async function loadAudio(e,t){if(audioBufferCache[e])return audioBufferCache[e];const s=await fetch(t),o=await s.arrayBuffer(),n=await audioContext.decodeAudioData(o);return audioBufferCache[e]=n,n}function unlockAudio(){audioContext.resume()}function loadVoices(){const e=new Promise(e=>{let t=speechSynthesis.getVoices();if(t.length!==0)e(t);else{let n=!1;speechSynthesis.addEventListener("voiceschanged",()=>{n=!0,t=speechSynthesis.getVoices(),e(t)}),setTimeout(()=>{n||document.getElementById("noTTS").classList.remove("d-none")},1e3)}}),t=["com.apple.speech.synthesis.voice.Bahh","com.apple.speech.synthesis.voice.Albert","com.apple.speech.synthesis.voice.Hysterical","com.apple.speech.synthesis.voice.Organ","com.apple.speech.synthesis.voice.Cellos","com.apple.speech.synthesis.voice.Zarvox","com.apple.speech.synthesis.voice.Bells","com.apple.speech.synthesis.voice.Trinoids","com.apple.speech.synthesis.voice.Boing","com.apple.speech.synthesis.voice.Whisper","com.apple.speech.synthesis.voice.Deranged","com.apple.speech.synthesis.voice.GoodNews","com.apple.speech.synthesis.voice.BadNews","com.apple.speech.synthesis.voice.Bubbles"];e.then(e=>{englishVoices=e.filter(e=>e.lang=="en-US").filter(e=>!t.includes(e.voiceURI))})}loadVoices();function loopVoice(e,t){speechSynthesis.cancel();const n=new globalThis.SpeechSynthesisUtterance(e);n.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],n.lang="en-US";for(let e=0;e<t;e++)speechSynthesis.speak(n)}function respeak(){loopVoice(answer,1)}function resizeFontSize(e){function c(e,t){const n=tmpCanvas.getContext("2d");n.font=t;const s=n.measureText(e);return s.width}function l(e,t,n,s){const o=e.split(`
`),a=t+"px "+n;let i=0;for(let e=0;e<o.length;e++){const t=c(o[e],a);i<t&&(i=t)}return[i,t*o.length*s]}function d(e){const t=parseFloat(e.paddingLeft)+parseFloat(e.paddingRight),n=parseFloat(e.paddingTop)+parseFloat(e.paddingBottom);return[t,n]}const t=getComputedStyle(e),u=t.fontFamily,n=parseFloat(t.fontSize),h=parseFloat(t.lineHeight)/n,s=[e.parentNode.offsetWidth,e.parentNode.offsetHeight],o=l(e.textContent,n,u,h),i=d(t),a=n*(s[0]-i[0])/o[0]*.9,r=n*(s[1]-i[1])/o[1]*.9;r<a?e.style.fontSize=r+"px":e.style.fontSize=a+"px"}function getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e)+e)}function nextProblem(){searchButton.disabled=!0,setTimeout(()=>{searchButton.disabled=!1},2e3);let e=problems[getRandomInt(0,problems.length-1)];Math.random()>.5?(left=e.slice(0,2),right=e.slice(2,4)):(left=e.slice(2,4),right=e.slice(0,2)),Math.random()>.5?e=e.slice(0,2):e=e.slice(2,4);const[t,n]=e,s=document.getElementById("cse-search-input-box-id");s.value=n,answer=t,loopVoice(answer,3),replied=!1}function initProblems(){const e=document.getElementById("grade").selectedIndex;fetch("data/"+e+".csv").then(e=>e.text()).then(e=>{problems=[],e.split(`
`).forEach(e=>{if(!e)return;problems.push(e.split(","))})})}initProblems();function searchByGoogle(e){e.preventDefault();const s=document.getElementById("cse-search-input-box-id"),t=google.search.cse.element.getElement("result1"),n=google.search.cse.element.getElement("result2");if(nextProblem(),s.value==""?(t.clearAllResults(),n.clearAllResults()):(t.execute(left[1]),n.execute(right[1])),firstRun){document.getElementById("aa1").remove(),document.getElementById("aa2").remove();const e=document.getElementById("problems").getElementsByClassName("searchResults");[...e].forEach(e=>e.classList.remove("d-none")),firstRun=!1}return document.getElementById("en1").textContent=left[0],document.getElementById("ja1").textContent=left[1],document.getElementById("en2").textContent=right[0],document.getElementById("ja2").textContent=right[1],!1}function scoring(){document.getElementById("correct").textContent=correctCount,document.getElementById("total").textContent=correctCount+incorrectCount}function startGameTimer(){clearInterval(gameTimer);const e=document.getElementById("time");gameTimer=setInterval(()=>{const t=parseInt(e.textContent);t>0?e.textContent=t-1:(clearInterval(gameTimer),playAudio("end"),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),scoring())},1e3)}function countdown(){correctCount=incorrectCount=0,countPanel.classList.remove("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const e=document.getElementById("counter");e.textContent=3;const t=setInterval(()=>{const n=["skyblue","greenyellow","violet","tomato"];if(parseInt(e.textContent)>1){const t=parseInt(e.textContent)-1;e.style.backgroundColor=n[t],e.textContent=t}else clearTimeout(t),countPanel.classList.add("d-none"),playPanel.classList.remove("d-none"),startGameTimer(),searchButton.classList.add("animate__heartBeat")},1e3)}function startGame(){initTime(),countdown()}function initTime(){document.getElementById("time").textContent=gameTime}function selectReply(e){const n=e.target.id.slice(-1)[0],t=document.getElementById("en"+n).textContent;firstRun||replied?loopVoice(t,1):(answer==t?(correctCount+=1,playAudio("correct",.3)):(incorrectCount+=1,playAudio("incorrect",.3)),replied=!0),searchButton.classList.add("animate__heartBeat")}function resizeAA(){aas.forEach(e=>{resizeFontSize(e)})}const aas=[...document.getElementById("problems").getElementsByClassName("aa")];searchButton.addEventListener("animationend",e=>{e.target.classList.remove("animate__heartBeat")}),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("restartButton").onclick=startGame,document.getElementById("startButton").onclick=startGame,document.getElementById("respeak").onclick=respeak,document.getElementById("cse-search-box-form-id").onsubmit=searchByGoogle,document.getElementById("choice1").onclick=selectReply,document.getElementById("choice2").onclick=selectReply,document.getElementById("grade").onchange=initProblems,document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0}),document.getElementById("searchButton").addEventListener("click",()=>{globalThis.removeEventListener("resize",resizeAA)}),globalThis.addEventListener("resize",resizeAA)