# phantomjs_search_weibo
search topics of sina weibo by phantomjs
run command:
`phantomjs login_and_search_topic.js --username xxx --password xxx`
with optional args:
```
--topic 恒大VS巴萨 
--interval 5 
--server {hostname}:{port}/weibos
--size large
```

TODO:
 - [x]搜索时，时常不能返回数据结果，通过重新请求来修复。
