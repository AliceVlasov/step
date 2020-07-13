// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Only begin setting event listeners once all the HTML is loaded
document.addEventListener('DOMContentLoaded', function() {
    setUp();
  }, false);

/** Class name for visible .tab and .tabContent objects*/
const TAB_SELECTED_CLASS = 'tabSelected';

/** Class name for .tab objects */
const TAB_CLASS = 'tab';

function setUp() {
    loadLogin();
    setTabEvents();
    setInfoEvents();
    createMap();
    getComments();
}

/** Removes or adds a class from an object's class list as required
 * @param {Element} el
 * @param {String} className
 * @param {boolean} toAdd Determines whether to add or remove className from el
 */
function toggleClass(el, className, toAdd) {
  toAdd? el.classList.add(className): el.classList.remove(className);
}

// TAB FEATURES

/** Adds click events with tab-switching feature to all tabs */
function setTabEvents() {
    /**Class name of all tabs that do not use the text or picture wrappers*/
    const SPECIAL_TAB = "special";
  
    var tabs = document.getElementsByClassName(TAB_CLASS);
    for (const tab of tabs) {
        tab.addEventListener("click", function() {
            if (prevSelectedTab().classList.contains(SPECIAL_TAB)) {
                toggleSpecialTab(/**showSpecial=*/ false);
            }
            if (this.classList.contains(SPECIAL_TAB)) {
                toggleSpecialTab(/**showSpecial=*/ true);
            }
            switchTabSelection(prevSelectedTab(), this);
        });
    }
} // setTabEvents

/**
 * @return {Element} Currently visible .tab object
 */
function prevSelectedTab() {
  return document.getElementsByClassName(TAB_CLASS+' '+TAB_SELECTED_CLASS)[0];
}

// INFO FEATURES
/**
 * Hides and reveals the wrappers for all tab content except for the special tab
 * @param {boolean} showGallery Whether or not to hide the tab content wrappers
 */
function toggleSpecialTab(showSpecial) {
  /** Class name for hidden tab content wrappers */
  const HIDDEN_WRAPPER_CLASS = 'wrapperHidden';

  /** ID of the container for all tab pictures except for the gallery tab */
  const PICTURE_WRAPPER_ID = 'pictureWrapper';
  let pictureWrapper = document.getElementById(PICTURE_WRAPPER_ID);

  /** ID of the container for all tab text except for the gallery tab */
  const TEXT_WRAPPER_ID = 'textWrapper';
  let textWrapper = document.getElementById(TEXT_WRAPPER_ID);

  if (showSpecial) {
    toggleClass(textWrapper, HIDDEN_WRAPPER_CLASS, /* addClass= */ true);
    toggleClass(pictureWrapper, HIDDEN_WRAPPER_CLASS, /* addClass= */ true);
  } else {
    toggleClass(textWrapper, HIDDEN_WRAPPER_CLASS, /* addClass= */ false);
    toggleClass(pictureWrapper, HIDDEN_WRAPPER_CLASS, /* addClass= */ false);
  }
}

/**
 * Hide current tab and its content and show the clicked tab and its content
 */
function switchTabSelection(tabToHide, tabToShow) {
  if (tabToHide === tabToShow) return;

  toggleTabContent(tabToHide, /* toShow= */ false);
  toggleTabContent(tabToShow, /* toShow= */ true);
}

/**
 * Removes or adds the tabSelected class from a tab and its content
 * @param {Element} tab
 * @param {boolean} toShow Whether or not the objects need to be revealed
 */
function toggleTabContent(tab, toShow) {
  let tabContent = getElementsByTitle(tab.getAttribute('title'));
  
  for (const elem of tabContent) {
    toggleClass(elem, TAB_SELECTED_CLASS, /* addClass= */ toShow);
  }
}

/**
 * @param {String} title Value of the title attribute being looked for
 * @return {[Element]} All elements with the given title
 */
function getElementsByTitle(title) {
  return document.querySelectorAll(`[title='${title}']`);
}

// INFO EVENTS

/** Sets animations when headers in each tab are clicked */
function setInfoEvents() {
  /** Class name for all objects with content that collapses */
  const GROUP_HEADER_CLASS = 'groupHeader';

  let infoHeaders = document.getElementsByClassName(GROUP_HEADER_CLASS);

  for (const header of infoHeaders) {
    header.addEventListener('click', function() {
      toggleGroupContent(this);
    });
  }
}

/** 
 * Changes the height of the content associated with the header to 0 or the 
 * height necessary to make all the text visible
 * @param {Element} header The object that was clicked
 */
function toggleGroupContent(header) {
  // The animation is triggered for elements with the 'active' attribute toggled
  header.classList.toggle('active');
  
  let content = getContent(header);
  
  if (content.style.maxHeight) {
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = `${content.scrollHeight}px`;
  }
}

