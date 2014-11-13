# hubot 拡張

このドキュメントは、direct 用に hubot を拡張した点について整理しています。


## メッセージの送信

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		robot.respond /.../i, (msg) ->
			# here

### テキスト (hubot)

	msg.send "This message is text."

### スタンプ
	
	msg.send
		stamp_set: 3
		stamp_index: "1152921507291203198"
  		text: "おはよう"  # (Option) テキスト付きスタンプの場合のみ

※ stamp_set と stamp_index は、ブラウザの「要素の検証」等で確認してください。

	<img src="./images/stamp/3/1152921507291203198.png">
	

### Yes/No スタンプ

	msg.send
		question: "質問内容"

### セレクトスタンプ

	msg.send
	    question: "質問内容"
	    options: ["選択肢1", "選択肢2", "選択肢3"]

### タスクスタンプ

	msg.send
		title: "すること"
		closing_type: 0  # (Option) 誰かが:0, 全員が:1

### ファイル

	msg.send
		path: "your/file/name.png"
		name: "name.png"    # (Option) アップロード名
		type: "image/png"   # (Option) MIME
	

## メッセージの受信

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		# here


### テキスト (hubot)

	robot.respond /(.*)/, (msg) ->
		msg.send "Your message is #{msg.match[1]}"

### スタンプ

	robot.respond "stamp", (msg) ->
		msg.send "#{msg.json.stamp_set} - #{msg.json.stamp_index}"

### Yes/No スタンプの回答

	robot.respond "yesno", (msg) ->
		msg.send "Your answer is #{msg.json.response}."

### セレクトスタンプの回答

	robot.respond "select", (msg) ->
		msg.send "Your answer is #{msg.json.options[msg.json.response]}."

### ファイル

	robot.respond "file", (msg) ->
		msg.send "File received. name: #{msg.json.name} type: #{msg.json.content_type} 
			size: #{msg.json.content_size}bytes"
		msg.download msg.json, (path) ->
			msg.send "downloaded to #{path}"

### 位置情報

	robot.respond "map", (msg) ->
		msg.send "Your location is #{msg.json.place} at #{msg.json.lat}, #{msg.json.lng}"

## トークルーム情報の取得

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		robot.respond /room/i, (msg) ->
			user = msg.message.user
			room = user.rooms[msg.message.room]
			# here

### トークルーム一覧の取得

	msg.send "Joined talk count is #{Object.keys(user.rooms).length}"
	# array of joined Talk object

### グループトーク名の取得

	msg.send "Group talk name is #{room.topic}"  # string or undefined

### トークルームの種類

 	msg.send "This room is " + (room.type == 0 ? "pair" : "group") + " talk."

### トークの参加者情報の取得

	text = ""
    text += "#{user.name} #{user.email} #{user.profile_url}\n" for user in room.users
    msg.send text

## イベント

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		# here

### ペアトークでのメッセージ受信 (hubot)

	robot.respond /.../, (msg) ->
		room = msg.message.user.rooms[msg.message.room]
		msg.send "" if room.type == 0

### グループトークでのメッセージ受信 (hubot)
 
	robot.hear /.../, (msg) ->
		msg.send ""

「@ボット名 メッセージ」の場合

	robot.respond /.../, (msg) ->
		room = msg.message.user.rooms[msg.message.room]
		msg.send "" unless room.type == 0

### トークルームへのユーザーの参加 (hubot)

	robot.enter (msg) ->
		msg.send "Hi! #{msg.message.user.name}"

### トークルームからのユーザーの退出 (hubot)

	robot.leave (msg) ->
		msg.send "Good bye! #{msg.message.user.name}"

### 招待による自分自身のトークルームへの参加

	robot.join (msg) ->
		msg.send "Nice to meet you!"

## その他

### トークルームからの退出

	msg.leave()
