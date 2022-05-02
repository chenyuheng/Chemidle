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
        "remainnig-time": "Next Chemidle"
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
        "remainnig-time": "距离下一次还有"
    }
};

function get_lang() {
    let lang_url = new URLSearchParams(window.location.search).get("lng");
    if (lang_url) {
        return lang_url.substring(0,2);
    }
    let language = window.navigator.userLanguage || window.navigator.language;
    return language.substring(0, 2);
}

function translate() {
    let lang = get_lang();
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