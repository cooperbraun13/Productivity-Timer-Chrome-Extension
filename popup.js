let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let isPaused = false;
let isWorkMode = true;
let isLongBreakMode = false;
let totalTimeInSeconds = minutes * 60;
let remainingTimeInSeconds = totalTimeInSeconds;
let sessionsCompleted = 0;

// DOM elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const progressBar = document.getElementById('progress-bar');
const sessionCount = document.getElementById('session-count');
const modeText = document.getElementById('mode-text');
const modeIndicator = document.querySelector('.mode-indicator');

// Settings inputs
const workTimeInput = document.getElementById('work-time');
const breakTimeInput = document.getElementById('break-time');
const longBreakTimeInput = document.getElementById('long-break-time');
const sessionsBeforeLongBreakInput = document.getElementById('sessions-before-long-break');

// Load saved settings
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get([
    'workTime', 
    'breakTime', 
    'longBreakTime', 
    'sessionsBeforeLongBreak',
    'sessionsCompleted'
  ], (result) => {
    if (result.workTime) workTimeInput.value = result.workTime;
    if (result.breakTime) breakTimeInput.value = result.breakTime;
    if (result.longBreakTime) longBreakTimeInput.value = result.longBreakTime;
    if (result.sessionsBeforeLongBreak) sessionsBeforeLongBreakInput.value = result.sessionsBeforeLongBreak;
    if (result.sessionsCompleted) {
      sessionsCompleted = result.sessionsCompleted;
      sessionCount.textContent = result.sessionsCompleted;
    }
    
    updateTimer(workTimeInput.value, 0);
  });
});

// Save settings when changed
workTimeInput.addEventListener('change', saveSettings);
breakTimeInput.addEventListener('change', saveSettings);
longBreakTimeInput.addEventListener('change', saveSettings);
sessionsBeforeLongBreakInput.addEventListener('change', saveSettings);

function saveSettings() {
  chrome.storage.local.set({
    workTime: workTimeInput.value,
    breakTime: breakTimeInput.value,
    longBreakTime: longBreakTimeInput.value,
    sessionsBeforeLongBreak: sessionsBeforeLongBreakInput.value
  });
  
  if (!isRunning) {
    updateTimer(workTimeInput.value, 0);
  }
}

// Timer controls
startBtn.addEventListener('click', () => {
  if (!isRunning) {
    if (!isPaused) {
      // Start a new timer
      minutes = parseInt(workTimeInput.value);
      seconds = 0;
      totalTimeInSeconds = minutes * 60;
      remainingTimeInSeconds = totalTimeInSeconds;
      updateTimerDisplay();
    }
    
    startTimer();
    isRunning = true;
    isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // Disable settings inputs when timer is running
    workTimeInput.disabled = true;
    breakTimeInput.disabled = true;
    longBreakTimeInput.disabled = true;
    sessionsBeforeLongBreakInput.disabled = true;
  }
});

pauseBtn.addEventListener('click', () => {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
    isPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = 'Resume';
  }
});

resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  isRunning = false;
  isPaused = false;
  isWorkMode = true;
  isLongBreakMode = false;
  
  minutes = parseInt(workTimeInput.value);
  seconds = 0;
  totalTimeInSeconds = minutes * 60;
  remainingTimeInSeconds = totalTimeInSeconds;
  
  updateTimerDisplay();
  updateProgressBar(0);
  
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  startBtn.textContent = 'Start';
  
  // Enable settings inputs when timer is reset
  workTimeInput.disabled = false;
  breakTimeInput.disabled = false;
  longBreakTimeInput.disabled = false;
  sessionsBeforeLongBreakInput.disabled = false;
  
  updateModeIndicator();
});

function startTimer() {
  timer = setInterval(() => {
    if (remainingTimeInSeconds <= 0) {
      clearInterval(timer);
      handleTimerComplete();
      return;
    }
    
    remainingTimeInSeconds--;
    minutes = Math.floor(remainingTimeInSeconds / 60);
    seconds = remainingTimeInSeconds % 60;
    
    updateTimerDisplay();
    
    // Update progress bar
    const progress = 100 - (remainingTimeInSeconds / totalTimeInSeconds * 100);
    updateProgressBar(progress);
  }, 1000);
}

function updateTimerDisplay() {
  minutesDisplay.textContent = String(minutes).padStart(2, '0');
  secondsDisplay.textContent = String(seconds).padStart(2, '0');
}

function updateProgressBar(progress) {
  progressBar.style.width = `${progress}%`;
}

function updateTimer(mins, secs) {
  minutes = parseInt(mins);
  seconds = parseInt(secs);
  totalTimeInSeconds = minutes * 60 + seconds;
  remainingTimeInSeconds = totalTimeInSeconds;
  updateTimerDisplay();
  updateProgressBar(0);
}

function handleTimerComplete() {
  // Play notification sound
  const audio = new Audio('notification.mp3');
  audio.play();
  
  // Show notification
  if (isWorkMode) {
    // Work session complete
    sessionsCompleted++;
    sessionCount.textContent = sessionsCompleted;
    chrome.storage.local.set({ sessionsCompleted: sessionsCompleted });
    
    const sessionsBeforeLongBreak = parseInt(sessionsBeforeLongBreakInput.value);
    
    if (sessionsCompleted % sessionsBeforeLongBreak === 0) {
      // Time for a long break
      isWorkMode = false;
      isLongBreakMode = true;
      minutes = parseInt(longBreakTimeInput.value);
      
      chrome.runtime.sendMessage({
        type: 'showNotification',
        title: 'Work Session Complete',
        message: `Great job! Time for a long break (${minutes} minutes).`
      });
    } else {
      // Time for a regular break
      isWorkMode = false;
      isLongBreakMode = false;
      minutes = parseInt(breakTimeInput.value);
      
      chrome.runtime.sendMessage({
        type: 'showNotification',
        title: 'Work Session Complete',
        message: `Great job! Time for a short break (${minutes} minutes).`
      });
    }
  } else {
    // Break session complete
    isWorkMode = true;
    isLongBreakMode = false;
    minutes = parseInt(workTimeInput.value);
    
    chrome.runtime.sendMessage({
      type: 'showNotification',
      title: 'Break Complete',
      message: `Break time is over. Ready to focus again?`
    });
  }
  
  seconds = 0;
  totalTimeInSeconds = minutes * 60;
  remainingTimeInSeconds = totalTimeInSeconds;
  
  updateTimerDisplay();
  updateProgressBar(0);
  
  isRunning = false;
  isPaused = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  startBtn.textContent = 'Start';
  
  // Enable settings inputs when timer completes
  workTimeInput.disabled = false;
  breakTimeInput.disabled = false;
  longBreakTimeInput.disabled = false;
  sessionsBeforeLongBreakInput.disabled = false;
  
  updateModeIndicator();
}

function updateModeIndicator() {
  modeIndicator.classList.remove('break-mode', 'long-break-mode');
  
  if (isWorkMode) {
    modeText.textContent = 'Work Mode';
  } else if (isLongBreakMode) {
    modeText.textContent = 'Long Break Mode';
    modeIndicator.classList.add('long-break-mode');
  } else {
    modeText.textContent = 'Break Mode';
    modeIndicator.classList.add('break-mode');
  }
}

// Initialize
updateModeIndicator();