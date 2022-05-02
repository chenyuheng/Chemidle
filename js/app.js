const row_length = 15;
const row_number = 6;
const token_set = [
    "He", "Li", "Be", "Na", "Mg", "Al", "Si",  "Cl", "Ca", "He", "Ne", "Ar",
    "H", "B", "C", "N", "O", "F", "P", "S", "K",
    "1", "2", "3", "4", "5", "6", 
    "→", "+", "(", ")"];

const number_tokens = ["1", "2", "3", "4", "5", "6"];

const keyboard_chars = [
    ["H", "1", "2", "3", "4", "5", "6", "He"],
    ["Li", "Be", "B", "C", "N", "O", "F", "Ne"],
    ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"],
    ["K", "Ca", "+", "→", "(", ")", "←", "J"]
]

const key_icons = {
    "←": {
        "name": "backspace",
        "color": "red"
    },
    "J": {
        "name": "arrow-return-left",
        "color": "green"
    }
}

var current_row = 0;
var current_col = 0;
var target_equation = "";

Array.prototype.count = function(element) {
    return this.filter(x => x == element).length;
}

Array.prototype.split = function(element) {
    let items = [];
    let item = [];
    for (let i = 0; i < this.length; i++) {
        if (this[i] == element) {
            items.push(item);
            item = [];
            continue;
        }
        item.push(this[i]);
    }
    items.push(item);
    return items;
}

Object.prototype.add = function(key, number) {
    if (this[key] == undefined) {
        this[key] = 0;
    }
    this[key] += number;
}

Date.prototype.toString = function() {
    return this.toISOString().slice(0, 10);
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function equation_tokenizer(equation_str, length=-1) {
    let tokens = [];
    let i = 0;
    while (i < equation_str.length) {
        let found = false;
        for (token_i in token_set) {
            token = token_set[token_i]
            let co = equation_str.substring(i, i + token.length);
            if (token == equation_str.substring(i, i + token.length)) {
                tokens.push(token);
                i += token.length;
                found = true;
                break;
            }
        }
        if (!found) {
            console.error("tokenizer error: " + equation_str.substring(i));
            return;
        }
    }
    if (length != -1) {
        while (tokens.length < length) {
            tokens.push("");
        }
    }
    return tokens;
}

function item_parser(item_tokens) {
    let item = {"count": 1, "atoms": {}};
    item["atoms"] = {};
    if (number_tokens.includes(item_tokens[0])) {
        item["count"] = parseInt(item_tokens[0]);
        item_tokens.shift();
    }
    let in_paren = false;
    let paren_count = {};
    while (item_tokens.length != 0) {
        if (!in_paren) {
            if (item_tokens[0] == "(") {
                in_paren = true;
                item_tokens.shift();
                continue;
            }
            if (number_tokens.includes(item_tokens[1])) {
                item["atoms"].add(item_tokens[0], parseInt(item_tokens[1]));
                item_tokens.shift();
            } else {
                item["atoms"].add(item_tokens[0], 1);
            }
            item_tokens.shift();
        } else {
            if (item_tokens[0] == "(") {
                console.error("parse item: double start parenthesis");
                return;
            }
            if (item_tokens[0] == ")") {
                in_paren = false;
                let count = parseInt(item_tokens[1]);
                if (count == NaN) {
                    console.error("parse item: not number after ')'");
                    return;
                }
                for (key in paren_count) {
                    if (key != "add") {
                        item["atoms"].add(key, paren_count[key] * count);
                    }
                }
                item_tokens.shift();
                item_tokens.shift();
                paren_count = {};
            } else {
                if (number_tokens.includes(item_tokens[1])) {
                    paren_count.add(item_tokens[0], parseInt(item_tokens[1]));
                    item_tokens.shift();
                } else {
                    paren_count.add(item_tokens[0], 1);
                }
                item_tokens.shift();
            }
        }

    }
    if (in_paren) {
        console.error("parse item: parenthesis not closed");
        return;
    }
    return item;
}

function half_equation_parser(tokens) {
    let items = [];
    let items_tokens = tokens.split("+");
    for (let i = 0; i < items_tokens.length; i++) {
        let item = items_tokens[i];
        if (item.length == 0) {
            console.error("parser error: empty item");
            return;
        }
        items.push(item_parser(item));
    }
    return items;
}

/**
Parse equation string to structed data. For exmaple:
    equation Mg+2HCl=MgCl2+H2 is parsed to:
{
    "left": [
        {"count": 1, "atoms": {"Mg": 2}},
        {"count": 2, "atoms": {"H": 1, "Cl": 2}}
    ],
    "right": [
        {"count": 1, "atoms": {"Mg": 1, "Cl": 2}},
        {"count": 1, "atoms": {"H": 2}},
    ]
}
*/
function equation_parser(equation_str) {
    let tokens = equation_tokenizer(equation_str);
    if (tokens == null) {
        return;
    }
    if (tokens.count("→") != 1) {
        console.error("parser error: number of → is not 1");
        return;
    }
    let half_parts = tokens.split("→");
    let left = half_equation_parser(half_parts[0]);
    let right = half_equation_parser(half_parts[1]);
    if (left == null || right == null) {
        return;
    }
    let equation = {"left": left, "right": right};
    return equation;
}

function atoms_counter(items) {
    let count = {};
    for (i in items) {
        let item = items[i];
        for (k in item["atoms"]) {
            if (count[k] == undefined) {
                count[k] = 0;
            }
            count[k] += item["atoms"][k] * item["count"];
        }
    }
    return count;
}

// check if the equation is balanced
function equation_checker(equation_str) {
    let equation = equation_parser(equation_str);
    if (equation == null) {
        return false;
    }
    let left_count = atoms_counter(equation.left);
    let right_count = atoms_counter(equation.right);
    // console.log(left_count);
    // console.log(right_count);
    if (left_count.size != right_count.size) {
        return false;
    }
    for (k in left_count) {
        if (k == "add") {
            continue;
        }
        if (left_count[k] != right_count[k]) {
            return false;
        }
    }
    return true;
}

function get_equations() {
    let r = new XMLHttpRequest();
    r.onreadystatechange = function () {
        if(r.readyState === XMLHttpRequest.DONE && r.status === 200) {
            let lines = r.responseText.split("\n");
            let equations = [];
            let c = {};
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                line = line.replace("=", "→");
                if (line == "" || line.startsWith("#")) {
                    continue;
                }
                let f = equation_checker(line);
                if (!f) {
                    console.error("check fail: " + line);
                } else {
                    let tokens = equation_tokenizer(line);
                    c.add(tokens.length, 1);
                    if (line.length <= row_length) {
                        equations.push(line);
                    }
                }
            }
            let index = new Date().toString().hashCode() % equations.length;
            target_equation = equations[index];
            localStorage.setItem("target-equation", target_equation);
        }
    };
    r.open("GET", "data/equations.txt");
    r.send();
}

