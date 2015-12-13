var utils = require('./utils');
var sinaSSOEncoder = require('./sinassobase').sinaSSOEncoder;
var input_authcode = function() {
  var consoleRead = utils.consoleRead;
  return consoleRead("输入你收到的短信验证码:");
}
console.log('ready to login into sina...');
var page = require('webpage').create();
page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.107 Safari/537.36";
page.customHeaders = {
  "Connection:": "keep-alive"
};
var user = "18994047347";
user = sinaSSOEncoder.getSuByUsername(user);

var preloginurl = "http://login.sina.com.cn/sso/prelogin.php?entry=weibo&callback=sinaSSOController.preloginCallBack&su=" + user +
  "&rsakt=mod&checkpin=1&client=ssologin.js(v1.4.18)&_=" + (new Date).getTime();
var loginurl = 'http://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.18)';
page.open(preloginurl, function(status) {
  if (status != "success") {
    console.log("unable to access network");
  } else {
    var content = page.content;
    var regex = /\{(.*)\}/;
    console.log(content);
    var ret_json = JSON.parse(regex.exec(content)[0]);
    if (ret_json.smsurl) {
      var smsurl = ret_json.smsurl.concat("&_t=1&callback=STK_", (new Date).getTime().toString(), "1");
      smsurl = smsurl.split("&amp;").join("&");
      console.log(smsurl);
      //send sms to user
      //TODO:
      page.open(smsurl, function(status) {
        if (status == 'success') {
          console.log(page.content);
          console.log("please waiting the sms...");
          var authcode = input_authcode();
          var e = new sinaSSOEncoder.RSAKey;
          e.setPublic(ret_json.pubkey, "10001");
          //encrypt data by rsa2
          var sp = e.encrypt([ret_json.servertime, ret_json.nonce].join("\t") + "\n" + authcode);
          var postdata = {
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
          //login into weibo
          page.open(loginurl, 'post', postdata, function(status) {
            if (status == 'success') {
              console.log('正在登录...');
            }else{
              console.log('登录失败!', page.content);
              //phantom.exit();
            }
          });
        }
      });
    }
  }
});