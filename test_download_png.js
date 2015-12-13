var webPage = require('webpage');
var page = webPage.create();
page.viewportSize = { width: 100, height: 40 };
page.open("http://login.sina.com.cn/cgi/pin.php?r=68610298&s=0&p=gz-3213b5c7291fda5a3012940faa3debda4e92",function(){
  page.render("test.png",{format:"png",quality:"100"});
});