// =======================================================================
// DOM
// =======================================================================
var radioButtonsPeriod = document.getElementsByName('period');
var fromDate = document.getElementById('date-from');
var toDate = document.getElementById('date-to');
var btnSubmit = document.getElementById('btn-submit');

// =======================================================================
// VARIABLES
// =======================================================================
var periodSelected = getCheckedRadioButtonValue(radioButtonsPeriod);

// =======================================================================
// LISTENERS
// =======================================================================

// Executes the content.js file when the submit button is clicked
btnSubmit.onclick = function() {
  chrome.tabs.executeScript({file: "./js/content.js"});
}

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