/**@return {Element} The content associated with the header */
function getContent(header) {
  return header.nextElementSibling;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Servlet functions

/**
 * Fetches a message from the server and adds it to the DOM
 */
function getComments() {
  const comments = fetch(`/list-comments?vis=${getVis()}`);
  comments.then(response => response.json()).then((comments) => { 
            handleGivenComments(comments)
          });
}

/**
 * Handles the comments from the server by converting them to text and giving them to addNameToDom()
 */
function handleGivenComments(comments) {
  for (var i = 0; i < comments.length; i++) {
    const commentElement = addCommentToDom(comments[i]);
    loadMarker(comments[i], commentElement);
  }
}

/** Id of the element that contains all the visible comments*/
const COMMENTS_DISPLAY = "commentsDisplay";

/**
 * Adds the comment to the page
 */
function addCommentToDom(comment) {
  const commentDisplay = document.getElementById(COMMENTS_DISPLAY);
  const el = makeCommentElement
    (comment);

  // add the new elements to the comment Display
  commentDisplay.appendChild(el);
  return el;
}

/**
 * @return HTML div element containing the comment with relevant information and styling
 */
function makeCommentElement(comment) {
  const commentElement = document.createElement("div");

  /**Class name to style all comment blocks */
  const COMMENT_CLASS = "comment";

  commentElement.classList.add(COMMENT_CLASS);

  commentElement.appendChild(makeDeleteButton(comment, commentElement));
  commentElement.appendChild(makeLocationButton(comment, commentElement));
  commentElement.appendChild(makeCommentAuthorElement(comment.commentAuthor));
  commentElement.appendChild(makeCommentTextElement(comment.commentText));

  return commentElement;
}

/**
 * @return location button element
 */
 function makeLocationButton(comment, commentElement) {
   const button = document.createElement('div');
   button.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
   button.classList.add("locationTag");
   button.addEventListener('click', () => {
     selectCommentMarkerPair(comment.markerId, commentElement);
   });
   return button;
 }

  /**
   * Pans the map to this marker and highlights the comment Element
   */
 function selectCommentMarkerPair(markerId, commentElement) {
  const SELECTED_COMMENT = "selectedComment"
  //center this marker on the map
  const marker = permMarkers[`${markerId}`];
  MAP.panTo(marker.getPosition());

  const prevSelectedComment = 
    document.getElementsByClassName(SELECTED_COMMENT)[0];
    if (prevSelectedComment) {
      prevSelectedComment.classList.remove(SELECTED_COMMENT);
    }   
  commentElement.classList.add(SELECTED_COMMENT); 
  //TODO: make comments section scroll to this comment object;
 }


/**
 * @return delete button element
 */
function makeDeleteButton(comment, commentElement) {
  const button = document.createElement('div');
  button.innerHTML = '<i class="far fa-trash-alt"></i>';
  button.classList.add("deleteButton");
  button.addEventListener('click', () => {
    deleteMarker(comment.markerId);
    deleteComment(comment);
    commentElement.remove();
  });

  return button;
}

/**
 * @return HTML paragraph containing the comment text
 */
function makeCommentTextElement(text) {
  const commentText = document.createElement("p");
  commentText.innerText = `"${text}"`;

  /**Class name to style the comment text blocks */
  const COMMENT_TEXT = "commentText";
  commentText.classList.add(COMMENT_TEXT);

  return commentText;
}

/**
 * @return HTML paragraph containing the author's name
 */
function makeCommentAuthorElement(author) {
  const commentAuthor = document.createElement("p");
  commentAuthor.innerText = `@${author}`;

  /**Class name to style the comment author name */
  const COMMENT_AUTHOR = "commentAuthor";
  commentAuthor.classList.add(COMMENT_AUTHOR);

  return commentAuthor;
}

/**
 * Gets form input and uploads it to the servers
 */
function updateComments() { 
  //retrieve form values
  var commentText = clearFormValue("inputComment");
  var commentAuthor = clearFormValue("inputName");

  //TODO: replace loading map and comments with "loading..."
  if (!validComment(commentText)) {
    alert("invalid comment");
    return;
  }

  const latLng = tempMarker? tempMarker.getPosition(): DEFAULT_COORDS;

  const params = new URLSearchParams();
  params.append('lat', latLng.lat());
  params.append('lng', latLng.lng());
  params.append('visible', true);
  tempMarker.setMap(null);

  fetch('/markers', {method:'POST', body: params})
    .then(response => response.text()).then((idText) => {
      const markerId = parseInt(idText);
      uploadComment(markerId, commentText, commentAuthor);
    });
}

/**
 * uploads the values to the new-comment server
 */
function uploadComment(markerId, commentText, commentAuthor) {
  const params = new URLSearchParams();
  params.append('comment-text', commentText);
  params.append('comment-author', commentAuthor);
  params.append('marker-id', markerId);

  fetch('new-comment', {method: 'POST', body: params})
    .then(refreshComments);
}

/**
 * clears all displayed comments and adds back an updated list of comments
 */
function refreshComments() {
    clearComments();
    clearMarkers();
    getComments();
}

/**
 * @return If the comment is not blank
 */
function validComment(comment) {
  return !!comment;
}

/**
 * Clears and returns the form input element
 */
function clearFormValue(id) {
   const formInput = document.getElementById(id);
   const val = formInput.value;
   formInput.value = "";
   return val;
}

/**
 * @return the requested number of visible comments by the client
 */
function getVis() {
  const visSelect = document.getElementById("number");
  return visSelect.value;
}

/**
 * Deletes all existing commentelements
 */
function clearComments() {
  const commentDisplay = document.getElementById(COMMENTS_DISPLAY);
  var child = commentDisplay.lastElementChild;
  while (child) {
    commentDisplay.removeChild(child);
    child = commentDisplay.lastElementChild;
  }
}
/**
 * Removes all visible markers from the map and clears the permMarkers object
 */
function clearMarkers() {
  if (tempMarker) tempMarker.setMap(null);
  for (const id in permMarkers) {
    permMarkers[id].setMap(null);
    delete permMarkers[id];
  }
}

/**
 * Deletes the given comment from the page and server
 */
function deleteComment (comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  fetch('/delete-comment', {method: 'POST', body:params})
    .then(refreshComments);
}

/**
 * Deletes the given comment from the page and server
 */
function deleteMarker (markerId) {
  const marker = permMarkers[`${markerId}`];
  marker.setMap(null);

  const params = new URLSearchParams();
  params.append('id', markerId);
  fetch('/delete-marker', {method: 'POST', body:params});
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// MAP FUNCTIONS

/** The map object on the comments page*/
var MAP = null;

/**
 * Default coordinates to center the map and for comments with no
 * location tag 
 */
const DEFAULT_COORDS = {lat: 43.65, lng: -79.38};

/**
 * Makes an instance of a Map and sets map-related events
 */
function createMap() {
  MAP = new google.maps.Map(
    document.getElementById('map'), 
      {center: DEFAULT_COORDS, zoom: 8});     
  setMapClickEvents();
}

/**
 * Fetches the marker for this comment and adds it to the map
 */
function loadMarker(comment, commentElement) {
  const markerId = comment.markerId;
  const marker = fetch(`/markers?id=${markerId}`);
  marker.then(response => response.json()).then((marker) => { 
      makeMarker ({lat: marker.lat, lng: marker.lng}, 
        marker.visible, commentElement, markerId);
    });     
}

/**array to hold all the visible markers, their ids and Marker objects */
const permMarkers = {};

/**
 * @param {latLng} latLng coordinates of the marker
 * @param {boolean} visible whether or not the client should be able to interact with this marker
 * @param {HTML element} commentElement optional parameter indicating connected comment object
 * @param {long} id optional parameter to set marker id
 * @return the Marker object added to the map
 */
function makeMarker(latLng, visible, commentElement, markerId) {
  var marker = new google.maps.Marker({position: latLng, map: MAP});
  if (!visible) {
    marker.setOptions(new MarkerOptions().visible(false));
    marker.setClickable(false);
  }
  if (markerId) {
    permMarkers[`${markerId}`] = marker;
    marker.addListener("click", function() {
      selectCommentMarkerPair(markerId, commentElement);
    });
  }
  return marker;
}

/**
 * Allows client to click on the map repeatedly to choose on location
 * to tag to their comment
 */
function placeMarkerAndPanTo(latLng, map) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: map
  });
  map.panTo(latLng);
}

