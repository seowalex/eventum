#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import ast
import webapp2
import jinja2
import os
import datetime
import json
import random
import string
import httplib2

from webapp2_extras import sessions
from google.appengine.api import users
from google.appengine.api import mail
from google.appengine.ext import ndb

from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
from oauth2client.client import Credentials
from apiclient.discovery import build

config = {}
config["webapp2_extras.sessions"] = {
    "secret_key": "ninjaflex",
}

template_env = jinja2.Environment(loader=jinja2.FileSystemLoader(os.getcwd()))

CLIENT_ID = json.loads(open('client_secrets.json', 'r').read())['web']['client_id']

SCOPES = [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'
]

VISIBLE_ACTIONS = [
    'http://schemas.google.com/AddActivity',
    'http://schemas.google.com/ReviewActivity'
]

class Users(ndb.Model):
    user_id = ndb.StringProperty()
    user_name = ndb.StringProperty()
    user_public_profile_url = ndb.StringProperty()
    user_public_profile_photo_url = ndb.StringProperty()
    user_google_credentials = ndb.JsonProperty()

class Guests(ndb.Model):
    guest_id = ndb.StringProperty()
    guest_status = ndb.StringProperty()
    guest_permissions = ndb.StringProperty()

class ForumPosts(ndb.Model):
    post_author = ndb.StringProperty()
    post_time = ndb.DateTimeProperty(auto_now_add=True)
    post_content = ndb.TextProperty()
    post_first = ndb.BooleanProperty()

class ForumThreads(ndb.Model):
    thread_id = ndb.StringProperty()
    thread_author = ndb.StringProperty()
    thread_started = ndb.DateTimeProperty(auto_now_add=True)
    thread_title = ndb.StringProperty()
    thread_pinned = ndb.BooleanProperty()
    thread_locked = ndb.BooleanProperty()
    thread_posts = ndb.StructuredProperty(ForumPosts, repeated=True)
    thread_views = ndb.IntegerProperty()

class Pledges(ndb.Model):
    pledge_id = ndb.StringProperty()
    pledge_amount = ndb.FloatProperty()

class Items(ndb.Model):
    item_id = ndb.StringProperty()
    item_confirmed = ndb.BooleanProperty()
    item_item = ndb.StringProperty()
    item_time = ndb.DateTimeProperty(auto_now_add=True)

class Logistics(ndb.Model):
    logistics_id = ndb.StringProperty()
    logistics_type = ndb.StringProperty()
    logistics_goal = ndb.FloatProperty()
    logistics_pledges = ndb.StructuredProperty(Pledges, repeated=True)
    logistics_items = ndb.StructuredProperty(Items, repeated=True)
    logistics_notes = ndb.TextProperty()

class LocationVotes(ndb.Model):
    location_vote_id = ndb.StringProperty()
    location_vote_count = ndb.IntegerProperty()

class Locations(ndb.Model):
    location_id = ndb.StringProperty()
    location_author = ndb.StringProperty()
    location_name = ndb.StringProperty()
    location_address = ndb.StringProperty()
    location_notes = ndb.TextProperty()
    location_vote_count = ndb.IntegerProperty()
    location_votes = ndb.StructuredProperty(LocationVotes, repeated=True)
    location_is_master = ndb.BooleanProperty()
    location_coordinate = ndb.GeoPtProperty()

class DateVotes(ndb.Model):
    date_vote_id = ndb.StringProperty()
    date_vote_value = ndb.StringProperty()

class Dates(ndb.Model):
    date_id = ndb.StringProperty()
    date_datetime_start = ndb.DateTimeProperty()
    date_datetime_end = ndb.DateTimeProperty()
    date_votes = ndb.StructuredProperty(DateVotes, repeated=True)
    date_is_master = ndb.BooleanProperty()

class EventOptions(ndb.Model):
    option_date_voting_enabled = ndb.BooleanProperty()
    option_forum_enabled = ndb.BooleanProperty()
    option_logistics_enabled = ndb.BooleanProperty()
    option_location_type = ndb.StringProperty()

class Events(ndb.Model):
    event_name = ndb.StringProperty()
    event_description = ndb.TextProperty()
    event_author = ndb.StringProperty()
    event_datetime_start = ndb.DateTimeProperty()
    event_datetime_end = ndb.DateTimeProperty()
    event_guests = ndb.StructuredProperty(Guests, repeated=True)
    event_invited = ndb.StringProperty(repeated=True)
    event_options = ndb.StructuredProperty(EventOptions)

class BaseSessionHandler(webapp2.RequestHandler):
    def dispatch(self):
        self.session_store = sessions.get_store(request=self.request)

        if self.session.get("gplus_id") is None:
            if self.request.path != "/" :
                print("redirect to root if no g+ user session created")
                self.redirect("/")

        try:
            webapp2.RequestHandler.dispatch(self)
        finally:
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        return self.session_store.get_session()

    def get_user_from_session(self):
        gplus_id = self.session.get("gplus_id")
        if gplus_id is None:
            print("no gplus id in session")
            return None

        print("gplus id in session:", gplus_id)
        user = Users.query(Users.user_id == gplus_id).get()
        return user

    def get_gplus_service(self):
        credentials_in_json = self.session.get("credentials")

        if credentials_in_json is None:
            return None

        credentials = Credentials.new_from_json(credentials_in_json)
        print("gplus api call", credentials)

        http = httplib2.Http()
        gplus = build("plus", "v1", http=http)
        credentials.authorize(http)
        return [gplus, http]

    def logout_url(self):
        return "/logout"

class MainHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        host_url = self.request.host_url
        path = self.request.path

        if user:
            user_entity = user

            events = Events.query(Events.event_guests.guest_id.IN([user.user_id])).order(Events.event_datetime_start, Events.event_datetime_end, Events.event_name)

            users_list = Users.query().fetch()

            if path == "/":
                template = template_env.get_template("/templates/main.html")
                outstr = template.render({ "path" : path, "user_entity" : user_entity, "logout_url" : self.logout_url(), "events" : events, "users_list" : users_list })
                self.response.write(str(outstr))
            else:
                template = template_env.get_template("/templates/error.html")
                outstr = template.render({ "path" : host_url + path, "user_entity" : user_entity, "logout_url" : self.logout_url() })
                self.response.write(str(outstr))

        else:
            hidden_key = "".join(random.choice(string.ascii_uppercase + string.digits) for x in xrange(32))
            self.session["hidden_key"] = hidden_key

            template = template_env.get_template("/templates/index.html")
            outstr = template.render({ "path" : path, "CLIENT_ID": CLIENT_ID, "HIDDEN_KEY": hidden_key })
            self.response.write(str(outstr))

class EventHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        host_url = self.request.host_url
        path = self.request.path
        query_string = self.request.query_string

        user_entity = user
        users_list = Users.query().fetch()

        try:
            if Events.get_by_id(int(self.request.get("id"))) != None:
                event = Events.get_by_id(int(self.request.get("id")))
                dates = Dates.query(Dates.date_id == self.request.get("id"))
                forum = ForumThreads.query(ForumThreads.thread_id == self.request.get("id")).order(-ForumThreads.thread_pinned, -ForumThreads.thread_posts.post_time)
                locations = Locations.query(Locations.location_id == self.request.get("id"))

                status_count = [0, 0, 0]

                for guest in event.event_guests:
                    if guest.guest_status == "going":
                        status_count[0] += 1
                    elif guest.guest_status == "maybe":
                        status_count[1] += 1
                    elif guest.guest_status == "notgoing":
                        status_count[2] += 1

                for guest in event.event_guests:
                    if guest.guest_id == user.user_id:
                        template = template_env.get_template("/templates/%s.html" % path)
                        outstr = template.render({ "path" : path, "user_entity" : user_entity, "users_list" : users_list, "logout_url" : self.logout_url(), "event" : event, "status_count" : status_count, "dates" : dates, "forum" : forum, "locations" : locations })
                        break

                else:
                    template = template_env.get_template("/templates/accessDenied.html")
                    outstr = template.render({ "user_entity" : user_entity, "logout_url" : self.logout_url(), "event" : event })

                if path == "/forum" and event.event_options.option_forum_enabled == False:
                    self.redirect("/event?id=" + self.request.get("id"))

                else:
                    self.response.write(str(outstr))

            else:
                template = template_env.get_template("/templates/error.html")
                outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
                self.response.write(str(outstr))

        except ValueError:
            template = template_env.get_template("/templates/error.html")
            outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
            self.response.write(str(outstr))

class CreateEventHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        path = self.request.path

        user_entity = user

        template = template_env.get_template("/templates/%s.html" % path)
        outstr = template.render({ "path" : path, "user_entity" : user_entity, "logout_url" : self.logout_url() })
        self.response.write(str(outstr))

    def post(self):
        user = self.get_user_from_session()

        event = Events(event_author = user.user_id,
                       event_guests = [Guests(guest_id = user.user_id,
                                              guest_status = "going",
                                              guest_permissions = "admin")],
                       event_name = self.request.get("event_name"),
                       event_description = self.request.get("event_description"),
                       event_options = EventOptions(option_date_voting_enabled = ast.literal_eval(self.request.get("date_voting_enabled")),
                                                    option_forum_enabled = ast.literal_eval(self.request.get("forum_enabled")),
                                                    option_logistics_enabled = ast.literal_eval(self.request.get("logistics_enabled")),
                                                    option_location_type = self.request.get("location_type")))

        if ast.literal_eval(self.request.get("date_voting_enabled")) == False:
            event.event_datetime_start = datetime.datetime.strptime(self.request.get("event_datetime_start"), "%d/%m/%Y %I:%M %p")
            event.event_datetime_end = datetime.datetime.strptime(self.request.get("event_datetime_end"), "%d/%m/%Y %I:%M %p")

        event_key = event.put()

        if ast.literal_eval(self.request.get("date_voting_enabled")) == False:
            date = Dates(date_id = str(event_key.id()),
                         date_datetime_start = datetime.datetime.strptime(self.request.get("event_datetime_start"), "%d/%m/%Y %I:%M %p"),
                         date_datetime_end = datetime.datetime.strptime(self.request.get("event_datetime_end"), "%d/%m/%Y %I:%M %p"),
                         date_is_master = True)

            date.put()

        if self.request.get("location_type") == "fixed":
            location = Locations(location_id = str(event_key.id()),
                                 location_author = user.user_id,
                                 location_name = self.request.get("location_name"),
                                 location_address = self.request.get("location_address"),
                                 location_notes = self.request.get("location_notes"),
                                 location_vote_count = 0,
                                 location_is_master = True,
                                 location_coordinate = ndb.GeoPt(float(self.request.get("location_lat")), float(self.request.get("location_long"))))

            location.put()

        self.redirect("/event?id=" + str(event_key.id()) + "&notification=createEvent")

class EditEventHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        host_url = self.request.host_url
        path = self.request.path
        query_string = self.request.query_string

        user_entity = user
        users_list = Users.query().fetch()

        try:
            if Events.get_by_id(int(self.request.get("id"))) != None:
                event = Events.get_by_id(int(self.request.get("id")))
                locations = Locations.query(Locations.location_id == self.request.get("id"))
                location = Locations.query(Locations.location_is_master == True).get()

                for guest in event.event_guests:
                    if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                        template = template_env.get_template("/templates/%s.html" % path)
                        outstr = template.render({ "path" : path, "user_entity" : user_entity, "users_list" : users_list, "logout_url" : self.logout_url(), "event" : event, "locations" : locations, "location": location })
                        self.response.write(str(outstr))
                        break

                else:
                    template = template_env.get_template("/templates/accessDenied.html")
                    outstr = template.render({ "path" : path, "user_entity" : user_entity, "logout_url" : self.logout_url(), "event" : event })
                    self.response.write(str(outstr))

            else:
                template = template_env.get_template("/templates/error.html")
                outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
                self.response.write(str(outstr))

        except ValueError:
            template = template_env.get_template("/templates/error.html")
            outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
            self.response.write(str(outstr))

    def post(self):
        user = self.get_user_from_session()

        event = Events.get_by_id(int(self.request.get("id")))
        dates = Dates.query(Dates.date_id == self.request.get("id"))
        master_date = Dates.query(Dates.date_id == self.request.get("id"), Dates.date_is_master == True).get()
        locations = Locations.query(Locations.location_id == self.request.get("id"))
        fixed_location = Locations.query(Locations.location_id == self.request.get("id"), Locations.location_is_master == True).get()

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                event.event_name = self.request.get("event_name")
                event.event_description = self.request.get("event_description")
                event.event_options.option_date_voting_enabled = ast.literal_eval(self.request.get("date_voting_enabled"))

                for guest in event.event_guests:
                    if guest.guest_id != user.user_id:
                        guest.guest_permissions = "guest"

                for admin_id in self.request.get_all("event_admins"):
                    for guest in event.event_guests:
                        if guest.guest_id == admin_id:
                            guest.guest_permissions = "admin"

                event.event_options.option_forum_enabled = ast.literal_eval(self.request.get("forum_enabled"))
                event.event_options.option_logistics_enabled = ast.literal_eval(self.request.get("logistics_enabled"))
                event.event_options.option_location_type = self.request.get("location_type")

                event_key = event.put()

                if ast.literal_eval(self.request.get("date_voting_enabled")) == False:
                    event.event_datetime_start = datetime.datetime.strptime(self.request.get("event_datetime_start"), "%d/%m/%Y %I:%M %p")
                    event.event_datetime_end = datetime.datetime.strptime(self.request.get("event_datetime_end"), "%d/%m/%Y %I:%M %p")

                    event.put()

                    if master_date:
                        master_date.date_datetime_start = datetime.datetime.strptime(self.request.get("event_datetime_start"), "%d/%m/%Y %I:%M %p")
                        master_date.date_datetime_end = datetime.datetime.strptime(self.request.get("event_datetime_end"), "%d/%m/%Y %I:%M %p")

                        master_date.put()

                    else:
                        date = Dates(date_id = str(event_key.id()),
                                     date_datetime_start = datetime.datetime.strptime(self.request.get("event_datetime_start"), "%d/%m/%Y %I:%M %p"),
                                     date_datetime_end = datetime.datetime.strptime(self.request.get("event_datetime_end"), "%d/%m/%Y %I:%M %p"),
                                     date_is_master = True)

                        date.put()

                else:
                    del event.event_datetime_start
                    del event.event_datetime_end

                    event.put()

                    for date in dates:
                        if date.date_is_master == True:
                            date.date_is_master = False
                            date.put()

                if self.request.get("location_type") == "fixed":
                    if fixed_location:
                        fixed_location.location_name = self.request.get("location_name")
                        fixed_location.location_address = self.request.get("location_address")
                        fixed_location.location_notes = self.request.get("location_notes")
                        fixed_location.location_coordinate = ndb.GeoPt(float(self.request.get("location_lat")), float(self.request.get("location_long")))

                        fixed_location.put()

                    else:
                        location = Locations(location_id = str(event_key.id()),
                                             location_author = user.user_id,
                                             location_name = self.request.get("location_name"),
                                             location_address = self.request.get("location_address"),
                                             location_notes = self.request.get("location_notes"),
                                             location_vote_count = 0,
                                             location_is_master = True,
                                             location_coordinate = ndb.GeoPt(float(self.request.get("location_lat")), float(self.request.get("location_long"))))

                        location.put()

                if self.request.get("location_type") == "voting":
                    for location in locations:
                        if location.location_is_master == True:
                            location.location_is_master = False
                            location.put()
                break

        self.redirect("/event?id=" + self.request.get("id") + "&notification=editEvent")

class DeleteEventHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()

        event = Events.get_by_id(int(self.request.get("id")))
        dates = Dates.query(Dates.date_id == self.request.get("id"))
        threads = ForumThreads.query(ForumThreads.thread_id == self.request.get("id"))
        locations = Locations.query(Locations.location_id == self.request.get("id"))
        logistics = Logistics.query(Logistics.logistics_id == self.request.get("id"))

        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                event.key.delete()
                for date in dates:
                    date.key.delete()
                for thread in threads:
                    thread.key.delete()
                for location in locations:
                    location.key.delete()
                for logistic in logistics:
                    logistic.key.delete()

                auth = True

        self.response.write(auth)

class EventParticipationHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        host_url = self.request.host_url
        path = self.request.path
        query_string = self.request.query_string

        user_entity = user

        try:
            if Events.get_by_id(int(self.request.get("id"))) != None:
                event = Events.get_by_id(int(self.request.get("id")))

                for guest in event.event_guests:
                    if user.user_id == guest.guest_id:
                        guest.guest_status = self.request.get("participation")
                        break

                else:
                    event.event_guests += [Guests(guest_id = user.user_id,
                                                  guest_status = self.request.get("participation"),
                                                  guest_permissions = "guest")]

                event.put()

                self.redirect("/event?id=" + self.request.get("id"))

            else:
                template = template_env.get_template("/templates/error.html")
                outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
                self.response.write(str(outstr))

        except ValueError:
            template = template_env.get_template("/templates/error.html")
            outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
            self.response.write(str(outstr))

    def post(self):
        user = self.get_user_from_session()

        event = Events.get_by_id(int(self.request.get("id")))

        new = True

        for guest in event.event_guests:
            if user.user_id == guest.guest_id:
                guest.guest_status = self.request.get("participation")
                new = False

        if new == True:
            event.event_guests += [Guests(guest_id = user.user_id,
                                          guest_status = self.request.get("participation"),
                                          guest_permissions = "guest")]

        event.put()

class InviteHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        user_entity = user

        event = Events.get_by_id(int(self.request.get("id")))

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                self.id = self.request.get("id")
                self.email = self.request.get("email")
                self.eventName = event.event_name
                self.eventDescription = event.event_description

                messagebody = """<!DOCTYPE html>
                    <html lang="en">
                        <body>
                            <h1>You have been invited to %s by <a href="%s" target="_blank">%s</a></h1>
                            <p>%s</p>
                            <p>
                                <a href="http://gcdc2013-eventum.appspot.com/eventParticipation?id=%s&participation=going" style="display: inline-block; padding: 6px 12px; margin-bottom: 0; font-size: 14px; font-weight: normal; line-height: 1.428571429; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; background-image: none; border: 1px solid transparent; border-radius: 4px; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none; color: #333333; background-color: #ffffff; border-color: #cccccc;">Going</a>
                                <a href="http://gcdc2013-eventum.appspot.com/eventParticipation?id=%s&participation=maybe" style="display: inline-block; padding: 6px 12px; margin-bottom: 0; font-size: 14px; font-weight: normal; line-height: 1.428571429; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; background-image: none; border: 1px solid transparent; border-radius: 4px; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none; color: #333333; background-color: #ffffff; border-color: #cccccc;">Maybe</a>
                                <a href="http://gcdc2013-eventum.appspot.com/eventParticipation?id=%s&participation=notgoing" style="display: inline-block; padding: 6px 12px; margin-bottom: 0; font-size: 14px; font-weight: normal; line-height: 1.428571429; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; background-image: none; border: 1px solid transparent; border-radius: 4px; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none; color: #333333; background-color: #ffffff; border-color: #cccccc;">Not Going</a>
                            </p>
                        </body>
                    </html>""" % (self.eventName, user_entity.user_public_profile_url, user_entity.user_name, self.eventDescription, self.request.get("id"), self.request.get("id"), self.request.get("id"))

                mail.send_mail(sender = "Eventum <seowalex1@gmail.com>",
                               to = self.email,
                               subject = "Invitation to %s" % self.eventName,
                               body = messagebody,
                               html = messagebody)

class DateHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        host_url = self.request.host_url
        path = self.request.path
        query_string = self.request.query_string

        user_entity = user
        users_list = Users.query().fetch()

        try:
            if Events.get_by_id(int(self.request.get("id"))) != None:
                event = Events.get_by_id(int(self.request.get("id")))
                dates = Dates.query(Dates.date_id == self.request.get("id"))

                if event.event_options.option_date_voting_enabled == True:
                    for guest in event.event_guests:
                        if guest.guest_id == user.user_id:
                            template = template_env.get_template("/templates/%s.html" % path)
                            outstr = template.render({ "path" : path, "user_entity" : user_entity, "users_list" : users_list, "logout_url" : self.logout_url(), "event" : event, "dates" : dates })
                            break

                    else:
                        template = template_env.get_template("/templates/accessDenied.html")
                        outstr = template.render({ "user_entity" : user_entity, "logout_url" : self.logout_url(), "event" : event })

                    self.response.write(str(outstr))

                else:
                    self.redirect("/event?id=" + self.request.get("id"))

            else:
                template = template_env.get_template("/templates/error.html")
                outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
                self.response.write(str(outstr))

        except ValueError:
            template = template_env.get_template("/templates/error.html")
            outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
            self.response.write(str(outstr))

class AddDateHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and self.request.get("event_datetime_start") != "" and self.request.get("event_datetime_end") != "":
                date = Dates(date_id = self.request.get("id"),
                             date_datetime_start = datetime.datetime.strptime(self.request.get("event_datetime_start"), "%d/%m/%Y %I:%M %p"),
                             date_datetime_end = datetime.datetime.strptime(self.request.get("event_datetime_end"), "%d/%m/%Y %I:%M %p"),
                             date_is_master = False)

                date_key = date.put()

                auth = True

                self.response.write(date_key.integer_id())
                self.response.write("/")

        self.response.write(auth)

