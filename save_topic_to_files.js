var fs = require('fs');
var webpage = require('webpage');
var args = require('./utils').argsParse();

/*
  这种保存微博搜索信息的方法只适合演示对fs模块的使用，已经废弃！
 */
function saveTopicToFile(){
  var working_directory = args.output;
  if(fs.isAbsolute(working_directory)){
    if(fs.makeDirectory(working_directory) || fs.isDirectory(working_directory)){
      this.working_directory = working_directory;
      return this;
    }
  }else{
    var path = [fs.workingDirectory, working_directory].join(fs.separator);
    path = fs.absolute(path);
    if(fs.makeDirectory(path) || fs.isDirectory(path)){
      this.working_directory = path;
      return this;
    }
  }
  console.error(working_directory, ':this directory is unable to access or not exists.');
  return null;
}

function save(result, topic) {
  //result:[{'user_nick_name': user_nick_name, 'pics': pics}...]
  topic = topic || args.topic;
  if (topic && result) {
    var working_directory = this.working_directory;
    //'{working_directory}'/'{topic}/{user_name}/{pic_id}'
    var page = webpage.create();
    page.customHeaders = {
      "Accept": "image/png,image/*;q=0.8,*/*;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "en-US,en;q=0.5",
      "Connection": "keep-alive"
    };
    page.settings.resourceTimeout = 5000;
    page.viewportSize = { width: 1440, height: 900 };
    var index = 1;
    result.forEach(function(ret) {
      var user_directory = ret.user_nick_name;
      ret.pics.forEach(function(pic) {
        var pic_http_path = pic.split('/');
        var pic_id = pic_http_path[pic_http_path.length - 1];
        var pic_type = pic_id.split('.')[1];
        setTimeout(function() {
          page.open(pic, function(status) {
            if (status !== 'success') {
              //TODO:下载照片失败，存入失败的队列
              console.error('download pic:', pic, " ", status);
            } else {
              //保存照片到本地
              var pic_fullname = fs.absolute([working_directory, topic, user_directory, pic_id].join(fs.separator));
              try {
                //console.debug(pic_fullname);
                //TODO:用这样的方式保存图片，图片的大小尺寸会有问题，并不推荐这种实现
                page.render(pic_fullname, {
                  format: pic_type
                });
              } catch (e) {
                //TODO:保存照片失败，存入失败的队列
                console.error('save pic:', pic_fullname, " ", e.toString());
              }
            }
          })
        }, index * args.interval * 1000);
        index++;
      });
    });
  }
}
saveTopicToFile.prototype.save = save;

exports.save_topic_to_file = new saveTopicToFile();