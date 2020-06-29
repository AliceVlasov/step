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

function toggleClass(obj, className, toAdd) {
    toAdd? obj.classList.add(className): obj.classList.remove(className);
}

function switchTabSelection(tabRemove, tabAdd) {
    toggleClass(tabRemove, tabSelectedClass, false);
    toggleClass(tabAdd, tabSelectedClass, true);

}

function prevSelectedTab() {
    return document.getElementsByClassName(tabSelectedClass)[0];
}


function setTabEvents(tabs) {
    var tab;
    for (var i = 0; i < tabs.length; i++) {
        tab = tabs[i];
        tab.addEventListener("click", function() {
            switchTabSelection(prevSelectedTab(), this);
        });
    }
} // setTabEvents

function setUp() {
    var tabs = document.getElementsByClassName("tab");
    setTabEvents(tabs);
}

const tabSelectedClass = "tabSelected";