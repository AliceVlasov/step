// Copyright 2019 Google LLC
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https:// www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Comparator;

public class EventIterator {

  // filtered event lists sorted by start and end times
  private List<TrimmedEvent> startSortedEvents;
  private List<TrimmedEvent> endSortedEvents;

  private int mandatoryEventAttendees;
  private Set<String> optionalEventAttendees;

  // The maximum value startIndex and endIndex can have 
  private final int maxIndex;

  // index of the current position in startSortedEvents and endSortedEvents
  private int startIndex = 0;
  private int endIndex = 0;

  private TrimmedEvent currEvent;
  private int currEventTime;

  private boolean eventEndsNow;

  public EventIterator(List<TrimmedEvent> events) {
    maxIndex = events.size();
    this.startSortedEvents =  sortEvents(events, TrimmedEvent.ORDER_BY_START);
    this.endSortedEvents =  sortEvents(events, TrimmedEvent.ORDER_BY_END);
    if (maxIndex > 0) {
      setCurrEvent();
    }
  }

  /**
   * Returns a sorted list of Events
   * @param events collection of events given to the query
   * @param comparator comparator used to sort the event time ranges
   */
  private List<TrimmedEvent> sortEvents(List<TrimmedEvent> events, 
      Comparator<TrimmedEvent> comparator) {
    List<TrimmedEvent> sortedEvents = new ArrayList(events); 
    sortedEvents.sort(comparator);
    return sortedEvents;
  }

  /**
   * Returns whether this eventIterator has finished going through all the
   * time of interest.
   */
  public boolean notDone() {
    return endIndex < maxIndex && maxIndex != 0;
  }  

  public void update() {
    increment();
    setCurrEvent();
  }

  private void setCurrEvent() {
    TrimmedEvent startEvent = 
        startSortedEvents.get(Math.min(startIndex, maxIndex-1));
    int startEventTime = startEvent.getWhen().start(); 
    TrimmedEvent endEvent = 
        endSortedEvents.get(Math.min(endIndex, maxIndex-1));
    int endEventTime = endEvent.getWhen().end();
    
    eventEndsNow = startIndex == maxIndex || endEventTime <= startEventTime;

    if (eventEndsNow) {
      currEvent = endEvent;
      currEventTime = endEventTime;
    }
    else {
      currEvent = startEvent;
      currEventTime = startEventTime;
    }

    mandatoryEventAttendees = currEvent.getMandatoryAttendees().size();
    optionalEventAttendees = currEvent.getOptionalAttendees();
  }

  public boolean eventEndsNow() {
    return eventEndsNow;
  }

  public void increment() {
    if (eventEndsNow) {
      endIndex++;
    } else {
      startIndex++;
    }
  }

  public int getCurrTime() {
    return currEventTime;
  }

  public Set<String> getOptionalEventAttendees() {
    return optionalEventAttendees;
  }

  public int getMandatoryEventAttendees() {
    return mandatoryEventAttendees;
  }

  public boolean eventHasMandatoryAttendees() {
    return mandatoryEventAttendees > 0;
  }

  public boolean atLastEvent() {
    return endIndex == maxIndex-1;
  }
}