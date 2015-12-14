var utils = require('./utils');
var searchTopic = require('./search_topic').searchTopic;
var args = utils.argsParse();

var sinaSSOEncoder = require('./sinassobase').sinaSSOEncoder;
var input_authcode = function() {
  var consoleRead = utils.consoleRead;
  return consoleRead("请输入位于程序运行目录下的图片*pin.png*的验证码:");
}
var login_error = function(errmsg){
  if(errmsg)
    console.log(errmsg);  
  else
    console.log('login failed!', '检查用户名和密码，重新尝试登录!');
  phantom.exit();
}

console.log('ready to login into sina...');
var page = require('webpage').create();
page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.107 Safari/537.36";
page.customHeaders = {
  "Connection:": "keep-alive"
};
var user = args.username;
var password = args.password;
user = sinaSSOEncoder.getSuByUsername(user);
var topic = args.topic || '主要看气质';
var interval = parseInt(args.delay) || 15;

var preloginurl = "http://login.sina.com.cn/sso/prelogin.php?entry=weibo&callback=sinaSSOController.preloginCallBack&su=" + user +
  "&rsakt=mod&checkpin=1&client=ssologin.js(v1.4.18)&_=" + (new Date).getTime();
var pincodeurl = "http://login.sina.com.cn/cgi/pin.php";
var loginurl = 'http://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.18)';
page.open(preloginurl, function(status) {
  if (status != "success") {
    console.log("unable to access network");
  } else {
    var content = page.content;
    var regex = /\{(.*)\}/;
    //console.log(content);
    var ret_json = JSON.parse(regex.exec(content)[0]);
    utils.log(ret_json);
    if (ret_json.pcid) {
      //request the captchat and download it to the local
      var _pincodeurl = utils.getPinCodeUrl(ret_json.pcid, pincodeurl);
      console.log(_pincodeurl);

      page.customHeaders = {
        "Accept": "image/png,image/*;q=0.8,*/*;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive"
      };
      page.viewportSize = { width: 100, height: 40 };
      page.open(_pincodeurl, function(status) {
        if (status == 'success') {
          page.render("pin.png",{format:"png",quality:"100"});
          console.log("please waiting the captcha...");
          var authcode = input_authcode();
          var e = new sinaSSOEncoder.RSAKey;
          e.setPublic(ret_json.pubkey, "10001");
          //encrypt username and password
          var sp = e.encrypt([ret_json.servertime, ret_json.nonce].join("\t") + "\n" + password);
          var postdata = {
            'door': authcode,
            'entry': 'weibo',
            'gateway': '1',
            'from': '',
            'savestate': '7',
            'userticket': '1',
            'pagerefer': '',
            'cfrom': '1',
            'vsnf': '1',
            'su': user,
            'service': 'miniblog',
            'servertime': ret_json.servertime,
            'nonce': ret_json.nonce,
            'pwencode': 'rsa2',
            'rsakv': ret_json.rsakv,
            'pcid': ret_json.pcid,
            'sp': sp,
            'sr': '1440*900',
            'encoding': 'UTF-8',
            'prelt': '503',
            'url': 'http://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack',
            'returntype': 'META'
          };
          page.customHeaders = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Connection": "keep-alive"
          };
          postdata = utils.httpBuildQuery(postdata);
          page.open(loginurl, 'post', postdata, function(status) {
            if (status == 'success') {
              var waiting = utils.progressbar.start('Sign up.');
              //try to delay 5s for waiting the response from sina SSO authentication
              setTimeout(function(){
                utils.progressbar.stop(waiting);
                if (page.cookies.some(function(ele,index){return ele.name === "SSOLoginState"})){
                  console.log("login successfully!");
                  //开始搜索数据
                  searchTopic(page, topic, undefined, interval);
                }else{
                  login_error();
                }
              },5000);
            }else{
              var regex = /location\.replace\(.*\)/;
              //获取出错的信息，因为页面是gbk的编码设定，使用了辅助方法urldecode解析，否则默认的utf编码会导致乱码
              if(regex.test(page.content)){
                a = regex.exec(page.content)[0].split('&').filter(function(ele,index){return ele.startsWith('retcode=') || ele.startsWith('reason=')});
                var ret = [];
                a.forEach(function(ele,index){utils.urldecode(ele.replace('")',""),'gb2312',function(str){ret.push(str.split('=')[1]);})}); 
                //解码的方法实际上更新了DOM，并通过回调函数设置返回值，这里读取返回值变量时，使用setTimeout(...,0)
                setTimeout(function(){login_error(['login failed!', 'errcode:', ret[0], 'errmsg:', ret[1]].join(" "))},0);
                setTimeout(function(){if(ret.every(function(ele){return ele === undefined})){
                  login_error();
                }},100);
              }
            }
          });
        }
      });
    }
  }
});

