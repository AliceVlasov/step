// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// TAB FEATURES

function toggleClass(obj, className, toAdd) {
    toAdd? obj.classList.add(className): obj.classList.remove(className);
}

function switchTabSelection(tabRemove, tabAdd) {
    if (tabRemove === tabAdd) {
        return;
    }

    contentRemove = document.querySelectorAll("[title="+"\""+tabRemove.getAttribute("title")+"\""+"]");
    contentAdd = document.querySelectorAll("[title="+"\""+tabAdd.getAttribute("title")+"\""+"]");
    
    contentAdd.forEach(function(obj) {
        toggleClass(obj, tabSelectedClass, true);
    });
    contentRemove.forEach(function(obj) {
        toggleClass(obj, tabSelectedClass, false);
    });
}

function prevSelectedTab() {
    return document.getElementsByClassName(tabClass+" "+tabSelectedClass)[0];
}

function toggleSpecialTab(showGallery) {
    var textWrapper = document.getElementById("textWrapper");
    var pictureWrapper = document.getElementById("pictureWrapper");
    if (showGallery) {
        textWrapper.style.display = "none";
        pictureWrapper.style.display = "none";
    }
    else {
        textWrapper.style.display = "flex";
        pictureWrapper.style.display = "flex";    
    }
}

function setTabEvents() {
    var tabs = document.getElementsByClassName(tabClass);
    var tab;
    for (var i = 0; i < tabs.length; i++) {
        tab = tabs[i];
        tab.addEventListener("click", function() {
            if (prevSelectedTab().classList.contains(SPECIAL_TAB)) {
                toggleSpecialTab(false);
            }
            if (this.classList.contains(SPECIAL_TAB)) {
                toggleSpecialTab(true);
            }
            switchTabSelection(prevSelectedTab(), this);
        });
    }
} // setTabEvents

// INFO FEATURES

function getContent(header) {
    return header.nextElementSibling;
}

function toggleGroupContent(header) {
    var content = getContent(header);
    
    header.classList.toggle("active");
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

function setInfoEvents() {
    var infoHeaders = document.getElementsByClassName(groupHeader);
    for (var i = 0; i < infoHeaders.length; i++) {
        infoHeaders[i].addEventListener("click", function() {
            toggleGroupContent(this);
        });
    }

}

function setUp() {
    setTabEvents();
    setInfoEvents();
    getComments();
    // setFormSubmit();

    // var postTarget = document.getElementById("submitTarget");
    // postTarget.onload = onLoadPost;
}

const tabSelectedClass = "tabSelected";
const tabClass = "tab";
const tabContentClass = "tabContent";
const SPECIAL_TAB = "special";
const groupHeader = "groupHeader";

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

/**The maximum number of comments that should be displayed */
const MAX_COMMENTS = 3;

/**
 * Handles the comments from the server by converting them to text and giving them to addNameToDom()
 */
function handleGivenComments(comments) {
  for (var i = 0; i < comments.length; i++) {
    addCommentToDom(comments[i]);
  }
}

const COMMENTS_DISPLAY = "commentsDisplay";

/**
 * Adds the comment to the page
 */
function addCommentToDom(comment) {
  const commentDisplay = document.getElementById(COMMENTS_DISPLAY);
  const obj = makeCommentElement
    (comment, comment.commentText, comment.commentAuthor);

  // add the new objects to the comment Display
  commentDisplay.appendChild(obj);
}

/**
 * @return HTML div object containing the comment with relevant information and styling
 */
function makeCommentElement(comment, text, author) {
  const commentObj = document.createElement("div");

  /**Class name to style all comment blocks */
  const COMMENT_CLASS = "comment";

  commentObj.classList.add(COMMENT_CLASS);
  
  commentObj.appendChild(makeDeleteButton(comment, commentObj));
  commentObj.appendChild(makeCommentAuthorElement(author));
  commentObj.appendChild(makeCommentTextElement(text));

  return commentObj;
}

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
  var commentText = getFormValue("inputComment");
  var commentAuthor = getFormValue("inputName");
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
  return !(comment.length === 0);
}

/**
 * Gets and clears the form input element
 */
function getFormValue(id) {
   const formInput = document.getElementById(id);
   const val = formInput.value;
   formInput.value = "";
   return val;
}

function getVis() {
  const visSelect = document.getElementById("number");
  return visSelect.value;
}

/**
 * Deletes all existing comment objects
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