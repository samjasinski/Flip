const Library = require('../app');

// this has an issue with timing 
function getLibraries() {
  Library.find({}, function(err, foundItems) {
    if (foundItems.length == 0) {
      return [];
    } else {
      return foundItems;
    }
  });
}

// the reason it is in brackets is to allow multiple functions to potentially be exported later
module.exports = {
  getLibraries
}
