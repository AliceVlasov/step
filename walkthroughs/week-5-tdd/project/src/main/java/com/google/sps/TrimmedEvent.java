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

import java.util.Comparator;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * TrimmedEvent is the container class for the processed Event information relevant to a certain meeting request. Events are considered read-only.
 */
public final class TrimmedEvent {

  private final Set<String> mandatoryAttendees = new HashSet<>();
  private final Set<String> optionalAttendees = new HashSet<>();

  private final String title;
  private final TimeRange when;

  /**
   * Creates a new trimmed event.
   *
   * @param title The human-readable name for the event. Must be non-null.
   * @param when The time when the event takes place. Must be non-null.
   * @param attendees The collection of attendees for the event. Must be non-null.
   * @param optionalAttendees The collection of optional meeting attendees attending the event. Must be non-null.
   * @param mandatoryAttendees The collection of mandatory meeting attendees attending the event. Must be non-null.
   */
  public TrimmedEvent(String title, TimeRange when, Collection<String> mandatoryAttendees, Collection<String> optionalAttendees) {
    if (title == null) {
      throw new IllegalArgumentException("title cannot be null");
    }

    if (when == null) {
      throw new IllegalArgumentException("when cannot be null");
    }

    if (optionalAttendees == null || mandatoryAttendees == null) {
      throw new IllegalArgumentException("attendees cannot be null. Use empty array instead.");
    }

    this.title = title;
    this.when = when;
    this.optionalAttendees.addAll(optionalAttendees);
    this.mandatoryAttendees.addAll(mandatoryAttendees);
  }

  /**
   * Returns the human-readable name for this event.
   */
  public String getTitle() {
    return title;
  }

  /**
   * Returns the {@code TimeRange} for when this event occurs.
   */
  public TimeRange getWhen() {
    return when;
  }

  /**
   * Returns a read-only set of mandatory meeting attendees attending this event.
   */
  public Set<String> getMandatoryAttendees() {
    // Return the attendees as an unmodifiable set so that the caller can't change our
    // internal data.
    return Collections.unmodifiableSet(mandatoryAttendees);
  }

    /**
   * Returns a read-only set of optional meeting attendees attending this event.
   */
  public Set<String> getOptionalAttendees() {
    // Return the attendees as an unmodifiable set so that the caller can't change our
    // internal data.
    return Collections.unmodifiableSet(optionalAttendees);
  }

  @Override
  public boolean equals(Object other) {
    return other instanceof TrimmedEvent && equals(this, (TrimmedEvent) other);
  }

  private static boolean equals(TrimmedEvent a, TrimmedEvent b) {
    // {@code attendees} must be a set for equals to work as expected. According to the {@code Set}
    // interface documentation, equals will check for set-equality across all set implementations.
    return a.title.equals(b.title) && a.when.equals(b.when) && a.optionalAttendees.equals(b.optionalAttendees) && 
        a.mandatoryAttendees.equals(b.mandatoryAttendees);
  }

  public boolean hasAttendees() {
    return optionalAttendees.size() > 0 || mandatoryAttendees.size() > 0;
  }

  @Override
  public int hashCode() {
    // For the hash code, just use the title. Most events "should" have different names and will
    // mainly be used as a way to skip the costly {@code equals()} call.
    return title.hashCode();
  }

     /**
   * A comparator for sorting ranges by their start time in ascending order.
   */
  public static final Comparator<TrimmedEvent> ORDER_BY_START = 
      new Comparator<TrimmedEvent>() {
    @Override
    public int compare(TrimmedEvent a, TrimmedEvent b) {
      return TimeRange.ORDER_BY_START.compare(a.when, b.when);
    }
  };

  /**
   * A comparator for sorting ranges by their end time in ascending order.
   */
  public static final Comparator<TrimmedEvent> ORDER_BY_END = 
      new Comparator<TrimmedEvent>() {
    @Override
    public int compare(TrimmedEvent a, TrimmedEvent b) {
      return TimeRange.ORDER_BY_END.compare(a.when, b.when);
    }
  };
}
