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
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;

/**
 * Find best time slots when a meeting can occur
 */
public final class FindMeetingQuery {

  // stores and updates possible meeting slot times
  private MeetingSlotTracker meetingSlotTracker;

  // Iterates through the times of interest of the day
  // and retrieves the current event's information
  private EventIterator eventIterator;

  // keeps track of busy attendees
  private AttendeesTracker attendeesTracker;

  /**
   * Returns all the time when the meeting should be scheduled
   */
  public Collection<TimeRange> query
          (Collection<Event> events, MeetingRequest request) {
    setUp(request, events);

    while (eventIterator.notDone()) {   
      if (eventIterator.eventEndsNow()) {
        meetingSlotTracker.setPotentialMeetingSlotStart();

        attendeesTracker.updateBusyAttendees();        
      } 
      else { // an event starts now
        if (attendeesTracker.noBusyMandatoryAttendees()) {
          meetingSlotTracker.addMandatorySlot();

          if (attendeesTracker.noBusyOptionalAttendees()) {
            meetingSlotTracker.addAllAvailableSlot();
          }
        }
        attendeesTracker.updateBusyAttendees();
      }
      eventIterator.update();  
    }
    meetingSlotTracker.addEndOfDayTimeSlots();
    return meetingSlotTracker.getMeetingTimeSlots();
  }

  private void setUp(MeetingRequest request, Collection<Event> events) {
    List<TrimmedEvent> trimmedEvents = filterEventsByAttendees(request, events);
    this.eventIterator = new EventIterator(trimmedEvents);
    this.attendeesTracker = new AttendeesTracker(request, eventIterator);
    this.meetingSlotTracker = new MeetingSlotTracker(request, eventIterator, attendeesTracker);   
  }

  /**
   * Returns a list of trimmed events identical to the events given except
   * only including mandatory and optional meeting attendees
   * @param requestedAttendees people of interest
   * @param events events that need to be filtered
   */
  private List<TrimmedEvent> filterEventsByAttendees
        (MeetingRequest request, Collection<Event> events) {
    List<TrimmedEvent> filteredEvents = new ArrayList<>();
    
    // temporary set including all event attendees in the meeting request
    Set<String> mandatoryEventAttendees = new HashSet<>();
    Set<String> optionalEventAttendees = new HashSet<>();
    Set<String> eventAttendees = new HashSet<>();

    // temporary Event including only attendees in the meeting request
    TrimmedEvent trimmedEvent;
    
    // only add trimmed events to filteredEvents
    for (Event event: events) {
      eventAttendees = event.getAttendees();
      mandatoryEventAttendees = 
          getIntersection(eventAttendees, request.getAttendees());
      optionalEventAttendees = 
          getIntersection(eventAttendees, optionalEventAttendees);

      // make a trimmed event which splits mandatory and optional attendees.
      trimmedEvent = new TrimmedEvent(event.getTitle(), event.getWhen(), mandatoryEventAttendees, optionalEventAttendees);
      
      if (trimmedEvent.hasAttendees()) {
        filteredEvents.add(trimmedEvent);
      }
    }

    return filteredEvents;
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
