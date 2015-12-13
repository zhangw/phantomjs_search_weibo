require('./Polyfill');
var utils = require('./utils');
var log = utils.log;
var page = require('webpage').create();
var sys = require('system');
var url = 'http://s.weibo.com/weibo/%2523%25E6%25AF%258F%25E5%25A4%25A9%25E4%25B8%2591%25E4%25B8%2580%25E5%258F%2591%2523?topnav=1&wvr=6&b=1';
sys.args.length == 2 && sys.args[1] && (url = sys.args[1]);



page.open(url, function(status) {
  if (status !== 'success') {
    console.log('Unable to access network');
  } else {
    //cdn.bootcss.com/jquery/2.1.0-rc1/jquery.min.js
    page.includeJs("//cdn.bootcss.com/jquery/2.1.0-rc1/jquery.min.js", function() {
      var results = page.evaluate(function() {
        var user_with_pics = [];
        //微博数据列表的容器
        var wrapper = STK.selector("div[action-type='feed_list_item']");
        for (var i = 0; i < wrapper.length; i++) {
          var container = wrapper[i];
          //getUser
          var user = container.querySelector("a[nick-name]");
          //<a class="W_texta W_fb" nick-name="啊什么你说什么我听不清楚" href="http://weibo.com/rockerhe" target="_blank" title="啊什么你说什么我听不清楚"
          //suda-data="key=tblog_search_weibo&amp;value=weibo_ss_1_name">xxx</a>
          var user_nick_name = user.getAttribute("nick-name");
          var pics = container.querySelector("img[class='bigcursor']");
          //<img class="bigcursor" suda-data="key=tblog_search_weibo&value=weibo_ss_2_pic"
          //action-data="uid=2411766022&mid=3918147427640298" action-type="feed_list_media_img"
          //src="http://ww3.sinaimg.cn/thumbnail/8fc0a106jw1eyte4gcghyj20e80e83zb.jpg"></img>
          if (pics && pics.src)
            pics = [pics.src.replace("thumbnail", "bmiddle")]
          else if (!pics) {
            //多图的获取
            //pics = container.querySelectorAll("img[action-type='fl_pics']");
            pics = $(container).find("img[action-type='fl_pics']");
            if (pics.length) {
              pics = pics.toArray();
              pics = pics.map(function(ele, index) {
                return ele.src.replace("square", "bmiddle")
              })
            }else{
              pics = [];
            }
          }
          else{
            pics = [];
          }
          user_with_pics.push({
            'user_nick_name': user_nick_name,
            'pics': pics
          })
        }
        return user_with_pics
      });
      log(results);
      phantom.exit();
    })
  }
});