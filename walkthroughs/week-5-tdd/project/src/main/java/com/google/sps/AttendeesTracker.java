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

import java.util.Map;
import java.util.Set;
import java.util.HashMap;
import java.util.Collection;

public class AttendeesTracker {
  // keep track of how many mandatory and optional attendees are busy
  private int busyMandatoryAttendees = 0;
  private int busyOptionalAttendees = 0;

  private Map<String, Integer> optionalAttendeeTracker;

  private EventIterator eventIterator;

  public AttendeesTracker(MeetingRequest request, EventIterator eventIterator) {
    this.eventIterator = eventIterator;
    setUpOptionalAttendeeTracker(request.getOptionalAttendees());
  }

  private void setUpOptionalAttendeeTracker(Collection<String> optionalAttendees) {
    optionalAttendeeTracker = new HashMap<String, Integer>();
    for (String name: optionalAttendees) {
      optionalAttendeeTracker.put(name,0);
    }
  }

  public boolean noBusyMandatoryAttendees() {
    return busyMandatoryAttendees == 0;
  }

  public boolean noBusyOptionalAttendees() {
    return busyOptionalAttendees == 0;
  }

  public int busyOptionalAttendees() {
    return this.busyOptionalAttendees;
  }

  /**
   * Updates the number of busy mandatory and optional attendees depending
   * on whether attendees are joining or leaving an event
   */
  public void updateBusyAttendees() {

    if (eventIterator.eventHasMandatoryAttendees()) {
      updateBusyMandatoryAttendees();
    }
    updateBusyOptionalAttendees();
  }

  private void updateBusyMandatoryAttendees() {
    int mandatoryEventAttendees = eventIterator.getMandatoryEventAttendees();
    busyMandatoryAttendees += eventIterator.eventEndsNow()? 
        mandatoryEventAttendees: -mandatoryEventAttendees;
  }

  private void updateBusyOptionalAttendees() {
    int attendeeCurrentMeetings;
    Set<String> optionalEventAttendees = 
          eventIterator.getOptionalEventAttendees();

    for (String attendee: optionalEventAttendees) {
      attendeeCurrentMeetings = optionalAttendeeTracker.get(attendee);
      
      if (eventIterator.eventEndsNow()) {
        attendeeCurrentMeetings--;
        optionalAttendeeTracker.put(attendee, attendeeCurrentMeetings);
        if (attendeeCurrentMeetings == 0) {
          busyOptionalAttendees--;
        }
      }
      else {
        attendeeCurrentMeetings++;
        optionalAttendeeTracker.put(attendee, attendeeCurrentMeetings);
        if (attendeeCurrentMeetings == 1) {
          busyOptionalAttendees++;
        }

      }
    }
  }
}