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
import java.util.Collection;
import java.util.HashSet;
import java.util.ArrayList;

public class MeetingSlotTracker {

  // This is used to save only the time slots with 
  // the highest possible attendance
  private int minBusyOptionalAttendees;

  // min duration required for a meeting time slot
  private long minDuration;

  // potential meeting times ranges that only consider mandatory attendees
  // or all attendees, respectively
  private List<TimeRange> mandatoryRanges;
  private List<TimeRange> allAttendRanges;

  // Potential starting time for a meeting excluding some optional attendees
  private int mandatorySlotStart = TimeRange.START_OF_DAY;

  // Potential starting time for a meeting that includes everyone
  private int allAttendSlotStart = TimeRange.START_OF_DAY;

  private EventIterator eventIterator;
  private AttendeesTracker attendeesTracker;

  private boolean meetingHasMandatoryAttendees;

  public MeetingSlotTracker(MeetingRequest request, 
        EventIterator eventIterator, AttendeesTracker attendeesTracker){
    this.eventIterator = eventIterator;
    this.attendeesTracker = attendeesTracker;
    this.minDuration = request.getDuration();
    this.minBusyOptionalAttendees = request.getOptionalAttendees().size();
    this.meetingHasMandatoryAttendees = request.getAttendees().size() > 0;
    this.mandatoryRanges = new ArrayList<>();
    this.allAttendRanges = new ArrayList<>();
  }

  public boolean foundAllAttendTime() {
    return allAttendRanges.size() > 0;
  }

  /**
   * Returns the best list for potential time meeting slots
   */
  public Collection<TimeRange> getMeetingTimeSlots() {
    if (allAttendRanges.size() == 0) return mandatoryRanges;
    
    return allAttendRanges;
  }

  /**
   * Sets the potential start times for mandatory and all attendees
   * Depending on whether mandatory attendees attended an event
   */
  public void setPotentialMeetingSlotStart() {
    if (eventIterator.eventHasMandatoryAttendees()) {
      mandatorySlotStart = eventIterator.getCurrTime();
    }
    allAttendSlotStart = eventIterator.getCurrTime();
  }

  /**
   * Adds the time range from the end of the last event to the end of the day
   */
  public void addEndOfDayTimeSlots() {
    if (meetingHasMandatoryAttendees) {
      addRange(mandatoryRanges, mandatorySlotStart, TimeRange.END_OF_DAY, 
      /* inclusive= */ true, /* checkOptionalAttendees= */ true); 
    }
    addRange(allAttendRanges, allAttendSlotStart, TimeRange.END_OF_DAY, 
    /* inclusive= */ true, /* checkOptionalAttendees= */ false);
  }

  /**
   * Adds a time slot that excludes some optional attendees
   */
  public void addMandatorySlot() {
    addRange(mandatoryRanges, mandatorySlotStart, eventIterator.getCurrTime(), 
             /* inclusive= */ false, /* checkOptionalAttendees= */ true);
  }

  /**
   * Adds a time slot that includes all attendees
   */
  public void addAllAvailableSlot() {
    addRange(allAttendRanges, allAttendSlotStart, eventIterator.getCurrTime(), 
             /* inclusive= */ false, /* checkOptionalAttendees= */ false);
  }

  /**
   * Adds valid time slots to the give list of time ranges and updates minBusyOptionalAttendees when relevant
   * @param dest where the TimeRange object should be added
   * @param start the start time of the slot
   * @param end the end time of the slot
   * @param inclusive whether the end time should be included or not in the slot
   */
  private void addRange
      (List<TimeRange> dest, int start, int end, boolean inclusive, boolean checkOptionalAttendees) {
    TimeRange freeSlot = TimeRange.fromStartEnd(start, end, inclusive);

    if (!goodDuration(freeSlot.duration())) return;

    if (addWithoutReplacement(checkOptionalAttendees)) {
      dest.add(freeSlot);
    } else if (addWithReplacement(checkOptionalAttendees)) {
      dest.clear();
      dest.add(freeSlot);
      minBusyOptionalAttendees = attendeesTracker.busyOptionalAttendees();
    }
  }

  /**
   * Checks if the duration of a potential time slot is at least the
   * required length of the meeting
   */
  private boolean goodDuration(int slotDuration) {
    return slotDuration >=minDuration;
  }

  /**
   * 
   */
  private boolean addWithoutReplacement(boolean checkOptionalAttendees) {
    return !checkOptionalAttendees || 
            (attendeesTracker.busyOptionalAttendees() == minBusyOptionalAttendees);
  }

  /**
   */
  private boolean addWithReplacement(boolean checkOptionalAttendees) {
    return checkOptionalAttendees && 
        (attendeesTracker.busyOptionalAttendees() < minBusyOptionalAttendees);
  }
}