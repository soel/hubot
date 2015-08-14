#
# robot.coffee に対する拡張部分
#
GOOGLE_SHORTENER_API_KEY="AIzaSyAUisTOqBoSigbgtdZDIH-2PYHpzSRYmoQ"

_map = (msg, callback) ->
  text = msg.match[1].replace(/[\n\r]/g, " ")
  m = text.match(/^今ココ[:：] (.*) (https?:\/\/.*)$/)
  if m?
    place = m[1].replace(/\ ?\(近辺\)$/, "").replace(/^緯度 [:：].*$/, "")
    url = m[2]

    cb = (url) ->
      loc = url.match(/[@=]([0-9.]+),([0-9.]+)/) or ["", "", ""]
      msg.json =
        place:place
        lat:loc[1]
        lng:loc[2]
      callback msg

    if url.indexOf("goo.gl") == -1
      cb url
    else
      msg.http("https://www.googleapis.com/urlshortener/v1/url?shortUrl=#{url}&key=#{GOOGLE_SHORTENER_API_KEY}")
        .get() (err, res, body) ->
          if err?
            console.log err
          else
            try
              json = JSON.parse body
              if json.longUrl?
                cb json.longUrl
              else
                console.log json
            catch ex
              console.log ex

# public:
jsonMatcher = (prop, cb) ->
    if prop == "map"
      return [/((.|[\n\r])*)/, (msg) -> _map msg, cb]

    checker = (obj) ->
      false unless obj?
      switch prop
        when "stamp"  then obj.stamp_set? && obj.stamp_index?
        when "yesno"  then obj.question? && not obj.options?
        when "select" then obj.question? && obj.options?
        when "task"   then obj.title?
        when "file"   then obj.file_id?
        else obj[prop]?
    [/({.*})/, (msg) -> cb msg if checker(msg.json = JSON.parse msg.match[1])]

module.exports =
  jsonMatcher:jsonMatcher

