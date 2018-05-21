// Constants
var MOUSEOVER_EVENT = 'mouseover';
var MOUSEOUT_EVENT = 'mouseout';

// Getting the number of badges in the header to compare with 
// the count to be sure that all the badges were counted properly
var totalBadgesFromDOM = document.querySelector('div[data-test-badges-count]').innerHTML;

// Getting the expander button referene (Show All/Show Less) to know
// if all the badges are shown to get their names
var btnShowAll = document.querySelector('a[tabindex="0"]');

// Checking if the expander is open, otherwise, click on it to make
// all badges visible
checkButtonExpanderStatus();

// Getting the list of the badge's names to retrieve
// the hours data from the server
var myBadges = getBadgesList();

console.log(myBadges.length + ' badges');
var totalPoints = 0;
myBadges.forEach(function(b) {
  totalPoints += Number(b.points);
  console.log(b);
});
console.log(totalPoints + ' points');

/**
 * =====================================================================
 * Helper functions
 * =====================================================================
 */

// Checks if the button to expand the badges list is opened or closed.
// This button uses Show All as innerHTML text when is colapsed and 
// changes to Show Less when the button has been clicked and all the badges
// are visible to the user
function checkButtonExpanderStatus() {
  var labels = [
    'Show All',
    'Mostrar todo',
    'Alles anzeigen',
    'すべて表示',
    'Afficher tout',
    'Mostrar tudo'
  ];
  if (labels.includes(btnShowAll.innerHTML)) {
    btnShowAll.click();
  }
}

// Gets the href, earned and points of every badge as a list
function getBadgesList() {
  var result = [];

  // Getting every badge element from the DOM
  document
    .querySelectorAll('div[class="slds-is-relative slds-col slds-size_1-of-2 slds-medium-size_1-of-4"]')
    .forEach(function(e) {
      // Simulating a mouseover event over each badge element from the DOM
      // to reveal the values for the date and points of every badge
      var mouseover = simulateMouseEvent(MOUSEOVER_EVENT, e);
      if (mouseover) {
        // Reference of the button that displays the date and points info
        var btn = document.querySelector('button[class="slds-button slds-float_right th-button--dropdown"]');
        // Skipping special badges that has no date or points info
        if (btn !== null) {
          var data = {};
          data.href = e.querySelector('a').getAttribute('href');
          btn.click();
          // Array with the earned date (index = 0) and points (index = 1)
          var array = document.querySelectorAll('div[class="th-highlights-table__cell"]');
          var index = 0;
          array.forEach(function(e) {
            if (index === 0) {
              data.earned = e.textContent;
            } else {
              data.points = e.textContent;
            }
            index++;
          });
          result.push(data);
        }
        // Mouseout from the actual badge to hide the expander button from the current target
        simulateMouseEvent(MOUSEOUT_EVENT, e);
      } else {
        alert('Something went wrong');
      }
    });

  return result;
}

// Simulate a mouse event and returns the event
function simulateMouseEvent(type, target) {
  var event = new MouseEvent(type, {
    view: window,
    bubbles: true,
    cancelable: true
  });
  return target.dispatchEvent(event);
}