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
    setTabEvents();
    setInfoEvents();
    getComments();
    createMap();
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
    addCommentToDom(comments[i]);
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
    (comment, comment.commentText, comment.commentAuthor);

  // add the new elements to the comment Display
  commentDisplay.appendChild(el);
}

/**
 * @return HTML div element containing the comment with relevant information and styling
 */
function makeCommentElement(comment, text, author) {
  const commentElement = document.createElement("div");

  /**Class name to style all comment blocks */
  const COMMENT_CLASS = "comment";

  commentElement.classList.add(COMMENT_CLASS);

  commentElement.appendChild(makeDeleteButton(comment, commentElement));
  commentElement.appendChild(makeLocationButton(comment, commentElement));
  commentElement.appendChild(makeCommentAuthorElement(author));
  commentElement.appendChild(makeCommentTextElement(text));

  return commentElement;
}

/**
 * @return location button element
 */
 function makeLocationButton(comment, commentElement) {
   const button = document.createElement('div');
   button.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
   button.classList.add("locationTag");
   //TODO: add click event
   return button;
 }

/**
 * @return delete button element
 */
function makeDeleteButton(comment, commentElement) {
  const button = document.createElement('div');
  button.innerHTML = '<i class="far fa-trash-alt"></i>';
  button.classList.add("deleteButton");
  button.addEventListener('click', () => {
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
 * Inserts new comment into the comment Display
 */
function updateComments() {
  var commentText = clearFormValue("inputComment");
  var commentAuthor = clearFormValue("inputName");
  newMarker = null;
  if (validComment(commentText)) {
    const params = new URLSearchParams();
    params.append('comment-text', commentText);
    params.append('comment-author', commentAuthor);
    fetch('new-comment', {method: 'POST', body: params}).then(refreshComments);
  }
}

function refreshComments() {
    clearComments();
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
 * Deletes the given comment from the page and server
 */
function deleteComment (comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  fetch('/delete-comment', {method: 'POST', body:params}).then(refreshComments);
}

// MAP FUNCTIONS

function createMap() {
  const map = new google.maps.Map(
    document.getElementById('map'), 
      {center: {lat: 43.65, lng: -79.38}, zoom: 8});   
  loadMarkers(map); 
  setClickEvents(map);
}

function loadMarkers() {
  const toronto = {lat: 43.65, lng: -79.38};
  const marker = makeMarker(toronto, map); 
  //TODO: load markers from a servlet    
}

/**
 * @return the Marker object added to the map
 */
function makeMarker(latLng, map) {
  var marker = new google.maps.Marker({position: latLng, map: map});
  return marker;
}



function setClickEvents(map) {
  map.addListener('click', function(mouse) {
    const latLng = mouse.latLng;
    setCommentMarker(latLng, map);
    map.panTo(latLng);
  });
}

/**
 *Stores the most recently added marker to the map which has not
 *been uploaded to the server yet.
 */
var newMarker = null;

/**
 * Adds a marker to the map where clicked and removes the previous newMarker
 * when applicable
 */
function setCommentMarker(latLng, map) {
  if (newMarker) {
    newMarker.setMap(null);
  }
  newMarker = makeMarker(latLng, map)
}