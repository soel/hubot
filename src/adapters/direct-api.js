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
			Settings.accessToken = options.access_token;
			Settings.proxyURL = options.proxyURL;
			Settings.account = options.account;
		} else if(console != null) console.error(AlberoLog.dateStr(),"Not enough parameters provided. I need a access token","","","","");
	}
	,announce: function(envelope,content) {
		var domainId;
		var roomId = envelope.room;
		if(roomId != null) {
			var talkId = albero.Int64Helper.idStrToInt64(roomId);
			if(talkId == null || content == null) return;
			var talk = this.data.getTalk(talkId);
			if(talk == null) return;
			domainId = talk.domainId;
		} else domainId = albero.Int64Helper.idStrToInt64(envelope.id);
		if(domainId == null) return;
		var settings;
		settings = js.Boot.__cast(this.facade.retrieveProxy("settings") , albero.proxy.SettingsProxy);
		settings.setSelectedDomainId(domainId);
		this.sendQueue.sendMessage(null,content);
	}
	,send: function(envelope,content) {
		var roomId = envelope.room;
		var talkId = albero.Int64Helper.idStrToInt64(roomId);
		if(talkId == null || content == null) return;
		this.sendQueue.sendMessage(talkId,content);
	}
	,topic: function(envelope,topic) {
		var roomId = envelope.room;
		var talkId = albero.Int64Helper.idStrToInt64(roomId);
		this.facade.sendNotification("Talk",albero.command.TalkAction.UPDATE(talkId,null,topic));
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
			_g.facade.sendNotification("Talk",albero.command.TalkAction.DELETE(talkId));
		},500);
	}
	,userForId: function(id) {
		return this.hubotObject.userObjectByIdStr(null,id);
	}
	,userObjects: function() {
		return this.hubotObject.userObjects(null);
	}
	,talkObjects: function() {
		return this.hubotObject.talkObjects();
	}
	,domainObjects: function() {
		return this.hubotObject.domainObjects();
	}
	,listen: function() {
		this.facade = albero.AppFacade.getInstance();
		this.api = js.Boot.__cast(this.facade.retrieveProxy("api") , albero.proxy.AlberoServiceProxy);
		this.data = js.Boot.__cast(this.facade.retrieveProxy("dataStore") , albero.proxy.DataStoreProxy);
		this.hubotObject = js.Boot.__cast(this.facade.retrieveProxy("hubotObject") , albero_cli.proxy.HubotObjectProxy);
		this.sendQueue = js.Boot.__cast(this.facade.retrieveProxy("sendQueue") , albero_cli.proxy.SendQueueProxy);
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
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,__class__: EReg
};
var HxOverrides = function() { };
$hxClasses["HxOverrides"] = HxOverrides;
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
};
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
	,isEmpty: function() {
		return this.h == null;
	}
	,remove: function(v) {
		var prev = null;
		var l = this.h;
		while(l != null) {
			if(l[0] == v) {
				if(prev == null) this.h = l[1]; else prev[1] = l[1];
				if(this.q == l) this.q = prev;
				this.length--;
				return true;
			}
			prev = l;
			l = l[1];
		}
		return false;
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
Math.__name__ = ["Math"];
var ObjectHelper = function() { };
$hxClasses["ObjectHelper"] = ObjectHelper;
ObjectHelper.__name__ = ["ObjectHelper"];
ObjectHelper.deepCopy = function(obj) {
	return haxe.Json.parse(JSON.stringify(obj,null,null));
};
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
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && v.__enum__ == null || t == "function" && (v.__name__ || v.__ename__) != null;
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) return false;
	delete(o[field]);
	return true;
};
var Std = function() { };
$hxClasses["Std"] = Std;
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.parseFloat = function(x) {
	return parseFloat(x);
};
var StringBuf = function() {
	this.b = "";
};
$hxClasses["StringBuf"] = StringBuf;
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	__class__: StringBuf
};
var StringTools = function() { };
$hxClasses["StringTools"] = StringTools;
StringTools.__name__ = ["StringTools"];
StringTools.urlEncode = function(s) {
	return encodeURIComponent(s);
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
var TextHelper = function() { };
$hxClasses["TextHelper"] = TextHelper;
TextHelper.__name__ = ["TextHelper"];
TextHelper.slice = function(text,len) {
	var result = new Array();
	var addResult = function(str) {
		while(str.length > len) {
			result.push(HxOverrides.substr(str,0,len));
			str = HxOverrides.substr(str,len,null);
		}
		if(str.length > 0) result.push(str);
	};
	var str1 = "";
	var texts = text.split("\n");
	while(texts.length > 0) {
		var t = texts.shift();
		if(str1.length + t.length > len) {
			addResult(str1);
			str1 = "";
		}
		if(str1.length > 0) str1 += "\n";
		str1 += t;
	}
	addResult(str1);
	return result;
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
Type.enumEq = function(a,b) {
	if(a == b) return true;
	try {
		if(a[0] != b[0]) return false;
		var _g1 = 2;
		var _g = a.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(!Type.enumEq(a[i],b[i])) return false;
		}
		var e = a.__enum__;
		if(e != b.__enum__ || e == null) return false;
	} catch( e1 ) {
		return false;
	}
	return true;
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
	,removeCommand: function(notificationName) {
		this.controller.removeCommand(notificationName);
	}
	,hasCommand: function(notificationName) {
		return this.controller.hasCommand(notificationName);
	}
	,registerProxy: function(proxy) {
		this.model.registerProxy(proxy);
	}
	,retrieveProxy: function(proxyName) {
		return this.model.retrieveProxy(proxyName);
	}
	,removeProxy: function(proxyName) {
		var proxy = null;
		if(this.model != null) proxy = this.model.removeProxy(proxyName);
		return proxy;
	}
	,hasProxy: function(proxyName) {
		return this.model.hasProxy(proxyName);
	}
	,registerMediator: function(mediator) {
		if(this.view != null) this.view.registerMediator(mediator);
	}
	,retrieveMediator: function(mediatorName) {
		return this.view.retrieveMediator(mediatorName);
	}
	,removeMediator: function(mediatorName) {
		var mediator = null;
		if(this.view != null) mediator = this.view.removeMediator(mediatorName);
		return mediator;
	}
	,hasMediator: function(mediatorName) {
		return this.view.hasMediator(mediatorName);
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
		var proxies = [new albero_cli.proxy.HubotObjectProxy(),new albero_cli.proxy.SendQueueProxy(),new albero_cli.proxy.MessageEventProxy(),new albero.proxy.AppStateProxy(),new albero.proxy.DataStoreProxy(),new albero.proxy.SettingsProxy(),new albero.proxy.MsgPackRpcProxy(),new albero.proxy.AlberoBroadcastProxy(),new albero.proxy.AlberoServiceProxy(),new albero.proxy.FileServiceProxy(),new albero.proxy.FormatterProxy(),new albero.proxy.RoutingProxy()];
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
		var commands = [albero.command.DomainCommand,albero.command.SignInCommand,albero.command.SignOutCommand,albero.command.ReloadDataCommand,albero.command.SendCommand,albero.command.TalkCommand,albero.command.ManageFriendsCommand,albero.command.ReadCommand,albero.command.LoadStampSetCommand,albero.command.FileCommand,albero.command.SelectTalkCommand,albero.command.UpdateUserCommand,albero.command.UpdateProfileCommand,albero.command.UrlCommand];
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
				if(proxy == null) null; else target[fieldName] = proxy;
			}
		}
	}
	,startup: function() {
		(js.Boot.__cast(this.retrieveProxy("appState") , albero.proxy.AppStateProxy)).start();
	}
	,__class__: albero.AppFacade
});
albero.AppState = { __ename__ : true, __constructs__ : ["Active","Inactive"] };
albero.AppState.Active = ["Active",0];
albero.AppState.Active.toString = $estr;
albero.AppState.Active.__enum__ = albero.AppState;
albero.AppState.Inactive = ["Inactive",1];
albero.AppState.Inactive.toString = $estr;
albero.AppState.Inactive.__enum__ = albero.AppState;
albero.ConnectionStatus = { __ename__ : true, __constructs__ : ["Ok","Error","ConcurrentAccessError","ForcibliyClosedError"] };
albero.ConnectionStatus.Ok = ["Ok",0];
albero.ConnectionStatus.Ok.toString = $estr;
albero.ConnectionStatus.Ok.__enum__ = albero.ConnectionStatus;
albero.ConnectionStatus.Error = ["Error",1];
albero.ConnectionStatus.Error.toString = $estr;
albero.ConnectionStatus.Error.__enum__ = albero.ConnectionStatus;
albero.ConnectionStatus.ConcurrentAccessError = ["ConcurrentAccessError",2];
albero.ConnectionStatus.ConcurrentAccessError.toString = $estr;
albero.ConnectionStatus.ConcurrentAccessError.__enum__ = albero.ConnectionStatus;
albero.ConnectionStatus.ForcibliyClosedError = ["ForcibliyClosedError",3];
albero.ConnectionStatus.ForcibliyClosedError.toString = $estr;
albero.ConnectionStatus.ForcibliyClosedError.__enum__ = albero.ConnectionStatus;
albero.History = function() { };
$hxClasses["albero.History"] = albero.History;
albero.History.__name__ = ["albero","History"];
albero.History.replaceState = function(state,title,url) {
	if(window.history != null) {
		window.history.replaceState(state,title,url);
		return true;
	}
	return false;
};
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
albero.Int64Helper.getHigh = function(id) {
	return id.high;
};
albero.Int64Helper.getLow = function(id) {
	return id.low;
};
albero.Int64Helper.idStr = function(id) {
	return "_" + id.high + "_" + id.low;
};
albero.Int64Helper.makeFromIdStr = function(idStr) {
	var r = new EReg("^_(-?\\d*)_(-?\\d*)$","");
	if(!r.match(idStr)) return null;
	return haxe.Int64.make(Std.parseInt(r.matched(1)),Std.parseInt(r.matched(2)));
};
albero.Int64Helper.eq = function(a,b) {
	return a != null && b != null && a.high == b.high && a.low == b.low;
};
albero.Int64Helper.toFloat = function(x) {
	var base = 4294967296.0;
	var high = x.high;
	var low = x.low;
	return high * base + (low >= 0?low:low + base);
};
albero.Int64Helper.idStrToInt64 = function(str) {
	var vals = str.split("_");
	if(vals.length > 2) return haxe.Int64.make(Std.parseInt(vals[1]),Std.parseInt(vals[2])); else return null;
};
albero.Int64Helper.decrement = function(a) {
	if(a == null) return null;
	return haxe.Int64.sub(a,new haxe.Int64(0,1));
};
albero.Int64Helper.contains = function(array,x) {
	if(array == null) return false;
	var _g = 0;
	while(_g < array.length) {
		var item = array[_g];
		++_g;
		if(item != null && x != null && item.high == x.high && item.low == x.low) return true;
	}
	return false;
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
albero.Urls.settings = function(domainId) { var $x = ["settings",7,domainId]; $x.__enum__ = albero.Urls; $x.toString = $estr; return $x; };
albero.Urls.announcements = ["announcements",8];
albero.Urls.announcements.toString = $estr;
albero.Urls.announcements.__enum__ = albero.Urls;
albero.Urls.error = ["error",9];
albero.Urls.error.toString = $estr;
albero.Urls.error.__enum__ = albero.Urls;
albero.Urls.loading = ["loading",10];
albero.Urls.loading.toString = $estr;
albero.Urls.loading.__enum__ = albero.Urls;
puremvc.interfaces.INotifier = function() { };
$hxClasses["puremvc.interfaces.INotifier"] = puremvc.interfaces.INotifier;
puremvc.interfaces.INotifier.__name__ = ["puremvc","interfaces","INotifier"];
puremvc.interfaces.INotifier.prototype = {
	__class__: puremvc.interfaces.INotifier
};
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
			this.api.deleteAttachment(info.id,info.messageId);
			break;
		case 2:
			var key = body[6];
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
			this.api.upload(talk1.domainId,talk1.id,info1,key);
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
albero.command.FileAction.UPLOAD_PATH = function(talkId,path,name,type,key) { var $x = ["UPLOAD_PATH",2,talkId,path,name,type,key]; $x.__enum__ = albero.command.FileAction; $x.toString = $estr; return $x; };
albero.command.FileAction.DOWNLOAD_PATH = function(url,path,callback) { var $x = ["DOWNLOAD_PATH",3,url,path,callback]; $x.__enum__ = albero.command.FileAction; $x.toString = $estr; return $x; };
albero.command.LoadStampSetCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.LoadStampSetCommand"] = albero.command.LoadStampSetCommand;
albero.command.LoadStampSetCommand.__name__ = ["albero","command","LoadStampSetCommand"];
albero.command.LoadStampSetCommand.__super__ = albero.command.AutoBindCommand;
albero.command.LoadStampSetCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var stamps = new Array();
	}
	,__class__: albero.command.LoadStampSetCommand
});
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
			this.api.getAllUsers(marker);
			break;
		case 5:
			var userIds = dataType[3];
			var domainId = dataType[2];
			this.api.getUsers(domainId,userIds);
			break;
		case 6:
			var userId = dataType[3];
			var domainId1 = dataType[2];
			this.api.getProfile(domainId1,userId);
			break;
		case 7:
			var marker1 = dataType[3];
			var query = dataType[2];
			this.api.searchDomainUsers(query,marker1);
			break;
		case 8:
			var range1 = dataType[2];
			this.api.getAnnouncements(range1);
			break;
		case 9:
			var range2 = dataType[5];
			var questionFilter = dataType[4];
			var fromType = dataType[3];
			var talk1 = dataType[2];
			this.api.getQuestions(talk1,fromType,questionFilter,range2);
			break;
		case 10:
			var callback = dataType[3];
			var msgId = dataType[2];
			this.api.getQuestion(msgId,callback);
			break;
		case 11:
			var range3 = dataType[3];
			var talk2 = dataType[2];
			this.api.getAttachments(talk2,range3);
			break;
		}
	}
	,__class__: albero.command.ReloadDataCommand
});
albero.command.ReloadDataType = { __ename__ : true, __constructs__ : ["Domains","Friends","Talks","Messages","AllUsers","GetUsers","GetProfile","SearchDomainUsers","Announcements","Questions","Question","Files"] };
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
albero.command.ReloadDataType.AllUsers = function(marker) { var $x = ["AllUsers",4,marker]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.GetUsers = function(domainId,userIds) { var $x = ["GetUsers",5,domainId,userIds]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.GetProfile = function(domainId,userId) { var $x = ["GetProfile",6,domainId,userId]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.SearchDomainUsers = function(query,marker) { var $x = ["SearchDomainUsers",7,query,marker]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.Announcements = function(range) { var $x = ["Announcements",8,range]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.Questions = function(talk,fromType,questionFilter,range) { var $x = ["Questions",9,talk,fromType,questionFilter,range]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.Question = function(msgId,callback) { var $x = ["Question",10,msgId,callback]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
albero.command.ReloadDataType.Files = function(talk,range) { var $x = ["Files",11,talk,range]; $x.__enum__ = albero.command.ReloadDataType; $x.toString = $estr; return $x; };
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
		var key;
		if(body.id != null) key = albero.Int64Helper.idStr(body.id); else key = null;
		if(body.talkId != null) this.api.createMessage(body.talkId,body.type,body.content,key); else this.api.createAnnouncement(body.type,body.content,key);
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
		this.settings.clearInputTextForAll();
		if(console != null) console.error(AlberoLog.dateStr(),"signout","","","","");
		js.Node.process.exit(1);
		return;
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
			var userIds = action[2];
			this.api.createTalk(userIds);
			break;
		case 1:
			var userIds1 = action[3];
			var talk = action[2];
			this.api.addTalkers(talk,userIds1);
			break;
		case 2:
			var talk1 = action[3];
			var talkId = action[2];
			if(talk1 == null) talk1 = this.dataStore.getTalk(talkId);
			this.api.deleteTalker(talk1,this.dataStore.me.id);
			break;
		case 3:
			var iconUrl = action[6];
			var iconFile = action[5];
			var name = action[4];
			var talk2 = action[3];
			var talkId1 = action[2];
			if(talk2 == null) talk2 = this.dataStore.getTalk(talkId1);
			this.api.updateGroupTalk(talk2,name,iconFile,iconUrl);
			break;
		}
	}
	,__class__: albero.command.TalkCommand
});
albero.command.TalkAction = { __ename__ : true, __constructs__ : ["NEW","ADD","DELETE","UPDATE"] };
albero.command.TalkAction.NEW = function(userIds) { var $x = ["NEW",0,userIds]; $x.__enum__ = albero.command.TalkAction; $x.toString = $estr; return $x; };
albero.command.TalkAction.ADD = function(talk,userIds) { var $x = ["ADD",1,talk,userIds]; $x.__enum__ = albero.command.TalkAction; $x.toString = $estr; return $x; };
albero.command.TalkAction.DELETE = function(talkId,talk) { var $x = ["DELETE",2,talkId,talk]; $x.__enum__ = albero.command.TalkAction; $x.toString = $estr; return $x; };
albero.command.TalkAction.UPDATE = function(talkId,talk,name,iconFile,iconUrl) { var $x = ["UPDATE",3,talkId,talk,name,iconFile,iconUrl]; $x.__enum__ = albero.command.TalkAction; $x.toString = $estr; return $x; };
albero.command.UpdateProfileCommand = function() {
	albero.command.AutoBindCommand.call(this);
};
$hxClasses["albero.command.UpdateProfileCommand"] = albero.command.UpdateProfileCommand;
albero.command.UpdateProfileCommand.__name__ = ["albero","command","UpdateProfileCommand"];
albero.command.UpdateProfileCommand.__super__ = albero.command.AutoBindCommand;
albero.command.UpdateProfileCommand.prototype = $extend(albero.command.AutoBindCommand.prototype,{
	execute: function(notification) {
		var domainId = notification.getBody().domainId;
		var profileItemValues = notification.getBody().profileItemValues;
		var copyToAllDomains = notification.getBody().copyToAllDomains;
		var domain = this.dataStore.getDomain(domainId);
		if(domain == null || domain.profileDefinition.itemDefinitions == null) return;
		var profileItemValueList = new Array();
		if(!copyToAllDomains) {
			var modifiableProfileItemValues = new Array();
			var iterator = HxOverrides.iter(profileItemValues);
			var _g = 0;
			while(_g < profileItemValues.length) {
				var itemValue = profileItemValues[_g];
				++_g;
				var def = albero.entity.ProfileItemDefinition.findById(domain.profileDefinition.itemDefinitions,itemValue.profileItemId);
				if(def != null && def.visible && !def.locked) modifiableProfileItemValues.push(itemValue);
			}
			if(modifiableProfileItemValues.length > 0) profileItemValueList.push({ domainId : domain.id, profileItemValues : modifiableProfileItemValues});
		} else {
			var modifiedNameValues = new Array();
			var _g1 = 0;
			while(_g1 < profileItemValues.length) {
				var itemValue1 = profileItemValues[_g1];
				++_g1;
				var def1 = albero.entity.ProfileItemDefinition.findById(domain.profileDefinition.itemDefinitions,itemValue1.profileItemId);
				if(def1 != null) modifiedNameValues.push({ name : def1.name, value : itemValue1.value});
			}
			var _g2 = 0;
			var _g11 = this.dataStore.getDomains();
			while(_g2 < _g11.length) {
				var domain1 = _g11[_g2];
				++_g2;
				if(domain1.frozen) continue;
				var modifiedItemValues = new Array();
				var _g21 = 0;
				var _g3 = domain1.profileDefinition.itemDefinitions;
				while(_g21 < _g3.length) {
					var def2 = _g3[_g21];
					++_g21;
					if(!def2.visible) continue;
					if(def2.locked) continue;
					var _g4 = 0;
					while(_g4 < modifiedNameValues.length) {
						var modifiedNameValue = modifiedNameValues[_g4];
						++_g4;
						if(modifiedNameValue.name == def2.name) {
							var itemValue2 = new albero.entity.ProfileItemValue();
							itemValue2.profileItemId = def2.profileItemId;
							itemValue2.value = modifiedNameValue.value;
							modifiedItemValues.push(itemValue2);
							break;
						}
					}
				}
				if(modifiedItemValues.length > 0) profileItemValueList.push({ domainId : domain1.id, profileItemValues : modifiedItemValues});
			}
		}
		if(profileItemValueList.length == 0) this.sendNotification("update_profile_responsed",this.dataStore.me); else this.api.updateProfile(profileItemValueList);
	}
	,__class__: albero.command.UpdateProfileCommand
});
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
	this.role = new albero.entity.DomainRole(props.role);
	this.frozen = props.frozen;
	this.updatedAt = props.updated_at;
	this.plan = new albero.entity.Plan(props.plan);
	this.closed = false;
	this.profileDefinition = new albero.entity.ProfileDefinition(props.profile_definition);
};
$hxClasses["albero.entity.Domain"] = albero.entity.Domain;
albero.entity.Domain.__name__ = ["albero","entity","Domain"];
albero.entity.Domain.prototype = {
	__class__: albero.entity.Domain
};
albero.entity.DomainRole = function(props) {
	if(props == null) return;
	this.type = this.typeOf(props.type);
	this.allowReadAnnouncements = props.allow_read_announcements;
	if(this.allowReadAnnouncements == null) this.allowReadAnnouncements = true;
	this.allowListUsers = props.allow_list_users;
	if(this.allowListUsers == null) this.allowListUsers = true;
};
$hxClasses["albero.entity.DomainRole"] = albero.entity.DomainRole;
albero.entity.DomainRole.__name__ = ["albero","entity","DomainRole"];
albero.entity.DomainRole.prototype = {
	typeOf: function(type) {
		switch(type) {
		case 10:
			return albero.entity.DomainRoleType.owner;
		case 20:
			return albero.entity.DomainRoleType.manager;
		case 30:
			return albero.entity.DomainRoleType.user;
		default:
			return albero.entity.DomainRoleType.guest;
		}
	}
	,__class__: albero.entity.DomainRole
};
albero.entity.DomainRoleType = { __ename__ : true, __constructs__ : ["owner","manager","user","guest"] };
albero.entity.DomainRoleType.owner = ["owner",0];
albero.entity.DomainRoleType.owner.toString = $estr;
albero.entity.DomainRoleType.owner.__enum__ = albero.entity.DomainRoleType;
albero.entity.DomainRoleType.manager = ["manager",1];
albero.entity.DomainRoleType.manager.toString = $estr;
albero.entity.DomainRoleType.manager.__enum__ = albero.entity.DomainRoleType;
albero.entity.DomainRoleType.user = ["user",2];
albero.entity.DomainRoleType.user.toString = $estr;
albero.entity.DomainRoleType.user.__enum__ = albero.entity.DomainRoleType;
albero.entity.DomainRoleType.guest = ["guest",3];
albero.entity.DomainRoleType.guest.toString = $estr;
albero.entity.DomainRoleType.guest.__enum__ = albero.entity.DomainRoleType;
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
albero.entity.User = function(props) {
	if(props == null) return;
	this.id = props.user_id;
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
	__class__: albero.entity.User
};
albero.entity.DomainUser = function(props) {
	albero.entity.User.call(this,props);
	if(props == null) return;
	this.domainId = props.domain_id;
	if(props.profile_contact != null) {
		this.profileContact = new Array();
		var _g = 0;
		var _g1;
		_g1 = js.Boot.__cast(props.profile_contact , Array);
		while(_g < _g1.length) {
			var itemValue = _g1[_g];
			++_g;
			this.profileContact.push(new albero.entity.ProfileItemValue(itemValue));
		}
	}
};
$hxClasses["albero.entity.DomainUser"] = albero.entity.DomainUser;
albero.entity.DomainUser.__name__ = ["albero","entity","DomainUser"];
albero.entity.DomainUser.__super__ = albero.entity.User;
albero.entity.DomainUser.prototype = $extend(albero.entity.User.prototype,{
	match: function(canonicalizedQuery,domain) {
		if(canonicalizedQuery == null || canonicalizedQuery.length == 0) return true;
		if(this.canonicalDisplayName == null || this.canonicalDisplayName.length == 0) {
			this.canonicalDisplayName = albero.js.TextCanonicalizer.canonicalize(this.displayName);
			null;
		}
		if(this.canonicalDisplayName.indexOf(canonicalizedQuery) > -1) return true;
		if(this.canonicalPhoneticDisplayName != null && this.canonicalPhoneticDisplayName.indexOf(canonicalizedQuery) > -1) return true;
		if(this.profileContact != null && domain.profileDefinition.itemDefinitions != null) {
			var _g = 0;
			var _g1 = this.profileContact;
			while(_g < _g1.length) {
				var itemValue = _g1[_g];
				++_g;
				var _g2 = 0;
				var _g3 = domain.profileDefinition.itemDefinitions;
				while(_g2 < _g3.length) {
					var itemDef = _g3[_g2];
					++_g2;
					if(itemDef.profileItemId == itemValue.profileItemId) {
						if(itemDef.visible && itemDef.group == 10 && itemValue.canonicalValue.indexOf(canonicalizedQuery) > -1) return true;
						break;
					}
				}
			}
		}
		return false;
	}
	,__class__: albero.entity.DomainUser
});
albero.entity.FileInfo = function(props) {
	if(props == null) return;
	this.messageId = props.message_id;
	this.talkId = props.talk_id;
	this.id = props.file_id;
	this.userId = props.user_id;
	this.name = props.name;
	this.contentType = props.content_type;
	this.contentSize = props.content_size;
	this.url = props.url;
	this.thumbUrl = props.thumbnail_url;
	this.updatedAt = props.updated_at;
	this.file = props.file;
	this.thumbFile = props.thumbnail_file;
};
$hxClasses["albero.entity.FileInfo"] = albero.entity.FileInfo;
albero.entity.FileInfo.__name__ = ["albero","entity","FileInfo"];
albero.entity.FileInfo.prototype = {
	__class__: albero.entity.FileInfo
};
albero.entity.FileInfoDeletion = function(props) {
	if(props == null) return;
	this.messageId = props[0];
	this.talkId = props[1];
	this.fileId = props[2];
};
$hxClasses["albero.entity.FileInfoDeletion"] = albero.entity.FileInfoDeletion;
albero.entity.FileInfoDeletion.__name__ = ["albero","entity","FileInfoDeletion"];
albero.entity.FileInfoDeletion.prototype = {
	__class__: albero.entity.FileInfoDeletion
};
albero.entity.Me = function(props) {
	albero.entity.User.call(this,props);
	if(props == null) return;
	this.email = props.email;
	if(props.profiles != null) {
		this.profiles = new Array();
		var _g = 0;
		var _g1;
		_g1 = js.Boot.__cast(props.profiles , Array);
		while(_g < _g1.length) {
			var profile = _g1[_g];
			++_g;
			this.profiles.push(new albero.entity.Profile(profile));
		}
	}
};
$hxClasses["albero.entity.Me"] = albero.entity.Me;
albero.entity.Me.__name__ = ["albero","entity","Me"];
albero.entity.Me.__super__ = albero.entity.User;
albero.entity.Me.prototype = $extend(albero.entity.User.prototype,{
	toDomainUser: function(domainId) {
		var user = new albero.entity.DomainUser();
		user.id = this.id;
		user.domainId = domainId;
		user.displayName = this.displayName;
		user.canonicalDisplayName = this.canonicalDisplayName;
		user.phoneticDisplayName = this.phoneticDisplayName;
		user.canonicalPhoneticDisplayName = this.canonicalPhoneticDisplayName;
		user.profileImageUrl = this.profileImageUrl;
		user.updatedAt = this.updatedAt;
		user.email = this.email;
		var _g = 0;
		var _g1 = this.profiles;
		while(_g < _g1.length) {
			var profile = _g1[_g];
			++_g;
			if(albero.Int64Helper.eq(profile.domainId,domainId)) {
				user.profileContact = profile.itemValues;
				break;
			}
		}
		return user;
	}
	,__class__: albero.entity.Me
});
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
	case 506:
		return albero.entity.MessageType.yesOrNoClosed;
	case 507:
		return albero.entity.MessageType.selectOneClosed;
	case 508:
		return albero.entity.MessageType.todoClosed;
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
	case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:case 13:
		return 500 + type[1] - 5;
	case 14:case 15:
		return 600 + type[1] - 14;
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
albero.entity.MessageType = { __ename__ : true, __constructs__ : ["system","text","stamp","geo","file","yesOrNo","yesOrNoReply","selectOne","selectOneReply","todo","todoDone","yesOrNoClosed","selectOneClosed","todoClosed","phoneCall","phoneReceive","unknown"] };
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
albero.entity.MessageType.yesOrNoClosed = ["yesOrNoClosed",11];
albero.entity.MessageType.yesOrNoClosed.toString = $estr;
albero.entity.MessageType.yesOrNoClosed.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.selectOneClosed = ["selectOneClosed",12];
albero.entity.MessageType.selectOneClosed.toString = $estr;
albero.entity.MessageType.selectOneClosed.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.todoClosed = ["todoClosed",13];
albero.entity.MessageType.todoClosed.toString = $estr;
albero.entity.MessageType.todoClosed.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.phoneCall = ["phoneCall",14];
albero.entity.MessageType.phoneCall.toString = $estr;
albero.entity.MessageType.phoneCall.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.phoneReceive = ["phoneReceive",15];
albero.entity.MessageType.phoneReceive.toString = $estr;
albero.entity.MessageType.phoneReceive.__enum__ = albero.entity.MessageType;
albero.entity.MessageType.unknown = ["unknown",16];
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
albero.entity.Profile = function(props) {
	if(props == null) return;
	this.domainId = props.domain_id;
	this.userId = props.user_id;
	if(props.item_values != null) {
		this.itemValues = new Array();
		var _g = 0;
		var _g1;
		_g1 = js.Boot.__cast(props.item_values , Array);
		while(_g < _g1.length) {
			var itemValue = _g1[_g];
			++_g;
			this.itemValues.push(new albero.entity.ProfileItemValue(itemValue));
		}
	}
};
$hxClasses["albero.entity.Profile"] = albero.entity.Profile;
albero.entity.Profile.__name__ = ["albero","entity","Profile"];
albero.entity.Profile.prototype = {
	__class__: albero.entity.Profile
};
albero.entity.ProfileDefinition = function(props) {
	if(props == null) return;
	this.domainId = props.domain_id;
	if(props.item_definitions != null) {
		this.itemDefinitions = new Array();
		var _g = 0;
		var _g1;
		_g1 = js.Boot.__cast(props.item_definitions , Array);
		while(_g < _g1.length) {
			var itemDef = _g1[_g];
			++_g;
			this.itemDefinitions.push(new albero.entity.ProfileItemDefinition(itemDef));
		}
	}
};
$hxClasses["albero.entity.ProfileDefinition"] = albero.entity.ProfileDefinition;
albero.entity.ProfileDefinition.__name__ = ["albero","entity","ProfileDefinition"];
albero.entity.ProfileDefinition.isSameProfileItemDefinitions = function(source,target) {
	if(target.length != source.length) return false;
	var _g1 = 0;
	var _g = target.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(target[i].profileItemId != source[i].profileItemId) return false;
	}
	return true;
};
albero.entity.ProfileDefinition.prototype = {
	getVisibleItemDefinition: function(includeDetails) {
		if(includeDetails == null) includeDetails = false;
		var result = new Array();
		if(this.itemDefinitions != null) {
			var _g = 0;
			var _g1 = this.itemDefinitions;
			while(_g < _g1.length) {
				var def = _g1[_g];
				++_g;
				if(!def.visible) continue;
				if(!includeDetails && def.group != 10) continue;
				result.push(def);
			}
		}
		return result;
	}
	,__class__: albero.entity.ProfileDefinition
};
albero.entity.ProfileItemDefinition = function(props) {
	this.locked = false;
	this.visible = true;
	if(props == null) return;
	this.profileItemId = props.profile_item_id;
	this.group = props.group;
	this.name = props.name;
	this.valueType = props.value_type;
	if(props.visible != null) this.visible = props.visible;
	if(props.locked != null) this.locked = props.locked;
};
$hxClasses["albero.entity.ProfileItemDefinition"] = albero.entity.ProfileItemDefinition;
albero.entity.ProfileItemDefinition.__name__ = ["albero","entity","ProfileItemDefinition"];
albero.entity.ProfileItemDefinition.findById = function(profileDefs,profileItemId) {
	var _g = 0;
	while(_g < profileDefs.length) {
		var defs = profileDefs[_g];
		++_g;
		if(defs.profileItemId == profileItemId) return defs;
	}
	return null;
};
albero.entity.ProfileItemDefinition.prototype = {
	__class__: albero.entity.ProfileItemDefinition
};
albero.entity.ProfileItemValue = function(props) {
	if(props == null) return;
	this.profileItemId = props.profile_item_id;
	this.value = props.value;
	this.canonicalValue = props.canonical_value;
	null;
};
$hxClasses["albero.entity.ProfileItemValue"] = albero.entity.ProfileItemValue;
albero.entity.ProfileItemValue.__name__ = ["albero","entity","ProfileItemValue"];
albero.entity.ProfileItemValue.findById = function(profileItemValues,profileItemId) {
	var _g = 0;
	while(_g < profileItemValues.length) {
		var value = profileItemValues[_g];
		++_g;
		if(value.profileItemId == profileItemId) return value;
	}
	return null;
};
albero.entity.ProfileItemValue.prototype = {
	__class__: albero.entity.ProfileItemValue
};
albero.entity.Question = function(props) {
	if(props == null) return;
	this.id = props.message_id;
	this.talkId = props.talk_id;
	this.type = albero.entity.Message.typeOf(props.type);
	this.content = props.content;
	this.userId = props.user_id;
	this.recipientIds = props.assigned_user_ids;
	this.responses = this.createResponses(props.responses);
	this.listing = props.listing;
	this.closingType = albero.entity.Question.typeOf(props.closing_type);
	this.maxResponseId = props.max_response_id;
	this.lastResponse = props.last_response;
	this.lastResponseUserId = props.last_response_user_id;
	this.createdAt = props.created_at;
	this.updatedAt = props.updated_at;
	this.responded = props.responded;
	this.closed = props.closed;
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
	,isCompleted: function(currentUserId) {
		if(Type.enumEq(this.type,albero.entity.MessageType.todo)) {
			if(Type.enumEq(this.closingType,albero.entity.QuestionClosingType.any)) {
				if(this.lastResponse != null) {
					if(this.responses[this.lastResponse].content == "DONE") return true;
				}
			} else {
				if(!this.responded) return false;
				var _g = 0;
				var _g1 = this.responses;
				while(_g < _g1.length) {
					var response = _g1[_g];
					++_g;
					if(albero.Int64Helper.contains(response.userIds,currentUserId)) {
						if(response.content == "DONE") return true;
						return false;
					}
				}
			}
			return false;
		} else if(Type.enumEq(this.closingType,albero.entity.QuestionClosingType.any)) return this.lastResponse != null; else return this.responded;
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
albero.entity.QuestionFromType = { __ename__ : true, __constructs__ : ["fromSelf","fromOther"] };
albero.entity.QuestionFromType.fromSelf = ["fromSelf",0];
albero.entity.QuestionFromType.fromSelf.toString = $estr;
albero.entity.QuestionFromType.fromSelf.__enum__ = albero.entity.QuestionFromType;
albero.entity.QuestionFromType.fromOther = ["fromOther",1];
albero.entity.QuestionFromType.fromOther.toString = $estr;
albero.entity.QuestionFromType.fromOther.__enum__ = albero.entity.QuestionFromType;
albero.entity.QuestionFilter = { __ename__ : true, __constructs__ : ["onlyClosed","onlyUnclosed","noFilter"] };
albero.entity.QuestionFilter.onlyClosed = ["onlyClosed",0];
albero.entity.QuestionFilter.onlyClosed.toString = $estr;
albero.entity.QuestionFilter.onlyClosed.__enum__ = albero.entity.QuestionFilter;
albero.entity.QuestionFilter.onlyUnclosed = ["onlyUnclosed",1];
albero.entity.QuestionFilter.onlyUnclosed.toString = $estr;
albero.entity.QuestionFilter.onlyUnclosed.__enum__ = albero.entity.QuestionFilter;
albero.entity.QuestionFilter.noFilter = ["noFilter",2];
albero.entity.QuestionFilter.noFilter.toString = $estr;
albero.entity.QuestionFilter.noFilter.__enum__ = albero.entity.QuestionFilter;
albero.entity.StampSet = function() {
};
$hxClasses["albero.entity.StampSet"] = albero.entity.StampSet;
albero.entity.StampSet.__name__ = ["albero","entity","StampSet"];
albero.entity.StampSet.prototype = {
	__class__: albero.entity.StampSet
};
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
			users.push(new albero.entity.DomainUser(obj));
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
	if(props.max_message != null) this.maxMessage = new albero.entity.Message(props.max_message); else this.maxMessage = null;
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
var AlberoLog = $hx_exports.AlberoLog = function() { };
$hxClasses["AlberoLog"] = AlberoLog;
AlberoLog.__name__ = ["AlberoLog"];
AlberoLog.dateStr = function() {
	return "[" + (function($this) {
		var $r;
		var _this = new Date();
		$r = HxOverrides.dateStr(_this);
		return $r;
	}(this)) + "] ";
};
albero.js = {};
albero.js.TextCanonicalizer = function() { };
$hxClasses["albero.js.TextCanonicalizer"] = albero.js.TextCanonicalizer;
albero.js.TextCanonicalizer.__name__ = ["albero","js","TextCanonicalizer"];
albero.js.TextCanonicalizer.canonicalize = function(src) {
	return albero.js.TextCanonicalizer.basicLatinAlphabetToUpperCase(albero.js.TextCanonicalizer.hiraganaToKatakana(albero.js.TextCanonicalizer.normalize(albero.js.TextCanonicalizer.eraseInvisible(src))));
};
albero.js.TextCanonicalizer.basicLatinAlphabetToUpperCase = function(src) {
	return src.toUpperCase();
};
albero.js.TextCanonicalizer.hiraganaToKatakana = function(src) {
	var lastHit = 0;
	var dest = "";
	var _g1 = 0;
	var _g = src.length;
	while(_g1 < _g) {
		var i = _g1++;
		var code = HxOverrides.cca(src,i);
		if(code >= albero.js.TextCanonicalizer.HIRAGANA_SMALL_A && code <= albero.js.TextCanonicalizer.HIRAGANA_NN) {
			dest += src.substring(lastHit,i);
			dest += String.fromCharCode(code + (albero.js.TextCanonicalizer.KATAKANA_SMALL_A - albero.js.TextCanonicalizer.HIRAGANA_SMALL_A));
			lastHit = i + 1;
		}
	}
	dest += src.substring(lastHit,src.length);
	return dest;
};
albero.js.TextCanonicalizer.normalize = function(src) {
	return src.normalize("NFKC");
};
albero.js.TextCanonicalizer.eraseInvisible = function(src) {
	var regex = new EReg("[\\u0000-\\u0020　]","g");
	return regex.replace(src,"");
};
albero.js.WebSocket = function(url) {
	var _g = this;
	var webSocketClient = js.Node.require("websocket").client;
	this.ws = new webSocketClient();
	this.ws.on("connectFailed",$bind(this,this.onError));
	this.ws.on("connect",function(connection) {
		_g.connection = connection;
		connection.on("error",$bind(_g,_g.onError));
		connection.on("close",$bind(_g,_g.onConnectionClose));
		connection.on("message",$bind(_g,_g.onMessage));
		_g.onOpen(null);
	});
	var requestOptions = null;
	if(Settings.proxyURL != null) {
		var proxy = js.Node.require("url").parse(Settings.proxyURL);
		var options = { host : proxy.hostname};
		if(proxy.port != null) options.port = Std.parseInt(proxy.port);
		if(proxy.auth != null) options.proxyAuth = proxy.auth;
		var tunnel = js.Node.require("tunnel-agent");
		var factory;
		if(proxy.protocol == "https:") factory = tunnel.httpsOverHttps; else factory = tunnel.httpsOverHttp;
		requestOptions = { agent : factory({ proxy : options})};
	}
	this.ws.connect(url,null,null,null,requestOptions);
};
$hxClasses["albero.js.WebSocket"] = albero.js.WebSocket;
albero.js.WebSocket.__name__ = ["albero","js","WebSocket"];
albero.js.WebSocket.prototype = {
	onOpen: function(event) {
		if(console != null) console.info(AlberoLog.dateStr(),"WebSocket opened.","","","","");
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
		if(console != null) console.error(AlberoLog.dateStr(),"WebSocket error. event:",event,"","","");
		if(this.onerror != null) this.onerror();
	}
	,onClose: function(event) {
		this.ws = null;
		this.connection = null;
		if(console != null) console.info(AlberoLog.dateStr(),"WebSocket closed. event:%s reason:%s wasClean:%s",event.code,event.reason,event.wasClean,"");
		if(this.onclose != null) this.onclose(event.code,event.reason,event.wasClean);
	}
	,onConnectionClose: function(code,reason) {
		this.onClose({ code : code, reason : reason});
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
	,getData: function() {
		return this.data;
	}
	,onRegister: function() {
	}
	,onRemove: function() {
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
		var _g1 = this;
		switch(name) {
		case "notify_update_user":
			if((body instanceof Array) && body.__enum__ == null) {
				var user = new albero.entity.DomainUser(body[1]);
				this.dataStore.setUserIfLatest(null,user);
			} else {
				var me = new albero.entity.Me(body);
				if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"Current user updated. user:",me,"","","");
				this.dataStore.setMe(me);
			}
			callback();
			break;
		case "notify_add_friend":
			var user1 = new albero.entity.DomainUser(body[1]);
			this.dataStore.addFriend(user1);
			this.sendNotification(name,user1);
			callback();
			break;
		case "notify_add_acquaintance":
			var user2 = new albero.entity.DomainUser(body[1]);
			this.dataStore.addAcquaintance(user2);
			this.sendNotification(name,user2);
			callback();
			break;
		case "notify_join_domain":
			var newDomain = new albero.entity.Domain(body);
			this.dataStore.setDomain(newDomain);
			this.sendNotification(name,[null,newDomain]);
			callback();
			break;
		case "notify_update_domain":
			var newDomain1 = new albero.entity.Domain(body);
			var oldDomain = this.dataStore.getDomain(newDomain1.id);
			this.dataStore.setDomain(newDomain1);
			if(oldDomain != null) {
				if(oldDomain.role.allowReadAnnouncements && !newDomain1.role.allowReadAnnouncements) {
					this.dataStore.removeAnnouncementStatus(oldDomain.id);
					var status = new albero.entity.AnnouncementStatus();
					status.domainId = newDomain1.id;
					this.sendNotification("notify_update_announcement_status",status);
				}
			}
			this.sendNotification(name,[oldDomain,newDomain1]);
			callback();
			break;
		case "notify_add_domain_invite":
			var domainInvite = new albero.entity.DomainInvite(body);
			this.dataStore.setDomainInvite(domainInvite);
			this.sendNotification(name,domainInvite);
			callback();
			break;
		case "notify_create_pair_talk":case "notify_create_group_talk":case "notify_update_group_talk":case "notify_add_talkers":case "notify_delete_talker":
			var talk = new albero.entity.Talk(body);
			this.dataStore.setTalk(talk);
			this.sendNotification(name,talk);
			callback();
			break;
		case "notify_create_message":
			var msg = new albero.entity.Message(body);
			var talkStatus = this.newTalkStatusByMessage(msg);
			if(talkStatus != null) this.sendNotification("notify_update_local_talk_status",talkStatus);
			var _g = msg.type;
			switch(_g[1]) {
			case 15:
				this.sendNotification("phone_call_connected",msg.content);
				this.sendNotification(name,msg);
				callback();
				break;
			case 5:case 7:case 9:
				haxe.Timer.delay(function() {
					_g1.sendNotification("ReloadData",albero.command.ReloadDataType.Question(msg.id,function() {
						_g1.sendNotification(name,msg);
						callback();
					}));
				},500);
				break;
			case 6:case 8:case 10:case 11:case 12:case 13:
				haxe.Timer.delay(function() {
					_g1.sendNotification("ReloadData",albero.command.ReloadDataType.Question(msg.content.in_reply_to,function() {
						_g1.sendNotification(name,msg);
						callback();
					}));
				},500);
				break;
			case 4:
				if(msg.content.file_id != null) {
					var file = new albero.entity.FileInfo();
					file.messageId = msg.id;
					file.talkId = msg.talkId;
					file.userId = msg.userId;
					file.updatedAt = msg.createdAt;
					file.id = msg.content.file_id;
					file.name = msg.content.name;
					file.contentType = msg.content.content_type;
					file.contentSize = msg.content.content_size;
					file.url = msg.content.url;
					this.sendNotification("notify_create_attachment",file);
				}
				this.sendNotification(name,msg);
				callback();
				break;
			case 0:
				var content = msg.content;
				var userId = null;
				var _g11 = content.type;
				switch(_g11) {
				case "delete_talker":
					userId = content.deleted_user_id;
					break;
				case "hide_pair_talk":
					userId = content.user_id;
					break;
				}
				if(userId == null) return;
				var talkId = msg.talkId;
				var questions = this.dataStore.getQuestions(talkId,userId);
				var _g12 = 0;
				while(_g12 < questions.length) {
					var question = questions[_g12];
					++_g12;
					question.closed = true;
					this.sendNotification("notify_update_question",question);
				}
				this.sendNotification(name,msg);
				callback();
				break;
			default:
				this.sendNotification(name,msg);
				callback();
			}
			break;
		case "notify_update_read_statuses":
			var status1 = new albero.entity.MessageReadStatusesUpdate(body);
			var talkStatus1 = this.updateTalkStatus(status1);
			if(talkStatus1 != null) this.sendNotification("notify_update_local_talk_status",talkStatus1);
			this.sendNotification(name,status1);
			callback();
			break;
		case "notify_update_talk_status":
			var statusUpdate = new albero.entity.TalkStatusUpdate(body);
			var status2 = this.dataStore.getTalkStatus(statusUpdate.talkId);
			if(status2 != null && (status2.maxEveryoneReadMessageId == null || haxe.Int64.compare(status2.maxEveryoneReadMessageId,statusUpdate.maxEveryoneReadMessageId) < 0)) {
				status2.maxEveryoneReadMessageId = statusUpdate.maxEveryoneReadMessageId;
				this.dataStore.setTalkStatus(status2);
				this.sendNotification("notify_update_local_talk_status",status2);
			}
			this.sendNotification(name,statusUpdate);
			callback();
			break;
		case "notify_create_announcement":
			var announce = new albero.entity.Announcement(body);
			this.sendNotification("notify_update_announcement_status",this.newAnnouncementStatus(announce));
			this.sendNotification(name,announce);
			callback();
			break;
		case "notify_update_announcement_status":
			var status3 = new albero.entity.AnnouncementStatus(body);
			var currentStatus = this.dataStore.getAnnouncementStatus(status3.domainId);
			if(currentStatus == null) this.dataStore.setAnnouncementStatus(status3); else if(currentStatus.maxReadAnnouncementId == null || haxe.Int64.compare(currentStatus.maxReadAnnouncementId,status3.maxReadAnnouncementId) < 0) this.dataStore.setAnnouncementStatus(status3); else {
				if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"notified announcement status is older than current status. notified:%o, current:%o",status3,currentStatus,"","");
				status3.maxReadAnnouncementId = currentStatus.maxReadAnnouncementId;
				status3.maxAnnouncementId = currentStatus.maxAnnouncementId;
				status3.unreadCount = currentStatus.unreadCount;
			}
			this.sendNotification(name,status3);
			callback();
			break;
		case "notify_delete_attachment":
			var deletion = new albero.entity.FileInfoDeletion(body);
			this.sendNotification(name,deletion);
			callback();
			break;
		case "notify_leave_domain":
			var domainId = body;
			this.dataStore.removeDomain(domainId);
			this.sendNotification(name,domainId);
			callback();
			break;
		case "notify_delete_domain_invite":
			var domainId1 = body;
			this.dataStore.removeDomainInvite(domainId1);
			this.sendNotification(name,domainId1);
			callback();
			break;
		case "notify_delete_friend":
			this.dataStore.removeFriend(body[0],body[1]);
			this.sendNotification(name,body);
			callback();
			break;
		case "notify_delete_acquaintance":
			this.dataStore.removeAcquaintance(body[0],body[1]);
			this.sendNotification(name,body);
			callback();
			break;
		case "notify_delete_talk":
			this.dataStore.removeTalk(body);
			this.dataStore.removeTalkStatus(body);
			this.sendNotification("SelectTalk",null);
			this.sendNotification(name,body);
			callback();
			break;
		default:
			this.sendNotification(name,body);
			callback();
		}
	}
	,newTalkStatusByMessage: function(msg) {
		var status = this.dataStore.getTalkStatus(msg.talkId);
		if(status == null) {
			status = new albero.entity.TalkStatus();
			status.id = msg.talkId;
		}
		if(status.maxMessageId == null || haxe.Int64.compare(status.maxMessageId,msg.id) < 0) {
			status.maxMessageId = msg.id;
			status.maxMessage = msg;
		}
		if(!this.dataStore.isMe(msg.userId)) status.unreadCount++;
		this.dataStore.setTalkStatus(status);
		return status;
	}
	,updateTalkStatus: function(msgStatuses) {
		var _g = 0;
		var _g1 = msgStatuses.readUserIds;
		while(_g < _g1.length) {
			var userId = _g1[_g];
			++_g;
			if(this.dataStore.isMe(userId)) {
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
	this.mockMsgId = new haxe.Int64(-1,-1);
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
			_g.settings.setAccessToken(accessToken);
			_g.createSession(accessToken);
		},function(error) {
			_g.sendNotification("Url",albero.command.UrlAction.FORWARD(albero.Urls.error));
		});
	}
	,createSession: function(accessToken) {
		var _g = this;
		this.rpc.call("create_session",[accessToken,"1.35"],function(map) {
			_g.dataStore.setMe(new albero.entity.Me(map.user));
			_g.settings.setConfiguration(new albero.entity.Configuration(map.configuration));
			var callback = function() {
				_g.dataRecoverd = true;
				var expired = map.configuration.bot_expired_version;
				if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"bot_expired_version",expired,"","","");
				if(expired != null) {
					var current = js.Node.require("../../package.json").version;
					if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"current",current,"","","");
					if(current != null) {
						var abc = expired.split(".");
						var xyz = current.split(".");
						if(abc.length == 3 && xyz.length == 3 && (Std.parseFloat(abc[0]) - Std.parseFloat(xyz[0])) * 10000 + (Std.parseFloat(abc[1]) - Std.parseFloat(xyz[1])) * 100 + (Std.parseFloat(abc[2]) - Std.parseFloat(xyz[2])) >= 0) js.Node.process.stderr.write("-----------------------------------------\n" + "Current version is expired! (current: " + current + ")\n" + "Run 'npm update hubot' to update\n" + "-----------------------------------------\n");
					}
				}
				_g.sendNotification("data_recovered");
				_g.rpc.call("start_notification",[],function(data) {
					var succeed = data;
					if(!succeed) {
						if(console != null) console.error(AlberoLog.dateStr(),"start_notification failed.","","","","");
						js.Node.process.exit(1);
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
				if(completeCount == 4) _g.getAllUserEmails(callback);
			};
			_g.getDomains(function() {
				var domains = _g.dataStore.getDomains();
				var gotAnnouncementStatusCount = 0;
				var callbackIfGotAllAnnouncementStatuses = function() {
					gotAnnouncementStatusCount++;
					if(gotAnnouncementStatusCount == domains.length) callbackIfAllFunctionFinished();
				};
				if(domains.length > 0) {
					var _g1 = 0;
					while(_g1 < domains.length) {
						var domain = domains[_g1];
						++_g1;
						_g.getAnnouncementStatuses(domain.id,callbackIfGotAllAnnouncementStatuses);
					}
				} else callbackIfAllFunctionFinished();
				var gotUsersCount = 0;
				var callbackIfGotUsers = function() {
					gotUsersCount++;
					if(gotUsersCount == 2) {
						_g.getTalks(callbackIfAllFunctionFinished);
						_g.getTalkInvites(callbackIfAllFunctionFinished);
					}
				};
				_g.getFriends(callbackIfGotUsers);
				_g.getAcquaintances(callbackIfGotUsers);
			});
			_g.getDomainInvites(callbackIfAllFunctionFinished);
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
			_g.rpc.call("update_user",[displayName,profileUrl,phoneticDisplayName],function(props) {
				_g.sendNotification("update_user_responsed",new albero.entity.Me(props));
			});
		};
		if(profileImageUrl != null) updateUserName(profileImageUrl); else if(profileImage != null) this.uploadFile(profileImage,null,albero.proxy._AlberoServiceProxy.UploadUseType.PROFILE_IMAGE,function(auth) {
			updateUserName(auth.get_url);
		}); else updateUserName();
	}
	,updateProfile: function(domainProfileItemValues) {
		var _g = this;
		var array = new Array();
		var _g1 = 0;
		while(_g1 < domainProfileItemValues.length) {
			var domainItemValue = domainProfileItemValues[_g1];
			++_g1;
			var content = new Array();
			content.push(domainItemValue.domainId);
			var itemValueArray = new Array();
			var _g11 = 0;
			var _g2 = domainItemValue.profileItemValues;
			while(_g11 < _g2.length) {
				var itemValue = _g2[_g11];
				++_g11;
				itemValueArray.push({ profile_item_id : itemValue.profileItemId, value : itemValue.value});
			}
			content.push(itemValueArray);
			array.push(content);
		}
		this.rpc.call("update_profile",[array],function(me) {
			_g.sendNotification("update_profile_responsed",me);
		});
	}
	,addFriend: function(friend) {
		var domainId = this.settings.getSelectedDomainId();
		this.rpc.call("add_friend",[domainId,friend.id]);
	}
	,deleteFriend: function(friend) {
		var domainId = this.settings.getSelectedDomainId();
		this.rpc.call("delete_friend",[domainId,friend.id]);
	}
	,getFriends: function(callback) {
		var _g2 = this;
		this.rpc.call("get_friends",[],function(array) {
			var _g = 0;
			while(_g < array.length) {
				var row = array[_g];
				++_g;
				var users = row[1];
				var _g1 = 0;
				while(_g1 < users.length) {
					var u = users[_g1];
					++_g1;
					var user = new albero.entity.DomainUser(u);
					_g2.dataStore.addFriend(user);
					_g2.sendNotification("notify_add_friend",user);
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
				var users = row[1];
				var _g1 = 0;
				while(_g1 < users.length) {
					var u = users[_g1];
					++_g1;
					var user = new albero.entity.DomainUser(u);
					_g2.dataStore.addAcquaintance(user);
					_g2.sendNotification("notify_add_acquaintance",user);
				}
			}
			if(callback != null) callback();
		});
	}
	,getAllUsers: function(marker) {
		var _g = this;
		var domainId = this.settings.getSelectedDomainId();
		var maxCount = 40;
		var targets = 14;
		this.rpc.call("get_domain_users",[domainId,targets,maxCount,marker],function(result) {
			var users = new Array();
			var _g1 = 0;
			var _g11;
			_g11 = js.Boot.__cast(result.contents , Array);
			while(_g1 < _g11.length) {
				var map = _g11[_g1];
				++_g1;
				users.push(new albero.entity.DomainUser(map));
			}
			_g.dataStore.setUsersIfLatest(domainId,users);
			_g.sendNotification("get_domain_users_responsed",[domainId,result.marker,result.next_marker,users]);
		});
	}
	,getUsers: function(domainId,userIds) {
		var _g = this;
		this.rpc.call("get_users",[domainId,userIds],function(result) {
			var users = new Array();
			var _g1 = 0;
			var _g11;
			_g11 = js.Boot.__cast(result , Array);
			while(_g1 < _g11.length) {
				var map = _g11[_g1];
				++_g1;
				users.push(new albero.entity.DomainUser(map));
			}
			_g.dataStore.setUsersIfLatest(domainId,users);
			_g.sendNotification("get_users_responsed",[domainId,users]);
		});
	}
	,getProfile: function(domainId,userId) {
		var _g = this;
		this.rpc.call("get_profile",[domainId,userId],function(result) {
			var profile = new albero.entity.Profile(result);
			_g.sendNotification("get_profile_responsed",profile);
		});
	}
	,searchDomainUsers: function(query,marker) {
		var _g = this;
		var domainId = this.settings.getSelectedDomainId();
		var maxCount = 40;
		var targets = 14;
		this.rpc.call("search_domain_users",[domainId,query,targets,maxCount,marker],function(result) {
			var users = new Array();
			var _g1 = 0;
			var _g11;
			_g11 = js.Boot.__cast(result.contents , Array);
			while(_g1 < _g11.length) {
				var map = _g11[_g1];
				++_g1;
				users.push(new albero.entity.DomainUser(map));
			}
			_g.dataStore.setUsersIfLatest(domainId,users);
			_g.sendNotification("get_domain_users_responsed",[domainId,result.marker,result.next_marker,users,query]);
		});
	}
	,getUserEmails: function(domainId,userIds,callback) {
		var _g2 = this;
		this.rpc.call("get_user_emails",[domainId,userIds],function(result) {
			var _g1 = 0;
			var _g = userIds.length;
			while(_g1 < _g) {
				var i = _g1++;
				var user = _g2.dataStore.getUser(domainId,userIds[i]);
				if(user != null) user.email = result[i];
			}
			if(callback != null) callback();
		});
	}
	,getAllUserEmails: function(callback) {
		var _g = this;
		var userIds = null;
		var _g1 = 0;
		var _g11 = this.dataStore.getUsers();
		while(_g1 < _g11.length) {
			var user = _g11[_g1];
			++_g1;
			if(user.email == null) {
				var domainIdStr = albero.Int64Helper.idStr(user.domainId);
				if(userIds == null) userIds = new haxe.ds.StringMap();
				var ids = userIds.get(domainIdStr);
				if(ids == null) {
					ids = new Array();
					userIds.set(domainIdStr,ids);
				}
				ids.push(user.id);
			}
		}
		if(userIds == null) callback(); else {
			var it = userIds.keys();
			var success = null;
			success = function() {
				if(it.hasNext()) {
					var domainIdStr1 = it.next();
					_g.getUserEmails(albero.Int64Helper.makeFromIdStr(domainIdStr1),userIds.get(domainIdStr1),success);
				} else callback();
			};
			success();
		}
	}
	,getDomains: function(callback) {
		var _g1 = this;
		var sendDomainNotifications = function(domains) {
			domains.reverse();
			var _g = 0;
			while(_g < domains.length) {
				var domain = domains[_g];
				++_g;
				_g1.sendNotification("notify_update_domain",[null,domain]);
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
				var maxMessage1;
				if(status1 != null) maxMessage1 = status1.maxMessage; else maxMessage1 = null;
				var update1;
				if(maxMessage1 != null) update1 = maxMessage1.createdAt; else update1 = null;
				if(update1 == null || haxe.Int64.compare(update1,talk1.updatedAt) < 0) update1 = talk1.updatedAt;
				var status2 = _g.dataStore.getTalkStatus(talk2.id);
				var maxMessage2;
				if(status2 != null) maxMessage2 = status2.maxMessage; else maxMessage2 = null;
				var update2;
				if(maxMessage2 != null) update2 = maxMessage2.createdAt; else update2 = null;
				if(update2 == null || haxe.Int64.compare(update2,talk2.updatedAt) < 0) update2 = talk2.updatedAt;
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
	,getTalkStatuses: function() {
		var _g = this;
		var sendTalkStatusNotification = function(status) {
			var talk = _g.dataStore.getTalk(status.id);
			if(talk == null) return;
			_g.sendNotification("notify_update_local_talk_status",status);
		};
		this.rpc.call("get_talk_statuses",[],function(array) {
			var _g1 = 0;
			while(_g1 < array.length) {
				var map = array[_g1];
				++_g1;
				sendTalkStatusNotification(_g.newTalkStatus(map));
			}
		});
	}
	,getReadStatus: function(talkId,messageId) {
		var _g = this;
		this.rpc.call("get_read_status",[talkId,messageId],function(status) {
			_g.sendNotification("notify_get_message_status",new albero.entity.MessageReadStatus(status));
		});
	}
	,createTalk: function(userIds) {
		var _g = this;
		var domainId = this.settings.getSelectedDomainId();
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
			_g.settings.setSelectedTalk(talk);
		});
	}
	,updateGroupTalk: function(talk,name,iconFile,iconUrl) {
		var _g = this;
		if(talk.type != albero.entity.TalkType.GroupTalk) return;
		var _updateGroupTalk = function(iconUrl1) {
			_g.rpc.call("update_group_talk",[talk.id,name,iconUrl1],function(map) {
				_g.sendNotification("notify_update_group_talk",_g.newTalk(map));
			});
		};
		if(iconUrl != null) _updateGroupTalk(iconUrl); else if(iconFile != null) this.uploadFile(iconFile,talk.domainId,albero.proxy._AlberoServiceProxy.UploadUseType.TALK_ICON,function(auth) {
			_updateGroupTalk(auth.get_url);
		}); else _updateGroupTalk();
	}
	,addTalkers: function(talk,userIds) {
		var _g = this;
		if(talk.type == albero.entity.TalkType.PairTalk) {
			var userIds1 = talk.userIds.concat(userIds);
			albero.Int64Helper.remove(userIds1,this.dataStore.me.id);
			this.createTalk(userIds1);
			return;
		}
		if(userIds.length == 0) return;
		this.rpc.call("add_talkers",[talk.id,userIds],function(talk1) {
			_g.sendNotification("notify_add_talkers",_g.newTalk(talk1));
		});
	}
	,deleteTalker: function(talk,userId) {
		var _g = this;
		this.rpc.call("delete_talker",[talk.id,userId],function(_) {
			albero.Int64Helper.remove(talk.userIds,userId);
			_g.sendNotification("notify_delete_talker",_g.dataStore.setTalk(talk));
		});
	}
	,inviteTalker: function(talk,email) {
		this.rpc.call("add_talk_invite",[talk.id,email],function(_) {
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
	,deleteTalkInvite: function(talkId) {
		this.rpc.call("delete_talk_invite",[talkId],function(_) {
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
	,createMessage: function(talkId,type,content,key) {
		var _g = this;
		var dummy = this.newDummyMessage(talkId,type,content);
		this.sendNotification("create_message_start",dummy);
		this.rpc.call("create_message",[talkId,albero.entity.Message.enumIndex(type),content],function(message) {
			_g.sendNotification("create_message_complete",[_g.newMessage(message),dummy.id],key);
		},function(error) {
			_g.sendNotification("create_message_fail",dummy);
			_g.sendNotification("error_occurred",error);
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
			var status1 = _g.dataStore.getTalkStatus(talkId);
			if(status1 == null) return;
			_g.rpc.call("update_read_statuses",[talkId,maxMsgId],function(_) {
			});
		},1000);
		this.updateReadStatusesTimers.set(talkIdStr,timer);
	}
	,upload: function(domainId,talkId,file,key) {
		var _g = this;
		var fileName = file.name.normalize("NFKC");
		var dummyFileInfo = { content_type : file.type, content_size : file.size, name : fileName, file : file};
		var dummy = this.newDummyMessage(talkId,albero.entity.MessageType.file,dummyFileInfo);
		this.uploadThumbnail(file,domainId,talkId,dummy,function(thumbAuth) {
			_g.uploadFile(file,domainId,albero.proxy._AlberoServiceProxy.UploadUseType.MESSAGE,function(auth) {
				var newFileInfo = { url : auth.get_url, content_type : file.type, content_size : file.size, name : fileName, file_id : auth.file_id};
				if(thumbAuth != null) newFileInfo.thumbnail_url = thumbAuth.get_url;
				_g.rpc.call("create_message",[talkId,albero.entity.Message.enumIndex(albero.entity.MessageType.file),newFileInfo],function(message) {
					_g.sendNotification("create_message_complete",[_g.newMessage(message),dummy.id],key);
				},function(error) {
					_g.sendNotification("create_message_fail",dummy);
					_g.sendNotification("error_occurred",error);
				});
			});
		});
	}
	,uploadThumbnail: function(file,domainId,talkId,dummyMessage,callback) {
		var _g = this;
		this.fileService.createThumbnail(file,function(thumbFile) {
			dummyMessage.content.thumbnail_file = thumbFile;
			_g.sendNotification("create_message_start",dummyMessage);
			if(thumbFile != null) _g.uploadFile(thumbFile,domainId,albero.proxy._AlberoServiceProxy.UploadUseType.THUMBNAIL,callback); else callback(null);
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
		case 2:
			useTypeInt = 2;
			break;
		case 3:
			useTypeInt = 4;
			break;
		}
		var fileName = file.name.normalize("NFKC");
		this.rpc.call("create_upload_auth",[fileName,file.type,file.size,domainId,useTypeInt],function(auth) {
			_g.fileService.upload(auth,file.type,file,function() {
				callback(auth);
			});
		});
	}
	,deleteAttachment: function(fileId,messageId) {
		this.rpc.call("delete_attachment",[fileId,messageId]);
	}
	,getAttachments: function(talk,range) {
		var _g1 = this;
		var count = 20;
		if(range == null) range = { sinceId : null, maxId : null};
		this.rpc.call("get_attachments",[talk.id,count,range.sinceId,range.maxId],function(result) {
			var files = new Array();
			var _g = 0;
			while(_g < result.length) {
				var data = result[_g];
				++_g;
				files.push(_g1.newFileInfo(data));
			}
			_g1.sendNotification("get_file_responsed",{ talkId : talk.id, files : files});
		});
	}
	,createAnnouncement: function(type,content,key) {
		var _g = this;
		var domainId = this.settings.getSelectedDomainId();
		if(domainId == null) return;
		this.rpc.call("create_announcement",[domainId,albero.entity.Message.enumIndex(type),content],function(message) {
			_g.sendNotification("notify_create_announcement",_g.newAnnouncement(message),key);
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
	,getQuestions: function(talk,fromType,filter,range) {
		var _g1 = this;
		var count = 20;
		var domainId = this.settings.getSelectedDomainId();
		var talkId = null;
		if(talk != null) {
			domainId = talk.domainId;
			talkId = talk.id;
		}
		var fromTypeInt;
		switch(fromType[1]) {
		case 0:
			fromTypeInt = 0;
			break;
		case 1:
			fromTypeInt = 1;
			break;
		}
		var closed;
		switch(filter[1]) {
		case 0:
			closed = true;
			break;
		case 1:
			closed = false;
			break;
		case 2:
			closed = null;
			break;
		}
		if(range == null) range = { sinceId : null, maxId : null};
		this.rpc.call("get_actions",[domainId,talkId,fromTypeInt,closed,count,range.sinceId,range.maxId],function(result) {
			var questions = new Array();
			var _g = 0;
			while(_g < result.length) {
				var question = result[_g];
				++_g;
				questions.push(_g1.newQuestion(question));
			}
			_g1.sendNotification("get_questions_responsed",{ domainId : domainId, talkId : talkId, questions : questions, fromType : fromType, filter : filter});
		});
	}
	,getQuestion: function(messageId,callback) {
		var _g = this;
		this.rpc.call("get_action",[messageId],function(question) {
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
		msg.id = this.mockMsgId;
		msg.userId = this.dataStore.me.id;
		msg.talkId = talkId;
		msg.type = type;
		msg.content = content;
		this.mockMsgId = albero.Int64Helper.decrement(this.mockMsgId);
		return msg;
	}
	,newQuestion: function(obj) {
		return this.dataStore.setQuestion(new albero.entity.Question(obj));
	}
	,newFileInfo: function(obj) {
		return new albero.entity.FileInfo(obj);
	}
	,newAnnouncement: function(obj) {
		return new albero.entity.Announcement(obj);
	}
	,newAnnouncementStatus: function(obj) {
		return this.dataStore.setAnnouncementStatus(new albero.entity.AnnouncementStatus(obj));
	}
	,createdAtNow: function() {
		var now = new Date().getTime();
		var base = 4294967296.0;
		return new haxe.Int64(now / base | 0,now % base | 0);
	}
	,__class__: albero.proxy.AlberoServiceProxy
});
albero.proxy._AlberoServiceProxy = {};
albero.proxy._AlberoServiceProxy.UploadUseType = { __ename__ : true, __constructs__ : ["PROFILE_IMAGE","MESSAGE","TALK_ICON","THUMBNAIL"] };
albero.proxy._AlberoServiceProxy.UploadUseType.PROFILE_IMAGE = ["PROFILE_IMAGE",0];
albero.proxy._AlberoServiceProxy.UploadUseType.PROFILE_IMAGE.toString = $estr;
albero.proxy._AlberoServiceProxy.UploadUseType.PROFILE_IMAGE.__enum__ = albero.proxy._AlberoServiceProxy.UploadUseType;
albero.proxy._AlberoServiceProxy.UploadUseType.MESSAGE = ["MESSAGE",1];
albero.proxy._AlberoServiceProxy.UploadUseType.MESSAGE.toString = $estr;
albero.proxy._AlberoServiceProxy.UploadUseType.MESSAGE.__enum__ = albero.proxy._AlberoServiceProxy.UploadUseType;
albero.proxy._AlberoServiceProxy.UploadUseType.TALK_ICON = ["TALK_ICON",2];
albero.proxy._AlberoServiceProxy.UploadUseType.TALK_ICON.toString = $estr;
albero.proxy._AlberoServiceProxy.UploadUseType.TALK_ICON.__enum__ = albero.proxy._AlberoServiceProxy.UploadUseType;
albero.proxy._AlberoServiceProxy.UploadUseType.THUMBNAIL = ["THUMBNAIL",3];
albero.proxy._AlberoServiceProxy.UploadUseType.THUMBNAIL.toString = $estr;
albero.proxy._AlberoServiceProxy.UploadUseType.THUMBNAIL.__enum__ = albero.proxy._AlberoServiceProxy.UploadUseType;
albero.proxy.AppStateProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"appState");
};
$hxClasses["albero.proxy.AppStateProxy"] = albero.proxy.AppStateProxy;
albero.proxy.AppStateProxy.__name__ = ["albero","proxy","AppStateProxy"];
albero.proxy.AppStateProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero.proxy.AppStateProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	start: function() {
		this.updateLastActivityAt();
		this.checkInactiveInterval();
	}
	,setAppState: function(_appState) {
		var p1 = "APP_STATE_CHANGED: " + Std.string(_appState);
		null;
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
		if(this.appState == albero.AppState.Inactive) return;
		var d = new Date().getTime() - this.lastActivityAt.getTime();
		if(d < 2000) return;
		this.setAppState(albero.AppState.Inactive);
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
	setMe: function(user) {
		this.me = user;
		var _g = 0;
		var _g1 = this.getDomains();
		while(_g < _g1.length) {
			var domain = _g1[_g];
			++_g;
			this.sendNotification("notify_update_user",this.me.toDomainUser(domain.id));
		}
		this.sendNotification("current_user_changed",user);
	}
	,getMe: function() {
		return this.me;
	}
	,isMe: function(userId) {
		return this.me != null && albero.Int64Helper.eq(this.me.id,userId);
	}
	,getFriends: function(domainId) {
		var map = this.users.get("_" + domainId.high + "_" + domainId.low);
		var result = [];
		if(map != null) {
			var $it0 = map.iterator();
			while( $it0.hasNext() ) {
				var value = $it0.next();
				if(value.type == 0) result.push(value.user);
			}
		}
		return result;
	}
	,isFriend: function(domainId,userId) {
		var map = this.users.get("_" + domainId.high + "_" + domainId.low);
		if(map != null) {
			var value = map.get("_" + userId.high + "_" + userId.low);
			return value != null && value.type == 0;
		}
		return false;
	}
	,addFriend: function(user) {
		var map = this.ensureDomainUserMap(user.domainId);
		var key = albero.Int64Helper.idStr(user.id);
		map.set(key,{ type : 0, user : user});
		return user;
	}
	,addAcquaintance: function(user) {
		var map = this.ensureDomainUserMap(user.domainId);
		var key = albero.Int64Helper.idStr(user.id);
		map.set(key,{ type : 1, user : user});
		return user;
	}
	,ensureDomainUserMap: function(domainId) {
		var domainIdStr = "_" + domainId.high + "_" + domainId.low;
		var map = this.users.get(domainIdStr);
		if(map == null) {
			map = new haxe.ds.StringMap();
			this.users.set(domainIdStr,map);
		}
		return map;
	}
	,setUserIfLatest: function(map,user) {
		if(map == null) {
			var key = albero.Int64Helper.idStr(user.domainId);
			map = this.users.get(key);
			if(map == null) return;
		}
		var value;
		var key1 = albero.Int64Helper.idStr(user.id);
		value = map.get(key1);
		if(value != null) {
			if(value.type == 2 || haxe.Int64.compare(user.updatedAt,value.user.updatedAt) > 1) {
				value.user = user;
				this.sendNotification("notify_update_user",user);
			}
		} else {
			var key2 = albero.Int64Helper.idStr(user.id);
			map.set(key2,{ type : 2, user : user});
		}
	}
	,setUsersIfLatest: function(domainId,users) {
		var map = this.users.get("_" + domainId.high + "_" + domainId.low);
		if(map == null) return;
		var _g = 0;
		while(_g < users.length) {
			var user = users[_g];
			++_g;
			this.setUserIfLatest(map,user);
		}
	}
	,removeFriend: function(domainId,userId) {
		var map = this.users.get("_" + domainId.high + "_" + domainId.low);
		if(map != null) {
			var value = map.get("_" + userId.high + "_" + userId.low);
			value.type = 2;
		}
	}
	,removeAcquaintance: function(domainId,userId) {
		this.removeFriend(domainId,userId);
	}
	,getUser: function(domainId,id) {
		if((id.high | id.low) == 0) return null;
		if(albero.Int64Helper.eq(this.me.id,id)) return this.me.toDomainUser(domainId);
		var map = this.users.get("_" + domainId.high + "_" + domainId.low);
		if(map != null) {
			var value = map.get("_" + id.high + "_" + id.low);
			if(value != null) return value.user;
		}
		return null;
	}
	,getUsers: function(domainId,userIds) {
		var _g = this;
		var _getUsers = function(domainId1,userIds1) {
			var map = _g.users.get("_" + domainId1.high + "_" + domainId1.low);
			if(map != null) {
				if(userIds1 != null) return userIds1.map(function(id) {
					if((id.high | id.low) == 0) return null;
					if(albero.Int64Helper.eq(_g.me.id,id)) return _g.me.toDomainUser(domainId1);
					var value = map.get("_" + id.high + "_" + id.low);
					if(value != null) return value.user; else return null;
				}); else {
					var users = new Array();
					var it = map.iterator();
					while(it.hasNext()) users.push(it.next().user);
					return users;
				}
			}
			return new Array();
		};
		if(domainId != null) return _getUsers(domainId,userIds); else {
			var it1 = this.domains.iterator();
			var users1 = null;
			while(it1.hasNext()) if(users1 == null) users1 = _getUsers(it1.next().id,userIds); else users1 = users1.concat(_getUsers(it1.next().id,userIds));
			return users1;
		}
	}
	,getTalk: function(id) {
		return this.talks.get("_" + id.high + "_" + id.low);
	}
	,setTalk: function(talk) {
		var key = albero.Int64Helper.idStr(talk.id);
		this.talks.set(key,talk);
		if(talk.leftUsers != null) {
			var map = this.ensureDomainUserMap(talk.domainId);
			var _g = 0;
			var _g1 = talk.leftUsers;
			while(_g < _g1.length) {
				var leftUser = _g1[_g];
				++_g;
				var idStr = albero.Int64Helper.idStr(leftUser.id);
				var value = map.get(idStr);
				if(value != null) {
					if(value.type == 2 && haxe.Int64.compare(leftUser.updatedAt,value.user.updatedAt) > 0) {
						value.user = leftUser;
						this.sendNotification("notify_update_user",leftUser);
					}
				} else {
					map.set(idStr,{ type : 2, user : leftUser});
					this.sendNotification("notify_update_user",leftUser);
				}
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
	,setTalks: function(talks) {
		var _g = 0;
		while(_g < talks.length) {
			var t = talks[_g];
			++_g;
			this.setTalk(t);
		}
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
		var $it0 = this.domains.iterator();
		while( $it0.hasNext() ) {
			var domain = $it0.next();
			result.push(domain);
		}
		return result;
	}
	,getDomain: function(id) {
		return this.domains.get("_" + id.high + "_" + id.low);
	}
	,setDomain: function(domain) {
		var key = albero.Int64Helper.idStr(domain.id);
		this.domains.set(key,domain);
		return domain;
	}
	,removeDomain: function(domainId) {
		this.domains.remove("_" + domainId.high + "_" + domainId.low);
	}
	,getUnreadCount: function() {
		var unreadCount = 0;
		var $it0 = this.domains.keys();
		while( $it0.hasNext() ) {
			var domainIdStr = $it0.next();
			unreadCount += this._getDomainUnreadCount(domainIdStr);
		}
		var $it1 = this.domainInvites.iterator();
		while( $it1.hasNext() ) {
			var domainIdStr1 = $it1.next();
			unreadCount++;
		}
		return unreadCount;
	}
	,_getDomainUnreadCount: function(domainIdStr) {
		if(this.domainUnreadCounts != null && this.domainUnreadCounts.exists(domainIdStr)) return this.domainUnreadCounts.get(domainIdStr);
		if(this.domainUnreadCounts == null) this.domainUnreadCounts = new haxe.ds.StringMap();
		var unreadCount = 0;
		var $it0 = this.talkStatuses.iterator();
		while( $it0.hasNext() ) {
			var status = $it0.next();
			if(status.unreadCount == null || status.unreadCount == 0) continue;
			var talk;
			var key = albero.Int64Helper.idStr(status.id);
			talk = this.talks.get(key);
			if(talk != null && albero.Int64Helper.idStr(talk.domainId) == domainIdStr) unreadCount += status.unreadCount;
		}
		var status1 = this.announcementStatuses.get(domainIdStr);
		if(status1 != null && status1.unreadCount != null) unreadCount += status1.unreadCount;
		this.domainUnreadCounts.set(domainIdStr,unreadCount);
		return unreadCount;
	}
	,getDomainUnreadCount: function(domainId) {
		return this._getDomainUnreadCount("_" + domainId.high + "_" + domainId.low);
	}
	,getDomainInvites: function() {
		var result = new Array();
		var $it0 = this.domainInvites.keys();
		while( $it0.hasNext() ) {
			var id = $it0.next();
			result.push(this.domainInvites.get(id));
		}
		return result;
	}
	,getDomainInvite: function(id) {
		return this.domainInvites.get("_" + id.high + "_" + id.low);
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
	,getQuestions: function(talkId,userId) {
		var result = [];
		if(this.questions != null) {
			var $it0 = this.questions.iterator();
			while( $it0.hasNext() ) {
				var question = $it0.next();
				if(albero.Int64Helper.eq(question.talkId,talkId) && albero.Int64Helper.eq(question.userId,userId)) result.push(question);
			}
		}
		return result;
	}
	,getQuestion: function(id) {
		return this.questions.get("_" + id.high + "_" + id.low);
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
	,removeAnnouncementStatus: function(domainId) {
		var domainIdStr = "_" + domainId.high + "_" + domainId.low;
		this.announcementStatuses.remove(domainIdStr);
		if(this.domainUnreadCounts != null) this.domainUnreadCounts.remove(domainIdStr);
		this.sendNotification("brand_badge_changed");
	}
	,clear: function() {
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
	,downloadUrl: function(url,download) {
		if(download == null) download = false;
		if(url == null || url.length == 0) return "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
		if(StringTools.startsWith(url,this.validHost)) {
			var accessToken = this.settings.getAccessToken();
			var url2 = url;
			if(url.indexOf("?") != -1) url2 += "&"; else url2 += "?";
			url2 += "Authorization=ALB%20" + accessToken;
			if(download) url2 += "&download=true";
			return url2;
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
				_g.download(loc,path,callback);
				return;
			}
			if(Math.floor(res.statusCode / 100) != 2) {
				callback(null);
				return;
			}
			var out = js.Node.require("fs").createWriteStream(path);
			res.on("data",function(chunk) {
				out.write(chunk);
			});
			res.on("end",function() {
				out.end();
				out.on("finish",function() {
					callback(path);
				});
			});
			res.on("error",function(e) {
				callback(null);
			});
			out.on("error",function(e1) {
				callback(null);
			});
		});
		req.on("error",function(e2) {
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
					_g.uploadFailed({ responseText : res.statusCode + ": " + data});
				});
				return;
			}
			callback();
		});
		req.on("error",function(e) {
			_g.uploadFailed({ responseText : e.message});
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
	,uploadFailed: function(xhr) {
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
	,createThumbnail: function(file,callback) {
		if(StringTools.startsWith(file.type,"video/")) callback(null); else callback(null);
	}
	,createVideoThumbnail: function(file,callback) {
		var _g = this;
		if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"createVideoThumbnail","","","","");
		var video = window.document.getElementById("thumb-video");
		video.pause();
		var videoURL = URL.createObjectURL(file);
		var onplaying = null;
		var onerror = null;
		var callbackWithThumb = function(thumbFile) {
			URL.revokeObjectURL(videoURL);
			video.removeEventListener("playing",onplaying,false);
			video.removeEventListener("error",onerror,false);
			callback(thumbFile);
		};
		var onplayingInvoked = false;
		onplaying = function(e) {
			if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"video playing","","","","");
			if(onplayingInvoked) return;
			onplayingInvoked = true;
			haxe.Timer.delay(function() {
				_g.captureVideo(video,function(thumbFile1) {
					video.pause();
					callbackWithThumb(thumbFile1);
				});
			},100);
		};
		video.addEventListener("playing",onplaying,false);
		onerror = function(e1) {
			if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"video error",e1,"","","");
			callbackWithThumb(null);
		};
		video.addEventListener("error",onerror,false);
		video.src = videoURL;
	}
	,captureVideo: function(video,callback) {
		var w0 = video.width;
		var h0 = video.height;
		var w = video.videoWidth;
		var h = video.videoHeight;
		if(h > w) {
			h *= w0 / w;
			w = w0;
		} else {
			w *= h0 / h;
			h = h0;
		}
		var x = (w0 - w) / 2.0;
		var y = (h0 - h) / 2.0;
		var canvas = window.document.getElementById("thumb-canvas");
		canvas.getContext("2d").drawImage(video,x,y,w,h);
		canvas.toBlob(function(blob) {
			if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"captureVideo blob callback","","","","");
			var thumbFile = { name : "thumb.jpeg", type : "image/jpeg", file : "thumb.jpeg", blob : blob, size : blob.size};
			callback(thumbFile);
		});
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
	dayOfWeekString: function(date) {
		var _g = date.getDay();
		switch(_g) {
		case 0:
			return "日";
		case 1:
			return "月";
		case 2:
			return "火";
		case 3:
			return "水";
		case 4:
			return "木";
		case 5:
			return "金";
		default:
			return "土";
		}
	}
	,dateString: function(date,dayOfWeek) {
		var now = new Date();
		var dateStr = "";
		if(date.getFullYear() != now.getFullYear()) dateStr += date.getFullYear() + "/";
		dateStr += date.getMonth() + 1 + "/" + date.getDate();
		if(dayOfWeek) dateStr += " (" + this.dayOfWeekString(date) + ")";
		return dateStr;
	}
	,abbreviateDatetimeString: function(date) {
		if(date == null) return "";
		var today = new Date();
		var d;
		var t = albero.Int64Helper.toFloat(date);
		var d1 = new Date();
		d1.setTime(t);
		d = d1;
		var r = "";
		if(today.getFullYear() == d.getFullYear() && today.getMonth() == d.getMonth() && today.getDate() == d.getDate()) r = d.getHours() + ":" + (d.getMinutes() < 10?"0":"") + d.getMinutes(); else r = this.dateString(d,false);
		return r;
	}
	,timeString: function(time) {
		if(time == null) return "";
		var d;
		var t = albero.Int64Helper.toFloat(time);
		var d1 = new Date();
		d1.setTime(t);
		d = d1;
		return d.getHours() + ":" + (d.getMinutes() < 10?"0":"") + d.getMinutes();
	}
	,datetimeString: function(date) {
		if(date == null) return "";
		var d;
		var t = Std.parseFloat(Std.string(date));
		var d1 = new Date();
		d1.setTime(t);
		d = d1;
		return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.getHours() + ":" + (d.getMinutes() < 10?"0":"") + d.getMinutes();
	}
	,messageString: function(domainId,msg) {
		var user;
		if(msg.type == albero.entity.MessageType.system) user = null; else user = this.dataStore.getUser(domainId,msg.userId);
		var userName;
		if(user != null) userName = user.displayName; else userName = "";
		var _g = msg.type;
		switch(_g[1]) {
		case 0:
			return this.systemMessageString(domainId,msg.content);
		case 1:
			return userName + ":" + Std.string(msg.content);
		case 2:
			return userName + ":" + "スタンプを送信しました。";
		case 5:case 7:
			return userName + ":" + "[質問] " + Std.string(msg.content.question);
		case 6:case 8:
			return userName + ":" + "質問に回答しました";
		case 9:
			return userName + ":" + "[タスク] " + Std.string(msg.content.title);
		case 10:
			return userName + ":" + "[タスク完了] " + Std.string(msg.content.title);
		case 11:case 12:case 13:
			return userName + "が回答を締め切りました。";
		default:
			return userName + "がメッセージを送信しました。";
		}
	}
	,announcementString: function(announcement) {
		var user = this.dataStore.getUser(announcement.domainId,announcement.userId);
		var userName;
		if(user != null) userName = user.displayName; else userName = announcement.userName;
		if(userName == null) userName = "";
		var _g = announcement.type;
		switch(_g[1]) {
		case 1:
			return userName + ":" + Std.string(announcement.content);
		default:
			if(console != null) console.error(AlberoLog.dateStr(),"announcement.type is not text. announcment:%o",announcement,"","","");
			return userName + "がメッセージを送信しました。";
		}
	}
	,systemMessageString: function(domainId,content) {
		var _g = content.type;
		switch(_g) {
		case "add_talkers":
			var addedUsers = "";
			var users = content.added_user_ids;
			var _g1 = 0;
			while(_g1 < users.length) {
				var uid = users[_g1];
				++_g1;
				var user = this.dataStore.getUser(domainId,uid);
				if(user != null) {
					if(addedUsers != "") addedUsers += "と";
					addedUsers += user.displayName;
				}
			}
			var addedBy = null;
			if(content.added_by != null) {
				var user1 = this.dataStore.getUser(domainId,content.added_by);
				if(user1 != null) addedBy = user1.displayName;
			}
			if(addedBy == null) return addedUsers + "を追加しました";
			return addedBy + "が" + addedUsers + "を追加しました";
		case "delete_talker":
			var msg = "";
			var user2 = this.dataStore.getUser(domainId,content.deleted_user_id);
			if(user2 != null) msg += user2.displayName;
			return msg + "が退出しました。関連するアクションは締め切られました。";
		case "add_talk_invite":
			var msg1 = content.email;
			return msg1 + "が招待されました";
		case "delete_talk_invite":
			var msg2 = content.email;
			return msg2 + "の招待が取り消されました";
		case "hide_pair_talk":
			var msg3 = "";
			var user3 = this.dataStore.getUser(domainId,content.user_id);
			if(user3 != null) msg3 += user3.displayName;
			return msg3 + "はメッセージ履歴を削除しました。相手にこれ以前のメッセージは表示されません。関連するアクションは締め切られました。";
		default:
			return "";
		}
	}
	,createText: function(text) {
		if(text == null) return null;
		var result = this.emoji(this.linking(text));
		if(StringTools.endsWith(result,"\n")) result = result + "\n";
		return result;
	}
	,emoji: function(text) {
		var r = new EReg("\\{p:(\\d+)\\}","g");
		var res = r.replace(text,"<img class='emoji' src='images/emoji/$1.gif'>");
		return res;
	}
	,linking: function(text) {
		return twttr.txt.autoLinkUrlsCustom(text,{ targetBlank : true, htmlEscapeNonEntities : true});
	}
	,__class__: albero.proxy.FormatterProxy
});
albero.proxy._FormatterProxy = {};
albero.proxy._FormatterProxy.ExternalUserIconListener = $hx_exports.albero.ExternalUserIconListener = function() { };
$hxClasses["albero.proxy._FormatterProxy.ExternalUserIconListener"] = albero.proxy._FormatterProxy.ExternalUserIconListener;
albero.proxy._FormatterProxy.ExternalUserIconListener.__name__ = ["albero","proxy","_FormatterProxy","ExternalUserIconListener"];
albero.proxy.MsgPackRpcProxy = function() {
	this.connectionStatus = albero.ConnectionStatus.Ok;
	puremvc.patterns.proxy.Proxy.call(this,"rpc");
	this.responseHandlers = new haxe.ds.IntMap();
	this.errorHandler = $bind(this,this.onServerError);
	this.connectionKeeper = new albero.proxy._MsgPackRpcProxy.ConnectionKeeper($bind(this,this.ping));
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
		this.connectionKeeper.start();
	}
	,onRemove: function() {
		this.connectionKeeper.stop();
		this.finishWebSocket();
	}
	,onOpen: function() {
		this.connectionKeeper.setConnected(true);
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
				if(console != null) console.error(AlberoLog.dateStr(),"No ResponseHandler prepared. msgId:%s error:%s result:",msgId,error,result,"");
				return;
			}
			if(error == null) {
				var func = responseHandler.onSuccess;
				if(func != null) func(result);
			} else {
				if(console != null) console.error(AlberoLog.dateStr(),"Receive Error Response. method:",responseHandler.method," error:",error,"");
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
		if(console != null) console.info(AlberoLog.dateStr(),"onClose. code:" + code + ", reason:" + reason + ", wasClean:" + (wasClean == null?"null":"" + wasClean),"","","","");
		if(code != 1001 || !wasClean) {
			if((code == 1000 || code == 1005) && reason == "concurrent access") this.connectionStatus = albero.ConnectionStatus.ConcurrentAccessError; else if((code == 1000 || code == 1005) && reason == "forcibly closed") this.connectionStatus = albero.ConnectionStatus.ForcibliyClosedError; else this.connectionStatus = albero.ConnectionStatus.Error;
			if(this.connectionStatus == albero.ConnectionStatus.ForcibliyClosedError) this.sendNotification("SignOut"); else this.sendNotification("Url",albero.command.UrlAction.FORWARD(albero.Urls.error));
		}
		this.finishWebSocket();
		this.connectionKeeper.setConnected(false);
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
		},500);
	}
	,call: function(method,args,onSuccess,onError) {
		if(this.ws == null) {
			if(console != null) console.error(AlberoLog.dateStr(),"disconnected. data:",this.data,"","","");
			return;
		}
		if(args == null) args = [];
		var msgId = albero.proxy.MsgPackRpcProxy.lastMsgId++;
		var value = new albero.proxy._MsgPackRpcProxy.ResponseHandler(method,onSuccess,onError);
		this.responseHandlers.set(msgId,value);
		var data = [0,msgId,method,args];
		var msgpack1 = new msgpack.Encoder(data).getBytes();
		this.ws.send(msgpack1);
		null;
	}
	,ping: function() {
		var _g = this.connectionStatus;
		switch(_g[1]) {
		case 2:case 3:
			return;
		default:
		}
		if(this.ws == null || this.ws.isClosed()) this.restart(); else this.ws.send(haxe.io.Bytes.alloc(0));
	}
	,onServerError: function(method,e) {
		this.sendNotification("error_occurred",e);
	}
	,__class__: albero.proxy.MsgPackRpcProxy
});
albero.proxy._MsgPackRpcProxy = {};
albero.proxy._MsgPackRpcProxy.ConnectionKeeper = function(ping) {
	this.connected = false;
	this.ping = ping;
};
$hxClasses["albero.proxy._MsgPackRpcProxy.ConnectionKeeper"] = albero.proxy._MsgPackRpcProxy.ConnectionKeeper;
albero.proxy._MsgPackRpcProxy.ConnectionKeeper.__name__ = ["albero","proxy","_MsgPackRpcProxy","ConnectionKeeper"];
albero.proxy._MsgPackRpcProxy.ConnectionKeeper.prototype = {
	start: function() {
	}
	,stop: function() {
		this.deleteTimer();
	}
	,setConnected: function(_connected) {
		if(this.connected == _connected && this.timer != null) return;
		this.connected = _connected;
		this.resetTimer();
	}
	,resetTimer: function() {
		var _g = this;
		this.deleteTimer();
		if(this.connected) {
			this.timer = new haxe.Timer(45000);
			this.timer.run = this.ping;
		} else {
			var f = null;
			f = function(delay) {
				var nextDelay = Std["int"](Math.min(delay * 2,45000));
				return function() {
					_g.ping();
					_g.timer = haxe.Timer.delay(f(nextDelay),delay);
				};
			};
			(f(3000))();
		}
	}
	,deleteTimer: function() {
		if(this.timer == null) return;
		this.timer.stop();
		this.timer = null;
	}
	,__class__: albero.proxy._MsgPackRpcProxy.ConnectionKeeper
};
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
albero.proxy.Error = function(prop) {
	this.code = prop.code;
	this.message = prop.message;
	this.detail = prop.detail;
};
$hxClasses["albero.proxy.Error"] = albero.proxy.Error;
albero.proxy.Error.__name__ = ["albero","proxy","Error"];
albero.proxy.Error.prototype = {
	__class__: albero.proxy.Error
};
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
	,redirect: function(url,historyState) {
		this.init();
		this.router.redirect(url,historyState);
	}
	,back: function() {
		if(this.router == null) return;
		this.router.back();
	}
	,stop: function() {
		if(this.router == null) return;
		if(this.router.started) this.router.stop();
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
		var domainId = this.getDomainId(url);
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
	,redirect: function(url,historyState) {
	}
	,redirectWithHash: function() {
	}
	,back: function() {
		this.notify(this.prev);
	}
	,stop: function() {
		this.started = false;
	}
	,getDomainId: function(url) {
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
		case 7:
			var domainId5 = url[2];
			return domainId5;
		default:
			return null;
		}
	}
	,parseFragment: function(fragment) {
		if(fragment == null) return null;
		var tokens = fragment.split("/");
		if(tokens[0] != "") return null;
		if(tokens.length == 2) {
			if(tokens[1] == "") return albero.Urls.domains; else if(tokens[1] == "settings") {
				var domainId = this.settings.getLastSelectedDomainId();
				if(domainId != null && this.dataStore.getDomain(domainId) != null) {
					albero.History.replaceState("settings",null,"#" + this.toFragment(albero.Urls.settings(domainId)));
					return albero.Urls.settings(domainId);
				}
				var domains = this.dataStore.getDomains();
				if(domains.length > 0) {
					var firstDomain = null;
					var _g = 0;
					while(_g < domains.length) {
						var domain = domains[_g];
						++_g;
						if(firstDomain == null || haxe.Int64.compare(firstDomain.id,domain.id) > 0) firstDomain = domain;
					}
					albero.History.replaceState("settings",null,"#" + this.toFragment(albero.Urls.settings(firstDomain.id)));
					return albero.Urls.settings(firstDomain.id);
				}
				return albero.Urls.settings(null);
			} else if(tokens[1] == Std.string(albero.Urls.error)) return albero.Urls.error; else if(tokens[1] == Std.string(albero.Urls.loading)) return albero.Urls.loading;
		} else if(tokens.length == 3) {
			var domainId1 = albero.Int64Helper.parse(tokens[1]);
			if(domainId1 != null) {
				if(tokens[2] == "") return albero.Urls.domain(domainId1); else if(tokens[2] == "members") return albero.Urls.members(domainId1); else if(tokens[2] == "talks") return albero.Urls.talks(domainId1); else if(tokens[2] == "actions") return albero.Urls.actions(domainId1); else if(tokens[2] == "console") return albero.Urls.console(domainId1); else if(tokens[2] == "settings") return albero.Urls.settings(domainId1);
			}
		}
		return null;
	}
	,toFragment: function(url) {
		switch(url[1]) {
		case 1:
			return "/";
		case 9:case 10:
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
		case 7:
			var domainId5 = url[2];
			if(domainId5 == null) domainId5 = this.settings.getLastSelectedDomainId();
			if(domainId5 != null) return "/" + domainId5.toString() + "/settings"; else return "/settings";
			break;
		default:
			return null;
		}
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
	setAccessTokenRemember: function(remember) {
		this.remember = remember;
	}
	,setAccessToken: function(accessToken) {
		if(!this.remember) return;
		this.accessToken = accessToken;
		this.sendNotification("access_token_changed",accessToken);
	}
	,getAccessToken: function() {
		if(this.accessToken == null) this.accessToken = Settings.accessToken;
		return this.accessToken;
	}
	,clearAccessToken: function() {
		this.accessToken = null;
	}
	,setConfiguration: function(conf) {
		this.configuration = conf;
		this.sendNotification("configuration_changed",conf);
	}
	,getConfiguration: function() {
		return this.configuration;
	}
	,setSelectedDomainId: function(domainId) {
		if(albero.Int64Helper.eq(this.selectedDomainId,domainId)) return;
		this.selectedDomainId = domainId;
		this.sendNotification("domain_selection_changed",domainId);
	}
	,getLastSelectedDomainId: function() {
		var h = null;
		var l = null;
		var val;
		if(h != null && l != null) val = new haxe.Int64(h,l); else val = null;
		return val;
	}
	,getSelectedDomainId: function() {
		return this.selectedDomainId;
	}
	,clearDomainSelection: function() {
		this.selectedDomainId = null;
	}
	,clearSelectedTalk: function() {
		if(!this.hasSelectedTalk()) return;
		var key = albero.Int64Helper.idStr(this.selectedDomainId);
		this.selectedTalkIds.remove(key);
	}
	,setSelectedTalk: function(talk) {
		if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"talk selected. talk:",talk,"","","");
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
	,hasSelectedTalk: function() {
		return this.selectedTalkIds != null && (function($this) {
			var $r;
			var key = albero.Int64Helper.idStr($this.selectedDomainId);
			$r = $this.selectedTalkIds.exists(key);
			return $r;
		}(this));
	}
	,getSelectedTalkId: function() {
		if(this.selectedTalkIds == null) return null;
		var key = albero.Int64Helper.idStr(this.selectedDomainId);
		return this.selectedTalkIds.get(key);
	}
	,isSendByEnter: function() {
		if(this.sendByEnter == null) this.sendByEnter = true;
		return this.sendByEnter;
	}
	,setSendByEnter: function(sendByEnter) {
		this.sendByEnter = sendByEnter;
	}
	,setSelectedStampTabId: function(tabId) {
	}
	,getSelectedStampTabId: function() {
		var tabId = 0;
		return tabId;
	}
	,clearSelectedStampTabId: function() {
	}
	,setInputTextForTalkId: function(text,talkId) {
		if(text == null || text.length == 0) this.clearInputTextForTalkId(talkId); else {
			this.loadInputTextForAll();
			this.inputTexts["_" + talkId.high + "_" + talkId.low] = text;
		}
	}
	,getInputTextForTalkId: function(talkId) {
		this.loadInputTextForAll();
		var text = this.inputTexts["_" + talkId.high + "_" + talkId.low];
		if(text != null) return text; else return "";
	}
	,clearInputTextForTalkId: function(talkId) {
		this.loadInputTextForAll();
		delete(this.inputTexts["_" + talkId.high + "_" + talkId.low]);
	}
	,loadInputTextForAll: function() {
		if(this.inputTexts == null) {
			try {
			} catch( unknown ) {
			}
			if(this.inputTexts == null) this.inputTexts = { };
		}
	}
	,saveInputTextForAll: function() {
		if(this.inputTexts != null) {
			var allText = JSON.stringify(this.inputTexts,null,null);
		}
	}
	,clearInputTextForAll: function() {
		js.Browser.getLocalStorage().removeItem("input_text");
		this.inputTexts = null;
	}
	,setCopyProfileToAllDomains: function(copy) {
		if(copy) js.Browser.getLocalStorage().setItem("copy_profile_to_all_domains","true"); else js.Browser.getLocalStorage().removeItem("copy_profile_to_all_domains");
	}
	,isCopyProfileToAllDomains: function() {
		return js.Browser.getLocalStorage().getItem("copy_profile_to_all_domains") != null;
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
	,setViewComponent: function(viewComponent) {
		this.viewComponent = viewComponent;
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
	,onRemove: function() {
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
		return ["app_state_changed","access_token_changed","current_user_changed","configuration_changed","domain_selection_changed","talk_selection_changed","user_selection_needed","user_selection_changed","friend_selection_needed","stamp_set_changed","stamp_selection_changed","phone_call_started","phone_call_accepted","phone_call_connected","phone_call_hangued_up","action_selection_changed","current_page_changed","fileinfo_selection_changed","error_occurred","brand_badge_changed","send_form_top_changed","data_recovered","notify_update_user","notify_add_friend","notify_add_acquaintance","notify_delete_friend","notify_delete_acquaintance","notify_update_domain_users","get_domain_users_responsed","get_users_responsed","get_profile_responsed","update_user_responsed","update_profile_responsed","notify_add_domain_invite","notify_accept_domain_invite","notify_delete_domain_invite","notify_join_domain","notify_update_domain","notify_leave_domain","notify_create_pair_talk","notify_create_group_talk","notify_update_group_talk","notify_add_talkers","notify_delete_talker","notify_add_talk_invite","notify_accept_talk_invite","notify_delete_talk_invite","notify_delete_talk","notify_create_message","notify_update_read_statuses","notify_update_talk_status","notify_update_local_talk_status","notify_get_messages","notify_get_message_status","create_message_start","create_message_complete","create_message_fail","notify_create_announcement","notify_update_announcement_status","notify_get_announcements","notify_update_question","get_questions_responsed","notify_create_attachment","notify_delete_attachment","get_file_responsed"];
	}
	,handleNotification: function(note) {
		var _g1 = this;
		var _g = note.getName();
		var defalut = _g;
		switch(_g) {
		case "data_recovered":
			if(this.dataRecovered) return;
			this.dataRecovered = true;
			this.eventEmitter.emit(note.getName());
			break;
		case "error_occurred":
			this.eventEmitter.emit(note.getName(),new Error("AdapterError"),note.getBody());
			break;
		default:
			this.eventEmitter.emit(note.getName(),note.getBody());
		}
		var view = this.getViewComponent();
		var _g2 = note.getName();
		switch(_g2) {
		case "access_token_changed":
			js.Node.console.log(note.getBody());
			js.Node.process.exit(0);
			break;
		case "current_user_changed":
			var user = note.getBody();
			null;
			break;
		case "notify_add_domain_invite":
			var invite = note.getBody();
			break;
		case "notify_create_pair_talk":case "notify_create_group_talk":
			if(!this.dataRecovered) return;
			var talk = note.getBody();
			haxe.Timer.delay(function() {
				_g1.emit(talk,"JoinMessage",_g1.dataStore.me);
			},500);
			break;
		case "notify_update_group_talk":
			if(!this.dataRecovered) return;
			var talk1 = note.getBody();
			var talkName;
			if(talk1.name != null) talkName = talk1.name; else talkName = "";
			haxe.Timer.delay(function() {
				_g1.emit(talk1,"TopicChangeMessage",_g1.dataStore.me,talkName);
			},500);
			break;
		case "create_message_complete":
			var args = note.getBody();
			var msg = args[0];
			var dummyId = args[1];
			if(this.dataStore.isMe(msg.userId)) {
				this.messageEvent.messageCreated(msg,note.getType());
				return;
			}
			break;
		case "notify_create_message":
			var msg1 = note.getBody();
			if(this.dataStore.isMe(msg1.userId)) return;
			var status = this.dataStore.getTalkStatus(msg1.talkId);
			if(status != null && status.maxReadMessageId != null && haxe.Int64.compare(status.maxReadMessageId,msg1.id) >= 0) return;
			haxe.Timer.delay(function() {
				_g1.sendNotification("Read",albero.command.ReadType.TALK(msg1.talkId,msg1.id));
				_g1.dispatch(msg1);
			},200);
			break;
		case "notify_update_read_statuses":
			var statuses = note.getBody();
			var _g11 = 0;
			var _g21 = statuses.messageIds;
			while(_g11 < _g21.length) {
				var msgId = _g21[_g11];
				++_g11;
				this.messageEvent.messageRead(statuses.talkId,msgId,statuses.readUserIds);
			}
			break;
		case "notify_get_message_status":
			var status1 = note.getBody();
			this.messageEvent.messageRead(status1.talkId,status1.id,status1.readUserIds,status1.unreadUserIds);
			break;
		}
	}
	,emit: function(talk,type,user,msg) {
		var _g = this;
		if(type != null && talk != null && user != null) this.api.getAllUserEmails(function() {
			_g.eventEmitter.emit(type,{ room : albero.Int64Helper.idStr(talk.id), rooms : _g.hubotObject.talkObjects()},_g.hubotObject.userObject(user),msg);
		});
	}
	,dispatch: function(msg) {
		var _g = this;
		var content = msg.content;
		var talk = this.dataStore.getTalk(msg.talkId);
		var emit = function(type,userId,body) {
			_g.emit(talk,type,_g.dataStore.getUser(talk.domainId,userId),{ id : albero.Int64Helper.idStr(msg.id), content : body});
		};
		if(msg.type == albero.entity.MessageType.system) {
			var subtype = content.type;
			if(subtype == "add_talkers") {
				var userIds = content.added_user_ids;
				var currentUserId = this.dataStore.me.id;
				if(albero.Int64Helper.contains(userIds,currentUserId)) {
					emit("JoinMessage",currentUserId);
					return;
				}
				var _g1 = 0;
				while(_g1 < userIds.length) {
					var uid = userIds[_g1];
					++_g1;
					emit("EnterMessage",uid);
				}
			} else if(subtype == "delete_talker") {
				emit("LeaveMessage",content.deleted_user_id);
				if(content.user_ids.length <= 1) haxe.Timer.delay(function() {
					_g.sendNotification("Talk",albero.command.TalkAction.DELETE(null,talk));
				},500);
			} else if(subtype == "hide_pair_talk") {
				emit("LeaveMessage",content.user_id);
				haxe.Timer.delay(function() {
					_g.sendNotification("Talk",albero.command.TalkAction.DELETE(null,talk));
				},500);
			}
		} else {
			var text = null;
			var _g2 = msg.type;
			switch(_g2[1]) {
			case 1:
				text = content;
				break;
			default:
				var obj = ObjectHelper.deepCopy(msg.content);
				var _g11 = 0;
				var _g21 = Reflect.fields(obj);
				while(_g11 < _g21.length) {
					var fieldName = _g21[_g11];
					++_g11;
					var val = Reflect.field(obj,fieldName);
					if(Reflect.isObject(obj) && val.high != null && val.low != null) {
						var id = haxe.Int64.make(val.high,val.low);
						Reflect.setField(obj,fieldName,fieldName == "stamp_index"?id.toString():"_" + id.high + "_" + id.low);
					} else if(fieldName == "stamp_set") Reflect.setField(obj,fieldName,Std.string(val));
				}
				text = JSON.stringify(obj);
			}
			if(text != null) {
				text = StringTools.replace(text,"　"," ");
				if(talk.type == albero.entity.TalkType.PairTalk) {
					var name = "Hubot";
					if(!StringTools.startsWith(text,name)) text = name + " " + text;
				}
				emit("TextMessage",msg.userId,text);
			}
		}
	}
	,__class__: albero_cli.mediator.CommandLineMediator
});
albero_cli.proxy = {};
albero_cli.proxy.HubotObjectProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"hubotObject");
};
$hxClasses["albero_cli.proxy.HubotObjectProxy"] = albero_cli.proxy.HubotObjectProxy;
albero_cli.proxy.HubotObjectProxy.__name__ = ["albero_cli","proxy","HubotObjectProxy"];
albero_cli.proxy.HubotObjectProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero_cli.proxy.HubotObjectProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	userObject: function(user) {
		var u = ObjectHelper.deepCopy(user);
		u.id_i64 = user.id;
		u.id = albero.Int64Helper.idStr(user.id);
		u.name = user.displayName;
		u.profile_url = user.profileImageUrl;
		return u;
	}
	,userObjectByIdStr: function(domainId,userId) {
		var users = this.userObjectsByIds(domainId,[albero.Int64Helper.idStrToInt64(userId)]);
		if(users.length > 0) return users[0]; else return null;
	}
	,userObjectsByIds: function(domainId,userIds) {
		var users = [];
		var _g = 0;
		var _g1 = this.dataStore.getUsers(domainId,userIds);
		while(_g < _g1.length) {
			var user = _g1[_g];
			++_g;
			if(user == null) continue;
			users.push(this.userObject(user));
		}
		return users;
	}
	,userObjects: function(domainId) {
		var users = { };
		var _g = 0;
		var _g1 = this.dataStore.getUsers(domainId);
		while(_g < _g1.length) {
			var user = _g1[_g];
			++_g;
			users[albero.Int64Helper.idStr(user.id)] = this.userObject(user);
		}
		return users;
	}
	,talkObjects: function() {
		var talks = { };
		var _g = 0;
		var _g1 = this.dataStore.getTalks();
		while(_g < _g1.length) {
			var talk = _g1[_g];
			++_g;
			var t = ObjectHelper.deepCopy(talk);
			t.id_i64 = talk.id;
			t.id = albero.Int64Helper.idStr(talk.id);
			t.topic = talk.name;
			if(talk.type == albero.entity.TalkType.Unknown) t.type = 0; else if(talk.type == albero.entity.TalkType.PairTalk) t.type = 1; else t.type = 2;
			t.users = this.userObjectsByIds(talk.domainId,talk.userIds);
			talks[albero.Int64Helper.idStr(talk.id)] = t;
		}
		return talks;
	}
	,domainObjects: function() {
		var domains = { };
		var _g = 0;
		var _g1 = this.dataStore.getDomains();
		while(_g < _g1.length) {
			var domain = _g1[_g];
			++_g;
			var d = ObjectHelper.deepCopy(domain);
			d.id_i64 = domain.id;
			d.id = albero.Int64Helper.idStr(domain.id);
			domains[albero.Int64Helper.idStr(domain.id)] = d;
		}
		return domains;
	}
	,__class__: albero_cli.proxy.HubotObjectProxy
});
albero_cli.proxy.MessageEventProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"messageEvent");
	this.emitters = new haxe.ds.StringMap();
};
$hxClasses["albero_cli.proxy.MessageEventProxy"] = albero_cli.proxy.MessageEventProxy;
albero_cli.proxy.MessageEventProxy.__name__ = ["albero_cli","proxy","MessageEventProxy"];
albero_cli.proxy.MessageEventProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero_cli.proxy.MessageEventProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	registEmitter: function(key,obj) {
		var emitter = null;
		var fields = Reflect.fields(obj);
		var _g = 0;
		while(_g < fields.length) {
			var fieldName = fields[_g];
			++_g;
			if(StringTools.startsWith(fieldName,"on")) {
				var val = Reflect.field(obj,fieldName);
				if(Reflect.isFunction(val)) {
					Reflect.deleteField(obj,fieldName);
					if(emitter == null) emitter = { context : obj};
					Reflect.setField(emitter,HxOverrides.substr(fieldName,2,null),val);
				}
			}
		}
		if(emitter != null) {
			if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"regist emitter",key,emitter,"","");
			this.emitters.set(key,emitter);
		}
	}
	,unregisterEmitter: function(emitter,key) {
		var listenerCount = 0;
		var _g = 0;
		var _g1 = Reflect.fields(emitter);
		while(_g < _g1.length) {
			var fieldName = _g1[_g];
			++_g;
			if(Reflect.isFunction(Reflect.field(emitter,fieldName))) listenerCount++;
		}
		if(listenerCount == 0) {
			if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"unregist emitter",key,emitter,"","");
			this.emitters.remove(key);
		}
	}
	,off: function(emitter,event) {
		if(event != null && Object.prototype.hasOwnProperty.call(emitter,event)) Reflect.deleteField(emitter,event);
	}
	,emit: function(emitter,event,params) {
		var func = Reflect.field(emitter,event);
		if(func != null) {
			if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"emit '" + event + "'",params,"","","");
			func.apply(emitter,params);
		}
	}
	,messageCreated: function(msg,key) {
		var emitter = this.emitters.get(key);
		if(emitter == null) return;
		this.emitters.remove(key);
		var key1 = albero.Int64Helper.idStr(msg.id);
		var value = emitter;
		this.emitters.set(key1,value);
		var talk = this.dataStore.getTalk(msg.talkId);
		var myId = this.dataStore.me.id;
		emitter.__readerIds = [myId];
		emitter.__unreadIds = talk.userIds.slice();
		albero.Int64Helper.remove(emitter.__unreadIds,myId);
		emitter.readUsers = this.hubotObject.userObjectsByIds(talk.domainId,emitter.__readerIds);
		emitter.unreadUsers = this.hubotObject.userObjectsByIds(talk.domainId,emitter.__unreadIds);
		this.emit(emitter,"send",[emitter,msg]);
		this.off(emitter,"send");
	}
	,messageRead: function(talkId,msgId,newReaders,allUnreaders) {
		var _g = this;
		var emitter = this.emitters.get("_" + msgId.high + "_" + msgId.low);
		if(emitter == null) return;
		if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"CALL messageREAD",newReaders,allUnreaders,"","");
		var readers = emitter.__readerIds;
		var unreads = emitter.__unreadIds;
		var diff = [];
		if(allUnreaders != null) unreads = emitter.__unreadIds = allUnreaders;
		var _g1 = 0;
		while(_g1 < newReaders.length) {
			var reader = newReaders[_g1];
			++_g1;
			if(!albero.Int64Helper.contains(readers,reader)) {
				readers.push(reader);
				diff.push(reader);
			}
			albero.Int64Helper.remove(unreads,reader);
			if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"UNREAD REMOVE",unreads,reader,"","");
		}
		if(AlberoLog.DEBUG && console != null) console.log(AlberoLog.dateStr(),"DIFF",diff,readers,unreads,"");
		if(diff.length > 0) {
			var talk = this.dataStore.getTalk(talkId);
			var domainId;
			if(talk != null) domainId = talk.domainId; else domainId = null;
			emitter.readUsers = this.hubotObject.userObjectsByIds(domainId,readers);
			emitter.unreadUsers = this.hubotObject.userObjectsByIds(domainId,unreads);
			this.emit(emitter,"read",[this.hubotObject.userObjectsByIds(domainId,diff),emitter.readUsers,emitter.unreadUsers]);
		}
		if(readers.length < 16) {
		} else if(emitter.__readerTimer == null) {
			var timer = new haxe.Timer(60000);
			timer.run = function() {
				_g.sendNotification("Read",albero.command.ReadType.READ_STATUS(talkId,msgId));
			};
			emitter.__readerTimer = timer;
		}
		if(unreads.length == 0) this.messageReadEveryone(talkId,msgId);
	}
	,messageReadEveryone: function(talkId,msgId) {
		var emitter = this.emitters.get("_" + msgId.high + "_" + msgId.low);
		if(emitter == null) return;
		var timer = emitter.__readerTimer;
		if(timer != null) {
			timer.stop();
			Reflect.deleteField(emitter,"__readerTimer");
		}
		this.off(emitter,"read");
		this.unregisterEmitter(emitter,"_" + msgId.high + "_" + msgId.low);
	}
	,__class__: albero_cli.proxy.MessageEventProxy
});
albero_cli.proxy.SendQueueProxy = function() {
	puremvc.patterns.proxy.Proxy.call(this,"sendQueue");
	this.sendQueue = new Array();
	this.sending = false;
	this.sendCount = 0;
	var d = new Date();
	d.setTime(0);
	this.lastSendTime = d;
};
$hxClasses["albero_cli.proxy.SendQueueProxy"] = albero_cli.proxy.SendQueueProxy;
albero_cli.proxy.SendQueueProxy.__name__ = ["albero_cli","proxy","SendQueueProxy"];
albero_cli.proxy.SendQueueProxy.__super__ = puremvc.patterns.proxy.Proxy;
albero_cli.proxy.SendQueueProxy.prototype = $extend(puremvc.patterns.proxy.Proxy.prototype,{
	sendMessage: function(talkId,content) {
		if(!(typeof(content) == "string")) {
			var msgId = haxe.Int64.make(0,this.sendCount++);
			this.messageEvent.registEmitter("_" + msgId.high + "_" + msgId.low,content);
			var msg = new albero.entity.Message();
			msg.id = msgId;
			msg.talkId = talkId;
			msg.content = this.parseContent(content);
			msg.type = this.detectType(msg.content);
			if(msg.type == albero.entity.MessageType.unknown) return;
			if(msg.type == albero.entity.MessageType.file && msg.content.path != null) {
				this.sendFile(talkId,msg.content,"_" + msgId.high + "_" + msgId.low);
				return;
			}
			this.pushQueue(msg);
		} else {
			var text = content;
			var _g = 0;
			var _g1 = TextHelper.slice(text,1024);
			while(_g < _g1.length) {
				var text1 = _g1[_g];
				++_g;
				var msg1 = new albero.entity.Message();
				msg1.talkId = talkId;
				msg1.type = albero.entity.MessageType.text;
				msg1.content = text1;
				this.pushQueue(msg1);
			}
		}
	}
	,sendFile: function(talkId,localFile,key) {
		var path;
		var name = null;
		var type = null;
		if(typeof(localFile) == "string") path = localFile; else {
			path = localFile.path;
			name = localFile.name;
			type = localFile.type;
		}
		if(path == null || !js.Node.require("fs").existsSync(path)) return;
		this.sendNotification("File",albero.command.FileAction.UPLOAD_PATH(talkId,path,name,type,key));
	}
	,pushQueue: function(msg) {
		this.sendQueue.push(msg);
		if(this.sending) return;
		this.sending = true;
		var span = new Date().getTime() - this.lastSendTime.getTime();
		var delay = Std["int"](Math.max(500 - span,100));
		haxe.Timer.delay($bind(this,this.startSendTimer),delay);
	}
	,startSendTimer: function() {
		this.sendNotification("Send",this.sendQueue.shift());
		if(this.sendQueue.length == 0) {
			this.lastSendTime = new Date();
			this.sending = false;
		} else haxe.Timer.delay($bind(this,this.startSendTimer),500);
	}
	,parseContent: function(obj) {
		if(obj == null) return null;
		var fields = Reflect.fields(obj);
		var _g = 0;
		while(_g < fields.length) {
			var fieldName = fields[_g];
			++_g;
			var val = Reflect.field(obj,fieldName);
			if(typeof(val) == "string") {
				var id = null;
				if(fieldName == "stamp_set") id = Std.parseInt(val); else if(fieldName == "stamp_index") id = albero.Int64Helper.parse(val); else if(fieldName == "file_id" || fieldName == "in_reply_to") id = albero.Int64Helper.idStrToInt64(val);
				if(id != null) obj[fieldName] = id;
			} else if(Reflect.isObject(obj)) {
				if(val.high != null && val.low != null) Reflect.setField(obj,fieldName,haxe.Int64.make(val.high,val.low));
			}
		}
		if(fields.length == 1 && obj.text != null) return obj.text;
		return obj;
	}
	,detectType: function(obj) {
		if(obj == null) return albero.entity.MessageType.unknown;
		if(typeof(obj) == "string") return albero.entity.MessageType.text;
		if(obj.stamp_set != null) return albero.entity.MessageType.stamp; else if(obj.lat != null) return albero.entity.MessageType.geo; else if(obj.file_id != null || obj.path != null) return albero.entity.MessageType.file; else if(obj.question != null) {
			if(obj.in_reply_to == null) {
				if(obj.options == null) return albero.entity.MessageType.yesOrNo; else return albero.entity.MessageType.selectOne;
			} else if(obj.options == null) return albero.entity.MessageType.yesOrNoReply; else return albero.entity.MessageType.selectOneReply;
		} else if(obj.title != null) {
			if(obj.in_reply_to == null) return albero.entity.MessageType.todo; else return albero.entity.MessageType.todoDone;
		} else return albero.entity.MessageType.unknown;
	}
	,__class__: albero_cli.proxy.SendQueueProxy
});
var haxe = {};
haxe.Http = function(url) {
	this.url = url;
	this.headers = new haxe.ds.StringMap();
	this.params = new haxe.ds.StringMap();
	this.async = true;
};
$hxClasses["haxe.Http"] = haxe.Http;
haxe.Http.__name__ = ["haxe","Http"];
haxe.Http.requestUrl = function(url) {
	var h = new haxe.Http(url);
	h.async = false;
	var r = null;
	h.onData = function(d) {
		r = d;
	};
	h.onError = function(e) {
		throw e;
	};
	h.request(false);
	return r;
};
haxe.Http.prototype = {
	setHeader: function(header,value) {
		this.headers.set(header,value);
	}
	,setParameter: function(param,value) {
		this.params.set(param,value);
	}
	,setPostData: function(data) {
		this.postData = data;
	}
	,request: function(post) {
		var _g = this;
		var me = this;
		var options = { };
		var uri = this.postData;
		var is_secure = this.url.substring(0,8) == "https://";
		if(this.url.substring(0,7) == "http://") this.url = HxOverrides.substr(this.url,7,null); else if(is_secure) this.url = HxOverrides.substr(this.url,8,null);
		var urlTokens = this.url.split("/");
		var host = urlTokens.shift();
		if(urlTokens.length > 0) options.path = "/" + urlTokens.join("/"); else options.path = "/";
		var hostTokens = host.split(":");
		if(hostTokens != null && hostTokens.length > 1) {
			options.host = hostTokens[0];
			options.port = Std.parseInt(hostTokens[1]);
		} else options.host = host;
		if(uri != null) post = true; else {
			var $it0 = this.params.keys();
			while( $it0.hasNext() ) {
				var p = $it0.next();
				if(uri == null) uri = ""; else uri += "&";
				uri += encodeURIComponent(p) + "=" + StringTools.urlEncode(this.params.get(p));
			}
		}
		if(uri != null) {
			var question = this.url.split("?").length <= 1;
			options.path += (question?"?":"&") + uri;
			uri = null;
		}
		if(post) options.method = "POST"; else options.method = "GET";
		if(this.headers.get("Content-Type") == null && post && this.postData == null) this.headers.set("Content-Type","application/x-www-form-urlencoded");
		if(this.headers.iterator().hasNext()) {
			if(options.headers == null) options.headers = { };
			var $it1 = this.headers.keys();
			while( $it1.hasNext() ) {
				var h = $it1.next();
				Reflect.setField(options.headers,h,this.headers.get(h));
			}
		}
		var service = null;
		if(is_secure) service = js.Node.require("https"); else service = js.Node.require("http");
		var request = service.request(options,function(response) {
			var responseData = "";
			response.setEncoding("utf8");
			var s;
			try {
				s = response.statusCode;
			} catch( e ) {
				s = 0;
			}
			if(response.statusCode != null) me.onStatus(response.statusCode);
			if(response.statusCode != null && response.statusCode >= 200 && response.statusCode < 400) {
			} else switch(s) {
			case 0:
				me.onError("Failed to connect or resolve host");
				break;
			case 12029:
				me.onError("Failed to connect to host");
				break;
			case 12007:
				me.onError("Unknown host");
				break;
			default:
				me.onError("Http Error #" + response.statusCode);
			}
			response.on("data",function(chunk) {
				responseData += chunk;
			});
			response.once("end",function() {
				response.removeAllListeners("data");
				response.removeAllListeners("end");
				if(responseData != null) _g.onData(responseData);
				responseData = null;
			});
			response.once("close",function() {
				if(responseData != null) _g.onData(responseData);
				responseData = null;
			});
			response.once("error",function(error) {
				me.onError("Http Response Error: " + Std.string(error));
			});
		});
		request.on("error",function(error1) {
			me.onError("Http Request Error: " + Std.string(error1));
		});
		request.end();
	}
	,onData: function(data) {
	}
	,onError: function(msg) {
	}
	,onStatus: function(status) {
	}
	,__class__: haxe.Http
};
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
haxe.Json = function() { };
$hxClasses["haxe.Json"] = haxe.Json;
haxe.Json.__name__ = ["haxe","Json"];
haxe.Json.stringify = function(obj,replacer,insertion) {
	return JSON.stringify(obj,replacer,insertion);
};
haxe.Json.parse = function(jsonString) {
	return JSON.parse(jsonString);
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
	get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v;
	}
	,blit: function(pos,src,srcpos,len) {
		if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw haxe.io.Error.OutsideBounds;
		src.b.copy(this.b,pos,srcpos,srcpos + len);
	}
	,sub: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var nb = new Buffer(len);
		var slice = this.b.slice(pos,pos + len);
		slice.copy(nb,0,0,len);
		return new haxe.io.Bytes(len,nb);
	}
	,compare: function(other) {
		var b1 = this.b;
		var b2 = other.b;
		var len;
		if(this.length < other.length) len = this.length; else len = other.length;
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			if(b1[i] != b2[i]) return b1[i] - b2[i];
		}
		return this.length - other.length;
	}
	,readString: function(pos,len) {
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
	,toHex: function() {
		var s = new StringBuf();
		var chars = [];
		var str = "0123456789abcdef";
		var _g1 = 0;
		var _g = str.length;
		while(_g1 < _g) {
			var i = _g1++;
			chars.push(HxOverrides.cca(str,i));
		}
		var _g11 = 0;
		var _g2 = this.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			var c = this.b[i1];
			s.b += String.fromCharCode(chars[c >> 4]);
			s.b += String.fromCharCode(chars[c & 15]);
		}
		return s.b;
	}
	,getData: function() {
		return this.b;
	}
	,__class__: haxe.io.Bytes
};
haxe.io.BytesBuffer = function() {
	this.b = new Array();
};
$hxClasses["haxe.io.BytesBuffer"] = haxe.io.BytesBuffer;
haxe.io.BytesBuffer.__name__ = ["haxe","io","BytesBuffer"];
haxe.io.BytesBuffer.prototype = {
	get_length: function() {
		return this.b.length;
	}
	,addByte: function($byte) {
		this.b.push($byte);
	}
	,add: function(src) {
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = 0;
		var _g = src.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,addBytes: function(src,pos,len) {
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
js.Browser = function() { };
$hxClasses["js.Browser"] = js.Browser;
js.Browser.__name__ = ["js","Browser"];
js.Browser.getLocalStorage = function() {
	try {
		var s = window.localStorage;
		s.getItem("");
		return s;
	} catch( e ) {
		return null;
	}
};
js.NodeC = function() { };
$hxClasses["js.NodeC"] = js.NodeC;
js.NodeC.__name__ = ["js","NodeC"];
js.Node = function() { };
$hxClasses["js.Node"] = js.Node;
js.Node.__name__ = ["js","Node"];
js.Node.get_assert = function() {
	return js.Node.require("assert");
};
js.Node.get_child_process = function() {
	return js.Node.require("child_process");
};
js.Node.get_cluster = function() {
	return js.Node.require("cluster");
};
js.Node.get_crypto = function() {
	return js.Node.require("crypto");
};
js.Node.get_dgram = function() {
	return js.Node.require("dgram");
};
js.Node.get_dns = function() {
	return js.Node.require("dns");
};
js.Node.get_fs = function() {
	return js.Node.require("fs");
};
js.Node.get_http = function() {
	return js.Node.require("http");
};
js.Node.get_https = function() {
	return js.Node.require("https");
};
js.Node.get_net = function() {
	return js.Node.require("net");
};
js.Node.get_os = function() {
	return js.Node.require("os");
};
js.Node.get_path = function() {
	return js.Node.require("path");
};
js.Node.get_querystring = function() {
	return js.Node.require("querystring");
};
js.Node.get_repl = function() {
	return js.Node.require("repl");
};
js.Node.get_tls = function() {
	return js.Node.require("tls");
};
js.Node.get_url = function() {
	return js.Node.require("url");
};
js.Node.get_util = function() {
	return js.Node.require("util");
};
js.Node.get_vm = function() {
	return js.Node.require("vm");
};
js.Node.get_zlib = function() {
	return js.Node.require("zlib");
};
js.Node.get___filename = function() {
	return __filename;
};
js.Node.get___dirname = function() {
	return __dirname;
};
js.Node.get_json = function() {
	return JSON;
};
js.Node.newSocket = function(options) {
	return new js.Node.net.Socket(options);
};
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
msgpack.MsgPack = function() { };
$hxClasses["msgpack.MsgPack"] = msgpack.MsgPack;
msgpack.MsgPack.__name__ = ["msgpack","MsgPack"];
msgpack.MsgPack.encode = function(d) {
	return new msgpack.Encoder(d).getBytes();
};
msgpack.MsgPack.decode = function(b,obj) {
	if(obj == null) obj = true;
	return new msgpack.Decoder(b,obj).getResult();
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
	,hasCommand: function(notificationName) {
		return this.commandMap.exists(notificationName);
	}
	,removeCommand: function(notificationName) {
		if(this.hasCommand(notificationName)) {
			this.view.removeObserver(notificationName,this);
			this.commandMap.remove(notificationName);
		}
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
	,hasProxy: function(proxyName) {
		return this.proxyMap.exists(proxyName);
	}
	,removeProxy: function(proxyName) {
		var proxy = this.proxyMap.get(proxyName);
		if(proxy != null) {
			this.proxyMap.remove(proxyName);
			proxy.onRemove();
		}
		return proxy;
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
	,removeObserver: function(notificationName,notifyContext) {
		var observers = this.observerMap.get(notificationName);
		var $it0 = observers.iterator();
		while( $it0.hasNext() ) {
			var observer = $it0.next();
			if(observer.compareNotifyContext(notifyContext) == true) {
				observers.remove(observer);
				break;
			}
		}
		if(observers.isEmpty()) this.observerMap.remove(notificationName);
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
	,retrieveMediator: function(mediatorName) {
		return this.mediatorMap.get(mediatorName);
	}
	,removeMediator: function(mediatorName) {
		var mediator = this.mediatorMap.get(mediatorName);
		if(mediator != null) {
			var interests = mediator.listNotificationInterests();
			var _g1 = 0;
			var _g = interests.length;
			while(_g1 < _g) {
				var i = _g1++;
				this.removeObserver(interests[i],mediator);
			}
			this.mediatorMap.remove(mediatorName);
			mediator.onRemove();
		}
		return mediator;
	}
	,hasMediator: function(mediatorName) {
		return this.mediatorMap.exists(mediatorName);
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
	,setBody: function(body) {
		this.body = body;
	}
	,getBody: function() {
		return this.body;
	}
	,setType: function(type) {
		this.type = type;
	}
	,getType: function() {
		return this.type;
	}
	,toString: function() {
		var msg = "Notification Name: " + this.getName();
		msg += "\nBody:" + (this.body == null?"null":this.body.toString());
		msg += "\nType:" + (this.type == null?"null":this.type);
		return msg;
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
	,getNotifyContext: function() {
		return this.context;
	}
	,notifyObserver: function(notification) {
		(this.getNotifyMethod())(notification);
	}
	,compareNotifyContext: function(object) {
		return object == this.context;
	}
	,__class__: puremvc.patterns.observer.Observer
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
var Settings = { };
var EventEmitter = require('events').EventEmitter;
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
var FileAPI = (function(module) {
	module.exports = null;
	///// FileAPI のミニ版。

function upload(opt) {
    var method = 'POST';
    var url = opt.url;
    var headers = opt.headers;
    var data = opt.data;
    var files = opt.files;
    var complete = opt.complete;

    var formData = new FormData();
    for (var name in data) {
        if (data.hasOwnProperty(name)) {
            formData.append(name, data[name]);
        }
    }
    for (var name in files) {
        if (files.hasOwnProperty(name)) {
            formData.append(name, files[name]);
        }
    }

    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    for (var name in headers) {
        if (headers.hasOwnProperty(name)) {
            xhr.setRequestHeader(name, headers[name]);
        }
    }
    xhr.onload = function(e) {
        if (xhr.readyState === 4) {
            complete(xhr.status === 200, xhr);
        }
    };
    xhr.onerror = function (e) {
        complete(false, xhr);
    };
    xhr.send(formData);

    return xhr;
}

module.exports = {
    upload: upload
};
;
	return module.exports;
})({ });
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
albero.AppFacade.APP_STATE_CHANGED = "app_state_changed";
albero.AppFacade.ACCESS_TOKEN_CHANGED = "access_token_changed";
albero.AppFacade.CURRENT_USER_CHANGED = "current_user_changed";
albero.AppFacade.CONFIGURATION_CHANGED = "configuration_changed";
albero.AppFacade.DOMAIN_SELECTION_CHANGED = "domain_selection_changed";
albero.AppFacade.TALK_SELECTION_CHANGED = "talk_selection_changed";
albero.AppFacade.USER_SELECTION_NEEDED = "user_selection_needed";
albero.AppFacade.USER_SELECTION_CHANGED = "user_selection_changed";
albero.AppFacade.FRIEND_SELECTION_NEEDED = "friend_selection_needed";
albero.AppFacade.STAMP_SET_CHANGED = "stamp_set_changed";
albero.AppFacade.STAMP_SELECTION_CHANGED = "stamp_selection_changed";
albero.AppFacade.PHONE_CALL_STARTED = "phone_call_started";
albero.AppFacade.PHONE_CALL_ACCEPTED = "phone_call_accepted";
albero.AppFacade.PHONE_CALL_CONNECTED = "phone_call_connected";
albero.AppFacade.PHONE_CALL_HANGED_UP = "phone_call_hangued_up";
albero.AppFacade.ACTION_SELECTION_CHANGED = "action_selection_changed";
albero.AppFacade.CURRENT_PAGE_CHANGED = "current_page_changed";
albero.AppFacade.CURRENT_PAGE_NOT_CHANGED = "current_page_not_changed";
albero.AppFacade.FILEINFO_SELECTION_CHANGED = "fileinfo_selection_changed";
albero.AppFacade.ERROR_OCCURRED = "error_occurred";
albero.AppFacade.UNREAD_COUNT_CHANGED = "brand_badge_changed";
albero.AppFacade.SEND_FORM_TOP_CHANGED = "send_form_top_changed";
albero.AppFacade.DATA_RECOVERED = "data_recovered";
albero.AppFacade.NOTIFY_UPDATE_USER = "notify_update_user";
albero.AppFacade.NOTIFY_ADD_FRIEND = "notify_add_friend";
albero.AppFacade.NOTIFY_ADD_ACQUAINTANCE = "notify_add_acquaintance";
albero.AppFacade.NOTIFY_DELETE_FRIEND = "notify_delete_friend";
albero.AppFacade.NOTIFY_DELETE_ACQUAINTANCE = "notify_delete_acquaintance";
albero.AppFacade.NOTIFY_UPDATE_DOMAIN_USERS = "notify_update_domain_users";
albero.AppFacade.GET_DOMAIN_USERS_RESPONSED = "get_domain_users_responsed";
albero.AppFacade.GET_USERS_RESPONSED = "get_users_responsed";
albero.AppFacade.GET_PROFILE_RESPONSED = "get_profile_responsed";
albero.AppFacade.UPDATE_USER_RESPONSED = "update_user_responsed";
albero.AppFacade.UPDATE_PROFILE_RESPONSED = "update_profile_responsed";
albero.AppFacade.NOTIFY_ADD_DOMAIN_INVITE = "notify_add_domain_invite";
albero.AppFacade.NOTIFY_ACCEPT_DOMAIN_INVITE = "notify_accept_domain_invite";
albero.AppFacade.NOTIFY_DELETE_DOMAIN_INVITE = "notify_delete_domain_invite";
albero.AppFacade.NOTIFY_JOIN_DOMAIN = "notify_join_domain";
albero.AppFacade.NOTIFY_UPDATE_DOMAIN = "notify_update_domain";
albero.AppFacade.NOTIFY_LEAVE_DOMAIN = "notify_leave_domain";
albero.AppFacade.NOTIFY_CREATE_PAIR_TALK = "notify_create_pair_talk";
albero.AppFacade.NOTIFY_CREATE_GROUP_TALK = "notify_create_group_talk";
albero.AppFacade.NOTIFY_UPDATE_GROUP_TALK = "notify_update_group_talk";
albero.AppFacade.NOTIFY_ADD_TALKERS = "notify_add_talkers";
albero.AppFacade.NOTIFY_DELETE_TALKER = "notify_delete_talker";
albero.AppFacade.NOTIFY_ADD_TALK_INVITE = "notify_add_talk_invite";
albero.AppFacade.NOTIFY_ACCEPT_TALK_INVITE = "notify_accept_talk_invite";
albero.AppFacade.NOTIFY_DELETE_TALK_INVITE = "notify_delete_talk_invite";
albero.AppFacade.NOTIFY_DELETE_TALK = "notify_delete_talk";
albero.AppFacade.NOTIFY_CREATE_MESSAGE = "notify_create_message";
albero.AppFacade.NOTIFY_UPDATE_READ_STATUSES = "notify_update_read_statuses";
albero.AppFacade.NOTIFY_UPDATE_TALK_STATUS = "notify_update_talk_status";
albero.AppFacade.NOTIFY_UPDATE_LOCAL_TALK_STATUS = "notify_update_local_talk_status";
albero.AppFacade.NOTIFY_GET_MESSAGES = "notify_get_messages";
albero.AppFacade.NOTIFY_GET_MESSAGE_READ_STATUS = "notify_get_message_status";
albero.AppFacade.CREATE_MESSAGE_START = "create_message_start";
albero.AppFacade.CREATE_MESSAGE_COMPLETE = "create_message_complete";
albero.AppFacade.CREATE_MESSAGE_FAIL = "create_message_fail";
albero.AppFacade.NOTIFY_CREATE_ANNOUNCEMENT = "notify_create_announcement";
albero.AppFacade.NOTIFY_UPDATE_ANNOUNCEMENT_STATUS = "notify_update_announcement_status";
albero.AppFacade.NOTIFY_GET_ANNOUNCEMENTS = "notify_get_announcements";
albero.AppFacade.NOTIFY_UPDATE_QUESTION = "notify_update_question";
albero.AppFacade.NOTIFY_GET_QUESTIONS = "get_questions_responsed";
albero.AppFacade.NOTIFY_CREATE_ATTACHMENT = "notify_create_attachment";
albero.AppFacade.NOTIFY_DELETE_ATTACHMENT = "notify_delete_attachment";
albero.AppFacade.GET_FILE_RESPONSED = "get_file_responsed";
albero.command.DomainCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.DomainCommand.NAME = "Domain";
albero.command.FileCommand.__meta__ = { fields : { api : { inject : null}, dataStore : { inject : null}, fileService : { inject : null}}};
albero.command.FileCommand.NAME = "File";
albero.command.LoadStampSetCommand.NAME = "LoadStampSet";
albero.command.LoadStampSetCommand.TAB_URL = "./json/app_ja.json";
albero.command.LoadStampSetCommand.TAB_PANE_URL = "./json/illust_category_ja.json";
albero.command.ManageFriendsCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.ManageFriendsCommand.NAME = "ManageFriends";
albero.command.ReadCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.ReadCommand.NAME = "Read";
albero.command.ReloadDataCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.ReloadDataCommand.NAME = "ReloadData";
albero.command.SelectTalkCommand.__meta__ = { fields : { dataStore : { inject : null}, settings : { inject : null}}};
albero.command.SelectTalkCommand.NAME = "SelectTalk";
albero.command.SendCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.SendCommand.NAME = "Send";
albero.command.SignInCommand.__meta__ = { fields : { api : { inject : null}, settings : { inject : null}, accountLoader : { inject : null}}};
albero.command.SignInCommand.NAME = "SignIn";
albero.command.SignOutCommand.__meta__ = { fields : { api : { inject : null}, settings : { inject : null}}};
albero.command.SignOutCommand.NAME = "SignOut";
albero.command.TalkCommand.__meta__ = { fields : { api : { inject : null}, dataStore : { inject : null}}};
albero.command.TalkCommand.NAME = "Talk";
albero.command.UpdateProfileCommand.__meta__ = { fields : { api : { inject : null}, dataStore : { inject : null}}};
albero.command.UpdateProfileCommand.NAME = "UpdateProfile";
albero.command.UpdateUserCommand.__meta__ = { fields : { api : { inject : null}}};
albero.command.UpdateUserCommand.NAME = "UpdateUser";
albero.command.UrlCommand.__meta__ = { fields : { routing : { inject : null}}};
albero.command.UrlCommand.NAME = "Url";
albero.entity.Message.MAX_READ_USER_IDS_COUNT = 16;
AlberoLog.DEBUG = false;
albero.js.TextCanonicalizer.HIRAGANA_SMALL_A = 12353;
albero.js.TextCanonicalizer.HIRAGANA_NN = 12435;
albero.js.TextCanonicalizer.KATAKANA_SMALL_A = 12449;
albero.proxy.AccountLoaderProxyFactory.NAME = "accountLoader";
puremvc.patterns.proxy.Proxy.NAME = "Proxy";
albero.proxy.AlberoBroadcastProxy.__meta__ = { fields : { api : { inject : null}, dataStore : { inject : null}, settings : { inject : null}}};
albero.proxy.AlberoBroadcastProxy.NAME = "broadcast";
albero.proxy.AlberoServiceProxy.__meta__ = { fields : { rpc : { inject : null}, settings : { inject : null}, dataStore : { inject : null}, fileService : { inject : null}}};
albero.proxy.AlberoServiceProxy.NAME = "api";
albero.proxy.AlberoServiceProxy.API_VERSION = "1.35";
albero.proxy.AppStateProxy.NAME = "appState";
albero.proxy.DataStoreProxy.NAME = "dataStore";
albero.proxy.DataStoreProxy.TYPE_FRIEND = 0;
albero.proxy.DataStoreProxy.TYPE_ACQUAINSTANCE = 1;
albero.proxy.DataStoreProxy.TYPE_NONE = 2;
albero.proxy.FileServiceProxy.__meta__ = { fields : { settings : { inject : null}}};
albero.proxy.FileServiceProxy.NAME = "fileService";
albero.proxy.FormatterProxy.__meta__ = { fields : { dataStore : { inject : null}, fileService : { inject : null}, settings : { inject : null}}};
albero.proxy.FormatterProxy.NAME = "formatter";
albero.proxy.MsgPackRpcProxy.__meta__ = { fields : { broadcast : { inject : null}}};
albero.proxy.MsgPackRpcProxy.NAME = "rpc";
albero.proxy.MsgPackRpcProxy.lastMsgId = 0;
albero.proxy._MsgPackRpcProxy.ConnectionKeeper.PING_INTERVAL_ON_CONNECTED = 45000;
albero.proxy.RoutingProxy.__meta__ = { fields : { settings : { inject : null}, dataStore : { inject : null}}};
albero.proxy.RoutingProxy.NAME = "routing";
albero.proxy.SettingsProxy.NAME = "settings";
albero.proxy.SettingsProxy.KEY_ACCESS_TOKEN = "access_token";
albero.proxy.SettingsProxy.KEY_SELECTED_DOMAIN_ID_H = "selected_domain_id_h";
albero.proxy.SettingsProxy.KEY_SELECTED_DOMAIN_ID_L = "selected_domain_id_l";
albero.proxy.SettingsProxy.COOKIE_KEY_SEND_BY_ENTER = "send-by-enter";
albero.proxy.SettingsProxy.COOKIE_EXPIRES_SEND_BY_ENTER = 31536000;
albero.proxy.SettingsProxy.KEY_SELECTED_STAMP_TAB_ID = "selected_stamp_tab_id";
albero.proxy.SettingsProxy.KEY_INPUT_TEXT = "input_text";
albero.proxy.SettingsProxy.KEY_COPY_PROFILE_TO_ALL_DOMAINS = "copy_profile_to_all_domains";
puremvc.patterns.mediator.Mediator.NAME = "Mediator";
albero_cli.mediator.CommandLineMediator.__meta__ = { fields : { dataStore : { inject : null}, api : { inject : null}, hubotObject : { inject : null}, messageEvent : { inject : null}}};
albero_cli.mediator.CommandLineMediator.NAME = "commandline";
albero_cli.proxy.HubotObjectProxy.__meta__ = { fields : { dataStore : { inject : null}}};
albero_cli.proxy.HubotObjectProxy.NAME = "hubotObject";
albero_cli.proxy.MessageEventProxy.__meta__ = { fields : { dataStore : { inject : null}, hubotObject : { inject : null}}};
albero_cli.proxy.MessageEventProxy.NAME = "messageEvent";
albero_cli.proxy.SendQueueProxy.__meta__ = { fields : { messageEvent : { inject : null}}};
albero_cli.proxy.SendQueueProxy.NAME = "sendQueue";
albero_cli.proxy.SendQueueProxy.MIN_SEND_SPAN = 500;
haxe.ds.ObjectMap.count = 0;
haxe.io.Output.LN2 = Math.log(2);
js.NodeC.UTF8 = "utf8";
js.NodeC.ASCII = "ascii";
js.NodeC.BINARY = "binary";
js.NodeC.BASE64 = "base64";
js.NodeC.HEX = "hex";
js.NodeC.EVENT_EVENTEMITTER_NEWLISTENER = "newListener";
js.NodeC.EVENT_EVENTEMITTER_ERROR = "error";
js.NodeC.EVENT_STREAM_DATA = "data";
js.NodeC.EVENT_STREAM_END = "end";
js.NodeC.EVENT_STREAM_ERROR = "error";
js.NodeC.EVENT_STREAM_CLOSE = "close";
js.NodeC.EVENT_STREAM_DRAIN = "drain";
js.NodeC.EVENT_STREAM_CONNECT = "connect";
js.NodeC.EVENT_STREAM_SECURE = "secure";
js.NodeC.EVENT_STREAM_TIMEOUT = "timeout";
js.NodeC.EVENT_STREAM_PIPE = "pipe";
js.NodeC.EVENT_PROCESS_EXIT = "exit";
js.NodeC.EVENT_PROCESS_UNCAUGHTEXCEPTION = "uncaughtException";
js.NodeC.EVENT_PROCESS_SIGINT = "SIGINT";
js.NodeC.EVENT_PROCESS_SIGUSR1 = "SIGUSR1";
js.NodeC.EVENT_CHILDPROCESS_EXIT = "exit";
js.NodeC.EVENT_HTTPSERVER_REQUEST = "request";
js.NodeC.EVENT_HTTPSERVER_CONNECTION = "connection";
js.NodeC.EVENT_HTTPSERVER_CLOSE = "close";
js.NodeC.EVENT_HTTPSERVER_UPGRADE = "upgrade";
js.NodeC.EVENT_HTTPSERVER_CLIENTERROR = "clientError";
js.NodeC.EVENT_HTTPSERVERREQUEST_DATA = "data";
js.NodeC.EVENT_HTTPSERVERREQUEST_END = "end";
js.NodeC.EVENT_CLIENTREQUEST_RESPONSE = "response";
js.NodeC.EVENT_CLIENTRESPONSE_DATA = "data";
js.NodeC.EVENT_CLIENTRESPONSE_END = "end";
js.NodeC.EVENT_NETSERVER_CONNECTION = "connection";
js.NodeC.EVENT_NETSERVER_CLOSE = "close";
js.NodeC.FILE_READ = "r";
js.NodeC.FILE_READ_APPEND = "r+";
js.NodeC.FILE_WRITE = "w";
js.NodeC.FILE_WRITE_APPEND = "a+";
js.NodeC.FILE_READWRITE = "a";
js.NodeC.FILE_READWRITE_APPEND = "a+";
msgpack.Encoder.FLOAT_SINGLE_MIN = 1.40129846432481707e-45;
msgpack.Encoder.FLOAT_SINGLE_MAX = 3.40282346638528860e+38;
msgpack.Encoder.FLOAT_DOUBLE_MIN = 4.94065645841246544e-324;
msgpack.Encoder.FLOAT_DOUBLE_MAX = 1.79769313486231570e+308;
DirectAPI.main();
})(typeof window != "undefined" ? window : exports);
