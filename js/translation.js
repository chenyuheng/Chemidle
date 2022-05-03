const lang_dict = {
    "default": {
        "help": "How to Play",
        "help-1": "Guess the <span style='font-weight: bold;'>Chemidle</span> in six tries! Which is a chemical equation.",
        "help-2": "This chemical equation contains only the first 20 elements in the periodic table, with coefficient(s) not greater than 6. The length of the equation is not fixed, with number of tokens no more than 15. The reaction conditions and reaction phenomena are ommitted.",
        "help-3": "After each guess, the color of the tokens will indicate the target chemical equation: grey indicates not exist; yellow indicates existence but in wrong place; green indicates correctness.",
        "help-4": "Each guess must contain one → symbol, and the number of atoms must be balanced in both sides.",
        "help-5": "When a whole row is green, congraduations, you win!",
        "statistics": "Statistics",
        "played": "Played",
        "win-rate": "Win Rate %",
        "remainnig-time": "Next Chemidle",
        "settings": "Settings",
        "clear-localstorage": "Clear local storage",
        "language": "language",
        "feedback": "Feedback",
        "issues": "Issues",
        "project": "Project address",
        "github": "GitHub",
        "invalid-equation": "Invalid equation",
        "nice": "Nice!",
        "target-equation": "Guess incorrect, the target equation is: ",
        "share": "Share",
        "share-text-clipboard": "https://Chemidle.com/ Chemical equation Wordle",
        "share-text": "Chemical equation Wordle",
        "copy-clip-button": "Copy to clipboard",
        "share-button": "Share to ...",
        "copied": "Copied"
    },
    "zh": {
        "help": "游戏规则",
        "help-1": "你有六次机会猜一个<span style='font-weight: bold;'>化学方程式</span>。",
        "help-2": "这个化学方程式只包含元素周期表的前 20 号元素，系数不超过 6。方程式长度不定，但其符号数量不超过 15。反应条件和反应现象均省略。",
        "help-3": "每次猜测之后，化学方程式中符号的颜色会指示你的猜测结果。灰色表示答案方程式中没有这个符号；黄色表示答案方程式中存在该符号，但不在该位置；绿色表示答案中在该位置就是该符号。",
        "help-4": "每次猜测的方程式必须只包含一个→符号，且左右两边原子数量配平。",
        "help-5": "当整行都是绿色时，恭喜你，猜到正确答案了！",
        "statistics": "统计",
        "played": "游玩次数",
        "win-rate": "胜率 %",
        "remainnig-time": "距离下一次还有",
        "settings": "设置",
        "clear-localstorage": "清空本地数据",
        "language": "语言",
        "feedback": "反馈",
        "issues": "Issues",
        "project": "项目地址",
        "github": "GitHub",
        "invalid-equation": "方程式不合法",
        "nice": "赞！",
        "target-equation": "猜错了，目标方程式是：",
        "share": "分享",
        "share-text-clipboard": "https://Chemidle.com/ 化学方程式 Wordle",
        "share-text": "化学方程式 Wordle",
        "copy-clip-button": "复制到剪贴板",
        "share-button": "分享到…",
        "copied": "已复制"
    }
};

var lang = "";

function get_lang() {
    if (lang != "") {
        return lang;
    }
    let lang_url = new URLSearchParams(window.location.search).get("lng");
    if (lang_url) {
        return lang_url.substring(0,2);
    }
    if (localStorage.getItem("language") != null) {
        return localStorage.getItem("language").substring(0, 2);
    }
    let language = window.navigator.userLanguage || window.navigator.language;
    return language.substring(0, 2);
}

function translate_all() {
    let lang = get_lang();
    localStorage.setItem("language", lang);
    let dict = lang_dict["default"];
    if (lang in lang_dict) {
        dict = lang_dict[lang];
    }
    $("[i18n-key]").each(
        function(index, node){
            $(this).html(dict[$(this).attr("i18n-key")]);
        }
    )
}

function translate(key) {
    let lang = get_lang();
    localStorage.setItem("language", lang);
    let dict = lang_dict["default"];
    if (lang in lang_dict) {
        dict = lang_dict[lang];
    }
    return dict[key];
}