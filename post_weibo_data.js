var webpage = require('webpage');
var utils = require('./utils');
var args = utils.argsParse();

/*
  将按页获取的weibo元数据提交至服务器，服务器会进行后续的处理
 */
function postWeiboData(weibos) {
  var page = webpage.create();
  var settings = {
    operation: "POST",
    encoding: "utf8",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify({
      'weibos': weibos
    })
  };
  page.open(args.server, settings, function(status){
    if(status !== 'success'){
      console.error('post weibo data to server:',status);
    }else{
      console.debug('post weibo data to server and response is:',page.plainText);
    }
  });
}

exports.postWeiboData = postWeiboData;