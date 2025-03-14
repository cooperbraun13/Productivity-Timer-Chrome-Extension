# Productivity Timer Chrome Extension
A Pomodoro-style productivity timer Chrome extension with notifications to help you focus and take breaks at regular intervals.

## Features
* Work/break cycles based on the Pomodoro Technique
* Visual progress bar
* Desktop notifications when timers complete
* Customizable work, break, and long break durations
* Session tracking
* Pause and reset functionality
* Visual mode indicators

## Installation
1. Download or clone this repository
2. Open Chrome and navigate to chrome://extensions/
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and ready to use

## How to Use
1. Click on the extension icon in your toolbar to open the timer
2. Adjust the settings as needed:
    * Work minutes: Duration of your work/focus sessions
    * Break minutes: Duration of your short breaks
    * Long break minutes: Duration of your long breaks
    * Sessions before long break: Number of work sessions before a long break
3. Click "Start" to begin your timer
4. You'll receive a notification when it's time to take a break or return to work
5. Use "Pause" and "Reset" buttons as needed

## Customization
You can adjust the timer settings directly in the popup interface:
* Work duration (default: 25 minutes)
* Short break duration (default: 5 minutes)
* Long break duration (default: 15 minutes)
* Number of sessions before a long break (default: 4)
Your settings will be saved automatically.

## Files
* manifest.json: Extension configuration
* popup.html: Main timer interface
* popup.js: Timer functionality
* styles.css: Styling for the popup
* background.js: Background script for notifications
* images/: Directory containing icon files

## Credits
This extension was created to help boost productivity using the proven Pomodoro Technique.