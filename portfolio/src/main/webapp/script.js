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
}

/** Removes or adds a class from an object's class list as required
 * @param {Element} obj
 * @param {String} className
 * @param {boolean} toAdd Determines whether to add or remove className from obj
 */
function toggleClass(obj, className, toAdd) {
  toAdd? obj.classList.add(className): obj.classList.remove(className);
}

// TAB FEATURES

/** Adds click events with tab-switching feature to all tabs */
function setTabEvents() {
  let tabs = document.getElementsByClassName(TAB_CLASS);

  for (const tab of tabs) {
    tab.addEventListener('click', function() {
      tabClickEvent(this);
    });
  }
}

/** Toggles visibility of tab content objects to simulate tab-switching
 * @param {Element} clickedTab Object that triggered a change in tabs
 */
function tabClickEvent(clickedTab) {
  /** Title of all objects related to the gallery tab */
  const GALLERY_TAB_TITLE = 'Gallery Tab';
  let currTab = prevSelectedTab(); // The tab that is currently visible

  // The gallery tab has a different layout than the other tabs so it has extra steps to switch to and from it
  if (currTab.getAttribute('title') === GALLERY_TAB_TITLE) {
    toggleGallerySelection(/* revealGallery= */ false);
  } else if (clickedTab.getAttribute('title') === GALLERY_TAB_TITLE) {
    toggleGallerySelection(/* revealGallery= */ true);
  }

  switchTabSelection(currTab, clickedTab);
}

/**
 * @return {Element} Currently visible .tab object
 */
function prevSelectedTab() {
  return document.getElementsByClassName(TAB_CLASS+' '+TAB_SELECTED_CLASS)[0];
}

/**
 * Hides and reveals the wrappers for all tab content except for the gallery tab
 * @param {boolean} showGallery Whether or not to hide the tab content wrappers
 */
function toggleGallerySelection(showGallery) {
  /** Class name for hidden tab content wrappers */
  const HIDDEN_WRAPPER_CLASS = 'wrapperHidden';

  /** ID of the container for all tab pictures except for the gallery tab */
  const PICTURE_WRAPPER_ID = 'pictureWrapper';
  let pictureWrapper = document.getElementById(PICTURE_WRAPPER_ID);

  /** ID of the container for all tab text except for the gallery tab */
  const TEXT_WRAPPER_ID = 'textWrapper';
  let textWrapper = document.getElementById(TEXT_WRAPPER_ID);

  if (showGallery) {
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

