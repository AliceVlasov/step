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

package com.google.sps.data;

/** A permanent marker on the map associated with a comment. */
public final class Marker {

  private final long id;
  private final boolean visible;
  private final double lat;
  private final double lng;

  public Marker(long id, boolean visible, double lat, double lng) {
    this.id = id;
    this.visible = visible;
    this.lat = lat;
    this.lng = lng;
  }
}