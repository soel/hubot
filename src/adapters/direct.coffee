
# customize
endpoint = process.env.HUBOT_DIRECT_ENDPOINT ? "wss://api.direct4b.com/albero-app-server/api"
accessToken = process.env.HUBOT_DIRECT_TOKEN

# Hubot dependencies
Robot                                                = require '../robot'
Adapter                                              = require '../adapter'
{TextMessage,EnterMessage,LeaveMessage,TopicMessage} = require '../message'

# dependencies
EventEmitter = require('events').EventEmitter
DirectAPI    = require('./direct-api').DirectAPI
url          = require('url')

class Direct extends Adapter

  send: (envelope, strings...) ->
    strings.forEach (string) =>
      if typeof(string) == 'function'
        string()
      else
        @robot.logger.debug "Sending strings to user: " + envelope.user.name
        @bot.send envelope, string

  reply: (envelope, strings...) ->
    @send envelope, strings.map((str) -> "@#{envelope.user.name} #{str}")...

  leave: (envelope) ->
    @bot.leave envelope
 
  run: ->
   self = @

   options =
     host:     url.parse(endpoint).host
     endpoint: endpoint
     name:     @robot.name
     access_token: accessToken

   bot = DirectAPI.getInstance();
   bot.setOptions options

   withAuthor = (callback) ->
     (talk, user, msg) ->
       envelope = self.robot.brain.userForId(user.id)
       envelope.name = user.name
       envelope.email = user.email
       envelope.room = talk.id
       envelope.rooms ?= {}
       envelope.rooms[talk.id] =
         topic: talk.name
         users: talk.users
       callback envelope, msg

   bot.on "TextMessage",
     withAuthor (envelope, msg) ->
       self.receive new TextMessage envelope, msg.content, msg.id

   bot.on "EnterMessage",
     withAuthor (envelope, msg) ->
       self.receive new EnterMessage envelope, null, msg.id

   bot.on "LeaveMessage",
     withAuthor (envelope, msg) ->
       self.receive new LeaveMessage envelope, null, msg.id

   bot.listen()

   @bot = bot

   self.emit "connected"

exports.use = (robot) ->
  new Direct robot
