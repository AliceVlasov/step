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

/**
 * Given a list of events, find all time slots where no events are occurring.
 */
public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    List<TimeRange> availableRanges = new ArrayList<>();

    List<TimeRange> startSortedEvents = 
        sortEvents(events, TimeRange.ORDER_BY_START);
    List<TimeRange> endSortedEvents =
        sortEvents(events, TimeRange.ORDER_BY_END);

    // min duration of the available time slot
    long minDuration = request.getDuration();

    // index of current position in startSortedEvents
    int startIndex = 0;

    //index of current position in endSortedEvents
    int endIndex = 0;

    //The maximum value startIndex and endIndex can have 
    int maxIndex = events.size();

    // keep track of how many attendees are busy before the current time
    int busyAttendees = 0;

    // keep track of when a possible available slot begins
    int freeSlotStart = TimeRange.START_OF_DAY;

    // temp variables to access event start and end times 
    // from startSorted Events and endSortedEvents
    int currStartTime;
    int currEndTime;

    // temp variable to store the timeRanges where no events occur
    TimeRange freeSlot;

    //go through day by iterating through times of interest
    // (when an event ends or starts)
    while (endIndex < maxIndex) {
      if (busyAttendees < 0) {
        System.out.println("!!!!CANNOT HAVE NEGATIVE ATTENDEES!!!!!");
        break;
      }

      currEndTime = endSortedEvents.get(endIndex).end();
      currStartTime = startSortedEvents.get(
          Math.min(startIndex, maxIndex-1)).start(); // startIndex could be equal to maxIndex

      if (startIndex == maxIndex || currEndTime <= currStartTime) { // events can only end from this point on
        freeSlotStart = currEndTime;
        endIndex++;  
        busyAttendees--;          
      }
      else { //an event starts now  
        if (busyAttendees == 0) { 
          addRange(availableRanges, minDuration, freeSlotStart, currStartTime, false);
        }
        startIndex ++;
        busyAttendees++;
      }
    }

    if (busyAttendees == 0) { //Add the time slot at the end of the day
      addRange(availableRanges, minDuration, freeSlotStart, TimeRange.END_OF_DAY, true);
    }
    else {
      System.out.println("!!!!FINAL BUSY ATTENDEES ="+busyAttendees);
    }

    return availableRanges;
  }

  /**
   * Sorts and returns the TimeRanges of the events given using the comparator
   * @param events collection of events given to the query
   * @param comparator comparator used to sort the event time ranges
   * @return the sorted ArrayList of TimeRanges
   */
  private ArrayList<TimeRange> sortEvents(Collection<Event> events,Comparator<TimeRange> comparator) {
    ArrayList<TimeRange> eventTimeRanges = new ArrayList<>();

    for (Event event: events) {
      eventTimeRanges.add(event.getWhen());
    }

    eventTimeRanges.sort(comparator);
    return eventTimeRanges;
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
