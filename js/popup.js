// =======================================================================
// DOM
// =======================================================================

// Request section
var radioButtonsPeriod = document.getElementsByName('period');
var fromDate = document.getElementById('date-from');
var toDate = document.getElementById('date-to');
var btnSubmit = document.getElementById('btn-submit');
var btnTxt = document.getElementById('btn-txt');
var btnSpinner = document.getElementById('btn-spinner');

// Totals section
var hoursMaxTotal = document.getElementById('hours-max-total');

// =======================================================================
// VARIABLES
// =======================================================================
var periodSelected = getCheckedRadioButtonValue(radioButtonsPeriod);

// =======================================================================
// LISTENERS
// =======================================================================

// Executes the content.js file when the submit button is clicked and inserts
// the values for the dates if the user wants to calculate the hours based
// on a span of time
btnSubmit.onclick = function() {
  periodSelected = getCheckedRadioButtonValue(radioButtonsPeriod);
  if (periodSelected === 'period') {
    if (fromDate.value == '' || fromDate.value == null || toDate.value == '' || toDate == null) {
      alert('Dates required');
    } 
    else if (Date.parse(fromDate.value) > Date.parse(toDate.value)) {
      alert('Invalid period of time');
    }
    else {
      showHideBtnSpinner();
      var str = 'var isPeriod = true; var fromDate = ' + Date.parse(fromDate.value) + '; var toDate = ' + Date.parse(toDate.value) + ';';
      chrome.tabs.executeScript({code: str}, function() {
        chrome.tabs.executeScript({file: "./js/content.js"});
      });
    }
  } else {
    showHideBtnSpinner();
    var str = 'var isPeriod = false;';
    chrome.tabs.executeScript({code: str}, function() {
      chrome.tabs.executeScript({file: "./js/content.js"});
    });
  }
}

// Receives messages from the content.js and updates the data in the popup.html
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  showHideBtnSpinner();

  var hrsModules = message.totals.modules.hours;
  var hrsProjects = message.totals.projects.hours;
  var hrsMaxSuper = message.totals.superbadges.hours.max;
  var hrsMaxTotal = hrsModules + hrsProjects + hrsMaxSuper;

  hoursMaxTotal.innerHTML = hrsMaxTotal.toFixed(2);
});

// =======================================================================
// GUI
// =======================================================================

// Listener to control the UI (availability) of the inputs for the dates
// when the user wants to calculate the hours in a range of time
radioButtonsPeriod.forEach(function(e) {
  e.onclick = function() {
    periodSelected = getCheckedRadioButtonValue(radioButtonsPeriod);
    if (periodSelected === 'period') {
      fromDate.disabled = false;
      toDate.disabled = false;
    } else {
      fromDate.disabled = true;
      toDate.disabled = true;
    }
  }
});

// Controls the button text and spinner
function showHideBtnSpinner() {
  if (btnSpinner.hidden === true) {
    btnSubmit.disabled = true;
    btnTxt.hidden = true;
    btnSpinner.hidden = false;
  } else {
    btnSubmit.disabled = false;
    btnTxt.hidden = false;
    btnSpinner.hidden = true;
  }
}

// =======================================================================
// HELPERS
// =======================================================================

// Returns the checked radio button from a radio buttons group
function getCheckedRadioButtonValue(radioButtons) {
  var checked = null;
  radioButtons.forEach(function(e) {
    if (e.checked) {
      checked = e.value;
    }
  });
  return checked;
}