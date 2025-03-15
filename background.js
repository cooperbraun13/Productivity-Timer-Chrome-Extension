chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'showNotification') {
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'images/icon128.png',
                title: message.title || 'Productivity Timer',
                message: message.message || 'Timer Notification',
                priority: 2
            });
            sendResponse({success: true});
          } catch (error) {
            console.error('Notification error:', error);
            sendResponse({success: false, error: error.message});
          }
        }
        return true;
  });

  console.log('Productivity Timer background service has started');
  
  // Handle alarm for timer completion
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'timerComplete') {
      // This backup notification system ensures notifications even if popup is closed
      chrome.storage.local.get(['lastTimerType'], (result) => {
        if (result.lastTimerType === 'work') {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon128.png',
            title: 'Work Session Complete',
            message: 'Time for a break! Take some time to rest.',
            priority: 2
          });
        } else {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon128.png',
            title: 'Break Complete',
            message: 'Break time is over. Ready to focus again?',
            priority: 2
          });
        }
      });
    }
  });