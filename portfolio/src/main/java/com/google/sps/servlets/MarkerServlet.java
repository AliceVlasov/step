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

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.gson.Gson;
import com.google.sps.data.Marker;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;

/** Servlet responsible for creating and retrieving markers. */
@WebServlet("/markers")
public class MarkerServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    double lat = Double.parseDouble(request.getParameter("lat"));
    double lng = Double.parseDouble(request.getParameter("lng"));
    boolean visible = Boolean.parseBoolean(request.getParameter("visible"));

    Entity markerEntity = new Entity("Marker");
    markerEntity.setProperty("lat", lat);
    markerEntity.setProperty("lng", lng);
    markerEntity.setProperty("visible", visible);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(markerEntity);

    long markerId = markerEntity.getKey().getId();
    response.getWriter().println(markerId);
  }

    @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("id"));

    Key markerEntityKey = KeyFactory.createKey("Marker", id);
  
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity markerEntity;
    try {
      markerEntity = datastore.get(markerEntityKey);
    } catch (Exception e){
      throw new IllegalArgumentException("No marker with id"+id);
    }
    Double lat = (double)markerEntity.getProperty("lat");
    Double lng = (double)markerEntity.getProperty("lng");
    boolean visible = (boolean)markerEntity.getProperty("visible");

    Marker marker = new Marker(id, visible, lat, lng);
    
    Gson gson = new Gson();
    String json = gson.toJson(marker);

    response.getWriter().println(json);
  }
}