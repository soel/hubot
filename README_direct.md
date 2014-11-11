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
	
	msg.send JSON.stringify
		stamp_set: 123
		stamp_index: 1
  		text: "おはよう"  # テキスト付きスタンプの場合のみ

### Yes/No スタンプ

	msg.send JSON.stringify
		question: "質問内容"

### セレクトスタンプ

	msg.send JSON.stringify
	    question: "質問内容"
	    options: ["選択肢1", "選択肢2", "選択肢3"]

### ファイル

【未実装】

	msg.upload "your/file/path.png", (file) ->
		msg.send JSON.stringify file


## トークルーム情報の取得

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		robot.respond /.../i, (msg) ->
			user = msg.user
			room = user.rooms[msg.message.room]
			# here

### トークルーム一覧の取得

	user.rooms  # array of Talk object

### グループトーク名の取得

	room.topic  # string or null

### トークの参加者情報の取得

	for user in room.users
		# user.name
		# user.email
		# user.profile_url

## メッセージの取得

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		# here


### テキスト (hubot)

	robot.respond /^(.*)$/i, (msg) ->
		# msg.match[1]

### スタンプ

	robot.respond /^({.*stamp_set.*})$/i, (msg) ->
		obj = JSON.parse msg.match[1]
		# obj.stamp_set
		# obj.stamp_index

### Yes/No スタンプの回答

	robot.respond /^({.*in_reply_to.*})$/i, (msg) ->
		obj = JSON.parse msg.match[1]
		if obj.in_reply_to == question.msg_id
			# obj.response   # true -> Yes, false -> No

### セレクトスタンプの回答

	robot.respond /^({.*in_reply_to.*})$/i, (msg) ->
		obj = JSON.parse msg.match[1]
		if obj.in_reply_to == question.msg_id
			# obj.response   # 選択肢の番号
	
### ファイル

【未実装】

	robot.respond /^({.*file_id.*})$/i, (msg) ->
		obj = JSON.parse msg.match[1]
		# obj.file_id
		# obj.name
		# obj.content_type  # "image/*" -> 画像, "video/*" -> 動画
		# obj.content_size
		# obj.url
		# obj.thumbnail_url
		msg.download obj.url, DIR + obj.file_id, (path) ->
			console.log "downloaded to #{path}"		

## イベント

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		# here

### トークルームへのユーザーの参加 (hubot)

	robot.enter (msg) ->
		# msg.user : 参加したユーザ

### トークルームからのユーザーの退出 (hubot)

	robot.leave (msg) ->
		# msg.user : 退出したユーザ

### 招待による自分自身のトークルームへの参加

【未実装】

	robot.join (msg) ->
		# msg.user : 自分自身


## その他

### トークルームからの退出

	msg.leave()
