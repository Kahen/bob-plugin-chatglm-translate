/**
 * 由于各大服务商的语言代码都不大一样，
 * 所以我定义了一份 Bob 专用的语言代码，以便 Bob 主程序和插件之间互传语种。
 * Bob 语言代码列表 https://ripperhe.gitee.io/bob/#/plugin/addtion/language
 *
 * 转换的代码建议以下面的方式实现，
 * `xxx` 代表服务商特有的语言代码，请替换为真实的，
 * 具体支持的语种数量请根据实际情况而定。
 *
 * Bob 语言代码转服务商语言代码(以为 'zh-Hans' 为例): var lang = langMap.get('zh-Hans');
 * 服务商语言代码转 Bob 语言代码: var standardLang = langMapReverse.get('xxx');
 */

var items = [
  ["auto", "中文简体"],
  ["zh-Hans", "中文简体"],
  ["zh-Hant", "中文繁体"],
  ["yue", "粤语"],
  ["wyw", "文言文"],
  ["pysx", "拼音缩写"],
  ["en", "英语"],
  ["ja", "日语"],
  ["ko", "韩语"],
  ["fr", "法语"],
  ["de", "德语"],
  ["es", "西班牙语"],
  ["it", "意大利语"],
  ["ru", "俄语"],
  ["pt", "葡萄牙语"],
  ["nl", "荷兰语"],
  ["pl", "波兰语"],
  ["ar", "阿拉伯语"],
];

var langMap = {};

items.forEach(([code, name]) => {
  langMap[code] = name;
});

var langMapReverse = new Map(
  items.map(([standardLang, lang]) => [lang, standardLang])
);

function supportLanguages() {
  return items.map(([standardLang, lang]) => standardLang);
}

function translate(query, completion) {
  $log.info('开始翻译流程');
  $log.info('查询文本: ' + query.text);
  $log.info('源语言: ' + query.from);
  $log.info('目标语言: ' + query.to);

  $http.request({
    method: "POST",
    url: "https://open.bigmodel.cn/api/v1/agents",
    header: {
      Authorization: $option.APIkey,
      "Content-Type": "application/json",
    },
    body: {
      agent_id: "general_translation",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: query.text
        }]
      }],
      custom_variables: {
        source_lang: langMap[query.detectFrom],
        target_lang: langMap[query.detectTo]
      }
    },
    handler: function (resp) {
      $log.info('收到响应');
      $log.error('翻译调试:'+ JSON.stringify($http.request.url));
      $log.error('翻译调试:'+ JSON.stringify($http.request.body));
      $log.error('翻译调试:'+ JSON.stringify($http.request.headers));
      if (resp.error) {
        $log.error('翻译出错:'+ JSON.stringify(resp));
        $log.info('翻译出错: ' + JSON.stringify(resp.error));
        completion({ error: resp.error });
        return;
      }

      $log.info('响应数据: ' + JSON.stringify(resp.data));
      var translatedText = resp.data.choices[0].messages[0].content.text;
      $log.info('翻译结果: ' + translatedText);
      
      completion({
        result: {
          toParagraphs: [translatedText]
        }
      });
    }
  });
}