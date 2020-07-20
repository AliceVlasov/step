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
    // potential meeting time ranges that consider 
    // mandatory attendees and all attendees
    List<TimeRange> mandatoryRanges = new ArrayList<>();
    List<TimeRange> optionalRanges = new ArrayList<>();

    // all mandatory attendees requested for the meeting
    Set<String> mandatoryAttendees = 
        new HashSet<>(request.getAttendees());

    // if there are no mandatory attendees, all optional attendees will be 
    // treated as mandatory attendees
    if (mandatoryAttendees.size() == 0) {
      mandatoryAttendees = new HashSet<>(request.getOptionalAttendees());
    }

    // both mandatory and optional attendees requested for the meeting
    Set<String> allAttendees = new HashSet<>(mandatoryAttendees);
    allAttendees.addAll(request.getOptionalAttendees());

    // events that only include attendees requested for the meeting
    List<Event> filteredEvents = 
        filterEventsByAttendees(allAttendees, events);

    // filtered event lists sorted by start and end times
    List<Event> startSortedEvents = 
        sortEvents(filteredEvents, Event.ORDER_BY_START);
    List<Event> endSortedEvents =
        sortEvents(filteredEvents, Event.ORDER_BY_END);

    // min duration of the available time slot
    long minDuration = request.getDuration();

    // index of the current position in startSortedEvents and endSortedEvents
    int startIndex = 0;
    int endIndex = 0;

    // The maximum value startIndex and endIndex can have 
    int maxIndex = filteredEvents.size();

    // keep track of how many mandatory and optional attendees are busy
    int busyMandatoryAttendees = 0;
    int busyOptionalAttendees = 0;

    // keep track of when a possible available slot for 
    // mandatory attendees and all attendees begins
    int freeMandatorySlotStart = TimeRange.START_OF_DAY;
    int freeOptionalSlotStart = TimeRange.START_OF_DAY;

    // temp variables to access necessary events and event times
    Event startEvent;
    Event endEvent;
    int startEventTime;
    int endEventTime;

    // temp variables to access everyone attending an event and 
    // how many of those are mandatory for the meeting
    Set<String> eventAttendees;
    int mandatoryEventAttendees;

    // go through day by iterating through times of interest
    // (when an event ends or starts)
    while (endIndex < maxIndex) {
      if (busyMandatoryAttendees < 0 || busyOptionalAttendees < 0) {
        System.out.println("!!!!CANNOT HAVE NEGATIVE ATTENDEES!!!!!");
        break;
      }

      // access events in startSortedEvents and endSortedEvents 
      // with given indices and their start times
      startEvent = startSortedEvents.get(Math.min(startIndex, maxIndex-1));
      startEventTime = startEvent.getWhen().start(); 
      endEvent = endSortedEvents.get(endIndex);
      endEventTime = endEvent.getWhen().end();
      

      // an event ends now
      if (startIndex == maxIndex || endEventTime <= startEventTime) {
        // get all attendees and # of mandatory attendees joining this event 
        eventAttendees = endEvent.getAttendees();
        mandatoryEventAttendees = 
            getIntersection(mandatoryAttendees, eventAttendees).size();

        // mandatory attendees are leaving this event
        if (mandatoryEventAttendees > 0) {
          freeMandatorySlotStart = endEventTime;
          busyMandatoryAttendees -= mandatoryEventAttendees;
        }

        // optional attendees are leaving the event too
        freeOptionalSlotStart = endEventTime;
        busyOptionalAttendees -= (eventAttendees.size() - mandatoryEventAttendees);

        endIndex++;         
      } 
      else { // an event starts now        

        // check if time slot works for mandatory attendees only
        if (busyMandatoryAttendees == 0) {        
          addRange(mandatoryRanges, minDuration, freeMandatorySlotStart, startEventTime, false);

          // check if time slot works for optional attendees as well
          if (busyOptionalAttendees == 0) {
            addRange(optionalRanges, minDuration, freeOptionalSlotStart, startEventTime, false);
          }
        }

        // get all attendees and # of mandatory attendees joining this event
        eventAttendees = startEvent.getAttendees();
        mandatoryEventAttendees = 
            getIntersection(mandatoryAttendees, eventAttendees).size();

        // mandatory attendees are joining this event
        if (mandatoryEventAttendees > 0) {
          busyMandatoryAttendees += mandatoryEventAttendees;
        }
        
        // optional attendees are joining the event too
        busyOptionalAttendees += (eventAttendees.size() - mandatoryEventAttendees);

        startIndex ++;
      }
    }

    if (busyMandatoryAttendees != 0 || busyOptionalAttendees != 0) {
      System.out.println("!!!!! Something went wrong !!!!!");
    }

    // all attendees are available after the last event ends so
    // consider time slot from last event ending to end of the day      
    addRange(mandatoryRanges, minDuration, freeMandatorySlotStart, TimeRange.END_OF_DAY, true);
    addRange(optionalRanges, minDuration, freeOptionalSlotStart, TimeRange.END_OF_DAY, true);

    // return appropriate time range list
    if (optionalRanges.size() == 0) {
      return mandatoryRanges;
    } else {
      return optionalRanges;
    }
  }

  /**
   * Removes all non-requested attendees from the events and 
   * returns a list of events that only include requested attendees
   * @param requestedAttendees people of interest
   * @param events events that need to be filtered
   */
  private List<Event> filterEventsByAttendees
      (Collection<String> requestedAttendees, Collection<Event> events) {
    List<Event> filteredEvents = new ArrayList<>();
    
    // temporary set including all event attendees in the meeting request
    Set<String> requestedEventAttendees;

    // temporary Event including only attendees in the meeting request
    Event trimmedEvent;
    
    // only add trimmed events to filteredEvents
    for (Event event: events) {
      requestedEventAttendees = 
          getIntersection(event.getAttendees(), requestedAttendees);
      if (requestedEventAttendees.size() > 0) {
        // make a copy of the current event only including requested attendees
        trimmedEvent = new Event(event.getTitle(), event.getWhen(), requestedEventAttendees);
        filteredEvents.add(trimmedEvent);
      }
    }

    return filteredEvents;
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

  /**
   * Returns a sorted list of Events
   * @param events collection of events given to the query
   * @param comparator comparator used to sort the event time ranges
   */
  private List<Event> sortEvents(List<Event> events, 
      Comparator<Event> comparator) {
    List<Event> sortedEvents = new ArrayList(events); 
    sortedEvents.sort(comparator);
    return sortedEvents;
  }

  /**
   * Returns how many elements are in both sets
   * @param a one set of elements
   * @param b the other set of elements
   */
  private Set<String> getIntersection
      (Collection<String> a, Collection<String> b) {
    Set<String> intersection = new HashSet<>(a);
    intersection.retainAll(b);
    return intersection;
  }
}