class DeleteDateHandler(BaseSessionHandler):
     def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        date = Dates.get_by_id(int(self.request.get("date_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                auth = True
                date.key.delete()

        self.response.write(auth)

class ConfirmDateHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        dates = Dates.query(Dates.date_id == self.request.get("id"))
        date = Dates.get_by_id(int(self.request.get("date_id")))
        auth = False

        for adate in dates:
            if adate.date_is_master == True:
                adate.date_is_master = False
                adate.put()

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                date.date_is_master = True
                event.event_datetime_start = date.date_datetime_start
                event.event_datetime_end = date.date_datetime_end
                event.event_options.option_date_voting_enabled = False
                auth = True
                break

        date.put()
        event.put()

        self.response.write(auth)

class DateVotingHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()

        event = Events.get_by_id(int(self.request.get("id")))
        date = Dates.get_by_id(int(self.request.get("date_id")))

        new = True

        for guest in event.event_guests:
            if user.user_id == guest.guest_id:
                for vote in date.date_votes:
                    if vote.date_vote_id == guest.guest_id:
                        vote.date_vote_value = self.request.get("availability")
                        new = False

        if new == True:
            date.date_votes += [DateVotes(date_vote_id = user.user_id,
                                          date_vote_value = self.request.get("availability"))]

        date.put()

class ThreadHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        host_url = self.request.host_url
        path = self.request.path
        query_string = self.request.query_string

        user_entity = user
        users_list = Users.query().fetch()

        try:
            if Events.get_by_id(int(self.request.get("id"))) != None and ForumThreads.get_by_id(int(self.request.get("thread_id"))) != None:
                event = Events.get_by_id(int(self.request.get("id")))
                thread = ForumThreads.get_by_id(int(self.request.get("thread_id")))

                for guest in event.event_guests:
                    if guest.guest_id == user.user_id:
                        thread.thread_views += 1
                        thread.put()

                        template = template_env.get_template("/templates/%s.html" % path)
                        outstr = template.render({ "path" : path, "user_entity" : user_entity, "users_list" : users_list, "logout_url" : self.logout_url(), "event" : event, "thread" : thread })
                        break

                else:
                    template = template_env.get_template("/templates/accessDenied.html")
                    outstr = template.render({ "user_entity" : user_entity, "logout_url" : self.logout_url(), "event" : event })

                self.response.write(str(outstr))

            else:
                template = template_env.get_template("/templates/error.html")
                outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
                self.response.write(str(outstr))

        except ValueError:
            template = template_env.get_template("/templates/error.html")
            outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
            self.response.write(str(outstr))

class AddThreadHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and event.event_options.option_forum_enabled == True and self.request.get("thread_title") != "" and self.request.get("thread_content") != "":
                thread = ForumThreads(thread_id = self.request.get("id"),
                                      thread_author = self.request.get("user_id"),
                                      thread_title = self.request.get("thread_title"),
                                      thread_pinned = False,
                                      thread_locked = False,
                                      thread_posts = [ForumPosts(post_author = self.request.get("user_id"),
                                                                 post_content = self.request.get("thread_content"),
                                                                 post_first = True)],
                                      thread_views = 0)

                thread_key = thread.put()

                auth = True

                self.response.write(thread_key.integer_id())
                self.response.write("/")

        self.response.write(auth)

class DeleteThreadHandler(BaseSessionHandler):
     def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        thread = ForumThreads.get_by_id(int(self.request.get("thread_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                auth = True
                thread.key.delete()

        self.response.write(auth)

class PinThreadHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        thread = ForumThreads.get_by_id(int(self.request.get("thread_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                thread.thread_pinned = not thread.thread_pinned
                thread.put()

                auth = True

        self.response.write(auth)

class LockThreadHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        thread = ForumThreads.get_by_id(int(self.request.get("thread_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                thread.thread_locked = not thread.thread_locked
                thread.put()

                auth = True

        self.response.write(auth)

class UpdateThreadHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        thread = ForumThreads.get_by_id(int(self.request.get("thread_id")))
        users_list = Users.query().fetch()

        for guest in event.event_guests:
            if guest.guest_id == user.user_id:
                if self.request.get("type") == "first_post":
                    self.response.write(thread.thread_posts[0].post_content)

                if self.request.get("type") == "update_posts":
                    for post in thread.thread_posts:
                        self.response.write(post.post_time)
                        self.response.write("/")

                    self.response.write("True")

                if self.request.get("type") == "post_content":
                    for post in thread.thread_posts:
                        if post.post_time.strftime('%Y-%m-%d %H:%M:%S.%f') == self.request.get("time"):
                            self.response.write(post.post_content)
                            self.response.write("/")
                            self.response.write("True")

                if self.request.get("type") == "post_author":
                    for post in thread.thread_posts:
                        if post.post_time.strftime('%Y-%m-%d %H:%M:%S.%f') == self.request.get("time"):
                            for guest in event.event_guests:
                                if guest.guest_id == post.post_author:
                                    for user1 in users_list:
                                         if user1.user_id == post.post_author:
                                            self.response.write(user1.user_name)
                                            self.response.write("/")
                                            self.response.write("True")

                if self.request.get("type") == "post_author_public_profile_url":
                    for post in thread.thread_posts:
                        if post.post_time.strftime('%Y-%m-%d %H:%M:%S.%f') == self.request.get("time"):
                            for guest in event.event_guests:
                                if guest.guest_id == post.post_author:
                                    for user1 in users_list:
                                         if user1.user_id == post.post_author:
                                            self.response.write(user1.user_public_profile_url)
                                            self.response.write("/")
                                            self.response.write("True")

                if self.request.get("type") == "post_author_public_profile_photo_url":
                    for post in thread.thread_posts:
                        if post.post_time.strftime('%Y-%m-%d %H:%M:%S.%f') == self.request.get("time"):
                            for guest in event.event_guests:
                                if guest.guest_id == post.post_author:
                                    for user1 in users_list:
                                         if user1.user_id == post.post_author:
                                            self.response.write(user1.user_public_profile_photo_url)
                                            self.response.write("/")
                                            self.response.write("True")

class AddPostHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        thread = ForumThreads.get_by_id(int(self.request.get("thread_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and self.request.get("post_content") != "" and thread.thread_locked == False:
                thread.thread_posts += [ForumPosts(post_author = user.user_id,
                                                   post_content = self.request.get("post_content"),
                                                   post_first = False)]

                auth = True

                thread.put()

                self.response.write(thread.thread_posts[-1].post_time)
                self.response.write("/")

        self.response.write(auth)

class EditPostHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()

        event = Events.get_by_id(int(self.request.get("id")))
        thread = ForumThreads.get_by_id(int(self.request.get("thread_id")))
        post_time = self.request.get("post_time")
        auth = False

        for post in thread.thread_posts:
            for guest in event.event_guests:
                if guest.guest_id == user.user_id and post.post_author == guest.guest_id and post.post_time.strftime('%Y-%m-%d %H:%M:%S.%f') == post_time and post.post_first == True and thread.thread_locked == False and self.request.get("post_content") != "":
                    post.post_content = self.request.get("post_content")
                    auth = True

        thread.put()

        self.response.write(auth)

class DeletePostHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()

        event = Events.get_by_id(int(self.request.get("id")))
        thread = ForumThreads.get_by_id(int(self.request.get("thread_id")))
        post_time = self.request.get("post_time")
        auth = False

        for post in thread.thread_posts:
            for guest in event.event_guests:
                if guest.guest_permissions == "admin" and guest.guest_id == user.user_id and post.post_time.strftime('%Y-%m-%d %H:%M:%S.%f') == post_time and post.post_first != True and thread.thread_locked == False:
                    thread.thread_posts.remove(post)
                    auth = True

        thread.put()

        self.response.write(auth)

class LogisticsHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        host_url = self.request.host_url
        path = self.request.path
        query_string = self.request.query_string

        user_entity = user
        users_list = Users.query().fetch()

        try:
            if Events.get_by_id(int(self.request.get("id"))) != None:
                event = Events.get_by_id(int(self.request.get("id")))
                logistics = Logistics.query(Logistics.logistics_id == self.request.get("id"))

                if event.event_options.option_logistics_enabled == True:
                    for guest in event.event_guests:
                        if guest.guest_id == user.user_id:
                            template = template_env.get_template("/templates/%s.html" % path)
                            outstr = template.render({ "path" : path, "user_entity" : user_entity, "users_list" : users_list, "logout_url" : self.logout_url(), "event" : event, "logistics" : logistics })
                            break

                    else:
                        template = template_env.get_template("/templates/accessDenied.html")
                        outstr = template.render({ "user_entity" : user_entity, "logout_url" : self.logout_url(), "event" : event })

                    self.response.write(str(outstr))

                else:
                    self.redirect("/event?id=" + self.request.get("id"))

            else:
                template = template_env.get_template("/templates/error.html")
                outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
                self.response.write(str(outstr))

        except ValueError:
            template = template_env.get_template("/templates/error.html")
            outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
            self.response.write(str(outstr))

class AddLogisticsHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                if self.request.get("logistics_type") == "crowdfunding" and self.request.get("logistics_goal") != "":
                    logistics = Logistics(logistics_id = self.request.get("id"),
                                          logistics_type = self.request.get("logistics_type"),
                                          logistics_goal = float(self.request.get("logistics_goal")),
                                          logistics_notes = self.request.get("logistics_notes"))

                if self.request.get("logistics_type") == "crowdsourcing":
                    logistics = Logistics(logistics_id = self.request.get("id"),
                                          logistics_type = self.request.get("logistics_type"),
                                          logistics_notes = self.request.get("logistics_notes"))

                logistics_key = logistics.put()

                auth = True

                self.response.write(logistics_key.integer_id())
                self.response.write("/")

        self.response.write(auth)

class EditLogisticsHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        logistics = Logistics.get_by_id(int(self.request.get("logistics_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                logistics.logistics_notes = self.request.get("logistics_notes")

                logistics.put()

                auth = True

        self.response.write(auth)

class DeleteLogisticsHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        logistics = Logistics.get_by_id(int(self.request.get("logistics_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                auth = True
                logistics.key.delete()
                break

        self.response.write(auth)

class PledgeHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        logistics = Logistics.get_by_id(int(self.request.get("logistics_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id:
                if self.request.get("pledge_amount") != "" and isinstance(float(self.request.get("pledge_amount")), float) and int(self.request.get("pledge_amount")) >= 0:
                    for pledge in logistics.logistics_pledges:
                        if pledge.pledge_id == guest.guest_id:
                            if float(self.request.get("pledge_amount")) != 0:
                                pledge.pledge_amount = float(self.request.get("pledge_amount"))
                            else:
                                logistics.logistics_pledges.remove(pledge)
                            break

                    else:
                        if float(self.request.get("pledge_amount")) != 0:
                            logistics.logistics_pledges += [Pledges(pledge_id = user.user_id,
                                                                    pledge_amount = float(self.request.get("pledge_amount")))]

                    logistics.put()

                    auth = True

        self.response.write(auth)

class AddItemHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        logistics = Logistics.get_by_id(int(self.request.get("logistics_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and self.request.get("item_item") != "":
                logistics.logistics_items += [Items(item_item = self.request.get("item_item"))]

                logistics.put()

                self.response.write(logistics.logistics_items[-1].item_time)
                self.response.write("/")
                auth = True

        self.response.write(auth)

class BringItemHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()

        event = Events.get_by_id(int(self.request.get("id")))
        logistics = Logistics.get_by_id(int(self.request.get("logistics_id")))
        item_time = self.request.get("item_time")
        auth = False

        for item in logistics.logistics_items:
            for guest in event.event_guests:
                if guest.guest_id == user.user_id and item.item_time.strftime('%Y-%m-%d %H:%M:%S.%f') == item_time:
                    if item.item_id == None:
                        item.item_id = user.user_id

                    else:
                        item.item_id = None

                    auth = True

        logistics.put()

        self.response.write(auth)

class DeleteItemHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()

        event = Events.get_by_id(int(self.request.get("id")))
        logistics = Logistics.get_by_id(int(self.request.get("logistics_id")))
        item_time = self.request.get("item_time")
        auth = False

        for item in logistics.logistics_items:
            for guest in event.event_guests:
                if guest.guest_id == user.user_id and item.item_time.strftime('%Y-%m-%d %H:%M:%S.%f') == item_time:
                    logistics.logistics_items.remove(item)

                    auth = True

        logistics.put()

        self.response.write(auth)

class LocationHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        host_url = self.request.host_url
        path = self.request.path
        query_string = self.request.query_string

        user_entity = user
        users_list = Users.query().fetch()

        try:
            if Events.get_by_id(int(self.request.get("id"))) != None:
                event = Events.get_by_id(int(self.request.get("id")))
                locations = Locations.query(Locations.location_id == self.request.get("id"))

                if event.event_options.option_location_type == "voting":
                    for guest in event.event_guests:
                        if guest.guest_id == user.user_id:
                            template = template_env.get_template("/templates/%s.html" % path)
                            outstr = template.render({ "path" : path, "user_entity" : user_entity, "users_list" : users_list, "logout_url" : self.logout_url(), "event" : event, "locations" : locations })
                            break

                    else:
                        template = template_env.get_template("/templates/accessDenied.html")
                        outstr = template.render({ "user_entity" : user_entity, "logout_url" : self.logout_url(), "event" : event })

                    self.response.write(str(outstr))

                else:
                    self.redirect("/event?id=" + self.request.get("id"))

            else:
                template = template_env.get_template("/templates/error.html")
                outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
                self.response.write(str(outstr))

        except ValueError:
            template = template_env.get_template("/templates/error.html")
            outstr = template.render({ "path" : host_url + path + "?" + query_string, "user_entity" : user_entity, "logout_url" : self.logout_url() })
            self.response.write(str(outstr))

class AddLocationHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and self.request.get("location_name") != "" and self.request.get("location_address") != "":
                location = Locations(location_id = self.request.get("id"),
                                     location_author = user.user_id,
                                     location_name = self.request.get("location_name"),
                                     location_address = self.request.get("location_address"),
                                     location_notes = self.request.get("location_notes"),
                                     location_vote_count = 0,
                                     location_is_master = False,
                                     location_coordinate = ndb.GeoPt(float(self.request.get("location_lat")), float(self.request.get("location_long"))))

                location_key = location.put()

                auth = True

                self.response.write(location_key.integer_id())
                self.response.write("/")

        self.response.write(auth)

class DeleteLocationHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        location = Locations.get_by_id(int(self.request.get("location_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin" or guest.guest_id == location.location_author:
                auth = True
                location.key.delete()
                break

        self.response.write(auth)

class EditLocationHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        location = Locations.get_by_id(int(self.request.get("location_id")))
        auth = False

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_id == location.location_author:
                auth = True
                location.location_name = self.request.get("location_name")
                location.location_notes = self.request.get("location_notes")

                location.put()

        self.response.write(auth)

class ConfirmLocationHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        locations = Locations.query(Locations.location_id == self.request.get("id"))
        location = Locations.get_by_id(int(self.request.get("location_id")))
        auth = False

        for alocation in locations:
            if alocation.location_is_master == True:
                alocation.location_is_master = False
                alocation.put()

        for guest in event.event_guests:
            if guest.guest_id == user.user_id and guest.guest_permissions == "admin":
                location.location_is_master = True
                event.event_options.option_location_type = "fixed"
                auth = True
                break

        location.put()
        event.put()

        self.response.write(auth)

class LocationVotingHandler(BaseSessionHandler):
    def post(self):
        user = self.get_user_from_session()
        event = Events.get_by_id(int(self.request.get("id")))
        location = Locations.get_by_id(int(self.request.get("location_id")))
        auth = False
        vote_count = 0

        for guest in event.event_guests:
            if guest.guest_id == user.user_id:
                if self.request.get("vote") == "upvote":
                    for vote in location.location_votes:
                        if vote.location_vote_id == user.user_id:
                            if vote.location_vote_count != 1:
                                vote.location_vote_count = 1
                                change = True
                            break

                    else:
                        location.location_votes += [LocationVotes(location_vote_id = user.user_id,
                                                                  location_vote_count = 1)]

                        new = True

                elif self.request.get("vote") == "downvote":
                    for vote in location.location_votes:
                        if vote.location_vote_id == user.user_id:
                            if vote.location_vote_count != -1:
                                vote.location_vote_count = -1
                                change = True
                            break

                    else:
                        location.location_votes += [LocationVotes(location_vote_id = user.user_id,
                                                                  location_vote_count = -1)]

                        new = True

                auth = True

                for vote in location.location_votes:
                    vote_count += vote.location_vote_count

                location.location_vote_count = vote_count

                location.put()

        self.response.write(vote_count)
        self.response.write("/")
        self.response.write(auth)

class ProfileHandler(BaseSessionHandler):
    def get(self):
        user = self.get_user_from_session()
        path = self.request.path

        user_entity = user

        template = template_env.get_template("/templates/%s.html" % path)
        outstr = template.render({ "path" : path, "user_entity" : user_entity , "logout_url" : self.logout_url() })
        self.response.write(str(outstr))

class GPlusConnectHandler(BaseSessionHandler):
    @staticmethod
    def save_user(gplus_id, credentials):
        http = httplib2.Http()
        plus = build("plus", "v1", http=http)
        credentials.authorize(http)
        profile = plus.people().get(userId="me").execute()
        print("gplus connection handler, save user", profile)

        user = Users.query(Users.user_id == gplus_id).get()
        if user is None:
            user = Users()
            user.user_id = profile.get("id")
            user.user_name = profile.get("displayName")
            user.user_public_profile_url = profile.get("url")

            image = profile.get("image")
            if image is not None:
                user.user_public_profile_photo_url = image.get("url").split("?")[0]

        user.user_google_credentials = credentials.to_json()
        user.put()
        print("user=", user)

        return user

    def post(self):
        hidden_key = self.request.get("key", "")
        if hidden_key != self.session["hidden_key"]:
            self.response.status = 301
            self.response.body = "Invalid key for the request"
            return self.response

        code = self.request.body
        print("code=", code)

        try:
          oauth_flow = flow_from_clientsecrets("client_secrets.json", scope=" ".join(SCOPES))
          oauth_flow.redirect_uri = "postmessage"
          credentials = oauth_flow.step2_exchange(code)
        except FlowExchangeError:
            self.response.status = 401
            self.response.body = "Failed to upgrade the authorization code."
            return self.response

        gplus_id = credentials.id_token["sub"]
        credentials_in_json = credentials.to_json()
        print("g+=", gplus_id, "credentials=", credentials_in_json)
        self.save_user(gplus_id, credentials)

        stored_credentials = self.session.get("credentials")
        stored_gplus_id = self.session.get("gplus_id")
        if stored_credentials is not None and gplus_id == stored_gplus_id:
            self.response.status = 200
            self.response.body = "Current user is already connected."
            self.session["credentials"] = credentials_in_json
            return self.response

        self.session["credentials"] = credentials_in_json
        self.session["gplus_id"] = gplus_id

        self.response.status = 200
        self.response.body = "Current user is already connected."
        return self.response

class LogoutHandler(BaseSessionHandler):
    def clear_session(self):
        self.session.pop("credentials", None)
        self.session.pop("gplus_id", None)

    def get(self):
        credentials_in_json = self.session.get("credentials")
        gplus_id = self.session.get("gplus_id")

        print("logout session", self.session)

        message = None
        if credentials_in_json is None:
            message = "Current user is not connected."
        else:
            credentials = Credentials.new_from_json(credentials_in_json)
            print("logout=", credentials)

            access_token = credentials.access_token
            url = "https://accounts.google.com/o/oauth2/revoke?token=%s" % access_token
            h = httplib2.Http()
            result = h.request(url, "GET")[0]

            print("logout=", result)

            if result["status"] == "200":
                message = "Successfully disconnected."
            else:
                message = "Failed to revoke token for given user."

        print("logout message:", message)
        self.clear_session()
        self.redirect("/")

app = webapp2.WSGIApplication([
    ("/event", EventHandler), ("/createEvent", CreateEventHandler), ("/editEvent", EditEventHandler), ("/deleteEvent", DeleteEventHandler), ("/eventParticipation", EventParticipationHandler), ("/invite", InviteHandler), ("/date", DateHandler), ("/addDate", AddDateHandler), ("/deleteDate", DeleteDateHandler), ("/confirmDate", ConfirmDateHandler), ("/dateVoting", DateVotingHandler), ("/forum", EventHandler), ("/thread", ThreadHandler), ("/addThread", AddThreadHandler), ("/deleteThread", DeleteThreadHandler), ("/pinThread", PinThreadHandler), ("/lockThread", LockThreadHandler), ("/updateThread", UpdateThreadHandler), ("/addPost", AddPostHandler), ("/editPost", EditPostHandler), ("/deletePost", DeletePostHandler), ("/logistics", LogisticsHandler), ("/addLogistics", AddLogisticsHandler), ("/editLogistics", EditLogisticsHandler),("/deleteLogistics", DeleteLogisticsHandler), ("/pledge", PledgeHandler), ("/addItem", AddItemHandler), ("/bringItem", BringItemHandler), ("/deleteItem", DeleteItemHandler), ("/location", LocationHandler), ("/addLocation", AddLocationHandler), ("/deleteLocation", DeleteLocationHandler), ("/editLocation", EditLocationHandler), ("/confirmLocation", ConfirmLocationHandler), ("/locationVoting", LocationVotingHandler), ("/guests", EventHandler), ("/gplusconnect", GPlusConnectHandler), ("/logout", LogoutHandler), ("/profile", ProfileHandler), ("/.*", MainHandler)
], config=config, debug=True)