function extract_equation(row_no) {
    return $("#row_" + row_no).text();
}

function handle_backspace() {
    if (current_col > 0) {
        current_col--;
        let id = current_row + "_" + current_col;
        $("#" + id).text("");
        $("#" + id).attr("class", "empty grid");
    }
}

function handle_submit(submit_equation, replay) {
    if (!equation_checker(submit_equation)) {
        alert("invalid equation");
        return;
    }
    if (!replay) {
        localStorage.setItem("guess-" + current_row.toString(), submit_equation);
    }
    let submit_equation_tokens = equation_tokenizer(submit_equation, row_length);
    let target_equation_tokens = equation_tokenizer(target_equation, row_length);
    let col_no = 0;
    let miss_count = {};
    for (; col_no < row_length; col_no++) {
        let target_token = target_equation_tokens[col_no];
        if (miss_count[target_token] == undefined) {
            miss_count[target_token] = 0;
        }
        if (submit_equation_tokens[col_no] != target_token) {
            miss_count[target_token]++;
        }
    }
    col_no = 0;
    let win = true;
    for (; col_no < row_length; col_no++) {
        let id = current_row + "_" + col_no;
        let submit_token = submit_equation_tokens[col_no];
        let grid = $("#" + id);
        let key = $("[token='" + submit_token + "']");
        grid.text(submit_token);
        if (submit_token == target_equation_tokens[col_no]) {
            grid.attr("class", "hit grid");
            key.attr("class", "hit key");
        } else if (target_equation_tokens.includes(submit_token)) {
            if (miss_count[submit_token]  > 0) {
                grid.attr("class", "partial-hit grid");
                miss_count[submit_token]--;
            } else {
                grid.attr("class", "missed grid");
            }
            if (key.attr("class") != "hit key") {
                key.attr("class", "partial-hit key")
            }
            win = false;
        } else {
            grid.attr("class", "missed grid");
            key.attr("class", "missed key");
            win = false;
        }
    }
    if (win && !replay) {
        let played_num = parseInt(localStorage.getItem("played")) + 1;
        let win_num = parseInt(localStorage.getItem("win")) + 1;
        localStorage.setItem("played", played_num);
        localStorage.setItem("win", win_num);
        localStorage.setItem("last-finished-date", new Date());
        alert("nice");
        $("#statistics-button").click();
        return;
    }
    current_row++;
    current_col = 0;
    if (current_row >= row_number && !replay) {
        let played_num = parseInt(localStorage.getItem("played")) + 1;
        localStorage.setItem("played", played_num);
        localStorage.setItem("last-finished-date", new Date());
        alert("the target equation is: " + target_equation);
    }
}

