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

/**The user entity containing the current user's id and nickname */
var user;

/**Retrieves the current user's information and sets up the page */
function setUp() {
    fetch("/user-login")
      .then(response => response.json())
      .then(currUser => user = currUser)
      .then(userCustomization)
      .then(setContent);
}

/**Sets the page's event listeners and loads markers and comments */
function setContent() {
    setTabEvents();
    setInfoEvents();
    setFormEvents();
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
 * Fetches a user-requested number of comments from the server 
 * and displays them on the website
 */
function getComments() {
  fetch(`/list-comments?vis=${getVis()}`)
      .then(response => response.json())
      .then((comments) => { 
        handleGivenComments(comments);
      });
}

/**
 * Parses the comment object from the server, retrieves the author's nickname
 * and then creates and displays the comment's elements and marker
 */
function handleGivenComments(comments) {
  for (var i = 0; i < comments.length; i++) {
    const comment = comments[i];
    fetch(`/get-user?id=${comment.userId}`)
      .then(response => response.json())
      .then(author => addCommentToDom(author.nickname, comment))
      .then(el => loadMarker(comment, el));
  }
}

/** Id of the element that contains all the visible comments*/
const COMMENTS_DISPLAY = "commentsDisplay";

/**
 * Adds the comment with author's nickname, location tag, and edit and delete
 * buttons when applicable to the DOM
 */
function addCommentToDom(author, comment) {
  const commentDisplay = document.getElementById(COMMENTS_DISPLAY);
  const commentElement = document.createElement("div");

  /**Class name to style all comment blocks */
  const COMMENT_CLASS = "comment";

  commentElement.classList.add(COMMENT_CLASS);

  let addElement = function(el) {commentElement.appendChild(el)}; 
  var userComment = false;
  if (user.loggedIn && comment.userId === user.id) {
    addElement(makeDeleteButton(comment, commentElement));
    addElement(makeEditButton(author, comment, commentElement));
    userComment = true;
   }

  
  addElement(makeLocationButton(comment, commentElement));
  addElement(makeCommentAuthorElement(author, userComment));
  addElement(makeCommentTextElement(comment.commentText));

  commentDisplay.appendChild(commentElement);
  return commentElement;
}

/**
 * @return location button element
 */
 function makeLocationButton(comment, commentElement) {
   const button = document.createElement('div');
   
   //insert location tag icon
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
  
  const marker = getMarker(markerId);
  MAP.panTo(marker.getPosition());

  const prevSelectedComment = 
    document.getElementsByClassName(SELECTED_COMMENT)[0];
    
  if (prevSelectedComment) {
    prevSelectedComment.classList.remove(SELECTED_COMMENT);
  }   

  if (prevSelectedComment !== commentElement) {
    commentElement.classList.add(SELECTED_COMMENT); 
  }
  //TODO: make comments section scroll to this comment object;
 }


/**
 * @return delete button element
 */
function makeDeleteButton(comment, commentElement) {
  const button = document.createElement('div');
  
  //insert delete icon
  button.innerHTML = '<i class="far fa-trash-alt"></i>';
  
  button.classList.add("deleteButton");
  button.addEventListener('click', () => {
    deleteCommentElements(comment, commentElement);
  });
  return button;
}

/**
 * When clicked, the edit button needs to modify the comment
 * element so the client can see that it is currently being
 * edited, replace the permanent marker with a temporary one,
 * and get the comment details and put them in the form.
 * @return edit button element
 */
function makeEditButton(author, comment, commentElement) {
  const button = document.createElement('div');
  button.innerHTML = '<i class="fas fa-pencil-alt"></i>';
  button.classList.add("editButton");

  button.addEventListener('click', () => {
    setEditingState(comment, commentElement);
    makeTempMarker(getMarker(comment.markerId).getPosition());
    deleteMarker(comment.markerId);
    setFormContent(author, comment.commentText);
  });

  return button;
}

/**Stores the comment object being edited */
var editedComment;

/**
 * Formats the comment element so the client can see it is
 * being edited and stores the commment object in editedComment
 * for use in updateComments()
 */
function setEditingState(comment, commentElement) {
  commentElement.id = "editing";
  commentElement.lastElementChild.innerText="editing...";
  const nameInput = document.getElementById("inputName");
  nameInput.value = user.nickname;
  editedComment = comment;
}

/**
 * @return the Marker object with the given id 
 */
function getMarker(markerId) {
  return permMarkers[`${markerId}`];
}

/**
 * Add comment text and author name to the form
 */
function setFormContent(author, commentText) {
  const form = document.getElementById("inputComment");
  form.value = commentText;
  const inputAuthor = document.getElementById("inputName");
  inputAuthor.value = author;
}

/**
 * Deletes the marker, marker entity, comment entity, and comment element
 * associated with the clicked comment
 */
function deleteCommentElements(comment, commentElement) {
  commentElement.remove();
  const marker = getMarker(comment.markerId);
  marker.setMap(null);
  deleteMarker(comment.markerId);
  deleteComment(comment);
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
 * @return HTML paragraph containing the author's name, and "(Me)"
 * if this is the user's comment
 */
function makeCommentAuthorElement(author, isUserComment) {
  const authorElement = document.createElement("p");
  const authorFormat = `@${author}`;
  if (isUserComment) {
    authorElement.innerText = authorFormat+` (Me)`;
    authorElement.classList.add("myComment");
  } else {
    authorElement.innerText = authorFormat;
    authorElement.classList.add("commentAuthor");
  }
      
  return authorElement;
}

/**
 * Sets submit functionality to the form
 */
function setFormEvents() {
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.addEventListener("click", function() {
    updateComments();
  });
}

/**
 * Gets form input and uploads a new marker and, if a comment is not being
 * edited, a new comment as well
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
  
  var isCustomMarker = true;
  
  //get the temp marker position or default position if the client did not 
  // choose a location on the map
  if (!tempMarker) {
    tempMarker = new google.maps.Marker({position:DEFAULT_COORDS, map:MAP});
    isCustomMarker = false;
  }

  var latLng = tempMarker.getPosition();

  // prep the new marker Entity parameters and remove the temp marker
  const params = new URLSearchParams();
  params.append('lat', latLng.lat());
  params.append('lng', latLng.lng());
  params.append('visible', isCustomMarker); 
  tempMarker.setMap(null);

  //post the marker to the servlet and get it's id to upload with the comment
  fetch('/markers', {method:'POST', body: params})
    .then(response => response.text())
    .then((idText) => {
      const markerId = parseInt(idText);
      // check if this form submission is intended to edit an existing comment
      if (editedComment) {
        editComment(markerId, commentText, commentAuthor);
      } else {
        uploadNewComment(markerId, commentText, commentAuthor);
      }
    });
}

/**
 * Removes "editing" state from the editedComment and updates the comment 
 * entity in datastore
 */
function editComment(markerId, commentText, commentAuthor) {
  const commentTextElement = document.getElementById("editing");
  commentTextElement.removeAttribute("id");

  const params = new URLSearchParams();
  params.append('comment-text', commentText);
  params.append('marker-id', markerId);
  params.append('id', editedComment.id);
  editedComment = null;

  postCommentToServlet('/edit-comment', params, commentAuthor);
}

/**
 * uploads a new comment with given parameters to the servlet
 */
function uploadNewComment(markerId, commentText, commentAuthor) {
  const params = new URLSearchParams();
  params.append('comment-text', commentText);
  params.append('user-id', user.id);
  params.append('marker-id', markerId);

  postCommentToServlet('/new-comment', params, commentAuthor);
}

/**
 * Posts the given comment information to the given servlet,
 * and updates the user's nickname appropriately
 */
function postCommentToServlet(servlet, params, commentAuthor) {
    fetch(servlet, {method: 'POST', body: params})
    .then(() => {
      if (user.nickname != commentAuthor) {
        updateNickname(commentAuthor);
      }
      refreshComments();
    });
}

/**
 * Clears all displayed comments and redownloads the updated versions
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
 * @return the form input element that was deleted
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
 * Deletes all existing comment elements
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
 * @return Promise from deleting the comment entity from /delete-comment
 */
function deleteComment (comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  fetch('/delete-comment', {method: 'POST', body:params})
        .then(refreshComments);
}

/**
 * Deletes the given comment from the page and server
 * @return Promise from deleting the marker entity from /delete-marker
 */
function deleteMarker (markerId) {
  const marker = getMarker(markerId);
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
const DEFAULT_COORDS = {lat:43.65, lng:-79.38};

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
  fetch(`/markers?id=${markerId}`)
    .then(response => response.json())
    .then((marker) => { 
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
    marker.setVisible(false);
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

/**
 * Creates a temporary and moveable marker whenever the client clicks on the map
 */
function setMapClickEvents() {
  if (user.loggedIn) {
    MAP.addListener('click', function(e) {
      var coords = e.latLng;
      makeTempMarker(coords);
    });
  }
}

/**
 * Stores the most recently added marker to the map which has not
 * been uploaded to the server yet.
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
  MAP.panTo(latLng);
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// AUTHENTICATION FUNCTIONS

/**
 * Changes appearance and accessibility of website when logged in/out
 */
function userCustomization() {
  if (user.loggedIn) {
    customizeWelcome("Logout");
  } else {
    customizeWelcome("Login");
    customizeForm();
    disableContent();
  }
}

/**
 * Displays customized content for logged-in and anonymous clients
 */
function customizeWelcome(linkText) {
  const welcome = document.getElementById("welcome");
  const loginArea = document.getElementById("loginArea");

  welcome.innerHTML = `<h1>Hello ${user.nickname}!</h1>`;
  loginArea.innerHTML = 
      `<p>${linkText} <a href="${user.toggleLoginURL}">here</a>.</p>`;
}

/**
 * Disables all inputs and changes placeholder text to instruct the user login
 * in order to submit a comment
 */
function disableContent() {
  const inputComment = document.getElementById("inputComment");
  inputComment.setAttribute("placeholder", "Login to submit a comment.");
  const inputName = document.getElementById("inputName");
  inputName.setAttribute("placeholder", "");
  const formElements = [inputName, inputComment, 
      document.getElementById("submitBtn")];

  for (const el of formElements) {
    el.setAttribute("disabled", "disabled");
  }
}

/**
 * Retrieves the user entity and updates its nickname
 */
function updateNickname(nickname) {
  const params = new URLSearchParams();
  fetch(`/user-login?id=${user.id}&nickname=${nickname}`, {method: 'POST', body:params}).then(() => {
    customizeWelcome("Logout", nickname);
    customizeForm(nickname);
  });
}

/**
 * Automatically fills the name entry of the comments form
 * with the user's set nickname
 */
function customizeForm() {
  const nameInput = document.getElementById("inputName");
  nameInput.setAttribute("value", user.nickname);
}