function setMapClickEvents() {
  MAP.addListener('click', function(e) {
    var coords = e.latLng;
    makeTempMarker(coords);
    MAP.panTo(coords);
  });
}

/**
 *Stores the most recently added marker to the map which has not
 *been uploaded to the server yet.
 */
var tempMarker = null;

/**
 * Adds a marker to the map where clicked and removes the previous tempMarker
 * when applicable
 */
function makeTempMarker(latLng) {
  if (tempMarker) {
    tempMarker.setMap(null);
  }
  tempMarker = makeMarker(latLng, /**visible=*/ true);
  tempMarker.setDraggable(true);

  // clicking on a temp marker deletes it from the map
  tempMarker.addListener("click", () => {
    tempMarker.setMap(null);
  });

  tempMarker.addListener('dragend', () => {
    MAP.panTo(tempMarker.getPosition());
  });
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// AUTHENTICATION FUNCTIONS

function loadLogin() {
  fetch("/login").then(response => response.json()).then((user) => {
    userCustomization(user);
  });
}

/**
 * responsible for change appearance and accessibility of website when logged it
 */
function userCustomization(user) {
  //TODO: keep form and delete button objects but disable them when logged out
  //TODO: opposite when logged in;
  if (user.loggedIn) {
    customizeWelcome(user.email, "Logout", user.toggleLoginURL);
  } else {
    customizeWelcome("Stranger", "Login", user.toggleLoginURL);
  }
  homeBody.innerHTML ("<p>Hello " + userEmail + "!</p>");
  response.getWriter().println("<p>Logout <a href=\"" + logoutUrl + "\">here</a>.</p>");
}

function customizeWelcome(email, linkText, url) {
  const welcome = document.getElementById("welcome");
  const loginArea = document.getElementById("loginArea");
  welcome.innerHTML = `<p>Hello ${email}!</p>`;
  loginArea.innerHTML = `<p>${linkText} <a href="${url}">here</a>.</p>`;
}