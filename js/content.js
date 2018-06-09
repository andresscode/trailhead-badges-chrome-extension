// user details form identifiers and labels
var userDetails = {
  firstName: {
    key: 'user_first_name',
    label: 'First Name'
  },
  lastName: {
    key: 'user_last_name',
    label: 'Last Name'
  },
  company: {
    key: 'user_company',
    label: 'Company'
  }
};

/**
 * =====================================================================
 * PROGRAM SEQUENCE
 * =====================================================================
 */

// Getting user details. Badges will be added after, when the all of them
// have been shown clicking the expander button
var user = {
  trailheadId: getTrailheadId(),
  firstName: getUserDetails(userDetails.firstName),
  lastName: getUserDetails(userDetails.lastName),
  company: getUserDetails(userDetails.company),
  badges: []
};

// Getting the expander button referene (Show All/Show Less) to know
// if all the badges are shown to get their names
var btnShowAll = document.querySelector('a[tabindex="0"]');

// Checking if the expander is open, otherwise, click on it to make
// all badges visible
checkButtonExpanderStatus();

// Getting the badges earned that have points to count and hours
user.badges = getBadgesList();

// Synchronizing user data to server
syncUser(user);

// console.log(user);

// Send the totals of hours and points of Modules, Projects and Superbadges
// to the popup.js to be shown to the user
getTotals(user.badges);

/**
 * =====================================================================
 * HELPER FUNCTIONS FOR USER DATA
 * =====================================================================
 */

// Returns the user Id that is at the end of the URL
function getTrailheadId() {
  var url = location.href;
  var id = url.substr(url.lastIndexOf('/') + 1);
  // Checking if the URL contains a # at the end to remove it
  if (id.includes('#')) {
    return id.replace('#', '');
  } else {
    return id;
  }
}

function getUserDetails(value) {
  var form = document.querySelector('div[data-test-about-me]');
  var div = form.querySelector('div label[for="' + value.key + '"]');
  if (div !== null) {
    return div.parentNode.querySelector('span').textContent;
  } else {
    alert('Please enter your ' + value.label + ' in the About Me section');
  }
}

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
      var mouseover = simulateMouseEvent('mouseover', e);
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
              data.points = Number(e.textContent);
            }
            index++;
          });
          result.push(data);
        }
        // Mouseout from the actual badge to hide the expander button from the current target
        simulateMouseEvent('mouseout', e);
      } else {
        console.log('Error simulating mouse event');
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

// Looks for the user in the database to create or update it
function syncUser(user) {
  // Checking if the user is already created
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://trailheadbadges-api.herokuapp.com/users/search/findByTrailheadId?trailheadId=' + user.trailheadId, true);
  xhr.onload = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var payload = JSON.parse(xhr.responseText);
        saveUser('PUT', payload._links.self.href, user);
      } else if (xhr.status === 404) {
        saveUser('POST', 'https://trailheadbadges-api.herokuapp.com/users', user);
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function() {
    console.error(xhr.statusText);
  };
  xhr.send();
}

// Creates or updates an user
function saveUser(method, url, body) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onload = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // console.log('User updated correctly');
      } else if (xhr.status === 201) {
        // console.log('User created correctly');
      } 
      else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function() {
    console.error(xhr.statusText);
  };
  xhr.send(JSON.stringify(body));
}

/**
 * =====================================================================
 * HELPER FUNCTIONS FOR CALCULATING TOTALS
 * =====================================================================
 */

// By pass function to prepare the object that 
// will hold the data for the totals
function getTotals(badges) {
  var totals = {
    modules: {
      hours: 0,
      points: 0
    },
    projects: {
      hours: 0,
      points: 0
    },
    superbadges: {
      hours: {
        min: 0,
        max: 0
      },
      points: 0
    }
  };
  if (!isPeriod) {
    executeCallout(badges, totals);
  } else {
    executeCallout(filteredBadgesByPeriod(badges), totals);
  }
}

// Recursive function to add the totals and send the message to the popup.js
function executeCallout(badges, totals, index = 0) {
  if (index < badges.length) {
    var href = 'https://trailhead.salesforce.com' + badges[index].href;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://trailheadbadges-api.herokuapp.com/badges/search/findByHref?href=' + href, true);
    xhr.onload = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var badge = JSON.parse(xhr.responseText);
          if (badge.type === 'Module') {
            totals.modules.hours += badge.hours;
            totals.modules.points += badges[index].points;
          }
          if (badge.type === 'Project') {
            totals.projects.hours += badge.hours;
            totals.projects.points += badges[index].points;
          }
          if (badge.type === 'Superbadge') {
            totals.superbadges.hours.min += badge.hours.min;
            totals.superbadges.hours.max += badge.hours.max;
            totals.superbadges.points += badges[index].points;
          }
          executeCallout(badges, totals, index + 1);
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function() {
      console.error(xhr.statusText);
    };
    xhr.send(null);
  } else {
    // console.log(totals);
    chrome.runtime.sendMessage({
      totals: totals
    });
  }
}

// Filters a list of badges depending of a period of time
function filteredBadgesByPeriod(badges) {
  var result = [];

  badges.forEach(function(b) {
    var badgeDate = Date.parse(b.earned);
    if (badgeDate >= fromDate && badgeDate <= toDate) {
      result.push(b);
    }
  });

  return result;
}