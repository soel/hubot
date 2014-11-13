(function ($hx_exports) { "use strict";
$hx_exports.albero = $hx_exports.albero || {};
var $hxClasses = {},$estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var DirectAPI = $hx_exports.DirectAPI = function() {
	var EventEmitter = require('events').EventEmitter;
	this.eventEmitter = new EventEmitter();
	js.Node.require("unorm");
};
$hxClasses["DirectAPI"] = DirectAPI;
DirectAPI.__name__ = ["DirectAPI"];
DirectAPI.getInstance = function() {
	if(DirectAPI.instance == null) DirectAPI.instance = new DirectAPI();
	return DirectAPI.instance;
};
DirectAPI.main = function() {
};
DirectAPI.prototype = {
	setOptions: function(options) {
		if(options != null) {
			Settings.host = options.host;
			Settings.endpoint = options.endpoint;
			Settings.$name = options.name;
			Settings.accessToken = options.access_token;
		} else throw new Error("Not enough parameters provided. I need a access token");
	}
	,send: function(envelope,text) {
		var roomId = envelope.room;
		var talkId = albero.Int64Helper.idStrToInt64(roomId);
		if(talkId == null || text == null || text.length == 0) return;
		var msgs = new Array();
		if(StringTools.startsWith(text,"{") && StringTools.endsWith(text,"}")) {
			var msg = new albero.entity.Message();
			msg.talkId = talkId;
			msg.content = this.parseContent(text);
			msg.type = this.detectType(msg.content);
			if(msg.type == albero.entity.MessageType.unknown) return;
			if(msg.type == albero.entity.MessageType.file && msg.content.path != null) {
				this.sendFile(envelope,msg.content);
				return;
			}
			msgs.push(msg);
		} else {
			var _g = 0;
			var _g1 = TextHelper.slice(text,1024);
			while(_g < _g1.length) {
				var text1 = _g1[_g];
				++_g;
				var msg1 = new albero.entity.Message();
				msg1.talkId = talkId;
				msg1.type = albero.entity.MessageType.text;
				msg1.content = text1;
				msgs.push(msg1);
			}
		}
		this.sendMessages(msgs);
	}
	,sendMessages: function(msgs) {
		if(msgs != null && msgs.length > 0) {
			if(this.sendQueue == null) this.sendQueue = msgs; else {
				var _g = 0;
				while(_g < msgs.length) {
					var msg = msgs[_g];
					++_g;
					this.sendQueue.push(msg);
				}
			}
		}
		if(this.sendQueue == null) return;
		var msg1 = this.sendQueue.shift();
		this.facade.sendNotification("Send",msg1);
		if(this.sendQueue.length == 0) this.sendQueue = null; else haxe.Timer.delay($bind(this,this.sendMessages),500);
	}
	,parseContent: function(json) {
		var obj;
		obj = JSON.parse(json);
		if(obj == null) return null;
		var _g = 0;
		var _g1 = Reflect.fields(obj);
		while(_g < _g1.length) {
			var fieldName = _g1[_g];
			++_g;
			var val = Reflect.field(obj,fieldName);
			if(typeof(val) == "string") {
				if(fieldName == "stamp_index" || fieldName == "in_reply_to") Reflect.setField(obj,fieldName,albero.Int64Helper.parse(val));
			} else if(Reflect.isObject(obj)) {
				if(val.high != null && val.low != null) Reflect.setField(obj,fieldName,haxe.Int64.make(val.high,val.low));
			}
		}
		return obj;
	}
	,detectType: function(obj) {
		if(obj == null) return albero.entity.MessageType.unknown;
		if(obj.stamp_set != null) return albero.entity.MessageType.stamp; else if(obj.lat != null) return albero.entity.MessageType.geo; else if(obj.file_id != null || obj.path != null) return albero.entity.MessageType.file; else if(obj.question != null) {
			if(obj.in_reply_to == null) {
				if(obj.options == null) return albero.entity.MessageType.yesOrNo; else return albero.entity.MessageType.selectOne;
			} else if(obj.options == null) return albero.entity.MessageType.yesOrNoReply; else return albero.entity.MessageType.selectOneReply;
		} else if(obj.title != null) {
			if(obj.in_reply_to == null) return albero.entity.MessageType.todo; else return albero.entity.MessageType.todoDone;
		} else return albero.entity.MessageType.unknown;
	}
	,sendFile: function(envelope,localFile) {
		var path;
		var name = null;
		var type = null;
		if(typeof(localFile) == "string") path = localFile; else {
			path = localFile.path;
			name = localFile.name;
			type = localFile.type;
		}
		if(path == null || !js.Node.require("fs").existsSync(path)) return;
		var roomId = envelope.room;
		var talkId = albero.Int64Helper.idStrToInt64(roomId);
		this.facade.sendNotification("File",albero.command.FileAction.UPLOAD_PATH(talkId,path,name,type));
	}
	,download: function(envelope,remoteFile,callback) {
		var url;
		var path = null;
		var name = null;
		if(typeof(remoteFile) == "string") url = remoteFile; else {
			url = remoteFile.url;
			path = remoteFile.path;
			name = remoteFile.name;
		}
		if(url == null) {
			callback(null);
			return;
		}
		if(name == null) name = js.Node.require("path").basename(url);
		if(path == null) path = js.Node.require("path").join(js.Node.require("os").tmpdir(),name);
		this.facade.sendNotification("File",albero.command.FileAction.DOWNLOAD_PATH(url,path,callback));
	}
	,leave: function(envelope) {
		var _g = this;
		var roomId = envelope.room;
		var talkId = albero.Int64Helper.idStrToInt64(roomId);
		haxe.Timer.delay(function() {
			_g.facade.sendNotification("Talk",albero.command.TalkAction.DELETE(null,talkId));
		},500);
	}
	,listen: function() {
		this.facade = albero.AppFacade.getInstance();
		this.facade.startup();
	}
	,emit: function(event,arg1,arg2,arg3) {
		this.eventEmitter.emit(event,arg1,arg2,arg3);
	}
	,on: function(event,fn) {
		return this.eventEmitter.on(event,fn);
	}
	,__class__: DirectAPI
};
var TextHelper = function() { };
$hxClasses["TextHelper"] = TextHelper;
TextHelper.__name__ = ["TextHelper"];
TextHelper.slice = function(text,len) {
	var result = new Array();
	var str = "";
	var texts = text.split("\n");
	while(texts.length > 0) {
		var t = texts.shift();
		if(str.length + t.length > len) {
			result.push(str);
			str = "";
		}
		if(str.length > 0) str += "\n";
		str += t;
	}
	result.push(str);
	return result;
};
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
$hxClasses["EReg"] = EReg;
EReg.__name__ = ["EReg"];
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,__class__: EReg
};
var HxOverrides = function() { };
$hxClasses["HxOverrides"] = HxOverrides;
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
$hxClasses["Lambda"] = Lambda;
Lambda.__name__ = ["Lambda"];
Lambda.count = function(it,pred) {
	var n = 0;
	if(pred == null) {
		var $it0 = $iterator(it)();
		while( $it0.hasNext() ) {
			var _ = $it0.next();
			n++;
		}
	} else {
		var $it1 = $iterator(it)();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(pred(x)) n++;
		}
	}
	return n;
};
var List = function() {
	this.length = 0;
};
$hxClasses["List"] = List;
List.__name__ = ["List"];
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,__class__: List
};
var IMap = function() { };
$hxClasses["IMap"] = IMap;
IMap.__name__ = ["IMap"];
IMap.prototype = {
	__class__: IMap
};
Math.__name__ = ["Math"];
var Reflect = function() { };
$hxClasses["Reflect"] = Reflect;
Reflect.__name__ = ["Reflect"];
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
Reflect.setField = function(o,field,value) {
	o[field] = value;
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && v.__enum__ == null || t == "function" && (v.__name__ || v.__ename__) != null;
};
var Std = function() { };
$hxClasses["Std"] = Std;
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var StringTools = function() { };
$hxClasses["StringTools"] = StringTools;
StringTools.__name__ = ["StringTools"];
StringTools.htmlEscape = function(s,quotes) {
	s = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	if(quotes) return s.split("\"").join("&quot;").split("'").join("&#039;"); else return s;
};
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
};
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var ValueType = { __ename__ : true, __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] };
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { };
$hxClasses["Type"] = Type;
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
Type.getClassName = function(c) {
	var a = c.__name__;
	return a.join(".");
};
Type.resolveClass = function(name) {
	var cl = $hxClasses[name];
	if(cl == null || !cl.__name__) return null;
	return cl;
};
Type.createInstance = function(cl,args) {
	var _g = args.length;
	switch(_g) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw "Too many arguments";
	}
	return null;
};
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c;
		if((v instanceof Array) && v.__enum__ == null) c = Array; else c = v.__class__;
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
};
var puremvc = {};
puremvc.interfaces = {};
puremvc.interfaces.IFacade = function() { };
$hxClasses["puremvc.interfaces.IFacade"] = puremvc.interfaces.IFacade;
puremvc.interfaces.IFacade.__name__ = ["puremvc","interfaces","IFacade"];
puremvc.interfaces.IFacade.prototype = {
	__class__: puremvc.interfaces.IFacade
};
puremvc.patterns = {};
puremvc.patterns.facade = {};
puremvc.patterns.facade.Facade = function() {
	puremvc.patterns.facade.Facade.instance = this;
	this.initializeFacade();
};
$hxClasses["puremvc.patterns.facade.Facade"] = puremvc.patterns.facade.Facade;
puremvc.patterns.facade.Facade.__name__ = ["puremvc","patterns","facade","Facade"];
puremvc.patterns.facade.Facade.__interfaces__ = [puremvc.interfaces.IFacade];
puremvc.patterns.facade.Facade.getInstance = function() {
	if(puremvc.patterns.facade.Facade.instance == null) puremvc.patterns.facade.Facade.instance = new puremvc.patterns.facade.Facade();
	return puremvc.patterns.facade.Facade.instance;
};
puremvc.patterns.facade.Facade.prototype = {
	initializeFacade: function() {
		this.initializeModel();
		this.initializeController();
		this.initializeView();
	}
	,initializeController: function() {
		if(this.controller != null) return;
		this.controller = puremvc.core.Controller.getInstance();
	}
	,initializeModel: function() {
		if(this.model != null) return;
		this.model = puremvc.core.Model.getInstance();
	}
	,initializeView: function() {
		if(this.view != null) return;
		this.view = puremvc.core.View.getInstance();
	}
	,registerCommand: function(notificationName,commandClassRef) {
		this.controller.registerCommand(notificationName,commandClassRef);
	}
	,registerProxy: function(proxy) {
		this.model.registerProxy(proxy);
	}
	,retrieveProxy: function(proxyName) {
		return this.model.retrieveProxy(proxyName);
	}
	,registerMediator: function(mediator) {
		if(this.view != null) this.view.registerMediator(mediator);
	}
	,sendNotification: function(notificationName,body,type) {
		this.notifyObservers(new puremvc.patterns.observer.Notification(notificationName,body,type));
	}
	,notifyObservers: function(notification) {
		if(this.view != null) this.view.notifyObservers(notification);
	}
	,__class__: puremvc.patterns.facade.Facade
};
var albero = {};
albero.AppFacade = function() {
	puremvc.patterns.facade.Facade.call(this);
};
$hxClasses["albero.AppFacade"] = albero.AppFacade;
albero.AppFacade.__name__ = ["albero","AppFacade"];
albero.AppFacade.getInstance = function() {
	if(puremvc.patterns.facade.Facade.instance == null) puremvc.patterns.facade.Facade.instance = new albero.AppFacade();
	return js.Boot.__cast(puremvc.patterns.facade.Facade.instance , albero.AppFacade);
};
albero.AppFacade.__super__ = puremvc.patterns.facade.Facade;
albero.AppFacade.prototype = $extend(puremvc.patterns.facade.Facade.prototype,{
	initializeModel: function() {
		puremvc.patterns.facade.Facade.prototype.initializeModel.call(this);
		var proxies = [new albero.proxy.AppStateProxy(),new albero.proxy.DataStoreProxy(),new albero.proxy.SettingsProxy(),new albero.proxy.MsgPackRpcProxy(),new albero.proxy.AlberoBroadcastProxy(),new albero.proxy.AlberoServiceProxy(),new albero.proxy.FileServiceProxy(),new albero.proxy.FormatterProxy(),new albero.proxy.RoutingProxy()];
		proxies.push(albero.proxy.AccountLoaderProxyFactory.newInstance());
		var _g = 0;
		while(_g < proxies.length) {
			var proxy = proxies[_g];
			++_g;
			this.registerProxy(proxy);
		}
		var _g1 = 0;
		while(_g1 < proxies.length) {
			var proxy1 = proxies[_g1];
			++_g1;
			this.autoBind(proxy1);
		}
	}
	,initializeView: function() {
		puremvc.patterns.facade.Facade.prototype.initializeView.call(this);
		var mediators = [new albero_cli.mediator.CommandLineMediator()];
		var _g = 0;
		while(_g < mediators.length) {
			var mediator = mediators[_g];
			++_g;
			this.registerMediator(mediator);
		}
	}
	,initializeController: function() {
		puremvc.patterns.facade.Facade.prototype.initializeController.call(this);
		var commands = [albero.command.DomainCommand,albero.command.SignInCommand,albero.command.SignOutCommand,albero.command.ReloadDataCommand,albero.command.SendCommand,albero.command.TalkCommand,albero.command.ManageFriendsCommand,albero.command.ReadCommand,albero.command.FileCommand,albero.command.SelectTalkCommand,albero.command.UpdateUserCommand,albero.command.UrlCommand];
		var _g = 0;
		while(_g < commands.length) {
			var type = commands[_g];
			++_g;
			var name = StringTools.replace(Type.getClassName(type).split(".").pop(),"Command","");
			this.registerCommand(name,type);
		}
	}
	,registerMediator: function(mediator) {
		this.autoBind(mediator);
		puremvc.patterns.facade.Facade.prototype.registerMediator.call(this,mediator);
	}
	,autoBind: function(target) {
		var fieldsMeta = haxe.rtti.Meta.getFields(Type.getClass(target));
		var _g = 0;
		var _g1 = Reflect.fields(fieldsMeta);
		while(_g < _g1.length) {
			var fieldName = _g1[_g];
			++_g;
			var meta = Reflect.field(fieldsMeta,fieldName);
			if(Object.prototype.hasOwnProperty.call(meta,"inject")) {
				var proxy = this.retrieveProxy(fieldName);
				if(proxy == null) console.log("[autoBind:Error]" + Type.getClassName(Type.getClass(target)) + "." + fieldName); else {
					console.log("[autoBind] " + Type.getClassName(Type.getClass(target)) + "." + fieldName + " <= " + Type.getClassName(Type.getClass(proxy)));
					target[fieldName] = proxy;
				}
			}
		}
	}
	,startup: function() {
	}
	,__class__: albero.AppFacade
});
albero.AppStates = { __ename__ : true, __constructs__ : ["active","inactive"] };
albero.AppStates.active = ["active",0];
albero.AppStates.active.toString = $estr;
albero.AppStates.active.__enum__ = albero.AppStates;
albero.AppStates.inactive = ["inactive",1];
albero.AppStates.inactive.toString = $estr;
albero.AppStates.inactive.__enum__ = albero.AppStates;
albero.Int64Helper = function() { };
$hxClasses["albero.Int64Helper"] = albero.Int64Helper;
albero.Int64Helper.__name__ = ["albero","Int64Helper"];
albero.Int64Helper.parse = function(str) {
	var r = new EReg("^\\d+$","");
	if(!r.match(str)) return null;
	var v = new haxe.Int64(0,0);
	var base = new haxe.Int64(0,10);
	var _g1 = 0;
	var _g = str.length;
	while(_g1 < _g) {
		var i = _g1++;
		v = haxe.Int64.add(haxe.Int64.mul(v,base),haxe.Int64.make(0,Std.parseInt(str.charAt(i))));
	}
	return v;
};
albero.Int64Helper.idStr = function(id) {
	return "_" + id.high + "_" + id.low;
};
albero.Int64Helper.eq = function(a,b) {
	return a != null && b != null && a.high == b.high && a.low == b.low;
};
albero.Int64Helper.idStrToInt64 = function(str) {
	var vals = str.split("_");
	if(vals.length > 2) return haxe.Int64.make(Std.parseInt(vals[1]),Std.parseInt(vals[2])); else return null;
};
albero.Int64Helper.remove = function(array,x) {
	if(array == null) return false;
	var _g = 0;
	while(_g < array.length) {
		var item = array[_g];
		++_g;
		if(item != null && x != null && item.high == x.high && item.low == x.low) {
			HxOverrides.remove(array,item);
			return true;
		}
	}
	return false;
};
albero.Urls = { __ename__ : true, __constructs__ : ["auto","domains","domain","members","talks","actions","console","settings","announcements","error","loading"] };
albero.Urls.auto = ["auto",0];
albero.Urls.auto.toString = $estr;
albero.Urls.auto.__enum__ = albero.Urls;
albero.Urls.domains = ["domains",1];
albero.Urls.domains.toString = $estr;
albero.Urls.domains.__enum__ = albero.Urls;
albero.Urls.domain = function(domainId) { var $x = ["domain",2,domainId]; $x.__enum__ = albero.Urls; $x.toString = $estr; return $x; };
albero.Urls.members = function(domainId) { var $x = ["members",3,domainId]; $x.__enum__ = albero.Urls; $x.toString = $estr; return $x; };
albero.Urls.talks = function(domainId) { var $x = ["talks",4,domainId]; $x.__enum__ = albero.Urls; $x.toString = $estr; return $x; };
albero.Urls.actions = function(domainId) { var $x = ["actions",5,domainId]; $x.__enum__ = albero.Urls; $x.toString = $estr; return $x; };
albero.Urls.console = function(domainId) { var $x = ["console",6,domainId]; $x.__enum__ = albero.Urls; $x.toString = $estr; return $x; };
albero.Urls.settings = ["settings",7];
albero.Urls.settings.toString = $estr;
albero.Urls.settings.__enum__ = albero.Urls;
albero.Urls.announcements = ["announcements",8];
albero.Urls.announcements.toString = $estr;
albero.Urls.announcements.__enum__ = albero.Urls;
albero.Urls.error = ["error",9];
albero.Urls.error.toString = $estr;
albero.Urls.error.__enum__ = albero.Urls;
albero.Urls.loading = ["loading",10];
albero.Urls.loading.toString = $estr;
albero.Urls.loading.__enum__ = albero.Urls;
albero.UrlsHelper = function() { };
$hxClasses["albero.UrlsHelper"] = albero.UrlsHelper;
albero.UrlsHelper.__name__ = ["albero","UrlsHelper"];
albero.UrlsHelper.getDomainId = function(url) {
	switch(url[1]) {
	case 2:
		var domainId = url[2];
		return domainId;
	case 3:
		var domainId1 = url[2];
		return domainId1;
	case 4:
		var domainId2 = url[2];
		return domainId2;
	case 5:
		var domainId3 = url[2];
		return domainId3;
	case 6:
		var domainId4 = url[2];
		return domainId4;
	default:
		return null;
	}
};
albero.UrlsHelper.toFragment = function(url) {
	switch(url[1]) {
	case 1:
		return "/";
	case 7:case 9:case 10:
		return "/" + Std.string(url);
	case 2:
		var domainId = url[2];
		return "/" + domainId.toString() + "/";
	case 3:
		var domainId1 = url[2];
		return "/" + domainId1.toString() + "/members";
	case 4:
		var domainId2 = url[2];
		return "/" + domainId2.toString() + "/talks";
	case 5:
		var domainId3 = url[2];
		return "/" + domainId3.toString() + "/actions";
	case 6:
		var domainId4 = url[2];
		return "/" + domainId4.toString() + "/console";
	default:
		return null;
	}
};
puremvc.interfaces.INotifier = function() { };
$hxClasses["puremvc.interfaces.INotifier"] = puremvc.interfaces.INotifier;
puremvc.interfaces.INotifier.__name__ = ["puremvc","interfaces","INotifier"];
puremvc.patterns.observer = {};
puremvc.patterns.observer.Notifier = function() {
	this.facade = puremvc.patterns.facade.Facade.getInstance();
};
$hxClasses["puremvc.patterns.observer.Notifier"] = puremvc.patterns.observer.Notifier;
puremvc.patterns.observer.Notifier.__name__ = ["puremvc","patterns","observer","Notifier"];
puremvc.patterns.observer.Notifier.__interfaces__ = [puremvc.interfaces.INotifier];
puremvc.patterns.observer.Notifier.prototype = {
	sendNotification: function(notificationName,body,type) {
		this.facade.sendNotification(notificationName,body,type);
	}
	,__class__: puremvc.patterns.observer.Notifier
};
puremvc.interfaces.ICommand = function() { };
$hxClasses["puremvc.interfaces.ICommand"] = puremvc.interfaces.ICommand;
puremvc.interfaces.ICommand.__name__ = ["puremvc","interfaces","ICommand"];
puremvc.interfaces.ICommand.prototype = {
	__class__: puremvc.interfaces.ICommand
};
puremvc.patterns.command = {};
puremvc.patterns.command.SimpleCommand = function() {
	puremvc.patterns.observer.Notifier.call(this);
};
$hxClasses["puremvc.patterns.command.SimpleCommand"] = puremvc.patterns.command.SimpleCommand;
puremvc.patterns.command.SimpleCommand.__name__ = ["puremvc","patterns","command","SimpleCommand"];
puremvc.patterns.command.SimpleCommand.__interfaces__ = [puremvc.interfaces.ICommand];
puremvc.patterns.command.SimpleCommand.__super__ = puremvc.patterns.observer.Notifier;
puremvc.patterns.command.SimpleCommand.prototype = $extend(puremvc.patterns.observer.Notifier.prototype,{
	execute: function(notification) {
	}
	,__class__: puremvc.patterns.command.SimpleCommand
});
albero.command = {};
albero.command.AutoBindCommand = function() {
	puremvc.patterns.command.SimpleCommand.call(this);
	albero.AppFacade.getInstance().autoBind(this);
};
$hxClasses["albero.command.AutoBindCommand"] = albero.command.AutoBindCommand;
albero.command.AutoBindCommand.__name__ = ["albero","command","AutoBindCommand"];
albero.command.AutoBindCommand.__super__ = puremvc.patterns.command.SimpleCommand;
albero.command.AutoBindCommand.prototype = $extend(puremvc.patterns.command.SimpleCommand.prototype,{
	__class__: albero.command.AutoBindCommand
});
albero.command.DomainCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.DomainCommand"] = albero.command.DomainCommand;
albero.command.DomainCommand.__name__ = ["albero","command","DomainCommand"];
albero.command.DomainCommand.__super__ = albero.command.AutoBindCommand;
albero.command.DomainCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var action = notification.getBody();
		switch(action[1]) {
		case 0:
			var domainId = action[2];
			this.api.acceptDomainInvite(domainId);
			break;
		case 1:
			var domainId1 = action[2];
			this.api.deleteDomainInvite(domainId1);
			break;
		case 2:
			var domainId2 = action[2];
			this.api.leaveDomain(domainId2);
			break;
		}
	}
	,__class__: albero.command.DomainCommand
});
albero.command.DomainAction = { __ename__ : true, __constructs__ : ["ACCEPT_INVITE","DELETE_INVITE","LEAVE"] };
albero.command.DomainAction.ACCEPT_INVITE = function(domainId) { var $x = ["ACCEPT_INVITE",0,domainId]; $x.__enum__ = albero.command.DomainAction; $x.toString = $estr; return $x; };
albero.command.DomainAction.DELETE_INVITE = function(domainId) { var $x = ["DELETE_INVITE",1,domainId]; $x.__enum__ = albero.command.DomainAction; $x.toString = $estr; return $x; };
albero.command.DomainAction.LEAVE = function(domain) { var $x = ["LEAVE",2,domain]; $x.__enum__ = albero.command.DomainAction; $x.toString = $estr; return $x; };
albero.command.FileCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.FileCommand"] = albero.command.FileCommand;
albero.command.FileCommand.__name__ = ["albero","command","FileCommand"];
albero.command.FileCommand.__super__ = albero.command.AutoBindCommand;
albero.command.FileCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var body = notification.getBody();
		switch(body[1]) {
		case 0:
			var file = body[3];
			var talk = body[2];
			this.api.upload(talk.domainId,talk.id,file);
			break;
		case 1:
			var info = body[2];
			this.api.deleteFile(info.id);
			break;
		case 2:
			var type = body[5];
			var name = body[4];
			var path = body[3];
			var talkId = body[2];
			var info1 = this.fileService.createDummyFile(path);
			info1.path = path;
			info1.size = js.Node.require("fs").statSync(path).size;
			if(name != null) info1.name = name;
			if(type != null) info1.type = type;
			var talk1 = this.dataStore.getTalk(talkId);
			this.api.upload(talk1.domainId,talk1.id,info1);
			break;
		case 3:
			var callback = body[4];
			var path1 = body[3];
			var url = body[2];
			this.fileService.download(url,path1,callback);
			break;
		}
	}
	,__class__: albero.command.FileCommand
});
albero.command.FileAction = { __ename__ : true, __constructs__ : ["UPLOAD","DELETE","UPLOAD_PATH","DOWNLOAD_PATH"] };
albero.command.FileAction.UPLOAD = function(talk,file) { var $x = ["UPLOAD",0,talk,file]; $x.__enum__ = albero.command.FileAction; $x.toString = $estr; return $x; };
albero.command.FileAction.DELETE = function(info) { var $x = ["DELETE",1,info]; $x.__enum__ = albero.command.FileAction; $x.toString = $estr; return $x; };
albero.command.FileAction.UPLOAD_PATH = function(talkId,path,name,type) { var $x = ["UPLOAD_PATH",2,talkId,path,name,type]; $x.__enum__ = albero.command.FileAction; $x.toString = $estr; return $x; };
albero.command.FileAction.DOWNLOAD_PATH = function(url,path,callback) { var $x = ["DOWNLOAD_PATH",3,url,path,callback]; $x.__enum__ = albero.command.FileAction; $x.toString = $estr; return $x; };
albero.command.ManageFriendsCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.ManageFriendsCommand"] = albero.command.ManageFriendsCommand;
albero.command.ManageFriendsCommand.__name__ = ["albero","command","ManageFriendsCommand"];
albero.command.ManageFriendsCommand.__super__ = albero.command.AutoBindCommand;
albero.command.ManageFriendsCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var data = notification.getBody();
		var _g = data.action;
		switch(_g[1]) {
		case 0:
			var _g1 = 0;
			var _g2 = data.users;
			while(_g1 < _g2.length) {
				var u = _g2[_g1];
				++_g1;
				this.api.addFriend(u);
			}
			break;
		case 1:
			var _g11 = 0;
			var _g21 = data.users;
			while(_g11 < _g21.length) {
				var u1 = _g21[_g11];
				++_g11;
				this.api.deleteFriend(u1);
			}
			break;
		}
	}
	,__class__: albero.command.ManageFriendsCommand
});
albero.command.ManageFriendsAction = { __ename__ : true, __constructs__ : ["ADD","DELETE"] };
albero.command.ManageFriendsAction.ADD = ["ADD",0];
albero.command.ManageFriendsAction.ADD.toString = $estr;
albero.command.ManageFriendsAction.ADD.__enum__ = albero.command.ManageFriendsAction;
albero.command.ManageFriendsAction.DELETE = ["DELETE",1];
albero.command.ManageFriendsAction.DELETE.toString = $estr;
albero.command.ManageFriendsAction.DELETE.__enum__ = albero.command.ManageFriendsAction;
albero.command.ReadCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.ReadCommand"] = albero.command.ReadCommand;
albero.command.ReadCommand.__name__ = ["albero","command","ReadCommand"];
albero.command.ReadCommand.__super__ = albero.command.AutoBindCommand;
albero.command.ReadCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var type = notification.getBody();
		switch(type[1]) {
		case 0:
			var msgId = type[3];
			var talkId = type[2];
			this.api.updateReadStatuses(talkId,msgId);
			break;
		case 1:
			var domainId = type[2];
			this.api.updateAnnouncementReadStatus(domainId);
			break;
		case 2:
			var messageId = type[3];
			var talkId1 = type[2];
			this.api.getReadStatus(talkId1,messageId);
			break;
		}
	}
	,__class__: albero.command.ReadCommand
});
albero.command.ReadType = { __ename__ : true, __constructs__ : ["TALK","ANNOUNCEMENT","READ_STATUS"] };
albero.command.ReadType.TALK = function(talkId,msgId) { var $x = ["TALK",0,talkId,msgId]; $x.__enum__ = albero.command.ReadType; $x.toString = $estr; return $x; };
albero.command.ReadType.ANNOUNCEMENT = function(domainId) { var $x = ["ANNOUNCEMENT",1,domainId]; $x.__enum__ = albero.command.ReadType; $x.toString = $estr; return $x; };
albero.command.ReadType.READ_STATUS = function(talkId,messageId) { var $x = ["READ_STATUS",2,talkId,messageId]; $x.__enum__ = albero.command.ReadType; $x.toString = $estr; return $x; };
albero.command.ReloadDataCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.ReloadDataCommand"] = albero.command.ReloadDataCommand;
albero.command.ReloadDataCommand.__name__ = ["albero","command","ReloadDataCommand"];
albero.command.ReloadDataCommand.__super__ = albero.command.AutoBindCommand;
albero.command.ReloadDataCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var dataType = notification.getBody();
		switch(dataType[1]) {
		case 0:
			this.api.getDomains();
			break;
		case 1:
			this.api.getFriends();
			this.api.getAcquaintances();
			break;
		case 2:
			this.api.getTalks();
			break;
		case 3:
			var range = dataType[3];
			var talk = dataType[2];
			this.api.getMessages(talk,range);
			break;
		case 4:
			var marker = dataType[2];
			this.api.getNotYetFriends(marker);
			break;
		case 5:
			var marker1 = dataType[3];
			var query = dataType[2];
			this.api.searchDomainUsers(query,marker1);
			break;
		case 6:
			var range1 = dataType[2];
			this.api.getAnnouncements(range1);
			break;
		case 7:
			var range2 = dataType[4];
			var type = dataType[3];
			var talk1 = dataType[2];
			this.api.getQuestions(talk1,type,range2);
			break;
		case 8:
			var callback = dataType[3];
			var msgId = dataType[2];
			this.api.getQuestion(msgId,callback);
			break;
		case 9:
			var range3 = dataType[3];
			var talk2 = dataType[2];
			this.api.getFiles(talk2,range3);
			break;
		}
	}
	,__class__: albero.command.ReloadDataCommand
});
albero.command.ReloadDataType = { __ename__ : true, __constructs__ : ["Domains","Friends","Talks","Messages","NotYetFriends","SearchDomainUsers","Announcements","Questions","Question","Files"] };
albero.command.ReloadDataType.Domains = ["Domains",0];
albero.command.ReloadDataType.Domains.toString = $estr;
albero.command.ReloadDataType.Domains.__enum__ = albero.command.ReloadDataType;
albero.command.ReloadDataType.Friends = ["Friends",1];
albero.command.ReloadDataType.Friends.toString = $estr;
albero.command.ReloadDataType.Friends.__enum__ = albero.command.ReloadDataType;
albero.command.ReloadDataType.Talks = ["Talks",2];
albero.command.ReloadDataType.Talks.toString = $estr;
albero.command.ReloadDataType.Talks.__enum__ = albero.command.ReloadDataType;
albero.command.ReloadDataType.Messages = function(talk,range) { var $x = ["Messages",3,talk,range]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.NotYetFriends = function(marker) { var $x = ["NotYetFriends",4,marker]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.SearchDomainUsers = function(query,marker) { var $x = ["SearchDomainUsers",5,query,marker]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.Announcements = function(range) { var $x = ["Announcements",6,range]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.Questions = function(talk,type,range) { var $x = ["Questions",7,talk,type,range]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.Question = function(msgId,callback) { var $x = ["Question",8,msgId,callback]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.Files = function(talk,range) { var $x = ["Files",9,talk,range]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.SelectTalkCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.SelectTalkCommand"] = albero.command.SelectTalkCommand;
albero.command.SelectTalkCommand.__name__ = ["albero","command","SelectTalkCommand"];
albero.command.SelectTalkCommand.__super__ = albero.command.AutoBindCommand;
albero.command.SelectTalkCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var talk = notification.getBody();
		this.settings.setSelectedTalk(talk);
	}
	,__class__: albero.command.SelectTalkCommand
});
albero.command.SendCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.SendCommand"] = albero.command.SendCommand;
albero.command.SendCommand.__name__ = ["albero","command","SendCommand"];
albero.command.SendCommand.__super__ = albero.command.AutoBindCommand;
albero.command.SendCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var body = notification.getBody();
		this.api.createMessage(body.talkId,body.type,body.content);
	}
	,__class__: albero.command.SendCommand
});
albero.command.SignInCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.SignInCommand"] = albero.command.SignInCommand;
albero.command.SignInCommand.__name__ = ["albero","command","SignInCommand"];
albero.command.SignInCommand.__super__ = albero.command.AutoBindCommand;
albero.command.SignInCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var accessToken = this.settings.getAccessToken();
		if(accessToken != null) {
			this.api.createSession(accessToken);
			return;
		}
		var account = notification.getBody();
		if(account == null) account = this.accountLoader.load();
		if(account != null) this.api.createAccessToken(account.email,account.pass);
		return;
	}
	,__class__: albero.command.SignInCommand
});
albero.command.SignOutCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.SignOutCommand"] = albero.command.SignOutCommand;
albero.command.SignOutCommand.__name__ = ["albero","command","SignOutCommand"];
albero.command.SignOutCommand.__super__ = albero.command.AutoBindCommand;
albero.command.SignOutCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		this.api.deleteSession();
		this.sendNotification("Url",albero.command.UrlAction.FORWARD(albero.Urls.error));
	}
	,__class__: albero.command.SignOutCommand
});
albero.command.TalkCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.TalkCommand"] = albero.command.TalkCommand;
albero.command.TalkCommand.__name__ = ["albero","command","TalkCommand"];
albero.command.TalkCommand.__super__ = albero.command.AutoBindCommand;
albero.command.TalkCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var action = notification.getBody();
		switch(action[1]) {
		case 0:
			var users = action[2];
			this.api.createTalk(users);
			break;
		case 1:
			var users1 = action[3];
			var talk = action[2];
			this.api.addTalkers(talk,users1);
			break;
		case 2:
			var talkId = action[3];
			var talk1 = action[2];
			if(talk1 == null) talk1 = this.dataStore.getTalk(talkId);
			this.api.deleteTalker(talk1,this.dataStore.currentUser);
			break;
		case 3:
			var iconUrl = action[5];
			var iconFile = action[4];
			var name = action[3];
			var talk2 = action[2];
			this.api.updateGroupTalk(talk2,name,iconFile,iconUrl);
			break;
		}
	}
	,__class__: albero.command.TalkCommand
});
albero.command.TalkAction = { __ename__ : true, __constructs__ : ["NEW","ADD","DELETE","UPDATE"] };
albero.command.TalkAction.NEW = function(users) { var $x = ["NEW",0,users]; $x.__enum__ = albero.command.TalkAction; $x.toString = $estr; return $x; };
albero.command.TalkAction.ADD = function(talk,users) { var $x = ["ADD",1,talk,users]; $x.__enum__ = albero.command.TalkAction; $x.toString = $estr; return $x; };
albero.command.TalkAction.DELETE = function(talk,talkId) { var $x = ["DELETE",2,talk,talkId]; $x.__enum__ = albero.command.TalkAction; $x.toString = $estr; return $x; };
albero.command.TalkAction.UPDATE = function(talk,name,iconFile,iconUrl) { var $x = ["UPDATE",3,talk,name,iconFile,iconUrl]; $x.__enum__ = albero.command.TalkAction; $x.toString = $estr; return $x; };
albero.command.UpdateUserCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.UpdateUserCommand"] = albero.command.UpdateUserCommand;
albero.command.UpdateUserCommand.__name__ = ["albero","command","UpdateUserCommand"];
albero.command.UpdateUserCommand.__super__ = albero.command.AutoBindCommand;
albero.command.UpdateUserCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var body = notification.getBody();
		if(body.profileImage != null && !StringTools.startsWith(body.profileImage.type,"image/")) return;
		this.api.updateUser(body.displayName,body.profileImage,body.profileImageUrl,body.phoneticDisplayName);
	}
	,__class__: albero.command.UpdateUserCommand
});
albero.command.UrlCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.UrlCommand"] = albero.command.UrlCommand;
albero.command.UrlCommand.__name__ = ["albero","command","UrlCommand"];
albero.command.UrlCommand.__super__ = albero.command.AutoBindCommand;
albero.command.UrlCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var action = notification.getBody();
		switch(action[1]) {
		case 0:
			var url = action[2];
			this.routing.forward(url);
			break;
		case 1:
			var url1 = action[2];
			this.routing.redirect(url1);
			break;
		case 2:
			this.routing.back();
			break;
		}
	}
	,__class__: albero.command.UrlCommand
});
albero.command.UrlAction = { __ename__ : true, __constructs__ : ["FORWARD","REDIRECT","BACK"] };
albero.command.UrlAction.FORWARD = function(url) { var $x = ["FORWARD",0,url]; $x.__enum__ = albero.command.UrlAction; $x.toString = $estr; return $x; };
albero.command.UrlAction.REDIRECT = function(url) { var $x = ["REDIRECT",1,url]; $x.__enum__ = albero.command.UrlAction; $x.toString = $estr; return $x; };
albero.command.UrlAction.BACK = ["BACK",2];
albero.command.UrlAction.BACK.toString = $estr;
albero.command.UrlAction.BACK.__enum__ = albero.command.UrlAction;
albero.entity = {};
albero.entity.Account = function(email,pass) {
	this.email = email;
	this.pass = pass;
};
$hxClasses["albero.entity.Account"] = albero.entity.Account;
albero.entity.Account.__name__ = ["albero","entity","Account"];
albero.entity.Account.prototype = {
	__class__: albero.entity.Account
};
albero.entity.Announcement = function(props) {
	if(props == null) return;
	this.id = props.announcement_id;
	this.domainId = props.domain_id;
	this.groupId = props.group_id;
	this.groupName = props.group_name;
	this.type = albero.entity.Message.typeOf(props.type);
	this.content = props.content;
	this.userId = props.user_id;
	this.userName = props.user_name;
	this.createdAt = props.created_at;
};
$hxClasses["albero.entity.Announcement"] = albero.entity.Announcement;
albero.entity.Announcement.__name__ = ["albero","entity","Announcement"];
albero.entity.Announcement.prototype = {
	__class__: albero.entity.Announcement
};
albero.entity.AnnouncementStatus = function(props) {
	if(props == null) return;
	this.domainId = props.domain_id;
	if(props.unread_count != null) this.unreadCount = props.unread_count; else this.unreadCount = 0;
	this.maxAnnouncementId = props.max_announcement_id;
	this.maxReadAnnouncementId = props.max_read_announcement_id;
};
$hxClasses["albero.entity.AnnouncementStatus"] = albero.entity.AnnouncementStatus;
albero.entity.AnnouncementStatus.__name__ = ["albero","entity","AnnouncementStatus"];
albero.entity.AnnouncementStatus.prototype = {
	__class__: albero.entity.AnnouncementStatus
};
albero.entity.Configuration = function(props) {
};
$hxClasses["albero.entity.Configuration"] = albero.entity.Configuration;
albero.entity.Configuration.__name__ = ["albero","entity","Configuration"];
albero.entity.Configuration.prototype = {
	__class__: albero.entity.Configuration
};
albero.entity.Domain = function(props) {
	if(props == null) return;
	this.id = props.domain_id;
	this.name = props.domain_name;
	this.role = this.typeOf(props.role);
	this.frozen = props.frozen;
	this.updatedAt = props.updated_at;
	this.plan = new albero.entity.Plan(props.plan);
	this.closed = false;
};
$hxClasses["albero.entity.Domain"] = albero.entity.Domain;
albero.entity.Domain.__name__ = ["albero","entity","Domain"];
albero.entity.Domain.prototype = {
	typeOf: function(role) {
		var type = role.type;
		switch(type) {
		case 10:
			return albero.entity.DomainRole.owner;
		case 20:
			return albero.entity.DomainRole.manager;
		case 30:
			return albero.entity.DomainRole.user;
		default:
			return albero.entity.DomainRole.guest;
		}
	}
	,__class__: albero.entity.Domain
};
albero.entity.DomainRole = { __ename__ : true, __constructs__ : ["owner","manager","user","guest"] };
albero.entity.DomainRole.owner = ["owner",0];
albero.entity.DomainRole.owner.toString = $estr;
albero.entity.DomainRole.owner.__enum__ = albero.entity.DomainRole;
albero.entity.DomainRole.manager = ["manager",1];
albero.entity.DomainRole.manager.toString = $estr;
albero.entity.DomainRole.manager.__enum__ = albero.entity.DomainRole;
albero.entity.DomainRole.user = ["user",2];
albero.entity.DomainRole.user.toString = $estr;
albero.entity.DomainRole.user.__enum__ = albero.entity.DomainRole;
albero.entity.DomainRole.guest = ["guest",3];
albero.entity.DomainRole.guest.toString = $estr;
albero.entity.DomainRole.guest.__enum__ = albero.entity.DomainRole;
albero.entity.DomainInvite = function(props) {
	if(props == null) return;
	this.id = props.domain_id;
	this.name = props.domain_name;
	this.updatedAt = props.updated_at;
};
$hxClasses["albero.entity.DomainInvite"] = albero.entity.DomainInvite;
albero.entity.DomainInvite.__name__ = ["albero","entity","DomainInvite"];
albero.entity.DomainInvite.prototype = {
	__class__: albero.entity.DomainInvite
};
albero.entity.FileInfo = function(props) {
	if(props == null) return;
	this.id = props.file_id;
	this.userId = props.user_id;
	this.name = props.name;
	this.contentType = props.content_type;
	this.contentSize = props.content_size;
	this.url = props.url;
	this.thumbUrl = props.thumbnail_url;
	this.updatedAt = props.updated_at;
};
$hxClasses["albero.entity.FileInfo"] = albero.entity.FileInfo;
albero.entity.FileInfo.__name__ = ["albero","entity","FileInfo"];
albero.entity.FileInfo.prototype = {
	__class__: albero.entity.FileInfo
};
albero.entity.Message = function(props) {
	if(props == null) return;
	this.id = props.message_id;
	this.talkId = props.talk_id;
	this.userId = props.user_id;
	this.type = albero.entity.Message.typeOf(props.type);
	this.content = props.content;
	this.createdAt = props.created_at;
	this.setStatus(props);
};
$hxClasses["albero.entity.Message"] = albero.entity.Message;
albero.entity.Message.__name__ = ["albero","entity","Message"];
albero.entity.Message.typeOf = function(type) {
	switch(type) {
	case 0:
		return albero.entity.MessageType.system;
	case 1:
		return albero.entity.MessageType.text;
	case 2:
		return albero.entity.MessageType.stamp;
	case 3:
		return albero.entity.MessageType.geo;
	case 4:
		return albero.entity.MessageType.file;
	case 500:
		return albero.entity.MessageType.yesOrNo;
	case 501:
		return albero.entity.MessageType.yesOrNoReply;
	case 502:
		return albero.entity.MessageType.selectOne;
	case 503:
		return albero.entity.MessageType.selectOneReply;
	case 504:
		return albero.entity.MessageType.todo;
	case 505:
		return albero.entity.MessageType.todoDone;
	case 600:
		return albero.entity.MessageType.phoneCall;
	case 601:
		return albero.entity.MessageType.phoneReceive;
	default:
		return albero.entity.MessageType.unknown;
	}
};
albero.entity.Message.enumIndex = function(type) {
	switch(type[1]) {
	case 0:case 1:case 2:case 3:case 4:
		return type[1];
	case 5:case 6:case 7:case 8:case 9:case 10:
		return 500 + type[1] - 5;
	case 11:case 12:
		return 600 + type[1] - 11;
	default:
		return -1;
	}
};
albero.entity.Message.prototype = {
	setStatus: function(props) {
		if(props == null) return;
		this.readCount = props.read_count;
		this.readUserIds = props.read_user_ids;
	}
	,__class__: albero.entity.Message
};
albero.entity.MessageType = { __ename__ : true, __constructs__ : ["system","text","stamp","geo","file","yesOrNo","yesOrNoReply","selectOne","selectOneReply","todo","todoDone","phoneCall","phoneReceive","unknown"] };
albero.entity.MessageType.system = ["system",0];
albero.entity.MessageType.system.toString = $estr;
albero.entity.MessageType.system.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.text = ["text",1];
albero.entity.MessageType.text.toString = $estr;
albero.entity.MessageType.text.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.stamp = ["stamp",2];
albero.entity.MessageType.stamp.toString = $estr;
albero.entity.MessageType.stamp.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.geo = ["geo",3];
albero.entity.MessageType.geo.toString = $estr;
albero.entity.MessageType.geo.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.file = ["file",4];
albero.entity.MessageType.file.toString = $estr;
albero.entity.MessageType.file.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.yesOrNo = ["yesOrNo",5];
albero.entity.MessageType.yesOrNo.toString = $estr;
albero.entity.MessageType.yesOrNo.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.yesOrNoReply = ["yesOrNoReply",6];
albero.entity.MessageType.yesOrNoReply.toString = $estr;
albero.entity.MessageType.yesOrNoReply.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.selectOne = ["selectOne",7];
albero.entity.MessageType.selectOne.toString = $estr;
albero.entity.MessageType.selectOne.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.selectOneReply = ["selectOneReply",8];
albero.entity.MessageType.selectOneReply.toString = $estr;
albero.entity.MessageType.selectOneReply.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.todo = ["todo",9];
albero.entity.MessageType.todo.toString = $estr;
albero.entity.MessageType.todo.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.todoDone = ["todoDone",10];
albero.entity.MessageType.todoDone.toString = $estr;
albero.entity.MessageType.todoDone.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.phoneCall = ["phoneCall",11];
albero.entity.MessageType.phoneCall.toString = $estr;
albero.entity.MessageType.phoneCall.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.phoneReceive = ["phoneReceive",12];
albero.entity.MessageType.phoneReceive.toString = $estr;
albero.entity.MessageType.phoneReceive.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.unknown = ["unknown",13];
albero.entity.MessageType.unknown.toString = $estr;
albero.entity.MessageType.unknown.__enum__ = albero.entity.MessageType;
albero.entity.MessageReadStatus = function(props) {
	if(props == null) return;
	this.id = props.message_id;
	this.talkId = props.talk_id;
	this.readUserIds = props.read_user_ids;
	this.unreadUserIds = props.unread_user_ids;
};
$hxClasses["albero.entity.MessageReadStatus"] = albero.entity.MessageReadStatus;
albero.entity.MessageReadStatus.__name__ = ["albero","entity","MessageReadStatus"];
albero.entity.MessageReadStatus.prototype = {
	__class__: albero.entity.MessageReadStatus
};
albero.entity.MessageReadStatusesUpdate = function(props) {
	if(props == null) return;
	this.talkId = props.talk_id;
	this.messageIds = props.message_ids;
	this.readUserIds = props.read_user_ids;
};
$hxClasses["albero.entity.MessageReadStatusesUpdate"] = albero.entity.MessageReadStatusesUpdate;
albero.entity.MessageReadStatusesUpdate.__name__ = ["albero","entity","MessageReadStatusesUpdate"];
albero.entity.MessageReadStatusesUpdate.prototype = {
	__class__: albero.entity.MessageReadStatusesUpdate
};
albero.entity.Plan = function(props) {
	if(props == null) return;
	this.name = props.plan_name;
	this.trial = props.trial;
};
$hxClasses["albero.entity.Plan"] = albero.entity.Plan;
albero.entity.Plan.__name__ = ["albero","entity","Plan"];
albero.entity.Plan.prototype = {
	__class__: albero.entity.Plan
};
albero.entity.Question = function(props) {
	if(props == null) return;
	this.id = props.message_id;
	this.talkId = props.talk_id;
	this.type = albero.entity.Message.typeOf(props.type);
	this.content = props.content;
	this.userId = props.user_id;
	this.recipientIds = props.recipient_ids;
	this.responses = this.createResponses(props.responses);
	this.closingType = albero.entity.Question.typeOf(props.closing_type);
	this.maxResponseId = props.max_response_id;
	this.lastResponse = props.last_response;
	this.lastResponseUserId = props.last_response_user_id;
	this.createdAt = props.created_at;
	this.updatedAt = props.updated_at;
	this.responded = props.responded;
};
$hxClasses["albero.entity.Question"] = albero.entity.Question;
albero.entity.Question.__name__ = ["albero","entity","Question"];
albero.entity.Question.typeOf = function(type) {
	switch(type) {
	case 0:
		return albero.entity.QuestionClosingType.any;
	case 1:
		return albero.entity.QuestionClosingType.all;
	default:
		return albero.entity.QuestionClosingType.unknown;
	}
};
albero.entity.Question.prototype = {
	createResponses: function(props) {
		var responses = [];
		if(props != null) {
			var _g = 0;
			while(_g < props.length) {
				var p = props[_g];
				++_g;
				responses.push(new albero.entity.QuestionResponse(p));
			}
		}
		return responses;
	}
	,__class__: albero.entity.Question
};
albero.entity.QuestionResponse = function(props) {
	if(props == null) return;
	this.content = props.content;
	this.count = props.count;
	this.userIds = props.user_ids;
};
$hxClasses["albero.entity.QuestionResponse"] = albero.entity.QuestionResponse;
albero.entity.QuestionResponse.__name__ = ["albero","entity","QuestionResponse"];
albero.entity.QuestionResponse.prototype = {
	__class__: albero.entity.QuestionResponse
};
albero.entity.QuestionClosingType = { __ename__ : true, __constructs__ : ["any","all","unknown"] };
albero.entity.QuestionClosingType.any = ["any",0];
albero.entity.QuestionClosingType.any.toString = $estr;
albero.entity.QuestionClosingType.any.__enum__ = albero.entity.QuestionClosingType;
albero.entity.QuestionClosingType.all = ["all",1];
albero.entity.QuestionClosingType.all.toString = $estr;
albero.entity.QuestionClosingType.all.__enum__ = albero.entity.QuestionClosingType;
albero.entity.QuestionClosingType.unknown = ["unknown",2];
albero.entity.QuestionClosingType.unknown.toString = $estr;
albero.entity.QuestionClosingType.unknown.__enum__ = albero.entity.QuestionClosingType;
albero.entity.Talk = function(props) {
	if(props == null) return;
	this.id = props.talk_id;
	this.domainId = props.domain_id;
	this.type = this.typeOf(props.type);
	this.name = props.talk_name;
	this.iconUrl = props.icon_url;
	this.userIds = props.user_ids;
	this.guestIds = props.inviting_guest_ids;
	this.updatedAt = props.updated_at;
	this.leftUsers = this.getUsers(props.left_users);
};
$hxClasses["albero.entity.Talk"] = albero.entity.Talk;
albero.entity.Talk.__name__ = ["albero","entity","Talk"];
albero.entity.Talk.prototype = {
	typeOf: function(type) {
		switch(type) {
		case 1:
			return albero.entity.TalkType.PairTalk;
		case 2:
			return albero.entity.TalkType.GroupTalk;
		default:
			return albero.entity.TalkType.Unknown;
		}
	}
	,getUsers: function(objs) {
		if(objs == null) return null;
		var users = new Array();
		var _g = 0;
		while(_g < objs.length) {
			var obj = objs[_g];
			++_g;
			users.push(new albero.entity.User(obj));
		}
		return users;
	}
	,__class__: albero.entity.Talk
};
albero.entity.TalkType = { __ename__ : true, __constructs__ : ["Unknown","PairTalk","GroupTalk"] };
albero.entity.TalkType.Unknown = ["Unknown",0];
albero.entity.TalkType.Unknown.toString = $estr;
albero.entity.TalkType.Unknown.__enum__ = albero.entity.TalkType;
albero.entity.TalkType.PairTalk = ["PairTalk",1];
albero.entity.TalkType.PairTalk.toString = $estr;
albero.entity.TalkType.PairTalk.__enum__ = albero.entity.TalkType;
albero.entity.TalkType.GroupTalk = ["GroupTalk",2];
albero.entity.TalkType.GroupTalk.toString = $estr;
albero.entity.TalkType.GroupTalk.__enum__ = albero.entity.TalkType;
albero.entity.TalkStatus = function(props) {
	this.unreadCount = 0;
	if(props == null) return;
	this.id = props.talk_id;
	if(props.unread_count != null) this.unreadCount = props.unread_count; else this.unreadCount = 0;
	this.maxMessageId = props.max_message_id;
	this.maxMessageCreatedAt = props.max_message_created_at;
	this.maxReadMessageId = props.max_read_message_id;
	this.maxEveryoneReadMessageId = props.max_everyone_read_message_id;
};
$hxClasses["albero.entity.TalkStatus"] = albero.entity.TalkStatus;
albero.entity.TalkStatus.__name__ = ["albero","entity","TalkStatus"];
albero.entity.TalkStatus.prototype = {
	__class__: albero.entity.TalkStatus
};
albero.entity.TalkStatusUpdate = function(props) {
	if(props == null) return;
	this.talkId = props.talk_id;
	this.maxEveryoneReadMessageId = props.max_everyone_read_message_id;
};
$hxClasses["albero.entity.TalkStatusUpdate"] = albero.entity.TalkStatusUpdate;
albero.entity.TalkStatusUpdate.__name__ = ["albero","entity","TalkStatusUpdate"];
albero.entity.TalkStatusUpdate.prototype = {
	__class__: albero.entity.TalkStatusUpdate
};
albero.entity.User = function(props) {
	if(props == null) return;
	this.id = props.user_id;
	this.email = props.email;
	this.displayName = props.display_name;
	this.canonicalDisplayName = props.canonical_display_name;
	this.phoneticDisplayName = props.phonetic_display_name;
	this.canonicalPhoneticDisplayName = props.canonical_phonetic_display_name;
	this.profileImageUrl = props.profile_image_url;
	this.updatedAt = props.updated_at;
};
$hxClasses["albero.entity.User"] = albero.entity.User;
albero.entity.User.__name__ = ["albero","entity","User"];
albero.entity.User.prototype = {
	getName: function(htmlEscape) {
		if(htmlEscape == null) htmlEscape = true;
		if(this.displayName != null) if(htmlEscape) return StringTools.htmlEscape(this.displayName,true); else return this.displayName;
		return this.email;
	}
	,__class__: albero.entity.User
};
var AlberoLog = $hx_exports.AlberoLog = function() { };
$hxClasses["AlberoLog"] = AlberoLog;
AlberoLog.__name__ = ["AlberoLog"];
albero.js = {};
albero.js.WebSocket = function(url) {
	var _g = this;
	var webSocketClient = js.Node.require("websocket").client;
	this.ws = new webSocketClient();
	this.ws.on("connectFailed",$bind(this,this.onError));
	this.ws.on("connect",function(connection) {
		_g.connection = connection;
		connection.on("error",$bind(_g,_g.onError));
		connection.on("close",$bind(_g,_g.onClose));
		connection.on("message",$bind(_g,_g.onMessage));
		_g.onOpen(null);
	});
	this.ws.connect(url);
};
$hxClasses["albero.js.WebSocket"] = albero.js.WebSocket;
albero.js.WebSocket.__name__ = ["albero","js","WebSocket"];
albero.js.WebSocket.prototype = {
	onOpen: function(event) {
		if(console != null) console.info("WebSocket opened.","","","","");
		if(this.onopen != null) this.onopen();
	}
	,onMessage: function(event) {
		if(this.onmessage != null) {
			var data = null;
			var e = event;
			data = haxe.io.Bytes.ofData(e.binaryData);
			this.onmessage(data);
		}
	}
	,onError: function(event) {
		if(console != null) console.error("WebSocket error. event:",event,"","","");
		if(this.onerror != null) this.onerror();
	}
	,onClose: function(event) {
		this.ws = null;
		this.connection = null;
		if(console != null) console.info("WebSocket closed. event:%s reason:%s wasClean:%s",event.code,event.reason,event.wasClean,"");
		if(this.onclose != null) this.onclose(event.code,event.reason,event.wasClean);
	}
	,close: function() {
		if(this.isClosed()) return;
		this.connection.close();
	}
	,send: function(data) {
		if(this.isClosed()) return;
		this.connection.sendBytes(data.b);
	}
	,isClosed: function() {
		return this.ws == null || this.connection == null || !this.connection.connected;
	}
	,__class__: albero.js.WebSocket
};
puremvc.interfaces.IProxy = function() { };
$hxClasses["puremvc.interfaces.IProxy"] = puremvc.interfaces.IProxy;
puremvc.interfaces.IProxy.__name__ = ["puremvc","interfaces","IProxy"];
puremvc.interfaces.IProxy.prototype = {
	__class__: puremvc.interfaces.IProxy
};
albero.proxy = {};
albero.proxy.AccountLoaderProxy = function() { };
$hxClasses["albero.proxy.AccountLoaderProxy"] = albero.proxy.AccountLoaderProxy;
albero.proxy.AccountLoaderProxy.__name__ = ["albero","proxy","AccountLoaderProxy"];
albero.proxy.AccountLoaderProxy.__interfaces__ = [puremvc.interfaces.IProxy];
albero.proxy.AccountLoaderProxy.prototype = {
	__class__: albero.proxy.AccountLoaderProxy
};
albero.proxy.AccountLoaderProxyFactory = function() { };
$hxClasses["albero.proxy.AccountLoaderProxyFactory"] = albero.proxy.AccountLoaderProxyFactory;
albero.proxy.AccountLoaderProxyFactory.__name__ = ["albero","proxy","AccountLoaderProxyFactory"];
albero.proxy.AccountLoaderProxyFactory.newInstance = function() {
	var cls = Type.resolveClass("albero.debug.proxy.AccountLoaderProxyImpl");
	if(cls != null) return Type.createInstance(cls,["accountLoader"]); else return new albero.proxy._AccountLoaderProxy.DefaultTestAccountLoaderProxy("accountLoader");
};
puremvc.patterns.proxy = {};
puremvc.patterns.proxy.Proxy = function(proxyName,data) {
	puremvc.patterns.observer.Notifier.call(this);
	if(proxyName != null) this.proxyName = proxyName; else this.proxyName = puremvc.patterns.proxy.Proxy.NAME;
	if(data != null) this.setData(data);
};
$hxClasses["puremvc.patterns.proxy.Proxy"] = puremvc.patterns.proxy.Proxy;
puremvc.patterns.proxy.Proxy.__name__ = ["puremvc","patterns","proxy","Proxy"];
puremvc.patterns.proxy.Proxy.__interfaces__ = [puremvc.interfaces.IProxy];
puremvc.patterns.proxy.Proxy.__super__ = puremvc.patterns.observer.Notifier;
puremvc.patterns.proxy.Proxy.prototype = $extend(puremvc.patterns.observer.Notifier.prototype,{
	getProxyName: function() {
		return this.proxyName;
	}
	,setData: function(data) {
		this.data = data;
	}
	,onRegister: function() {
	}
	,__class__: puremvc.patterns.proxy.Proxy
});
albero.proxy._AccountLoaderProxy = {};
albero.proxy._AccountLoaderProxy.DefaultTestAccountLoaderProxy = function(name) {
	puremvc.patterns.proxy.Proxy.call(this,name);
};
$hxClasses["albero.proxy._AccountLoaderProxy.DefaultTestAccountLoaderProxy"] = albero.proxy._AccountLoaderProxy.DefaultTestAccountLoaderProxy;
albero.proxy._AccountLoaderProxy.DefaultTestAccountLoaderProxy.__name__ = ["albero","proxy","_AccountLoaderProxy","DefaultTestAccountLoaderProxy"];
albero.proxy._AccountLoaderProxy.DefaultTestAccountLoaderProxy.__interfaces__ = [albero.proxy.AccountLoaderProxy];
albero.proxy._AccountLoaderProxy.DefaultTestAccountLoaderProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy._AccountLoaderProxy.DefaultTestAccountLoaderProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	load: function() {
		var _g = this;
		var read = js.Node.require("read");
		read({ prompt : "Email: "},function(er,user) {
			read({ prompt : "Password: ", silent : true},function(er1,pass) {
				_g.sendNotification("SignIn",new albero.entity.Account(user,pass));
			});
		});
		return null;
	}
	,__class__: albero.proxy._AccountLoaderProxy.DefaultTestAccountLoaderProxy
});
albero.proxy.AlberoBroadcastProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"broadcast");
};
$hxClasses["albero.proxy.AlberoBroadcastProxy"] = albero.proxy.AlberoBroadcastProxy;
albero.proxy.AlberoBroadcastProxy.__name__ = ["albero","proxy","AlberoBroadcastProxy"];
albero.proxy.AlberoBroadcastProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.AlberoBroadcastProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	handleNotification: function(name,body,callback) {
		if(AlberoLog.DEBUG && console != null) console.log("Receive request from server. name:",name," body:",body,"");
		var obj = this.convertObject(name,body);
		var callbackSoon = this.preNotification(name,obj,callback);
		this.sendNotification(name,obj);
		if(callbackSoon) callback();
	}
	,preNotification: function(name,obj,callback) {
		var _g1 = this;
		var callbackSoon = true;
		switch(name) {
		case "notify_leave_domain":
			var domainId = obj;
			this.dataStore.removeDomain(domainId);
			break;
		case "notify_delete_domain_invite":
			var domainId1 = obj;
			this.dataStore.removeDomainInvite(domainId1);
			break;
		case "notify_add_friend":
			this.dataStore.addFriend(obj[0],obj[1]);
			break;
		case "notify_delete_friend":
			this.dataStore.removeFriend(obj[0],obj[1]);
			break;
		case "notify_add_acquaintance":
			this.dataStore.addAcquaintance(obj[0],obj[1]);
			break;
		case "notify_delete_acquaintance":
			this.dataStore.removeAcquaintance(obj[0],obj[1]);
			break;
		case "notify_create_message":
			var msg = obj;
			var _g = msg.type;
			switch(_g[1]) {
			case 12:
				this.sendNotification("phone_call_connected",msg.content);
				break;
			case 5:case 7:case 9:
				callbackSoon = false;
				haxe.Timer.delay(function() {
					_g1.sendNotification("ReloadData",albero.command.ReloadDataType.Question(msg.id,callback));
				},500);
				break;
			case 6:case 8:case 10:
				callbackSoon = false;
				haxe.Timer.delay(function() {
					_g1.sendNotification("ReloadData",albero.command.ReloadDataType.Question(msg.content.in_reply_to,callback));
				},500);
				break;
			case 4:
				if(msg.content.file_id != null) {
					var file = new albero.entity.FileInfo();
					file.talkId = msg.talkId;
					file.userId = msg.userId;
					file.updatedAt = msg.createdAt;
					file.id = msg.content.file_id;
					file.name = msg.content.name;
					file.contentType = msg.content.content_type;
					file.contentSize = msg.content.content_size;
					file.url = msg.content.url;
					this.sendNotification("notify_update_fileinfo",file);
				}
				break;
			default:
			}
			var talkStatus = this.newTalkStatusByMessage(msg);
			if(talkStatus != null) this.sendNotification("notify_update_local_talk_status",talkStatus);
			break;
		case "notify_update_read_statuses":
			var status = obj;
			var talkStatus1 = this.updateTalkStatus(status);
			if(talkStatus1 != null) this.sendNotification("notify_update_local_talk_status",talkStatus1);
			break;
		case "notify_update_announcement_status":
			var status1 = obj;
			var currentStatus = this.dataStore.getAnnouncementStatus(status1.domainId);
			if(currentStatus == null) this.dataStore.setAnnouncementStatus(status1); else if(currentStatus.maxReadAnnouncementId == null || haxe.Int64.compare(currentStatus.maxReadAnnouncementId,status1.maxReadAnnouncementId) < 0) this.dataStore.setAnnouncementStatus(status1); else {
				if(AlberoLog.DEBUG && console != null) console.log("notified announcement status is older than current status. notified:%o, current:%o",status1,currentStatus,"","");
				status1.maxReadAnnouncementId = currentStatus.maxReadAnnouncementId;
				status1.maxAnnouncementId = currentStatus.maxAnnouncementId;
				status1.unreadCount = currentStatus.unreadCount;
			}
			break;
		case "notify_update_talk_status":
			var statusUpdate = obj;
			var status2 = this.dataStore.getTalkStatus(statusUpdate.talkId);
			if(status2 != null && haxe.Int64.compare(status2.maxEveryoneReadMessageId,statusUpdate.maxEveryoneReadMessageId) < 0) {
				status2.maxEveryoneReadMessageId = statusUpdate.maxEveryoneReadMessageId;
				this.dataStore.setTalkStatus(status2);
				this.sendNotification("notify_update_local_talk_status",status2);
			}
			break;
		case "notify_delete_talk":
			this.dataStore.removeTalk(obj);
			this.dataStore.removeTalkStatus(obj);
			this.sendNotification("SelectTalk",null);
			break;
		case "notify_create_announcement":
			var announce = obj;
			this.sendNotification("notify_update_announcement_status",this.newAnnouncementStatus(announce));
			break;
		}
		return callbackSoon;
	}
	,convertObject: function(name,obj) {
		switch(name) {
		case "notify_update_user":
			if((obj instanceof Array) && obj.__enum__ == null) obj[1] = this.newUser(obj[1]); else {
				var user = this.newUser(obj);
				if(albero.Int64Helper.eq(user.id,this.dataStore.currentUser.id)) {
					if(AlberoLog.DEBUG && console != null) console.log("Current user updated. user:",user,"","","");
					this.dataStore.setCurrentUser(user);
				}
				obj = [this.settings.getSelectedDomainId(),user];
			}
			break;
		case "notify_add_friend":case "notify_add_acquaintance":
			obj[1] = this.newUser(obj[1]);
			break;
		case "notify_join_domain":case "notify_update_domain":
			obj = this.newDomain(obj);
			break;
		case "notify_add_domain_invite":
			obj = this.newDomainInvite(obj);
			break;
		case "notify_create_pair_talk":case "notify_create_group_talk":case "notify_update_group_talk":case "notify_add_talkers":case "notify_delete_talker":
			obj = this.newTalk(obj);
			break;
		case "notify_create_message":
			obj = this.newMessage(obj);
			break;
		case "notify_update_read_statuses":
			obj = this.newMessageReadStatusesUpdate(obj);
			break;
		case "notify_update_talk_status":
			obj = this.newTalkStatusUpdate(obj);
			break;
		case "notify_create_announcement":
			obj = new albero.entity.Announcement(obj);
			break;
		case "notify_update_announcement_status":
			obj = new albero.entity.AnnouncementStatus(obj);
			break;
		default:
			if(console != null) console.warn("Unknown method. name:",name," obj:",obj,"");
		}
		return obj;
	}
	,newDomain: function(obj) {
		return this.dataStore.setDomain(new albero.entity.Domain(obj));
	}
	,newDomainInvite: function(obj) {
		return this.dataStore.setDomainInvite(new albero.entity.DomainInvite(obj));
	}
	,newUser: function(obj) {
		return this.dataStore.setUser(new albero.entity.User(obj));
	}
	,newTalk: function(obj) {
		return this.dataStore.setTalk(new albero.entity.Talk(obj));
	}
	,newTalkStatusByMessage: function(msg) {
		var status = this.dataStore.getTalkStatus(msg.talkId);
		if(status == null) {
			status = new albero.entity.TalkStatus();
			status.id = msg.talkId;
		}
		if(status.maxMessageId == null || haxe.Int64.compare(status.maxMessageId,msg.id) < 0) {
			status.maxMessageId = msg.id;
			status.maxMessageCreatedAt = msg.createdAt;
		}
		if(!this.dataStore.isCurrentUser(msg.userId)) status.unreadCount++;
		this.dataStore.setTalkStatus(status);
		return status;
	}
	,updateTalkStatus: function(msgStatuses) {
		var _g = 0;
		var _g1 = msgStatuses.readUserIds;
		while(_g < _g1.length) {
			var userId = _g1[_g];
			++_g;
			if(this.dataStore.isCurrentUser(userId)) {
				var talkStatus = this.dataStore.getTalkStatus(msgStatuses.talkId);
				var maxMessageId = msgStatuses.messageIds[0];
				var _g2 = 0;
				var _g3 = msgStatuses.messageIds;
				while(_g2 < _g3.length) {
					var msgId = _g3[_g2];
					++_g2;
					if(talkStatus.maxReadMessageId == null || haxe.Int64.compare(talkStatus.maxReadMessageId,msgId) < 0) {
						if(haxe.Int64.compare(maxMessageId,msgId) < 0) maxMessageId = msgId;
						talkStatus.unreadCount--;
					}
				}
				if(talkStatus.maxReadMessageId == null || haxe.Int64.compare(talkStatus.maxReadMessageId,maxMessageId) < 0) {
					talkStatus.maxReadMessageId = maxMessageId;
					this.dataStore.setTalkStatus(talkStatus);
				}
				return talkStatus;
			}
		}
		return null;
	}
	,newMessage: function(obj) {
		return new albero.entity.Message(obj);
	}
	,newMessageReadStatusesUpdate: function(obj) {
		return new albero.entity.MessageReadStatusesUpdate(obj);
	}
	,newTalkStatusUpdate: function(obj) {
		return new albero.entity.TalkStatusUpdate(obj);
	}
	,newAnnouncementStatus: function(announce) {
		var status = this.dataStore.getAnnouncementStatus(announce.domainId);
		if(status == null) {
			status = new albero.entity.AnnouncementStatus();
			status.domainId = announce.domainId;
		}
		if(status.maxAnnouncementId == null || haxe.Int64.compare(status.maxAnnouncementId,announce.id) < 0) status.maxAnnouncementId = announce.id;
		if(status.unreadCount == null) status.unreadCount = 0;
		status.unreadCount++;
		this.dataStore.setAnnouncementStatus(status);
		return status;
	}
	,__class__: albero.proxy.AlberoBroadcastProxy
});
albero.proxy.AlberoServiceProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"api");
	this.updateReadStatusesTimers = new haxe.ds.StringMap();
	this.updateReadAnnouncementStatusesTimers = new haxe.ds.StringMap();
};
$hxClasses["albero.proxy.AlberoServiceProxy"] = albero.proxy.AlberoServiceProxy;
albero.proxy.AlberoServiceProxy.__name__ = ["albero","proxy","AlberoServiceProxy"];
albero.proxy.AlberoServiceProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.AlberoServiceProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	createAccessToken: function(email,password) {
		var _g = this;
		var type = "pc";
		type = "bot";
		var idfv = "";
		this.rpc.call("create_access_token",[email,password,idfv,type,""],function(accessToken) {
			if(AlberoLog.DEBUG && console != null) console.log("access token:" + accessToken,"","","","");
			_g.settings.setAccessToken(accessToken);
			_g.createSession(accessToken);
		},function(error) {
			_g.sendNotification("Url",albero.command.UrlAction.FORWARD(albero.Urls.error));
		});
	}
	,createSession: function(accessToken) {
		var _g = this;
		this.rpc.call("create_session",[accessToken,"1.21"],function(map) {
			_g.dataStore.setCurrentUser(_g.newUser(map.user));
			_g.settings.setConfiguration(new albero.entity.Configuration(map.configuration));
			var callback = function() {
				_g.dataRecoverd = true;
				_g.sendNotification("data_recovered");
				_g.rpc.call("start_notification",[],function(data) {
					var succeed = data;
					if(!succeed) {
					}
				});
			};
			if(_g.dataRecoverd) {
				callback();
				return;
			}
			_g.recoverData(callback);
		},function(error) {
			_g.settings.clearAccessToken();
			_g.sendNotification("Url",albero.command.UrlAction.FORWARD(albero.Urls.error));
		});
	}
	,recoverData: function(callback) {
		var _g = this;
		this.rpc.call("reset_notification",[],function(_) {
			var completeCount = 0;
			var callbackIfAllFunctionFinished = function() {
				completeCount++;
				if(completeCount < 6) return;
				callback();
			};
			_g.getDomains(function() {
				var domains = _g.dataStore.getDomains();
				var gotAnnouncementStatusCount = 0;
				var callbackIfGotAllAnnouncementStatuses = function() {
					gotAnnouncementStatusCount++;
					if(gotAnnouncementStatusCount >= domains.length) callbackIfAllFunctionFinished();
				};
				if(domains.length > 0) {
					var _g1 = 0;
					while(_g1 < domains.length) {
						var domain = domains[_g1];
						++_g1;
						_g.getAnnouncementStatuses(domain.id,callbackIfGotAllAnnouncementStatuses);
					}
				} else callbackIfAllFunctionFinished();
			});
			_g.getDomainInvites(callbackIfAllFunctionFinished);
			_g.getFriends(callbackIfAllFunctionFinished);
			_g.getAcquaintances(callbackIfAllFunctionFinished);
			_g.getTalks(callbackIfAllFunctionFinished);
			_g.getTalkInvites(callbackIfAllFunctionFinished);
		});
	}
	,deleteSession: function() {
		this.settings.clearSelectedStampTabId();
		this.settings.clearDomainSelection();
		this.settings.clearAccessToken();
		this.rpc.restart();
	}
	,updateUser: function(displayName,profileImage,profileImageUrl,phoneticDisplayName) {
		var _g = this;
		var updateUserName = function(profileUrl) {
			_g.rpc.call("update_user",[displayName,profileUrl,phoneticDisplayName],function(map) {
				_g.dataStore.setCurrentUser(_g.newUser(map));
			});
		};
		if(profileImageUrl != null) updateUserName(profileImageUrl); else if(profileImage != null) this.uploadFile(profileImage,null,albero.proxy._AlberoServiceProxy.UploadUseType.PROFILE_IMAGE,function(auth) {
			updateUserName(auth.get_url);
		}); else updateUserName();
	}
	,addFriend: function(friend) {
		var _g = this;
		var domainId = this.settings.getSelectedDomainId();
		this.rpc.call("add_friend",[domainId,friend.id],function(r) {
			r[1] = _g.newFriend(r[0],r[1]);
			_g.sendNotification("notify_add_friend",r);
		});
	}
	,deleteFriend: function(friend) {
		var _g = this;
		var domainId = this.settings.getSelectedDomainId();
		this.rpc.call("delete_friend",[domainId,friend.id],function(r) {
			_g.dataStore.removeFriend(r[0],r[1]);
			_g.sendNotification("delete_friend",r);
		});
	}
	,getFriends: function(callback) {
		var _g2 = this;
		this.rpc.call("get_friends",[],function(array) {
			var _g = 0;
			while(_g < array.length) {
				var row = array[_g];
				++_g;
				var domainId = row[0];
				var users = row[1];
				var _g1 = 0;
				while(_g1 < users.length) {
					var u = users[_g1];
					++_g1;
					var user = _g2.newFriend(domainId,u);
					_g2.sendNotification("notify_add_friend",[domainId,user]);
					_g2.sendNotification("notify_update_user",[domainId,user]);
				}
			}
			if(callback != null) callback();
		});
	}
	,getAcquaintances: function(callback) {
		var _g2 = this;
		this.rpc.call("get_acquaintances",[],function(array) {
			var _g = 0;
			while(_g < array.length) {
				var row = array[_g];
				++_g;
				var domainId = row[0];
				var users = row[1];
				var _g1 = 0;
				while(_g1 < users.length) {
					var u = users[_g1];
					++_g1;
					var user = _g2.newAcquaintance(domainId,u);
					_g2.sendNotification("notify_add_acquaintance",[domainId,user]);
					_g2.sendNotification("notify_update_user",[domainId,user]);
				}
			}
			if(callback != null) callback();
		});
	}
	,getNotYetFriends: function(marker) {
		var _g1 = this;
		var domainId = this.settings.getSelectedDomainId();
		var maxCount = 40;
		var targets = 8;
		this.rpc.call("get_domain_users",[domainId,targets,maxCount,marker],function(result) {
			var users = new Array();
			var usersArray = result.contents;
			var _g = 0;
			while(_g < usersArray.length) {
				var map = usersArray[_g];
				++_g;
				var user = _g1.newUser(map);
				if(!_g1.dataStore.isFriendOrAcquaintance(domainId,user.id)) users.push(user);
			}
			_g1.sendNotification("get_users_responsed",[domainId,result.marker,result.next_marker,users]);
		});
	}
	,searchDomainUsers: function(query,marker) {
		var _g1 = this;
		var domainId = this.settings.getSelectedDomainId();
		var maxCount = 40;
		var targets = 8;
		this.rpc.call("search_domain_users",[domainId,query,targets,maxCount,marker],function(result) {
			var users = new Array();
			var usersArray = result.contents;
			var _g = 0;
			while(_g < usersArray.length) {
				var map = usersArray[_g];
				++_g;
				var user = _g1.newUser(map);
				if(!_g1.dataStore.isFriendOrAcquaintance(domainId,user.id)) users.push(user);
			}
			_g1.sendNotification("get_users_responsed",[domainId,result.marker,result.next_marker,users,query]);
		});
	}
	,getDomains: function(callback) {
		var _g1 = this;
		var sendDomainNotifications = function(domains) {
			domains.reverse();
			var _g = 0;
			while(_g < domains.length) {
				var domain = domains[_g];
				++_g;
				_g1.sendNotification("notify_update_domain",domain);
			}
		};
		this.rpc.call("get_domains",[],function(array) {
			var _g2 = 0;
			while(_g2 < array.length) {
				var map = array[_g2];
				++_g2;
				_g1.newDomain(map);
			}
			sendDomainNotifications(_g1.dataStore.getDomains());
			if(callback != null) callback();
		});
	}
	,leaveDomain: function(domain) {
		var _g = this;
		this.rpc.call("leave_domain",[domain.id],function(domainId) {
			_g.dataStore.removeDomain(domainId);
		});
	}
	,getDomainInvites: function(callback) {
		var _g1 = this;
		this.rpc.call("get_domain_invites",[],function(array) {
			var _g = 0;
			while(_g < array.length) {
				var map = array[_g];
				++_g;
				_g1.sendNotification("notify_add_domain_invite",_g1.newDomainInvite(map));
			}
			if(callback != null) callback();
		});
	}
	,acceptDomainInvite: function(domainId) {
		this.rpc.call("accept_domain_invite",[domainId],function(domainId1) {
		});
	}
	,deleteDomainInvite: function(domainId) {
		this.rpc.call("delete_domain_invite",[domainId],function(domainId1) {
		});
	}
	,getTalks: function(callback) {
		var _g = this;
		var sendTalkNotification = function(talk) {
			var note;
			if(talk.type == albero.entity.TalkType.PairTalk) note = "notify_create_pair_talk"; else note = "notify_create_group_talk";
			_g.sendNotification(note,talk);
		};
		var sendTalkNotifications = function(talks) {
			talks.sort(function(talk1,talk2) {
				var status1 = _g.dataStore.getTalkStatus(talk1.id);
				var update1 = null;
				if(status1 != null) update1 = status1.maxMessageCreatedAt;
				if(update1 == null) update1 = talk1.updatedAt;
				var status2 = _g.dataStore.getTalkStatus(talk2.id);
				var update2 = null;
				if(status2 != null) update2 = status2.maxMessageCreatedAt;
				if(update2 == null) update2 = talk2.updatedAt;
				return haxe.Int64.compare(update1,update2);
			});
			var _g1 = 0;
			while(_g1 < talks.length) {
				var talk3 = talks[_g1];
				++_g1;
				sendTalkNotification(talk3);
			}
		};
		var sendTalkStatusNotifications = function(statuses) {
			var _g2 = 0;
			while(_g2 < statuses.length) {
				var status = statuses[_g2];
				++_g2;
				_g.sendNotification("notify_update_local_talk_status",status);
			}
		};
		this.rpc.call("get_talks",[],function(array) {
			var _g3 = 0;
			while(_g3 < array.length) {
				var map = array[_g3];
				++_g3;
				_g.newTalk(map);
			}
			_g.rpc.call("get_talk_statuses",[],function(array1) {
				var _g11 = 0;
				while(_g11 < array1.length) {
					var map1 = array1[_g11];
					++_g11;
					_g.newTalkStatus(map1);
				}
				sendTalkNotifications(_g.dataStore.getTalks());
				sendTalkStatusNotifications(_g.dataStore.getTalkStatuses());
				if(callback != null) callback();
			});
		});
	}
	,getReadStatus: function(talkId,messageId) {
		var _g = this;
		this.rpc.call("get_read_status",[talkId,messageId],function(status) {
			_g.sendNotification("notify_get_message_status",new albero.entity.MessageReadStatus(status));
		});
	}
	,getCheckedUserIds: function(users,domainId,talk) {
		var userIds = new Array();
		var added = new haxe.ds.StringMap();
		var key = albero.Int64Helper.idStr(this.dataStore.currentUser.id);
		added.set(key,true);
		if(talk != null) {
			var _g = 0;
			var _g1 = talk.userIds;
			while(_g < _g1.length) {
				var uid = _g1[_g];
				++_g;
				added.set("_" + uid.high + "_" + uid.low,true);
			}
		}
		var _g2 = 0;
		while(_g2 < users.length) {
			var u = users[_g2];
			++_g2;
			var uid1 = albero.Int64Helper.idStr(u.id);
			if(!added.exists(uid1) && this.dataStore.isFriend(domainId,u.id)) {
				userIds.push(u.id);
				added.set(uid1,true);
			}
		}
		return userIds;
	}
	,createTalk: function(users) {
		var _g = this;
		var domainId = this.settings.getSelectedDomainId();
		var userIds = this.getCheckedUserIds(users,domainId);
		if(userIds.length == 0) return;
		var pair = userIds.length == 1;
		var method;
		if(pair) method = "create_pair_talk"; else method = "create_group_talk";
		var params;
		if(pair) params = [domainId,userIds.pop()]; else params = [domainId,userIds];
		this.rpc.call(method,params,function(map) {
			var talk = _g.newTalk(map);
			var note;
			if(pair) note = "notify_create_pair_talk"; else note = "notify_create_group_talk";
			_g.sendNotification(note,talk);
			_g.sendNotification("talk_selection_changed",talk);
		});
	}
	,updateGroupTalk: function(talk,name,iconFile,iconUrl) {
		var _g = this;
		var _updateGroupTalk = function(iconUrl1) {
			_g.rpc.call("update_group_talk",[talk.id,name,iconUrl1],function(map) {
				_g.sendNotification("notify_update_group_talk",_g.newTalk(map));
			});
		};
		if(iconUrl != null) _updateGroupTalk(iconUrl); else if(iconFile != null) this.uploadFile(iconFile,talk.domainId,albero.proxy._AlberoServiceProxy.UploadUseType.TALK_ICON,function(auth) {
			_updateGroupTalk(auth.get_url);
		}); else _updateGroupTalk();
	}
	,addTalkers: function(talk,users) {
		var _g = this;
		if(talk.type == albero.entity.TalkType.PairTalk) {
			this.createTalk(this.dataStore.getUsers(talk.userIds).concat(users));
			return;
		}
		var userIds = this.getCheckedUserIds(users,talk.domainId,talk);
		if(userIds.length == 0) return;
		this.rpc.call("add_talkers",[talk.id,userIds],function(talk1) {
			_g.sendNotification("notify_add_talkers",_g.newTalk(talk1));
		});
	}
	,deleteTalker: function(talk,user) {
		var _g = this;
		this.rpc.call("delete_talker",[talk.id,user.id],function(_) {
			albero.Int64Helper.remove(talk.userIds,user.id);
			_g.sendNotification("notify_delete_talker",_g.dataStore.setTalk(talk));
		});
	}
	,getTalkInvites: function(callback) {
		var _g1 = this;
		this.rpc.call("get_talk_invites",[],function(array) {
			var _g = 0;
			while(_g < array.length) {
				var map = array[_g];
				++_g;
				_g1.acceptTalkInvite(map.talk_id);
			}
			if(callback != null) callback();
		});
	}
	,acceptTalkInvite: function(talkId) {
		this.rpc.call("accept_talk_invite",[talkId],function(_) {
		});
	}
	,getMessages: function(talk,range) {
		var _g1 = this;
		var count = 20;
		if(range == null) range = { sinceId : null, maxId : null};
		this.rpc.call("get_messages",[talk.id,count,range.sinceId,range.maxId],function(result) {
			var messages = new Array();
			var _g = 0;
			while(_g < result.length) {
				var msg = result[_g];
				++_g;
				messages.push(_g1.newMessage(msg));
			}
			_g1.sendNotification("notify_get_messages",{ talkId : talk.id, messages : messages});
		});
	}
	,createMessage: function(talkId,type,content) {
		var _g = this;
		this.sendNotification("notify_create_message",this.newDummyMessage(talkId,type,content));
		this.rpc.call("create_message",[talkId,albero.entity.Message.enumIndex(type),content],function(message) {
			_g.sendNotification("notify_create_message",_g.newMessage(message));
		});
	}
	,updateReadStatuses: function(talkId,maxMsgId) {
		var _g = this;
		var status = this.dataStore.getTalkStatus(talkId);
		if(status == null) return;
		if(maxMsgId == null) {
			if(status.unreadCount == 0) return;
			maxMsgId = status.maxMessageId;
		} else if(status.maxReadMessageId != null && haxe.Int64.compare(status.maxReadMessageId,maxMsgId) >= 0) return;
		status.unreadCount = 0;
		status.maxReadMessageId = maxMsgId;
		this.dataStore.setTalkStatus(status);
		this.sendNotification("notify_update_local_talk_status",status);
		var talkIdStr = "_" + talkId.high + "_" + talkId.low;
		var timer = this.updateReadStatusesTimers.get(talkIdStr);
		if(timer != null) timer.stop();
		timer = haxe.Timer.delay(function() {
			_g.updateReadStatusesTimers.remove(talkIdStr);
			_g.rpc.call("update_read_statuses",[talkId,maxMsgId],function(_) {
			});
		},1000);
		this.updateReadStatusesTimers.set(talkIdStr,timer);
	}
	,upload: function(domainId,talkId,file) {
		var _g = this;
		var fileName = file.name.normalize("NFKC");
		this.uploadFile(file,domainId,albero.proxy._AlberoServiceProxy.UploadUseType.MESSAGE,function(auth) {
			_g.createMessage(talkId,albero.entity.MessageType.file,{ file_id : auth.file_id, content_type : file.type, content_size : file.size, name : fileName, url : auth.get_url});
		});
	}
	,uploadFile: function(file,domainId,useType,callback) {
		var _g = this;
		var useTypeInt;
		switch(useType[1]) {
		case 0:
			useTypeInt = 0;
			break;
		case 1:
			useTypeInt = 1;
			break;
		default:
			useTypeInt = 2;
		}
		var fileName = file.name.normalize("NFKC");
		this.rpc.call("create_upload_auth",[fileName,file.type,file.size,domainId,useTypeInt],function(auth) {
			_g.fileService.upload(auth,file.type,file,function() {
				callback(auth);
			});
		});
	}
	,deleteFile: function(fileId) {
		var _g = this;
		this.rpc.call("delete_file",[fileId],function(_) {
			_g.sendNotification("notify_delete_fileinfo",fileId);
		});
	}
	,getFiles: function(talk,range) {
		var _g1 = this;
		var count = 20;
		if(range == null) range = { sinceId : null, maxId : null};
		this.rpc.call("get_talk_files",[talk.id,count,range.sinceId,range.maxId],function(result) {
			var files = new Array();
			var _g = 0;
			while(_g < result.length) {
				var data = result[_g];
				++_g;
				var info = _g1.newFileInfo(data);
				info.talkId = talk.id;
				files.push(info);
			}
			_g1.sendNotification("get_file_responsed",{ talkId : talk.id, files : files});
		});
	}
	,getAnnouncements: function(range,callback) {
		var _g = this;
		var count = 20;
		var domainId = this.settings.getSelectedDomainId();
		if(domainId == null) {
			if(callback != null) callback();
			return;
		}
		if(range == null) range = { sinceId : null, maxId : null};
		this.rpc.call("get_announcements",[domainId,count,range.sinceId,range.maxId],function(result) {
			var announcements = new Array();
			var _g1 = 0;
			while(_g1 < result.length) {
				var item = result[_g1];
				++_g1;
				announcements.push(new albero.entity.Announcement(item));
			}
			_g.sendNotification("notify_get_announcements",{ domainId : domainId, announcements : announcements});
		});
	}
	,getAnnouncementStatuses: function(domainId,callback) {
		var _g = this;
		this.rpc.call("get_announcement_status",[domainId],function(status) {
			_g.sendNotification("notify_update_announcement_status",_g.newAnnouncementStatus(status));
			if(callback != null) callback();
		});
	}
	,updateAnnouncementReadStatus: function(domainId) {
		var _g = this;
		var status = this.dataStore.getAnnouncementStatus(domainId);
		if(status == null || status.unreadCount == 0) return;
		status.unreadCount = 0;
		status.maxReadAnnouncementId = status.maxAnnouncementId;
		this.dataStore.setAnnouncementStatus(status);
		this.sendNotification("notify_update_announcement_status",status);
		var domainIdStr = "_" + domainId.high + "_" + domainId.low;
		var timer = this.updateReadAnnouncementStatusesTimers.get(domainIdStr);
		if(timer != null) timer.stop();
		timer = haxe.Timer.delay(function() {
			_g.updateReadAnnouncementStatusesTimers.remove(domainIdStr);
			_g.rpc.call("update_announcement_status",[domainId,status.maxAnnouncementId],function(_) {
			});
		},1000);
		this.updateReadAnnouncementStatusesTimers.set(domainIdStr,timer);
	}
	,getQuestions: function(talk,type,range) {
		var _g1 = this;
		var count = 20;
		var domainId = this.settings.getSelectedDomainId();
		var talkId = null;
		if(talk != null) {
			domainId = talk.domainId;
			talkId = talk.id;
		}
		var typeIdx = null;
		if(type != null) typeIdx = albero.entity.Message.enumIndex(type);
		if(range == null) range = { sinceId : null, maxId : null};
		console.log("get_questions_request. domainId:" + Std.string(domainId) + " sinceId:" + Std.string(range.sinceId) + " maxId:" + Std.string(range.maxId));
		this.rpc.call("get_questions",[domainId,talkId,typeIdx,count,range.sinceId,range.maxId],function(result) {
			var questions = new Array();
			var _g = 0;
			while(_g < result.length) {
				var question = result[_g];
				++_g;
				questions.push(_g1.newQuestion(question));
			}
			_g1.sendNotification("get_questions_responsed",{ domainId : domainId, talkId : talkId, questions : questions});
			if(questions.length > 0) console.log("get_questions_response. domainId:" + Std.string(domainId) + " minId:" + Std.string(questions[questions.length - 1].id) + " maxId:" + Std.string(questions[0].id)); else console.log("get_questions_response. domainId:" + Std.string(domainId) + " no more questions.");
		});
	}
	,getQuestion: function(messageId,callback) {
		var _g = this;
		this.rpc.call("get_question",[messageId],function(question) {
			_g.sendNotification("notify_update_question",_g.newQuestion(question));
			if(callback != null) callback();
		});
	}
	,newDomain: function(obj) {
		return this.dataStore.setDomain(new albero.entity.Domain(obj));
	}
	,newDomainInvite: function(obj) {
		return this.dataStore.setDomainInvite(new albero.entity.DomainInvite(obj));
	}
	,newFriend: function(domainId,obj) {
		return this.dataStore.addFriend(domainId,this.newUser(obj));
	}
	,newAcquaintance: function(domainId,obj) {
		return this.dataStore.addAcquaintance(domainId,this.newUser(obj));
	}
	,newUser: function(obj) {
		return this.dataStore.setUser(new albero.entity.User(obj));
	}
	,newTalk: function(obj) {
		return this.dataStore.setTalk(new albero.entity.Talk(obj));
	}
	,newTalkStatus: function(obj) {
		return this.dataStore.setTalkStatus(new albero.entity.TalkStatus(obj));
	}
	,newMessage: function(obj) {
		return new albero.entity.Message(obj);
	}
	,newDummyMessage: function(talkId,type,content) {
		var msg = new albero.entity.Message();
		msg.id = new haxe.Int64(0,0);
		msg.userId = this.dataStore.currentUser.id;
		msg.talkId = talkId;
		msg.type = type;
		msg.content = content;
		return msg;
	}
	,newQuestion: function(obj) {
		return this.dataStore.setQuestion(new albero.entity.Question(obj));
	}
	,newFileInfo: function(obj) {
		return new albero.entity.FileInfo(obj);
	}
	,newAnnouncementStatus: function(obj) {
		return this.dataStore.setAnnouncementStatus(new albero.entity.AnnouncementStatus(obj));
	}
	,__class__: albero.proxy.AlberoServiceProxy
});
albero.proxy._AlberoServiceProxy = {};
albero.proxy._AlberoServiceProxy.UploadUseType = { __ename__ : true, __constructs__ : ["PROFILE_IMAGE","MESSAGE","TALK_ICON"] };
albero.proxy._AlberoServiceProxy.UploadUseType.PROFILE_IMAGE = ["PROFILE_IMAGE",0];
albero.proxy._AlberoServiceProxy.UploadUseType.PROFILE_IMAGE.toString = $estr;
albero.proxy._AlberoServiceProxy.UploadUseType.PROFILE_IMAGE.__enum__ = albero.proxy._AlberoServiceProxy.UploadUseType;
albero.proxy._AlberoServiceProxy.UploadUseType.MESSAGE = ["MESSAGE",1];
albero.proxy._AlberoServiceProxy.UploadUseType.MESSAGE.toString = $estr;
albero.proxy._AlberoServiceProxy.UploadUseType.MESSAGE.__enum__ = albero.proxy._AlberoServiceProxy.UploadUseType;
albero.proxy._AlberoServiceProxy.UploadUseType.TALK_ICON = ["TALK_ICON",2];
albero.proxy._AlberoServiceProxy.UploadUseType.TALK_ICON.toString = $estr;
albero.proxy._AlberoServiceProxy.UploadUseType.TALK_ICON.__enum__ = albero.proxy._AlberoServiceProxy.UploadUseType;
albero.proxy.AppStateProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"appState");
};
$hxClasses["albero.proxy.AppStateProxy"] = albero.proxy.AppStateProxy;
albero.proxy.AppStateProxy.__name__ = ["albero","proxy","AppStateProxy"];
albero.proxy.AppStateProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.AppStateProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	onRegister: function() {
		this.start();
	}
	,start: function() {
		this.updateLastActivityAt();
		this.setupListeners();
		this.checkInactiveInterval();
	}
	,setupListeners: function() {
	}
	,setAppState: function(_appState) {
		var p1 = "APP_STATE_CHANGED: " + Std.string(_appState);
		if(AlberoLog.DEBUG && console != null) console.log(p1,"","","","");
		this.appState = _appState;
		this.sendNotification("app_state_changed",this.appState);
	}
	,updateLastActivityAt: function() {
		this.lastActivityAt = new Date();
	}
	,checkInactiveInterval: function() {
		var _g = this;
		this.checkInactive();
		haxe.Timer.delay(function() {
			_g.checkInactiveInterval();
		},500);
	}
	,checkInactive: function() {
		if(this.appState == albero.AppStates.inactive) return;
		var d = new Date().getTime() - this.lastActivityAt.getTime();
		if(d < 2000) return;
		this.setAppState(albero.AppStates.inactive);
	}
	,__class__: albero.proxy.AppStateProxy
});
albero.proxy.DataStoreProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"dataStore");
	this.clear();
};
$hxClasses["albero.proxy.DataStoreProxy"] = albero.proxy.DataStoreProxy;
albero.proxy.DataStoreProxy.__name__ = ["albero","proxy","DataStoreProxy"];
albero.proxy.DataStoreProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.DataStoreProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	setCurrentUser: function(user) {
		this.currentUser = user;
		this.sendNotification("current_user_changed",user);
	}
	,isCurrentUser: function(userId) {
		return this.currentUser != null && albero.Int64Helper.eq(this.currentUser.id,userId);
	}
	,getFriendsMap: function(domainId) {
		var key = "_" + domainId.high + "_" + domainId.low;
		var friendsInDomain = this.friends.get(key);
		if(friendsInDomain == null) {
			friendsInDomain = new haxe.ds.StringMap();
			this.friends.set(key,friendsInDomain);
		}
		return friendsInDomain;
	}
	,isFriend: function(domainId,userId) {
		return (function($this) {
			var $r;
			var this1 = $this.getFriendsMap(domainId);
			$r = this1.get("_" + userId.high + "_" + userId.low);
			return $r;
		}(this)) == true;
	}
	,isFriendOrAcquaintance: function(domainId,userId) {
		var this1 = this.getFriendsMap(domainId);
		return this1.exists("_" + userId.high + "_" + userId.low);
	}
	,addFriend: function(domainId,user) {
		var this1 = this.getFriendsMap(domainId);
		var key = albero.Int64Helper.idStr(user.id);
		this1.set(key,true);
		return user;
	}
	,addAcquaintance: function(domainId,user) {
		var this1 = this.getFriendsMap(domainId);
		var key = albero.Int64Helper.idStr(user.id);
		this1.set(key,false);
		return user;
	}
	,removeFriend: function(domainId,userId) {
		var this1 = this.getFriendsMap(domainId);
		this1.remove("_" + userId.high + "_" + userId.low);
	}
	,removeAcquaintance: function(domainId,userId) {
		this.removeFriend(domainId,userId);
	}
	,getUser: function(id) {
		if((id.high | id.low) == 0) return null;
		var uid = "_" + id.high + "_" + id.low;
		return this.users.get(uid);
	}
	,setUser: function(user) {
		var key = albero.Int64Helper.idStr(user.id);
		this.users.set(key,user);
		return user;
	}
	,getUsers: function(userIds) {
		var _g = this;
		return userIds.map(function(id) {
			return _g.getUser(id);
		});
	}
	,getTalk: function(id) {
		return this.talks.get("_" + id.high + "_" + id.low);
	}
	,setTalk: function(talk) {
		var key = albero.Int64Helper.idStr(talk.id);
		this.talks.set(key,talk);
		if(talk.leftUsers != null) {
			var _g = 0;
			var _g1 = talk.leftUsers;
			while(_g < _g1.length) {
				var user = _g1[_g];
				++_g;
				var uid = albero.Int64Helper.idStr(user.id);
				if(!this.users.exists(uid)) this.users.set(uid,user);
			}
		}
		return talk;
	}
	,getTalks: function() {
		var result = new Array();
		var $it0 = this.talks.keys();
		while( $it0.hasNext() ) {
			var id = $it0.next();
			result.push(this.talks.get(id));
		}
		return result;
	}
	,removeTalk: function(talkId) {
		this.talks.remove("_" + talkId.high + "_" + talkId.low);
	}
	,getTalkStatuses: function() {
		var result = new Array();
		var $it0 = this.talkStatuses.keys();
		while( $it0.hasNext() ) {
			var id = $it0.next();
			if(this.talks.exists(id)) result.push(this.talkStatuses.get(id));
		}
		return result;
	}
	,getTalkStatus: function(id) {
		return this.talkStatuses.get("_" + id.high + "_" + id.low);
	}
	,setTalkStatus: function(status) {
		var idStr = albero.Int64Helper.idStr(status.id);
		if(this.domainUnreadCounts != null) {
			var talk = this.talks.get(idStr);
			var key = albero.Int64Helper.idStr(talk.domainId);
			this.domainUnreadCounts.remove(key);
		}
		this.talkStatuses.set(idStr,status);
		this.sendNotification("brand_badge_changed");
		return status;
	}
	,removeTalkStatus: function(talkId) {
		this.talkStatuses.remove("_" + talkId.high + "_" + talkId.low);
	}
	,getDomains: function() {
		var result = new Array();
		var $it0 = this.domains.keys();
		while( $it0.hasNext() ) {
			var id = $it0.next();
			result.push(this.domains.get(id));
		}
		return result;
	}
	,setDomain: function(domain) {
		var key = albero.Int64Helper.idStr(domain.id);
		this.domains.set(key,domain);
		return domain;
	}
	,removeDomain: function(domainId) {
		this.domains.remove("_" + domainId.high + "_" + domainId.low);
	}
	,setDomainInvite: function(domainInvite) {
		var key = albero.Int64Helper.idStr(domainInvite.id);
		this.domainInvites.set(key,domainInvite);
		this.sendNotification("brand_badge_changed");
		return domainInvite;
	}
	,removeDomainInvite: function(domainId) {
		this.domainInvites.remove("_" + domainId.high + "_" + domainId.low);
		this.sendNotification("brand_badge_changed");
	}
	,setQuestion: function(question) {
		var key = albero.Int64Helper.idStr(question.id);
		this.questions.set(key,question);
		return question;
	}
	,getAnnouncementStatus: function(domainId) {
		return this.announcementStatuses.get("_" + domainId.high + "_" + domainId.low);
	}
	,setAnnouncementStatus: function(status) {
		var domainIdStr = albero.Int64Helper.idStr(status.domainId);
		this.announcementStatuses.set(domainIdStr,status);
		if(this.domainUnreadCounts != null) this.domainUnreadCounts.remove(domainIdStr);
		this.sendNotification("brand_badge_changed");
		return status;
	}
	,clear: function() {
		this.friends = new haxe.ds.StringMap();
		this.users = new haxe.ds.StringMap();
		this.talks = new haxe.ds.StringMap();
		this.talkStatuses = new haxe.ds.StringMap();
		this.domains = new haxe.ds.StringMap();
		this.domainInvites = new haxe.ds.StringMap();
		this.questions = new haxe.ds.StringMap();
		this.announcementStatuses = new haxe.ds.StringMap();
	}
	,__class__: albero.proxy.DataStoreProxy
});
albero.proxy.FileServiceProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"fileService");
	this.validHost = this.getValidHost();
};
$hxClasses["albero.proxy.FileServiceProxy"] = albero.proxy.FileServiceProxy;
albero.proxy.FileServiceProxy.__name__ = ["albero","proxy","FileServiceProxy"];
albero.proxy.FileServiceProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.FileServiceProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	getValidHost: function() {
		return "https://" + Settings.host;
	}
	,downloadUrl: function(url) {
		if(url == null || url.length == 0) return "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
		if(StringTools.startsWith(url,this.validHost)) {
			var accessToken = this.settings.getAccessToken();
			return url + "?Authorization=ALB%20" + accessToken;
		} else return url;
	}
	,download: function(url,path,callback) {
		var _g = this;
		url = this.downloadUrl(url);
		if(StringTools.startsWith(url,"data:")) {
			callback(null);
			return;
		}
		var req = js.Node.require("https").request(url,function(res) {
			var loc = res.headers.location;
			if(loc != null) {
				console.log("redirect to " + loc);
				_g.download(loc,path,callback);
				return;
			}
			if(Math.floor(res.statusCode / 100) != 2) {
				console.log("Got error: " + res.statusCode);
				callback(null);
				return;
			}
			var out = js.Node.require("fs").createWriteStream(path);
			res.on("data",function(chunk) {
				out.write(chunk);
			});
			res.on("end",function() {
				out.end();
				callback(path);
			});
			res.on("error",function(e) {
				callback(null);
			});
			out.on("error",function(e1) {
				callback(null);
			});
		});
		req.on("error",function(e2) {
			console.log("Got error: " + e2.message);
			callback(null);
		});
		req.end();
	}
	,upload: function(auth,contentType,file,callback) {
		var _g = this;
		var options = js.Node.require("url").parse(auth.put_url);
		options.method = "PUT";
		options.headers = { };
		options.headers["Content-Length"] = file.size;
		options.headers["Content-Type"] = auth.post_form["Content-Type"];
		options.headers["Content-Disposition"] = auth.post_form["Content-Disposition"];
		var req = js.Node.require("https").request(options,function(res) {
			if(Math.floor(res.statusCode / 100) != 2) {
				var data = "";
				res.on("data",function(chunk) {
					data += chunk;
				});
				res.on("end",function() {
					_g.uploadFailed(res.statusCode + ": " + data);
				});
				return;
			}
			callback();
		});
		req.on("error",function(e) {
			_g.uploadFailed(e.message);
		});
		var f = js.Node.require("fs").createReadStream(file.path);
		f.on("data",function(chunk1) {
			req.write(chunk1);
		});
		f.on("end",function() {
			req.end();
		});
		f.on("error",function() {
			req.end();
		});
	}
	,uploadFailed: function(errorMessage) {
		console.log("uploadFailed. " + errorMessage);
		this.sendNotification("error_occurred",{ message : "ファイルの送信に失敗しました。"});
	}
	,createDummyFile: function(filePath) {
		var paths = filePath.split("\\");
		if(paths.length == 0) return null;
		var name = paths[paths.length - 1];
		if(name.length == 0) return null;
		var type = "application/octet-stream";
		var exts = name.split(".");
		if(exts.length > 1) {
			var _g = exts[exts.length - 1];
			switch(_g) {
			case "txt":
				type = "text/plain";
				break;
			case "htm":case "html":
				type = "text/html";
				break;
			case "xml":
				type = "text/xml";
				break;
			case "gif":
				type = "image/gif";
				break;
			case "jpg":case "jpeg":
				type = "image/jpeg";
				break;
			case "png":
				type = "image/png";
				break;
			case "pdf":
				type = "application/pdf";
				break;
			}
		}
		return { name : name, size : 1, type : type};
	}
	,__class__: albero.proxy.FileServiceProxy
});
albero.proxy.FormatterProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"formatter");
	albero.proxy._FormatterProxy.ExternalUserIconListener.formatterProxy = this;
};
$hxClasses["albero.proxy.FormatterProxy"] = albero.proxy.FormatterProxy;
albero.proxy.FormatterProxy.__name__ = ["albero","proxy","FormatterProxy"];
albero.proxy.FormatterProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.FormatterProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	__class__: albero.proxy.FormatterProxy
});
albero.proxy._FormatterProxy = {};
albero.proxy._FormatterProxy.ExternalUserIconListener = $hx_exports.albero.ExternalUserIconListener = function() { };
$hxClasses["albero.proxy._FormatterProxy.ExternalUserIconListener"] = albero.proxy._FormatterProxy.ExternalUserIconListener;
albero.proxy._FormatterProxy.ExternalUserIconListener.__name__ = ["albero","proxy","_FormatterProxy","ExternalUserIconListener"];
albero.proxy.MsgPackRpcProxy = function() {
	this.concurrentAccess = false;
	puremvc.patterns.proxy.Proxy.call(this,"rpc");
	this.responseHandlers = new haxe.ds.IntMap();
	this.errorHandler = $bind(this,this.onServerError);
};
$hxClasses["albero.proxy.MsgPackRpcProxy"] = albero.proxy.MsgPackRpcProxy;
albero.proxy.MsgPackRpcProxy.__name__ = ["albero","proxy","MsgPackRpcProxy"];
albero.proxy.MsgPackRpcProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.MsgPackRpcProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	initWebSocket: function() {
		if(this.ws != null) return;
		this.ws = new albero.js.WebSocket(Settings.endpoint);
		this.ws.onopen = $bind(this,this.onOpen);
		this.ws.onmessage = $bind(this,this.onMessage);
		this.ws.onclose = $bind(this,this.onClose);
	}
	,finishWebSocket: function() {
		if(this.ws == null) return;
		this.ws.onopen = null;
		this.ws.onmessage = null;
		this.ws.onerror = null;
		this.ws.onclose = null;
		this.ws.close();
		this.ws = null;
	}
	,onRegister: function() {
		this.initWebSocket();
		if(this.pingTimer == null) {
			this.pingTimer = new haxe.Timer(45000);
			this.pingTimer.run = $bind(this,this.ping);
		}
	}
	,onOpen: function() {
		this.sendNotification("SignIn");
	}
	,onMessage: function(data) {
		var _g1 = this;
		var data1 = new msgpack.Decoder(data,true).getResult();
		var type;
		type = js.Boot.__cast(data1[0] , Int);
		if(type == 1 && data1.length == 4) {
			var msgId;
			msgId = js.Boot.__cast(data1[1] , Int);
			var error = data1[2];
			var result = data1[3];
			var responseHandler = this.responseHandlers.get(msgId);
			if(responseHandler == null) {
				if(console != null) console.error("No ResponseHandler prepared. msgId:%s error:%s result:",msgId,error,result,"");
				return;
			}
			if(AlberoLog.DEBUG && console != null) console.log("message received. method:",responseHandler.method," data:",data1,"");
			if(error == null) {
				var func = responseHandler.onSuccess;
				if(func != null) func(result);
			} else {
				if(console != null) console.error("Receive Error Response. method:",responseHandler.method," error:",error,"");
				var func1 = responseHandler.onError;
				if(func1 != null) func1(error); else if(this.errorHandler != null) this.errorHandler(responseHandler.method,error);
			}
			this.responseHandlers.remove(msgId);
		} else if(type == 0 && data1.length == 4) {
			var msgId1;
			msgId1 = js.Boot.__cast(data1[1] , Int);
			var method;
			method = js.Boot.__cast(data1[2] , String);
			var params;
			params = js.Boot.__cast(data1[3] , Array);
			var _g = 0;
			while(_g < params.length) {
				var param = params[_g];
				++_g;
				this.broadcast.handleNotification(method,param,function() {
					_g1.ws.send(new msgpack.Encoder([1,msgId1,null,true]).getBytes());
				});
			}
		}
	}
	,onClose: function(code,reason,wasClean) {
		if(console != null) console.info("onClose. code:" + code + ", reason:" + reason + ", wasClean:" + (wasClean == null?"null":"" + wasClean),"","","","");
		if(code != 1001 || !wasClean) {
			if(code == 1000 && reason == "concurrent access") this.concurrentAccess = true;
			this.sendNotification("Url",albero.command.UrlAction.FORWARD(albero.Urls.error));
		}
		this.finishWebSocket();
	}
	,restart: function() {
		var _g = this;
		this.finishWebSocket();
		var $it0 = this.responseHandlers.keys();
		while( $it0.hasNext() ) {
			var k = $it0.next();
			this.responseHandlers.remove(k);
		}
		haxe.Timer.delay(function() {
			_g.initWebSocket();
		},1000);
	}
	,call: function(method,args,onSuccess,onError) {
		if(this.ws == null) {
			if(console != null) console.error("disconnected. data:",this.data,"","","");
			return;
		}
		if(args == null) args = [];
		var msgId = albero.proxy.MsgPackRpcProxy.lastMsgId++;
		var value = new albero.proxy._MsgPackRpcProxy.ResponseHandler(method,onSuccess,onError);
		this.responseHandlers.set(msgId,value);
		var data = [0,msgId,method,args];
		var msgpack1 = new msgpack.Encoder(data).getBytes();
		this.ws.send(msgpack1);
		if(AlberoLog.DEBUG && console != null) console.log("send request. data:",data,"","","");
	}
	,ping: function() {
		if(this.concurrentAccess) return;
		if(this.ws == null || this.ws.isClosed()) this.restart(); else this.ws.send(haxe.io.Bytes.alloc(0));
	}
	,onServerError: function(method,e) {
		this.sendNotification("error_occurred",e);
	}
	,__class__: albero.proxy.MsgPackRpcProxy
});
albero.proxy._MsgPackRpcProxy = {};
albero.proxy._MsgPackRpcProxy.ResponseHandler = function(method,onSuccess,onError) {
	this.method = method;
	this.onSuccess = onSuccess;
	this.onError = onError;
};
$hxClasses["albero.proxy._MsgPackRpcProxy.ResponseHandler"] = albero.proxy._MsgPackRpcProxy.ResponseHandler;
albero.proxy._MsgPackRpcProxy.ResponseHandler.__name__ = ["albero","proxy","_MsgPackRpcProxy","ResponseHandler"];
albero.proxy._MsgPackRpcProxy.ResponseHandler.prototype = {
	__class__: albero.proxy._MsgPackRpcProxy.ResponseHandler
};
albero.proxy.Error = function() { };
$hxClasses["albero.proxy.Error"] = albero.proxy.Error;
albero.proxy.Error.__name__ = ["albero","proxy","Error"];
albero.proxy.RoutingProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"routing");
};
$hxClasses["albero.proxy.RoutingProxy"] = albero.proxy.RoutingProxy;
albero.proxy.RoutingProxy.__name__ = ["albero","proxy","RoutingProxy"];
albero.proxy.RoutingProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.RoutingProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	init: function() {
		if(this.router == null) {
			this.router = new albero.proxy._RoutingProxy.LocalRouter(this,this.settings,this.dataStore);
			this.router.start();
		}
	}
	,forward: function(url) {
		this.init();
		this.router.forward(url);
	}
	,redirect: function(url) {
		this.init();
		this.router.redirect(url);
	}
	,back: function() {
		if(this.router == null) return;
		this.router.back();
	}
	,__class__: albero.proxy.RoutingProxy
});
albero.proxy._RoutingProxy = {};
albero.proxy._RoutingProxy.LocalRouter = function(proxy,settings,dataStore) {
	this.proxy = proxy;
	this.settings = settings;
	this.dataStore = dataStore;
	this.started = false;
};
$hxClasses["albero.proxy._RoutingProxy.LocalRouter"] = albero.proxy._RoutingProxy.LocalRouter;
albero.proxy._RoutingProxy.LocalRouter.__name__ = ["albero","proxy","_RoutingProxy","LocalRouter"];
albero.proxy._RoutingProxy.LocalRouter.prototype = {
	notify: function(url) {
		console.log("Routing to '" + albero.UrlsHelper.toFragment(url) + "'");
		var domainId = albero.UrlsHelper.getDomainId(url);
		this.settings.setSelectedDomainId(domainId);
		this.proxy.sendNotification("current_page_changed",url);
	}
	,start: function() {
		this.started = true;
	}
	,forward: function(url) {
		switch(url[1]) {
		case 0:
			break;
		default:
			this.notify(url);
		}
	}
	,redirect: function(url) {
	}
	,back: function() {
		this.notify(this.prev);
	}
	,__class__: albero.proxy._RoutingProxy.LocalRouter
};
albero.proxy.SettingsProxy = function() {
	this.selectedDomainId = null;
	this.remember = true;
	puremvc.patterns.proxy.Proxy.call(this,"settings");
};
$hxClasses["albero.proxy.SettingsProxy"] = albero.proxy.SettingsProxy;
albero.proxy.SettingsProxy.__name__ = ["albero","proxy","SettingsProxy"];
albero.proxy.SettingsProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.SettingsProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	setAccessToken: function(accessToken) {
		if(!this.remember) return;
		this.accessToken = accessToken;
		this.set("access_token",this.accessToken = accessToken);
		this.sendNotification("access_token_changed",accessToken);
	}
	,getAccessToken: function() {
		if(this.accessToken != null) return this.accessToken;
		return this.accessToken = this.get("access_token");
	}
	,clearAccessToken: function() {
		this.remove("access_token");
		this.accessToken = null;
	}
	,setConfiguration: function(conf) {
		this.configuration = conf;
		this.sendNotification("configuration_changed",conf);
	}
	,setSelectedDomainId: function(domainId) {
		if(albero.Int64Helper.eq(this.selectedDomainId,domainId)) return;
		this.selectedDomainId = domainId;
		this.sendNotification("domain_selection_changed",domainId);
	}
	,getSelectedDomainId: function() {
		return this.selectedDomainId;
	}
	,clearDomainSelection: function() {
		this.selectedDomainId = null;
	}
	,setSelectedTalk: function(talk) {
		if(AlberoLog.DEBUG && console != null) console.log("talk selected. talk:",talk,"","","");
		if(this.selectedTalkIds == null) this.selectedTalkIds = new haxe.ds.StringMap();
		if(talk == null) {
			if(this.selectedDomainId != null) {
				var key = albero.Int64Helper.idStr(this.selectedDomainId);
				this.selectedTalkIds.set(key,null);
			}
			this.sendNotification("talk_selection_changed");
		} else {
			var key1 = albero.Int64Helper.idStr(talk.domainId);
			this.selectedTalkIds.set(key1,talk.id);
			if(albero.Int64Helper.eq(talk.domainId,this.selectedDomainId)) this.sendNotification("talk_selection_changed",talk); else return false;
		}
		return true;
	}
	,set: function(key,val) {
		if(key == "access_token") {
			if(console != null) console.info(val,"","","","");
			js.Node.process.exit(0);
			return;
		}
		if(!js.Node.require("fs").existsSync("settings")) js.Node.require("fs").mkdirSync("settings");
		sys.io.File.saveContent("settings/" + key,val);
	}
	,get: function(key) {
		if(key == "access_token") return Settings.accessToken;
		if(!js.Node.require("fs").existsSync("settings/" + key)) return null;
		return sys.io.File.getContent("settings/" + key);
	}
	,remove: function(key) {
		js.Node.require("fs").unlinkSync("settings/" + key);
	}
	,clearSelectedStampTabId: function() {
	}
	,__class__: albero.proxy.SettingsProxy
});
puremvc.interfaces.IMediator = function() { };
$hxClasses["puremvc.interfaces.IMediator"] = puremvc.interfaces.IMediator;
puremvc.interfaces.IMediator.__name__ = ["puremvc","interfaces","IMediator"];
puremvc.interfaces.IMediator.prototype = {
	__class__: puremvc.interfaces.IMediator
};
puremvc.patterns.mediator = {};
puremvc.patterns.mediator.Mediator = function(mediatorName,viewComponent) {
	puremvc.patterns.observer.Notifier.call(this);
	if(mediatorName != null) this.mediatorName = mediatorName; else this.mediatorName = puremvc.patterns.mediator.Mediator.NAME;
	if(viewComponent != null) this.viewComponent = viewComponent;
};
$hxClasses["puremvc.patterns.mediator.Mediator"] = puremvc.patterns.mediator.Mediator;
puremvc.patterns.mediator.Mediator.__name__ = ["puremvc","patterns","mediator","Mediator"];
puremvc.patterns.mediator.Mediator.__interfaces__ = [puremvc.interfaces.IMediator];
puremvc.patterns.mediator.Mediator.__super__ = puremvc.patterns.observer.Notifier;
puremvc.patterns.mediator.Mediator.prototype = $extend(puremvc.patterns.observer.Notifier.prototype,{
	getMediatorName: function() {
		return this.mediatorName;
	}
	,getViewComponent: function() {
		return this.viewComponent;
	}
	,listNotificationInterests: function() {
		return [];
	}
	,handleNotification: function(notification) {
	}
	,onRegister: function() {
	}
	,__class__: puremvc.patterns.mediator.Mediator
});
var albero_cli = {};
albero_cli.mediator = {};
albero_cli.mediator.CommandLineMediator = function() {
	puremvc.patterns.mediator.Mediator.call(this,"commandline",null);
};
$hxClasses["albero_cli.mediator.CommandLineMediator"] = albero_cli.mediator.CommandLineMediator;
albero_cli.mediator.CommandLineMediator.__name__ = ["albero_cli","mediator","CommandLineMediator"];
albero_cli.mediator.CommandLineMediator.__super__ = puremvc.patterns.mediator.Mediator;
albero_cli.mediator.CommandLineMediator.prototype = $extend(puremvc.patterns.mediator.Mediator.prototype,{
	onRegister: function() {
		var view = this.getViewComponent();
		this.eventEmitter = DirectAPI.getInstance();
		this.dataRecovered = false;
	}
	,listNotificationInterests: function() {
		return ["current_user_changed","notify_add_domain_invite","notify_create_pair_talk","notify_create_group_talk","notify_create_message","data_recovered"];
	}
	,handleNotification: function(note) {
		var _g1 = this;
		var view = this.getViewComponent();
		var _g = note.getName();
		switch(_g) {
		case "current_user_changed":
			var user = note.getBody();
			console.log(user.getName() + " is logined.");
			if(Settings.$name != null && Settings.$name != "" && Settings.$name != "Hubot" && user.displayName != Settings.$name) haxe.Timer.delay(function() {
				_g1.sendNotification("UpdateUser",{ displayName : Settings.$name, phoneticDisplayName : Settings.$name, profileImage : null});
			},500);
			break;
		case "notify_add_domain_invite":
			var invite = note.getBody();
			break;
		case "notify_create_pair_talk":case "notify_create_group_talk":
			if(!this.dataRecovered) return;
			var talk = note.getBody();
			haxe.Timer.delay(function() {
				_g1.emit(talk,"JoinMessage",_g1.dataStore.currentUser);
			},500);
			break;
		case "notify_create_message":
			var msg = note.getBody();
			if(this.dataStore.isCurrentUser(msg.userId)) return;
			var status = this.dataStore.getTalkStatus(msg.talkId);
			if(status != null && status.maxReadMessageId != null && haxe.Int64.compare(status.maxReadMessageId,msg.id) >= 0) return;
			haxe.Timer.delay(function() {
				_g1.sendNotification("Read",albero.command.ReadType.TALK(msg.talkId,msg.id));
				_g1.dispatch(msg);
			},500);
			break;
		case "data_recovered":
			this.dataRecovered = true;
			break;
		}
	}
	,emit: function(talk,type,user,msg) {
		if(type != null && talk != null && user != null) this.eventEmitter.emit(type,{ room : albero.Int64Helper.idStr(talk.id), rooms : this.talksObject()},this.userObject(user),msg);
	}
	,dispatch: function(msg) {
		var _g = this;
		var content = msg.content;
		var talk = this.dataStore.getTalk(msg.talkId);
		var emit = function(type,userId,body) {
			_g.emit(talk,type,_g.dataStore.getUser(userId),{ id : albero.Int64Helper.idStr(msg.id), content : body});
		};
		if(msg.type == albero.entity.MessageType.system) {
			var subtype = content.type;
			if(subtype == "add_talkers") {
				var userIds = content.added_user_ids;
				var _g1 = 0;
				while(_g1 < userIds.length) {
					var uid = userIds[_g1];
					++_g1;
					emit("EnterMessage",uid);
				}
			} else if(subtype == "delete_talker") {
				emit("LeaveMessage",content.deleted_user_id);
				if(content.user_ids.length <= 1) this.sendNotification("Talk",albero.command.TalkAction.DELETE(talk));
			} else if(subtype == "hide_pair_talk") {
				emit("LeaveMessage",content.user_id);
				this.sendNotification("Talk",albero.command.TalkAction.DELETE(talk));
			}
		} else {
			var text = null;
			var _g2 = msg.type;
			switch(_g2[1]) {
			case 1:
				text = content;
				break;
			default:
				var obj;
				obj = JSON.parse(JSON.stringify(msg.content));
				var _g11 = 0;
				var _g21 = Reflect.fields(obj);
				while(_g11 < _g21.length) {
					var fieldName = _g21[_g11];
					++_g11;
					var val = Reflect.field(obj,fieldName);
					if(fieldName == "stamp_index" || fieldName == "in_reply_to") {
						if(Reflect.isObject(obj) && val.high != null && val.low != null) Reflect.setField(obj,fieldName,haxe.Int64.toStr(haxe.Int64.make(val.high,val.low)));
					}
				}
				text = JSON.stringify(obj);
			}
			if(text != null) {
				text = StringTools.replace(text,"　"," ");
				if(talk.type == albero.entity.TalkType.PairTalk) {
					if(!StringTools.startsWith(text,Settings.$name)) text = Settings.$name + " " + text;
				}
				emit("TextMessage",msg.userId,text);
			}
		}
	}
	,userObject: function(user) {
		return { id : albero.Int64Helper.idStr(user.id), name : user.displayName, email : user.email, profile_url : user.profileImageUrl};
	}
	,userObjects: function(userIds) {
		var users = [];
		var _g = 0;
		while(_g < userIds.length) {
			var userId = userIds[_g];
			++_g;
			if(this.dataStore.isCurrentUser(userId)) continue;
			var user = this.dataStore.getUser(userId);
			if(user != null) users.push(this.userObject(user));
		}
		return users;
	}
	,talksObject: function() {
		var talks = { };
		var _g = 0;
		var _g1 = this.dataStore.getTalks();
		while(_g < _g1.length) {
			var talk = _g1[_g];
			++_g;
			var type;
			if(talk.type == albero.entity.TalkType.Unknown) type = 0; else if(talk.type == albero.entity.TalkType.PairTalk) type = 1; else type = 2;
			talks[albero.Int64Helper.idStr(talk.id)] = { id : albero.Int64Helper.idStr(talk.id), name : talk.name, type : type, users : this.userObjects(talk.userIds)};
		}
		return talks;
	}
	,__class__: albero_cli.mediator.CommandLineMediator
});
var haxe = {};
haxe.Int64 = function(high,low) {
	this.high = high | 0;
	this.low = low | 0;
};
$hxClasses["haxe.Int64"] = haxe.Int64;
haxe.Int64.__name__ = ["haxe","Int64"];
haxe.Int64.make = function(high,low) {
	return new haxe.Int64(high,low);
};
haxe.Int64.getLow = function(x) {
	return x.low;
};
haxe.Int64.getHigh = function(x) {
	return x.high;
};
haxe.Int64.add = function(a,b) {
	var high = a.high + b.high | 0;
	var low = a.low + b.low | 0;
	if(haxe.Int64.uicompare(low,a.low) < 0) high++;
	return new haxe.Int64(high,low);
};
haxe.Int64.sub = function(a,b) {
	var high = a.high - b.high | 0;
	var low = a.low - b.low | 0;
	if(haxe.Int64.uicompare(a.low,b.low) < 0) high--;
	return new haxe.Int64(high,low);
};
haxe.Int64.mul = function(a,b) {
	var mask = 65535;
	var al = a.low & mask;
	var ah = a.low >>> 16;
	var bl = b.low & mask;
	var bh = b.low >>> 16;
	var p00 = al * bl;
	var p10 = ah * bl;
	var p01 = al * bh;
	var p11 = ah * bh;
	var low = p00;
	var high = p11 + (p01 >>> 16) + (p10 >>> 16) | 0;
	p01 = p01 << 16 | 0;
	low = low + p01 | 0;
	if(haxe.Int64.uicompare(low,p01) < 0) high = high + 1 | 0;
	p10 = p10 << 16 | 0;
	low = low + p10 | 0;
	if(haxe.Int64.uicompare(low,p10) < 0) high = high + 1 | 0;
	high = high + (function($this) {
		var $r;
		var a1 = a.low;
		var b1 = b.high;
		$r = (a1 * (b1 >>> 16) << 16 | 0) + a1 * (b1 & 65535) | 0;
		return $r;
	}(this)) | 0;
	high = high + (function($this) {
		var $r;
		var a2 = a.high;
		var b2 = b.low;
		$r = (a2 * (b2 >>> 16) << 16 | 0) + a2 * (b2 & 65535) | 0;
		return $r;
	}(this)) | 0;
	return new haxe.Int64(high,low);
};
haxe.Int64.divMod = function(modulus,divisor) {
	var quotient = new haxe.Int64(0,0);
	var mask_high = 0;
	var mask_low = 1;
	divisor = new haxe.Int64(divisor.high,divisor.low);
	while(divisor.high >= 0) {
		var cmp = haxe.Int64.ucompare(divisor,modulus);
		divisor.high = divisor.high << 1 | 0 | divisor.low >>> 31 | 0;
		divisor.low = divisor.low << 1 | 0;
		mask_high = mask_high << 1 | 0 | mask_low >>> 31 | 0;
		mask_low = mask_low << 1 | 0;
		if(cmp >= 0) break;
	}
	while((mask_low | mask_high | 0) != 0) {
		if(haxe.Int64.ucompare(modulus,divisor) >= 0) {
			quotient.high = quotient.high | mask_high | 0;
			quotient.low = quotient.low | mask_low | 0;
			modulus = haxe.Int64.sub(modulus,divisor);
		}
		mask_low = mask_low >>> 1 | (mask_high << 31 | 0) | 0;
		mask_high = mask_high >>> 1;
		divisor.low = divisor.low >>> 1 | (divisor.high << 31 | 0) | 0;
		divisor.high = divisor.high >>> 1;
	}
	return { quotient : quotient, modulus : modulus};
};
haxe.Int64.neg = function(a) {
	var high = ~a.high | 0;
	var low = -a.low | 0;
	if(low == 0) high++;
	return new haxe.Int64(high,low);
};
haxe.Int64.uicompare = function(a,b) {
	if(a < 0) {
		if(b < 0) return ~b - ~a | 0; else return 1;
	} else if(b < 0) return -1; else return a - b | 0;
};
haxe.Int64.compare = function(a,b) {
	var v = a.high - b.high | 0;
	if(v != 0) return v; else return haxe.Int64.uicompare(a.low,b.low);
};
haxe.Int64.ucompare = function(a,b) {
	var v = haxe.Int64.uicompare(a.high,b.high);
	if(v != 0) return v; else return haxe.Int64.uicompare(a.low,b.low);
};
haxe.Int64.toStr = function(a) {
	return a.toString();
};
haxe.Int64.prototype = {
	toString: function() {
		if((this.high | this.low) == 0) return "0";
		var str = "";
		var neg = false;
		var i = this;
		if(i.high < 0) {
			neg = true;
			i = haxe.Int64.neg(i);
		}
		var ten = new haxe.Int64(0,10);
		while(!((i.high | i.low) == 0)) {
			var r = haxe.Int64.divMod(i,ten);
			str = r.modulus.low + str;
			i = r.quotient;
		}
		if(neg) str = "-" + str;
		return str;
	}
	,__class__: haxe.Int64
};
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
$hxClasses["haxe.Timer"] = haxe.Timer;
haxe.Timer.__name__ = ["haxe","Timer"];
haxe.Timer.delay = function(f,time_ms) {
	var t = new haxe.Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
};
haxe.Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
	,__class__: haxe.Timer
};
haxe.ds = {};
haxe.ds.IntMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.IntMap"] = haxe.ds.IntMap;
haxe.ds.IntMap.__name__ = ["haxe","ds","IntMap"];
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	set: function(key,value) {
		this.h[key] = value;
	}
	,get: function(key) {
		return this.h[key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty(key);
	}
	,remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe.ds.IntMap
};
haxe.ds.ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
$hxClasses["haxe.ds.ObjectMap"] = haxe.ds.ObjectMap;
haxe.ds.ObjectMap.__name__ = ["haxe","ds","ObjectMap"];
haxe.ds.ObjectMap.__interfaces__ = [IMap];
haxe.ds.ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe.ds.ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,get: function(key) {
		return this.h[key.__id__];
	}
	,exists: function(key) {
		return this.h.__keys__[key.__id__] != null;
	}
	,remove: function(key) {
		var id = key.__id__;
		if(this.h.__keys__[id] == null) return false;
		delete(this.h[id]);
		delete(this.h.__keys__[id]);
		return true;
	}
	,__class__: haxe.ds.ObjectMap
};
haxe.ds.StringMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.StringMap"] = haxe.ds.StringMap;
haxe.ds.StringMap.__name__ = ["haxe","ds","StringMap"];
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		key = "$" + key;
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,__class__: haxe.ds.StringMap
};
haxe.io = {};
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
$hxClasses["haxe.io.Bytes"] = haxe.io.Bytes;
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.alloc = function(length) {
	return new haxe.io.Bytes(length,new Buffer(length));
};
haxe.io.Bytes.ofString = function(s) {
	var nb = new Buffer(s,"utf8");
	return new haxe.io.Bytes(nb.length,nb);
};
haxe.io.Bytes.ofData = function(b) {
	return new haxe.io.Bytes(b.length,b);
};
haxe.io.Bytes.prototype = {
	readString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				s += fcc((c & 15) << 18 | (c21 & 127) << 12 | c3 << 6 & 127 | b[i++] & 127);
			}
		}
		return s;
	}
	,toString: function() {
		return this.readString(0,this.length);
	}
	,__class__: haxe.io.Bytes
};
haxe.io.BytesBuffer = function() {
	this.b = new Array();
};
$hxClasses["haxe.io.BytesBuffer"] = haxe.io.BytesBuffer;
haxe.io.BytesBuffer.__name__ = ["haxe","io","BytesBuffer"];
haxe.io.BytesBuffer.prototype = {
	addBytes: function(src,pos,len) {
		if(pos < 0 || len < 0 || pos + len > src.length) throw haxe.io.Error.OutsideBounds;
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,getBytes: function() {
		var nb = new Buffer(this.b);
		var bytes = new haxe.io.Bytes(nb.length,nb);
		this.b = null;
		return bytes;
	}
	,__class__: haxe.io.BytesBuffer
};
haxe.io.Input = function() { };
$hxClasses["haxe.io.Input"] = haxe.io.Input;
haxe.io.Input.__name__ = ["haxe","io","Input"];
haxe.io.Input.prototype = {
	readByte: function() {
		throw "Not implemented";
	}
	,readBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) throw haxe.io.Error.OutsideBounds;
		while(k > 0) {
			b[pos] = this.readByte();
			pos++;
			k--;
		}
		return len;
	}
	,set_bigEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,read: function(nbytes) {
		var s = haxe.io.Bytes.alloc(nbytes);
		var p = 0;
		while(nbytes > 0) {
			var k = this.readBytes(s,p,nbytes);
			if(k == 0) throw haxe.io.Error.Blocked;
			p += k;
			nbytes -= k;
		}
		return s;
	}
	,readFloat: function() {
		var bytes = [];
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		if(!this.bigEndian) bytes.reverse();
		var sign = 1 - (bytes[0] >> 7 << 1);
		var exp = (bytes[0] << 1 & 255 | bytes[1] >> 7) - 127;
		var sig = (bytes[1] & 127) << 16 | bytes[2] << 8 | bytes[3];
		if(sig == 0 && exp == -127) return 0.0;
		return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp);
	}
	,readDouble: function() {
		var bytes = [];
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		if(!this.bigEndian) bytes.reverse();
		var sign = 1 - (bytes[0] >> 7 << 1);
		var exp = (bytes[0] << 4 & 2047 | bytes[1] >> 4) - 1023;
		var sig = this.getDoubleSig(bytes);
		if(sig == 0 && exp == -1023) return 0.0;
		return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
	}
	,readInt8: function() {
		var n = this.readByte();
		if(n >= 128) return n - 256;
		return n;
	}
	,readInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var n;
		if(this.bigEndian) n = ch2 | ch1 << 8; else n = ch1 | ch2 << 8;
		if((n & 32768) != 0) return n - 65536;
		return n;
	}
	,readUInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		if(this.bigEndian) return ch2 | ch1 << 8; else return ch1 | ch2 << 8;
	}
	,readInt32: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		if(this.bigEndian) return ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24; else return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
	}
	,getDoubleSig: function(bytes) {
		return ((bytes[1] & 15) << 16 | bytes[2] << 8 | bytes[3]) * 4294967296. + (bytes[4] >> 7) * 2147483648 + ((bytes[4] & 127) << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7]);
	}
	,__class__: haxe.io.Input
};
haxe.io.BytesInput = function(b,pos,len) {
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe.io.Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
	this.totlen = len;
};
$hxClasses["haxe.io.BytesInput"] = haxe.io.BytesInput;
haxe.io.BytesInput.__name__ = ["haxe","io","BytesInput"];
haxe.io.BytesInput.__super__ = haxe.io.Input;
haxe.io.BytesInput.prototype = $extend(haxe.io.Input.prototype,{
	readByte: function() {
		if(this.len == 0) throw new haxe.io.Eof();
		this.len--;
		return this.b[this.pos++];
	}
	,readBytes: function(buf,pos,len) {
		if(pos < 0 || len < 0 || pos + len > buf.length) throw haxe.io.Error.OutsideBounds;
		if(this.len == 0 && len > 0) throw new haxe.io.Eof();
		if(this.len < len) len = this.len;
		var b1 = this.b;
		var b2 = buf.b;
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b2[pos + i] = b1[this.pos + i];
		}
		this.pos += len;
		this.len -= len;
		return len;
	}
	,__class__: haxe.io.BytesInput
});
haxe.io.Output = function() { };
$hxClasses["haxe.io.Output"] = haxe.io.Output;
haxe.io.Output.__name__ = ["haxe","io","Output"];
haxe.io.Output.prototype = {
	writeByte: function(c) {
		throw "Not implemented";
	}
	,writeBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) throw haxe.io.Error.OutsideBounds;
		while(k > 0) {
			this.writeByte(b[pos]);
			pos++;
			k--;
		}
		return len;
	}
	,set_bigEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,write: function(s) {
		var l = s.length;
		var p = 0;
		while(l > 0) {
			var k = this.writeBytes(s,p,l);
			if(k == 0) throw haxe.io.Error.Blocked;
			p += k;
			l -= k;
		}
	}
	,writeFloat: function(x) {
		if(x == 0.0) {
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			return;
		}
		var exp = Math.floor(Math.log(Math.abs(x)) / haxe.io.Output.LN2);
		var sig = Math.floor(Math.abs(x) / Math.pow(2,exp) * 8388608) & 8388607;
		var b4;
		b4 = exp + 127 >> 1 | (exp > 0?x < 0?128:64:x < 0?128:0);
		var b3 = exp + 127 << 7 & 255 | sig >> 16 & 127;
		var b2 = sig >> 8 & 255;
		var b1 = sig & 255;
		if(this.bigEndian) {
			this.writeByte(b4);
			this.writeByte(b3);
			this.writeByte(b2);
			this.writeByte(b1);
		} else {
			this.writeByte(b1);
			this.writeByte(b2);
			this.writeByte(b3);
			this.writeByte(b4);
		}
	}
	,writeDouble: function(x) {
		if(x == 0.0) {
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			return;
		}
		var exp = Math.floor(Math.log(Math.abs(x)) / haxe.io.Output.LN2);
		var sig = Math.floor(Math.abs(x) / Math.pow(2,exp) * Math.pow(2,52));
		var sig_h = sig & 34359738367;
		var sig_l = Math.floor(sig / Math.pow(2,32));
		var b8;
		b8 = exp + 1023 >> 4 | (exp > 0?x < 0?128:64:x < 0?128:0);
		var b7 = exp + 1023 << 4 & 255 | sig_l >> 16 & 15;
		var b6 = sig_l >> 8 & 255;
		var b5 = sig_l & 255;
		var b4 = sig_h >> 24 & 255;
		var b3 = sig_h >> 16 & 255;
		var b2 = sig_h >> 8 & 255;
		var b1 = sig_h & 255;
		if(this.bigEndian) {
			this.writeByte(b8);
			this.writeByte(b7);
			this.writeByte(b6);
			this.writeByte(b5);
			this.writeByte(b4);
			this.writeByte(b3);
			this.writeByte(b2);
			this.writeByte(b1);
		} else {
			this.writeByte(b1);
			this.writeByte(b2);
			this.writeByte(b3);
			this.writeByte(b4);
			this.writeByte(b5);
			this.writeByte(b6);
			this.writeByte(b7);
			this.writeByte(b8);
		}
	}
	,writeInt8: function(x) {
		if(x < -128 || x >= 128) throw haxe.io.Error.Overflow;
		this.writeByte(x & 255);
	}
	,writeInt16: function(x) {
		if(x < -32768 || x >= 32768) throw haxe.io.Error.Overflow;
		this.writeUInt16(x & 65535);
	}
	,writeUInt16: function(x) {
		if(x < 0 || x >= 65536) throw haxe.io.Error.Overflow;
		if(this.bigEndian) {
			this.writeByte(x >> 8);
			this.writeByte(x & 255);
		} else {
			this.writeByte(x & 255);
			this.writeByte(x >> 8);
		}
	}
	,writeInt32: function(x) {
		if(this.bigEndian) {
			this.writeByte(x >>> 24);
			this.writeByte(x >> 16 & 255);
			this.writeByte(x >> 8 & 255);
			this.writeByte(x & 255);
		} else {
			this.writeByte(x & 255);
			this.writeByte(x >> 8 & 255);
			this.writeByte(x >> 16 & 255);
			this.writeByte(x >>> 24);
		}
	}
	,__class__: haxe.io.Output
};
haxe.io.BytesOutput = function() {
	this.b = new haxe.io.BytesBuffer();
};
$hxClasses["haxe.io.BytesOutput"] = haxe.io.BytesOutput;
haxe.io.BytesOutput.__name__ = ["haxe","io","BytesOutput"];
haxe.io.BytesOutput.__super__ = haxe.io.Output;
haxe.io.BytesOutput.prototype = $extend(haxe.io.Output.prototype,{
	writeByte: function(c) {
		this.b.b.push(c);
	}
	,writeBytes: function(buf,pos,len) {
		this.b.addBytes(buf,pos,len);
		return len;
	}
	,getBytes: function() {
		return this.b.getBytes();
	}
	,__class__: haxe.io.BytesOutput
});
haxe.io.Eof = function() {
};
$hxClasses["haxe.io.Eof"] = haxe.io.Eof;
haxe.io.Eof.__name__ = ["haxe","io","Eof"];
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
};
haxe.io.Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; };
haxe.rtti = {};
haxe.rtti.Meta = function() { };
$hxClasses["haxe.rtti.Meta"] = haxe.rtti.Meta;
haxe.rtti.Meta.__name__ = ["haxe","rtti","Meta"];
haxe.rtti.Meta.getFields = function(t) {
	var meta = t.__meta__;
	if(meta == null || meta.fields == null) return { }; else return meta.fields;
};
var js = {};
js.Boot = function() { };
$hxClasses["js.Boot"] = js.Boot;
js.Boot.__name__ = ["js","Boot"];
js.Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
};
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js.Boot.__interfLoop(js.Boot.getClass(o),cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
};
js.Node = function() { };
$hxClasses["js.Node"] = js.Node;
js.Node.__name__ = ["js","Node"];
var msgpack = {};
msgpack.Decoder = function(b,obj) {
	var i = new haxe.io.BytesInput(b);
	i.set_bigEndian(true);
	this.o = this.decode(i,obj);
};
$hxClasses["msgpack.Decoder"] = msgpack.Decoder;
msgpack.Decoder.__name__ = ["msgpack","Decoder"];
msgpack.Decoder.prototype = {
	decode: function(i,obj) {
		try {
			var b = i.readByte();
			switch(b) {
			case 192:
				return null;
			case 194:
				return false;
			case 195:
				return true;
			case 202:
				return i.readFloat();
			case 203:
				return i.readDouble();
			case 204:
				return i.readByte();
			case 205:
				return i.readUInt16();
			case 206:
				return i.readInt32();
			case 207:
				return haxe.Int64.make(i.readInt32(),i.readInt32());
			case 208:
				return i.readInt8();
			case 209:
				return i.readInt16();
			case 210:
				return i.readInt32();
			case 211:
				return haxe.Int64.make(i.readInt32(),i.readInt32());
			case 218:case 219:
				return i.read(b == 218?i.readUInt16():i.readInt32()).toString();
			case 220:case 221:
				return this.readArray(i,b == 220?i.readUInt16():i.readInt32(),obj);
			case 222:case 223:
				return this.readMap(i,b == 222?i.readUInt16():i.readInt32(),obj);
			default:
				if(b < 128) return b; else if(b < 144) return this.readMap(i,15 & b,obj); else if(b < 160) return this.readArray(i,15 & b,obj); else if(b < 192) return i.read(31 & b).toString(); else if(b > 223) return -256 | b;
			}
		} catch( e ) {
			if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
			} else throw(e);
		}
		return null;
	}
	,readArray: function(i,length,obj) {
		var a = [];
		var _g = 0;
		while(_g < length) {
			var x = _g++;
			a.push(this.decode(i,obj));
		}
		return a;
	}
	,readMap: function(i,length,obj) {
		if(!obj) {
			var h = new haxe.ds.ObjectMap();
			var _g = 0;
			while(_g < length) {
				var x = _g++;
				var k = this.decode(i,obj);
				var v = this.decode(i,obj);
				h.set(k,v);
			}
			return h;
		} else {
			var o = { };
			var _g1 = 0;
			while(_g1 < length) {
				var x1 = _g1++;
				var k1 = this.decode(i,obj);
				var v1 = this.decode(i,obj);
				o[k1] = v1;
			}
			return o;
		}
	}
	,getResult: function() {
		return this.o;
	}
	,__class__: msgpack.Decoder
};
msgpack.Encoder = function(d) {
	this.o = new haxe.io.BytesOutput();
	this.o.set_bigEndian(true);
	this.encode(d);
};
$hxClasses["msgpack.Encoder"] = msgpack.Encoder;
msgpack.Encoder.__name__ = ["msgpack","Encoder"];
msgpack.Encoder.prototype = {
	encode: function(d) {
		{
			var _g = Type["typeof"](d);
			switch(_g[1]) {
			case 0:
				this.o.writeByte(192);
				break;
			case 3:
				this.o.writeByte(d?195:194);
				break;
			case 1:
				this.writeInt(d);
				break;
			case 2:
				this.writeFloat(d);
				break;
			case 6:
				var c = _g[2];
				var _g1 = Type.getClassName(c);
				switch(_g1) {
				case "String":
					this.writeRaw(haxe.io.Bytes.ofString(d));
					break;
				case "Array":
					this.writeArray(d);
					break;
				case "Hash":
					this.writeHashMap(d);
					break;
				case "haxe.Int64":
					this.writeInt64(d);
					break;
				}
				break;
			case 4:
				this.writeObjectMap(d);
				break;
			case 7:
				throw "Error: Enum not supported";
				break;
			case 5:
				throw "Error: Function not supported";
				break;
			case 8:
				throw "Error: Unknown Data Type";
				break;
			}
		}
	}
	,writeInt: function(d) {
		if(d < -32) {
			if(d < -32768) {
				this.o.writeByte(210);
				this.o.writeInt32(d);
			} else if(d < -128) {
				this.o.writeByte(209);
				this.o.writeInt16(d);
			} else {
				this.o.writeByte(208);
				this.o.writeInt8(d);
			}
		} else if(d < 128) this.o.writeByte(d & 255); else if(d < 256) {
			this.o.writeByte(204);
			this.o.writeByte(d);
		} else if(d < 65536) {
			this.o.writeByte(205);
			this.o.writeUInt16(d);
		} else {
			this.o.writeByte(206);
			this.o.writeInt32(d);
		}
	}
	,writeInt64: function(d) {
		this.o.writeByte(d.high < 0?211:207);
		this.o.writeInt32(haxe.Int64.getHigh(d));
		this.o.writeInt32(haxe.Int64.getLow(d));
	}
	,writeFloat: function(d) {
		var a = Math.abs(d);
		if(a > 1.40129846432481707e-45 && a < 3.40282346638528860e+38) {
			this.o.writeByte(202);
			this.o.writeFloat(d);
		} else {
			this.o.writeByte(203);
			this.o.writeDouble(d);
		}
	}
	,writeRaw: function(b) {
		var length = b.length;
		if(length < 32) this.o.writeByte(160 | length); else if(length < 65536) {
			this.o.writeByte(218);
			this.o.writeUInt16(length);
		} else {
			this.o.writeByte(219);
			this.o.writeInt32(length);
		}
		this.o.write(b);
	}
	,writeArray: function(d) {
		var length = d.length;
		if(length < 16) this.o.writeByte(144 | length); else if(length < 65536) {
			this.o.writeByte(220);
			this.o.writeUInt16(length);
		} else {
			this.o.writeByte(221);
			this.o.writeInt32(length);
		}
		var _g = 0;
		while(_g < d.length) {
			var e = d[_g];
			++_g;
			this.encode(e);
		}
	}
	,writeMapLength: function(length) {
		if(length < 16) this.o.writeByte(128 | length); else if(length < 65536) {
			this.o.writeByte(222);
			this.o.writeUInt16(length);
		} else {
			this.o.writeByte(223);
			this.o.writeInt32(length);
		}
	}
	,writeHashMap: function(d) {
		this.writeMapLength(Lambda.count(d));
		var $it0 = d.keys();
		while( $it0.hasNext() ) {
			var k = $it0.next();
			this.writeRaw(haxe.io.Bytes.ofString(k));
			this.encode(d.get(k));
		}
	}
	,writeObjectMap: function(d) {
		var f = Reflect.fields(d);
		this.writeMapLength(Lambda.count(f));
		var _g = 0;
		while(_g < f.length) {
			var k = f[_g];
			++_g;
			this.writeRaw(haxe.io.Bytes.ofString(k));
			this.encode(Reflect.field(d,k));
		}
	}
	,getBytes: function() {
		return this.o.getBytes();
	}
	,__class__: msgpack.Encoder
};
puremvc.interfaces.IController = function() { };
$hxClasses["puremvc.interfaces.IController"] = puremvc.interfaces.IController;
puremvc.interfaces.IController.__name__ = ["puremvc","interfaces","IController"];
puremvc.interfaces.IController.prototype = {
	__class__: puremvc.interfaces.IController
};
puremvc.core = {};
puremvc.core.Controller = function() {
	puremvc.core.Controller.instance = this;
	this.commandMap = new haxe.ds.StringMap();
	this.initializeController();
};
$hxClasses["puremvc.core.Controller"] = puremvc.core.Controller;
puremvc.core.Controller.__name__ = ["puremvc","core","Controller"];
puremvc.core.Controller.__interfaces__ = [puremvc.interfaces.IController];
puremvc.core.Controller.getInstance = function() {
	if(puremvc.core.Controller.instance == null) puremvc.core.Controller.instance = new puremvc.core.Controller();
	return puremvc.core.Controller.instance;
};
puremvc.core.Controller.prototype = {
	initializeController: function() {
		this.view = puremvc.core.View.getInstance();
	}
	,executeCommand: function(note) {
		var commandClassRef = this.commandMap.get(note.getName());
		if(commandClassRef == null) return;
		var commandInstance = Type.createInstance(commandClassRef,[]);
		commandInstance.execute(note);
	}
	,registerCommand: function(notificationName,commandClassRef) {
		if(!this.commandMap.exists(notificationName)) this.view.registerObserver(notificationName,new puremvc.patterns.observer.Observer($bind(this,this.executeCommand),this));
		this.commandMap.set(notificationName,commandClassRef);
	}
	,__class__: puremvc.core.Controller
};
puremvc.interfaces.IModel = function() { };
$hxClasses["puremvc.interfaces.IModel"] = puremvc.interfaces.IModel;
puremvc.interfaces.IModel.__name__ = ["puremvc","interfaces","IModel"];
puremvc.interfaces.IModel.prototype = {
	__class__: puremvc.interfaces.IModel
};
puremvc.core.Model = function() {
	puremvc.core.Model.instance = this;
	this.proxyMap = new haxe.ds.StringMap();
	this.initializeModel();
};
$hxClasses["puremvc.core.Model"] = puremvc.core.Model;
puremvc.core.Model.__name__ = ["puremvc","core","Model"];
puremvc.core.Model.__interfaces__ = [puremvc.interfaces.IModel];
puremvc.core.Model.getInstance = function() {
	if(puremvc.core.Model.instance == null) puremvc.core.Model.instance = new puremvc.core.Model();
	return puremvc.core.Model.instance;
};
puremvc.core.Model.prototype = {
	initializeModel: function() {
	}
	,registerProxy: function(proxy) {
		this.proxyMap.set(proxy.getProxyName(),proxy);
		proxy.onRegister();
	}
	,retrieveProxy: function(proxyName) {
		return this.proxyMap.get(proxyName);
	}
	,__class__: puremvc.core.Model
};
puremvc.interfaces.IView = function() { };
$hxClasses["puremvc.interfaces.IView"] = puremvc.interfaces.IView;
puremvc.interfaces.IView.__name__ = ["puremvc","interfaces","IView"];
puremvc.interfaces.IView.prototype = {
	__class__: puremvc.interfaces.IView
};
puremvc.core.View = function() {
	puremvc.core.View.instance = this;
	this.mediatorMap = new haxe.ds.StringMap();
	this.observerMap = new haxe.ds.StringMap();
	this.initializeView();
};
$hxClasses["puremvc.core.View"] = puremvc.core.View;
puremvc.core.View.__name__ = ["puremvc","core","View"];
puremvc.core.View.__interfaces__ = [puremvc.interfaces.IView];
puremvc.core.View.getInstance = function() {
	if(puremvc.core.View.instance == null) puremvc.core.View.instance = new puremvc.core.View();
	return puremvc.core.View.instance;
};
puremvc.core.View.prototype = {
	initializeView: function() {
	}
	,registerObserver: function(notificationName,observer) {
		if(!this.observerMap.exists(notificationName)) this.observerMap.set(notificationName,new List());
		this.observerMap.get(notificationName).add(observer);
	}
	,notifyObservers: function(notification) {
		if(this.observerMap.exists(notification.getName())) {
			var observers_ref = this.observerMap.get(notification.getName());
			var observers = new List();
			var iterator_ref = observers_ref.iterator();
			while( iterator_ref.hasNext() ) {
				var observer = iterator_ref.next();
				observers.add(observer);
			}
			var iterator = observers.iterator();
			while( iterator.hasNext() ) {
				var observer1 = iterator.next();
				observer1.notifyObserver(notification);
			}
		}
	}
	,registerMediator: function(mediator) {
		if(this.mediatorMap.exists(mediator.getMediatorName())) return;
		this.mediatorMap.set(mediator.getMediatorName(),mediator);
		var interests = mediator.listNotificationInterests();
		if(interests.length > 0) {
			var observer = new puremvc.patterns.observer.Observer($bind(mediator,mediator.handleNotification),mediator);
			var _g1 = 0;
			var _g = interests.length;
			while(_g1 < _g) {
				var i = _g1++;
				this.registerObserver(interests[i],observer);
			}
		}
		mediator.onRegister();
	}
	,__class__: puremvc.core.View
};
puremvc.interfaces.INotification = function() { };
$hxClasses["puremvc.interfaces.INotification"] = puremvc.interfaces.INotification;
puremvc.interfaces.INotification.__name__ = ["puremvc","interfaces","INotification"];
puremvc.interfaces.INotification.prototype = {
	__class__: puremvc.interfaces.INotification
};
puremvc.interfaces.IObserver = function() { };
$hxClasses["puremvc.interfaces.IObserver"] = puremvc.interfaces.IObserver;
puremvc.interfaces.IObserver.__name__ = ["puremvc","interfaces","IObserver"];
puremvc.interfaces.IObserver.prototype = {
	__class__: puremvc.interfaces.IObserver
};
puremvc.patterns.observer.Notification = function(name,body,type) {
	this.name = name;
	if(body != null) this.body = body;
	if(type != null) this.type = type;
};
$hxClasses["puremvc.patterns.observer.Notification"] = puremvc.patterns.observer.Notification;
puremvc.patterns.observer.Notification.__name__ = ["puremvc","patterns","observer","Notification"];
puremvc.patterns.observer.Notification.__interfaces__ = [puremvc.interfaces.INotification];
puremvc.patterns.observer.Notification.prototype = {
	getName: function() {
		return this.name;
	}
	,getBody: function() {
		return this.body;
	}
	,__class__: puremvc.patterns.observer.Notification
};
puremvc.patterns.observer.Observer = function(notifyMethod,notifyContext) {
	this.setNotifyMethod(notifyMethod);
	this.setNotifyContext(notifyContext);
};
$hxClasses["puremvc.patterns.observer.Observer"] = puremvc.patterns.observer.Observer;
puremvc.patterns.observer.Observer.__name__ = ["puremvc","patterns","observer","Observer"];
puremvc.patterns.observer.Observer.__interfaces__ = [puremvc.interfaces.IObserver];
puremvc.patterns.observer.Observer.prototype = {
	setNotifyMethod: function(notifyMethod) {
		this.notify = notifyMethod;
	}
	,setNotifyContext: function(notifyContext) {
		this.context = notifyContext;
	}
	,getNotifyMethod: function() {
		return this.notify;
	}
	,notifyObserver: function(notification) {
		(this.getNotifyMethod())(notification);
	}
	,__class__: puremvc.patterns.observer.Observer
};
var sys = {};
sys.io = {};
sys.io.File = function() { };
$hxClasses["sys.io.File"] = sys.io.File;
sys.io.File.__name__ = ["sys","io","File"];
sys.io.File.getContent = function(path) {
	return js.Node.require("fs").readFileSync(path,sys.io.File.UTF8_ENCODING);
};
sys.io.File.saveContent = function(path,content) {
	js.Node.require("fs").writeFileSync(path,content);
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
var Settings = { };
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
$hxClasses.Math = Math;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.prototype.__class__ = $hxClasses.String = String;
String.__name__ = ["String"];
$hxClasses.Array = Array;
Array.__name__ = ["Array"];
Date.prototype.__class__ = $hxClasses.Date = Date;
Date.__name__ = ["Date"];
var Int = $hxClasses.Int = { __name__ : ["Int"]};
var Dynamic = $hxClasses.Dynamic = { __name__ : ["Dynamic"]};
var Float = $hxClasses.Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = $hxClasses.Class = { __name__ : ["Class"]};
var Enum = { };
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
js.Node.setTimeout = setTimeout;
js.Node.clearTimeout = clearTimeout;
js.Node.setInterval = setInterval;
js.Node.clearInterval = clearInterval;
js.Node.global = global;
js.Node.process = process;
js.Node.require = require;
js.Node.console = console;
js.Node.module = module;
js.Node.stringify = JSON.stringify;
js.Node.parse = JSON.parse;
var version = HxOverrides.substr(js.Node.process.version,1,null).split(".").map(Std.parseInt);
if(version[0] > 0 || version[1] >= 9) {
	js.Node.setImmediate = setImmediate;
	js.Node.clearImmediate = clearImmediate;
}
var WebSocketServer = js.Node.require("websocket").server;
albero.command.DomainCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.FileCommand.__meta__ = { fields : { api : { inject : null}, dataStore : { inject : null}, fileService : { inject : null}}};
albero.command.ManageFriendsCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.ReadCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.ReloadDataCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.SelectTalkCommand.__meta__ = { fields : { settings : { inject : null}}};
albero.command.SendCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.SignInCommand.__meta__ = { fields : { api : { inject : null}, settings : { inject : null}, accountLoader : { inject : null}}};
albero.command.SignOutCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.TalkCommand.__meta__ = { fields : { api : { inject : null}, dataStore : { inject : null}}};
albero.command.UpdateUserCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.UrlCommand.__meta__ = { fields : { routing : { inject : null}}};
AlberoLog.DEBUG = true;
puremvc.patterns.proxy.Proxy.NAME = "Proxy";
albero.proxy.AlberoBroadcastProxy.__meta__ = { fields : { dataStore : { inject : null}, settings : { inject : null}}};
albero.proxy.AlberoBroadcastProxy.NAME = "broadcast";
albero.proxy.AlberoServiceProxy.__meta__ = { fields : { rpc : { inject : null}, settings : { inject : null}, dataStore : { inject : null}, fileService : { inject : null}}};
albero.proxy.AlberoServiceProxy.NAME = "api";
albero.proxy.AppStateProxy.NAME = "appState";
albero.proxy.DataStoreProxy.NAME = "dataStore";
albero.proxy.FileServiceProxy.__meta__ = { fields : { settings : { inject : null}}};
albero.proxy.FileServiceProxy.NAME = "fileService";
albero.proxy.FormatterProxy.NAME = "formatter";
albero.proxy.MsgPackRpcProxy.__meta__ = { fields : { broadcast : { inject : null}}};
albero.proxy.MsgPackRpcProxy.NAME = "rpc";
albero.proxy.MsgPackRpcProxy.lastMsgId = 0;
albero.proxy.RoutingProxy.__meta__ = { fields : { settings : { inject : null}, dataStore : { inject : null}}};
albero.proxy.RoutingProxy.NAME = "routing";
albero.proxy.SettingsProxy.NAME = "settings";
puremvc.patterns.mediator.Mediator.NAME = "Mediator";
albero_cli.mediator.CommandLineMediator.__meta__ = { fields : { dataStore : { inject : null}}};
albero_cli.mediator.CommandLineMediator.NAME = "commandline";
haxe.ds.ObjectMap.count = 0;
haxe.io.Output.LN2 = Math.log(2);
sys.io.File.UTF8_ENCODING = { encoding : "utf8"};
DirectAPI.main();
})(typeof window != "undefined" ? window : exports);

//# sourceMappingURL=direct-api.debug.js.map