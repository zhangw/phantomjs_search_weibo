require('./Polyfill');
var utils = require('./utils');
var log = utils.log;
var progressbar = utils.progressbar;
var search_tasks = [];
var save_topic = require('./save_topic_to_files').save_topic_to_file;

var searchTopic = function(page, topic, pagenum, interval) {
  var url = utils.getSearchTopicUrl(topic, pagenum);
  var waiting_search_page = progressbar.start('Loading page:' + (pagenum || 1));
  page.open(url, function(status) {
    if (status !== 'success') {
      progressbar.stop(waiting_search_page);
      console.log('Unable to access network, try to reload page after 60 seconds.');
      progressbar.stop();
      //clear all the other tasks and only just try to restart the broken task
      search_tasks.forEach(function(ele){clearTimeout(ele.task_id)});
      var retry_task_id = setTimeout(function(){searchTopic(page, topic, pagenum)}, 60*1000);
      var retry_task = {};
      retry_task[pagenum] = retry_task_id;
      search_tasks.push(retry_task);
    } else {
      //NOTE：这里使用injectJs加载本地的js，使用includeJs不仅需要额外的网络请求，而且必须使用回调函数，而在回调函数中调用setTimeout进行下一次请求会导致一个严重的BUG！
      if (page.injectJs('jquery.min.js')) {
        var results = page.evaluate(function() {
          //判断话题搜索结果
          var noresult = $('p[class="noresult_tit"]').text().trim();
          if (noresult) {
            return noresult;
          }
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
              pics = [pics.src.replace("thumbnail", "mw1024").replace("square", "mw1024")]
            else if (!pics) {
              //多图的获取
              //pics = container.querySelectorAll("img[action-type='fl_pics']");
              pics = $(container).find("img[action-type='fl_pics']");
              if (pics.length) {
                pics = pics.toArray();
                pics = pics.map(function(ele, index) {
                  return ele.src.replace("square", "mw1024")
                })
              } else {
                pics = [];
              }
            } else {
              pics = [];
            }
            user_with_pics.push({
              'user_nick_name': user_nick_name,
              'pics': pics
            })
          }
          //var current_page = $("div[class='W_pages'] a[action-type='feed_list_page_more']").text();
          //var prev_page = $("div[class='W_pages'] a[class^='page prev']");
          var next_page = $("div[class='W_pages'] a[class^='page next']");
          if (next_page.length) {
            //是否有下一页
            next_page = next_page.attr('href').split('&page=')[1];
          } else {
            next_page = false;
          }
          return [user_with_pics, next_page]
        });
        progressbar.stop(waiting_search_page);
        if (typeof results !== "string" && results[1]) {
          var user_with_pics = results[0];
          log(user_with_pics);
          save_topic.save(user_with_pics);
          search_tasks.shift();
          var next_page = results[1];
          //15秒后再进行下一页的请求, 避免请求过频
          progressbar.start('request next page after ' + interval +' seconds...');
          task_id = setTimeout(function() {
            progressbar.stop();
            searchTopic(page, topic, next_page)
          }, interval * 1000);
          var task = {};
          task[next_page] = task_id;
          search_tasks.push(task);
        } else {
          if(typeof results === "string")
            log(results)
          else{
            var user_with_pics = results[0];
            save_topic.save.call(save_topic, user_with_pics);
            log(user_with_pics);
            console.log('No more pages to search, last page number is:', pagenum || 1);
          }
          //phantom.exit();
        }
      }else{
        //TODO:处理不能使用jquery.min.js解析数据的异常
      }
    }
  });
}
exports.searchTopic = searchTopic;