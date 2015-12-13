var _console = console;
function log(obj) {
  if (obj) {
    if (Array.isArray(obj)) {
      obj.forEach(function(ele, index) {
        log(ele)
      });
    }
    else if(typeof obj === 'object'){
      for (var i in obj) {
         log(i + ':==>');
         log(obj[i]);
      }
    }
    else {
      _console.log(obj)
    }
  }
}

/* 
  method used to prepare the data need to post with content-type:application/x-www-form-urlencoded
 */
function httpBuildQuery(a) {
  if (typeof a != "object")
    return "";
  var b = [];
  for (var c in a) {
    if (typeof a[c] == "function")
      continue;
    b.push(c + "=" + encodeURIComponent(a[c]))
  }
  return b.join("&")
}

/*
  method used to read input of the user
 */
function consoleRead(interactive_str) {
  var system = require('system');
  if (interactive_str)
    system.stdout.writeLine(interactive_str);
  var line = system.stdin.readLine();
  return line;
}

function stdout(s){
  var system = require('system');
  system.stdout.write(s);
}

/*
  method used to generate the request url of the pincode
 */
function getPinCodeUrl(pcid,baseurl,a) {
  a == undefined && (a = 0);
  return baseurl + "?r=" + Math.floor(Math.random() * 1e8) + "&s=" + a + (pcid.length > 0 ? "&p=" + pcid : "")
}

/*
  method used to decode with the specific charset,such as gb2312.
  reference:http://zcw.me/blogwp/front-end-urldecode-gbk/
  for example:
  str = 'http://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack&retcode=2070&reason=%CA%E4%C8%EB%B5%C4%D1%E9%D6%A4%C2%EB%B2%BB%D5%FD%C8%B7';
  urldecode(str, 'gb2312', function(str_decode){console.log(str_decode)});
 */
function urldecode(str, charset, callback) {
  window._urlDecodeFn_ = callback;
  var script = document.createElement('script');
  script.id = '_urlDecodeFn_';
  var src = 'data:text/javascript;charset=' + charset + ',_urlDecodeFn_("' + str + '");'
  src += 'document.getElementById("_urlDecodeFn_").parentNode.removeChild(document.getElementById("_urlDecodeFn_"));';
  script.src = src;
  document.body.appendChild(script);
}

String.prototype.startsWith = function(s){return this.indexOf(s) === 0};

/*
  helper for handling program arguments
 */
function argsParse(){
  var sys = require('system');
  var args = sys.args;
  var help_str = "command: phantomjs Crawler_weibo.js --username your_weibo_id --password your_weibo_password\n";
  var arg_names = ['--username','--password'];
  var _args_parse_error = function(){
    console.log('输入的参数格式不正确\n',help_str);
    phantom.exit();
  }
  if(args.length ===1 || args.length <= arg_names.length){
    _args_parse_error();
  }
  var current_arg, args_parsed = {};
  while((current_arg = args.shift()) !== undefined){
    if((i = arg_names.indexOf(current_arg)) > -1){
      _current_arg = current_arg.replace("--","");
      args_parsed[_current_arg] = args.shift();
      arg_names.splice(i,1);
    }
  }
  if(arg_names.length === 0 ){
    log(args_parsed);
    return args_parsed;
  }else{
    _args_parse_error();
  }
}

exports.log = log;
exports.httpBuildQuery = httpBuildQuery;
exports.consoleRead = consoleRead;
exports.getPinCodeUrl = getPinCodeUrl;
exports.urldecode = urldecode;
exports.argsParse = argsParse;
exports.stdout = stdout;


