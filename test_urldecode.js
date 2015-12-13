//test urldecode method
var urldecode = require('./utils').urldecode;
str_bgk_hex = '%CA%E4%C8%EB%B5%C4%D1%E9%D6%A4%C2%EB%B2%BB%D5%FD%C8%B7';
urldecode(str_bgk_hex,'gbk',function(str){
  console.log('gbk编码的字符串:', str_bgk_hex, "经过<script charset='gbk' src='...'/>解析==>", str);
  console.log('字符串:', str, '被encodeURI编码成utf-8格式==>', window.encodeURI(str));
});