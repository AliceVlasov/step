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

function setTabEvents(tabs) {
    var tab;
    for (var i = 0; i < tabs.length; i++) {
        tab = tabs[i];
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


function setUp() {
    var tabs = document.getElementsByClassName(tabClass);
    setTabEvents(tabs);
}


const tabSelectedClass = "tabSelected";
const tabClass = "tab";
const tabContentClass = "tabContent";
const galleryTitle = "galleryTab";
