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

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.sps.data.User;
import com.google.gson.Gson;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;

@WebServlet("/get-user")
public class GetUserServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/json");
    String requestedUserId = (String) request.getParameter("id");
    
    Entity requestedUserEntity = getUserEntity(requestedUserId);
    String nickname = (String) requestedUserEntity.getProperty("nickname");

    UserService userService = UserServiceFactory.getUserService();
    String currUserId = "";
    if (userService.isUserLoggedIn()) {
      currUserId = (String) userService.getCurrentUser().getUserId();
    }

    User user;
    if (currUserId == requestedUserId) {
      user = new User(requestedUserId, nickname, /*LoggedIn=*/true);
    } else {
      user = new User(requestedUserId, nickname, /*LoggedIn=*/false);
    }

    Gson gson = new Gson();
    String userJson;
    userJson = gson.toJson(user);
    response.getWriter().println(userJson);
  }

  /**
   * @return the entity of the current user containing their userId and nickname
   */
  private Entity getUserEntity(String userId) {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query("User").setFilter
        (new Query.FilterPredicate("id", Query.FilterOperator.EQUAL, userId));
    PreparedQuery results = datastore.prepare(query);
    Entity entity = results.asSingleEntity();

    if (entity == null) {
      entity = new Entity("User");
      entity.setProperty("id", userId);
      entity.setProperty("nickname", "New User");
    }

    return entity;
  }
}
