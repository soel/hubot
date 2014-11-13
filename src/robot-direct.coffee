#
# robot.coffee に対する拡張部分
#

_map = (msg, callback) ->
  text = msg.match[1].replace(/[\n\r]/g, " ")
  m = text.match(/^今ココ[:：] (.*) \(近辺\) (http:\/\/.*)$/)
  if m?
    msg.http("https://www.googleapis.com/urlshortener/v1/url?shortUrl=" + m[2])
      .get() (err, res, body) ->
        json = JSON.parse body
        loc = json.longUrl.match(/q=([0-9.]+),([0-9.]+)/)
        msg.json =
          place:m[1]
          lat:loc[1]
          lng:loc[2]
        callback msg

# public:
jsonMatcher = (prop, cb) ->
    if prop == "map"
      return [/((.|[\n\r])*)/, (msg) -> _map msg, cb]

    checker = (obj) ->
      false unless obj?
      switch prop
        when "stamp"  then obj.stamp_set? && obj.stamp_index?
        when "yesno"  then obj.response? && not obj.options?
        when "select" then obj.response? && obj.options?
        when "file"   then obj.file_id?
        else obj[prop]?
    [/({.*})/, (msg) -> cb msg if checker(msg.json = JSON.parse msg.match[1])]

module.exports =
  jsonMatcher:jsonMatcher

