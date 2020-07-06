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
  const comments = fetch("/data");
  comments.then(response => response.json()).then((list) => { 
            handleGivenComments(list)
          });
}

/**
 * Handles the comments from the server by converting them to text and giving them to addNameToDom()
 */
function handleGivenComments(comments) {
  for (var comment of comments) {
    addCommentToDom(comment);
  }
}

/**
 * Adds the comment to the page
 */
function addCommentToDom(comment) {
  const commentSection = document.getElementById("commentsSection");
  const obj = makeCommentElement(comment, "Alice");

  // add the new objects to the comment section
  commentSection.appendChild(obj);
}

/**
 * @return HTML div object containing the comment with relevant information and styling
 */
function makeCommentElement(text, author) {
  const commentObj = document.createElement("div");
  commentObj.classList.add("comment")
  
  commentObj.appendChild(makeCommentAuthorElement(author));
  commentObj.appendChild(makeCommentTextElement(text));

  return commentObj;
}

/**
 * @return HTML paragraph containing the comment text
 */
function makeCommentTextElement(text) {
  const commentText = document.createElement("p");
  commentText.innerText = text;
  commentText.classList.add("commentText");

  return commentText;
}

/**
 * @return HTML paragraph containing the author's name
 */
function makeCommentAuthorElement(author) {
  const commentAuthor = document.createElement("p");
  commentAuthor.innerText = author;
  commentAuthor.classList.add("commentAuthor");

  return commentAuthor;
}