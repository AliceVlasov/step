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

    contentRemove = document.querySelectorAll("[title="+tabRemove.getAttribute("title")+"]");
    contentAdd = document.querySelectorAll("[title="+tabAdd.getAttribute("title")+"]");
    
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

function toggleGallerySelection(showGallery) {
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
        tab.addEventListener("mouseover", function() {
            toggleClass(this, tabHoverClass, true);
        });

        tab.addEventListener("mouseout", function() {
            toggleClass(this, tabHoverClass, false);
        });

        tab.addEventListener("click", function() {
            if (prevSelectedTab().getAttribute("title") === galleryTitle) {
                toggleGallerySelection(false);
            }
            else if (this.getAttribute("title") === galleryTitle) {
                toggleGallerySelection(true);
            }
            switchTabSelection(prevSelectedTab(), this);
        });
    }
} // setTabEvents

function animate (obj, name) {
    obj.style["animation-name"] = name;
}

// INFO FEATURES

function getContent(header) {
    return header.nextElementSibling;
}

function toggleGroupContent(header) {
    var content = getContent(header);
    if (content.style["animation-name"] === showName) {
        animate(content, hideName);
    }
    else {
        animate(content, showName);
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

// GALLERY FEATURES

function getCaption(galleryPic) {
    return galleryPic.childNodes[1];
}

function fadeAnimation(caption, fadeIn) {
    if (fadeIn) {
        animate(caption, fadeInName);
    }
    else {
        animate(caption, fadeOutName);
    }
}

function fadeCaption(pic, fadeIn) {
    var caption = getCaption(pic);
    fadeAnimation(caption, fadeIn);
}

function setGalleryEvents() {
    var galleryPics = document.getElementsByClassName(galleryPicClass);
    var pic;
    for (var i = 0; i < galleryPics.length; i++) {
        pic = galleryPics[i];
        pic.addEventListener("mouseover", function() {
            fadeCaption(this, true);
        });
        pic.addEventListener("mouseout", function() {
            fadeCaption(this, false);
        });
    }
}


function setUp() {
    setTabEvents();
    setGalleryEvents();
    setInfoEvents();
}

const tabHoverClass = "tabHover";
const tabSelectedClass = "tabSelected";
const tabClass = "tab";
const tabContentClass = "tabContent";
const galleryTitle = "galleryTab";

const galleryPicClass = "gridItem"
const fadeInName = "fadeIn";
const fadeOutName = "fadeOut";
const captionClass = "caption";

const groupHeader = "groupHeader";
const groupText = "groupText";
const showName = "collapseShow";
const hideName = "collapseHide";