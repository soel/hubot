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
			# here

### トークルームの種類

 	msg.send "This room type is " + ["unknown", "pair", "group"][msg.message.roomType]

### トークルーム名

	if msg.message.roomType == 2  # Group talk
		msg.send "Group name is #{msg.message.roomTopic}"

### トークルームの参加者情報

	text = ""
	for user in msg.message.roomUsers
	    text += "#{user.name} #{user.email} #{user.profile_url}\n\n" 
    msg.send text

### トークルームの一覧

	text = ""
	for id,talk of msg.message.rooms
	    text += "name:#{talk.topic} type:#{talk.type} users:#{talk.users}\n\n" 
    msg.send text

## イベント

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		# here

### ペアトークでのメッセージ受信 (hubot)

	robot.respond /.../, (msg) ->
		msg.send ""

※ `respond` はグループトーク中の「@hubot名 メッセージ」の場合でも呼ばれます。厳密にペアトークのみに対応させたいときは`if msg.message.roomType == 1` で場合分けしてください。

### グループトークでのメッセージ受信 (hubot)
 
	robot.hear /.../, (msg) ->
		msg.send ""

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