function handle_equation_token(token) {
    let id = current_row + "_" + current_col;
    $("#" + id).text(token);
    $("#" + id).attr("class", "staged grid");
    current_col++;
}

function handle_key(token) {
    if (localStorage.getItem("last-finished-date") == new Date().toString()) {
        return;
    }
    if (token == "←") {
        handle_backspace();
    } else if (token == "J") {
        let submit_equation = extract_equation(current_row);
        handle_submit(submit_equation, false);
    } else {
        handle_equation_token(token);
    }
}

function display_grids() {
    let grids = $("#grids");
    let row_no = 0;
    for (; row_no < row_number; row_no++) {
        let row = $("<div></div>");
        row.attr("class", "row");
        row.attr("id", "row_" + row_no);
        grids.append(row);
        let col_no = 0;
        for (; col_no < row_length; col_no++) {
            let grid = $("<div></div>");
            grid.attr("class", "empty grid");
            grid.attr("id", row_no + "_" + col_no);
            row.append(grid);
        }
    }
}

function display_keyborad() {
    let keyboard = $("#keyboard");
    let row_no = 0;
    for (; row_no < keyboard_chars.length; row_no++) {
        let row = $("<div></div>");
        row.attr("class", "row");
        keyboard.append(row);
        let col_no = 0;
        for (; col_no < keyboard_chars[row_no].length; col_no++) {
            let key = $("<div></div>");
            key.attr("class", "key");
            let char = keyboard_chars[row_no][col_no];
            if (char in key_icons) {
                let icon = $("<i></i>");
                icon.text(key_icons[char].name);
                key.append(icon);
                key.css("color", key_icons[char].color);
            } else {
                key.text(char);
            }
            key.attr("onclick", "handle_key('" + char + "');");
            key.attr("token", char);
            row.append(key);
        }
    }
}

function close_modal() {
    $("#modal").css("display", "none");
}

function open_modal() {
    $("#modal").css("display", "block");
}

function sync_data() {
    if (localStorage.getItem("played") == null) {
        localStorage.setItem("played", "0");
        localStorage.setItem("win", "0");
        display_module("help");
    }

    if (localStorage.getItem("last-started-date") != new Date().toString()) {
        get_equations();
        localStorage.setItem("last-started-date", new Date());
        for (let i = 0; i < row_number; i++) {
            localStorage.removeItem("guess-" + i.toString());
        }
    }
    target_equation = localStorage.getItem("target-equation");

    for (let i = 0; localStorage.getItem("guess-" + i.toString()) != null; i++) {
        let equation = localStorage.getItem("guess-" + i.toString());
        handle_submit(equation, true);
    }
}

function display_statistics() {
    display_module("statistics");
    let played = parseInt(localStorage.getItem("played"));
    let win = parseInt(localStorage.getItem("win"));
    $("#played").text(played);
    $("#win-rate").text(win / played);
    if (localStorage.getItem("last-finished-date") == new Date().toString()) {
        let div = $("<div class=\"row\"></div>");
        div.html( `
            <span class="item-left" i18n-key="remainnig-time"></span>
            <span class="item-right" id="remainning-time"></span>
        `);
        $("#modal-content").append(div);
        translate();
        let display_countdown = function(){
            var now = new Date();
            var hoursleft = 23-now.getHours();
            var minutesleft = 59-now.getMinutes();
            var secondsleft = 59-now.getSeconds();
            //format 0 prefixes
            if(minutesleft<10) minutesleft = "0"+minutesleft;
            if(secondsleft<10) secondsleft = "0"+secondsleft;
            //display
            $('#remainning-time').html(hoursleft+":"+minutesleft+":"+secondsleft);
        }
        display_countdown();
        setInterval(display_countdown, 1000);
    }
}

function add_listeners() {
    window.onclick = function(event) {
        if (event.target == $("#modal")[0]) {
          close_modal();
        }
    }
    $("#close").click(close_modal);
    $("#help-button").click(function(){display_module("help");});
    $("#statistics-button").click(display_statistics);
}

function init() {
    display_grids();
    display_keyborad();
    sync_data();
    renders_icons();
    add_listeners();
}