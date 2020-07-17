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

package com.google.sps;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;

/**
 * Find all possible meeting times that satisfy the request and do not overlap with events unless event attendees are optional meeting attendees
 */
public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    List<TimeRange> availableRanges = new ArrayList<>();

    List<Event> filteredEvents = 
        filterEventsByAttendees(request.getAttendees(), events);

    List<Event> startSortedEvents = 
        sortEvents(filteredEvents, Event.ORDER_BY_START);
    List<Event> endSortedEvents =
        sortEvents(filteredEvents, Event.ORDER_BY_END);

    // min duration of the available time slot
    long minDuration = request.getDuration();

    // index of current position in startSortedEvents
    int startIndex = 0;

    //index of current position in endSortedEvents
    int endIndex = 0;

    //The maximum value startIndex and endIndex can have 
    int maxIndex = filteredEvents.size();

    // keep track of how many attendees are busy before the current time
    List<String> busyAttendees = new ArrayList<>();

    // keep track of when a possible available slot begins
    int freeSlotStart = TimeRange.START_OF_DAY;

    // temp variables to access event start and end Events
    // from startSorted Events and endSortedEvents
    Event startEvent;
    Event endEvent;
    int startEventTime;
    int endEventTime;

    // temp variable to store the timeRanges where no events occur
    TimeRange freeSlot;

    //go through day by iterating through times of interest
    // (when an event ends or starts)
    while (endIndex < maxIndex) {
      if (busyAttendees.size() < 0) {
        System.out.println("!!!!CANNOT HAVE NEGATIVE ATTENDEES!!!!!");
        break;
      }

      // events in startSortedEvents and endSortedEvents with given indices
      startEvent = startSortedEvents.get(Math.min(startIndex, maxIndex-1));
      endEvent = endSortedEvents.get(endIndex);

      endEventTime = endEvent.getWhen().end();
      startEventTime = startEvent.getWhen().start(); 

      if (startIndex == maxIndex || endEventTime <= startEventTime) { // events can only end from this point on
        freeSlotStart = endEventTime;
        busyAttendees.removeAll(endEvent.getAttendees());
        endIndex++;         
      }
      else { //an event starts now  
        if (busyAttendees.size() == 0) { 
          addRange(availableRanges, minDuration, freeSlotStart, startEventTime, false);
        }
        busyAttendees.addAll(startEvent.getAttendees());
        startIndex ++;
      }
    }

    if (busyAttendees.size() == 0) { //Add the time slot at the end of the day
      addRange(availableRanges, minDuration, freeSlotStart, TimeRange.END_OF_DAY, true);
    }
    else {
      System.out.println("!!!!FINAL BUSY ATTENDEES ="+busyAttendees);
    }

    return availableRanges;
  }

  /**
   * Returns a new collection object with the sorted events
   * @param events collection of events given to the query
   * @param comparator comparator used to sort the event time ranges
   * @return the sorted ArrayList of TimeRanges
   */
  private List<Event> sortEvents(List<Event> events, 
      Comparator<Event> comparator) {
    List<Event> sortedEvents = new ArrayList(events); 
    sortedEvents.sort(comparator);
    return sortedEvents;
  }

  /**
   * Returns a collection containing the events that include requested attendees
   * @param requestedAttendees people of interest
   * @param events events that need to be filtered
   */
  private List<Event> filterEventsByAttendees
      (Collection<String> requestedAttendees, Collection<Event> events) {
    List<Event> filteredEvents = new ArrayList<>();
    
    //temporary set including all event attendees in the meeting request
    Set<String> requestedEventAttendees;

    //temporary Event including only attendees in the eeting request
    Event trimmedEvent;
    
    //only add trimmed events to filteredEvents
    for (Event event: events) {
      requestedEventAttendees = 
          getRequestedEventAttendees(event.getAttendees(), requestedAttendees);
      if(requestedEventAttendees.size() > 0) {
        trimmedEvent = new Event(event.getTitle(), event.getWhen(), requestedEventAttendees);
        filteredEvents.add(trimmedEvent);
      }
    }

    return filteredEvents;
  }

  /**
   * Returns all the requested attendees that are also eventAttendees
   * @param eventAttendees list of people attending an event
   * @param requestedAttendees list of people needed for the meeting
   */
  private Set<String> getRequestedEventAttendees(Set<String> eventAttendees, Collection<String> requestedAttendees) {

    Set<String> requestedEventAttendees = new HashSet<>();
    for (String requestedAttendee: requestedAttendees) {
      if (eventAttendees.contains(requestedAttendee)) {
        requestedEventAttendees.add(requestedAttendee);
      }
    }

    return requestedEventAttendees;
  }

  /**
   * Adds the time slot to the destination if the given time slot is fits 
   * the minimum duration
   * @param dest where the TimeRange object should be added
   * @param minDuration the min duration the slot requires to be added to dest
   * @param start the start time of the slot
   * @param end the end time of the slot
   * @param inclusive whether the end time should be included or not in the slot
   */
  private void addRange(List<TimeRange> dest, long minDuration, int start, 
      int end, boolean inclusive) {
    TimeRange freeSlot = TimeRange.fromStartEnd(start, end, inclusive);
    if (freeSlot.duration() >= minDuration) {
      dest.add(freeSlot);
    }
  }
}
