const row_length = 15;
const row_number = 6;
const token_set = [
    "He", "Li", "Be", "Na", "Mg", "Al", "Si",  "Cl", "Ca", "He", "Ne", "Ar",
    "H", "B", "C", "N", "O", "F", "P", "S", "K",
    "1", "2", "3", "4", "5", "6", 
    "=", "+", "(", ")"];

const number_tokens = ["1", "2", "3", "4", "5", "6"];

const keyboard_chars = [
    ["H", "1", "2", "3", "4", "5", "6", "He"],
    ["Li", "Be", "B", "C", "N", "O", "F", "Ne"],
    ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"],
    ["K", "Ca", "+", "→", "(", ")", "←", "J"]
]

const icons = {
    "←": {
        "svg": `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-backspace" viewBox="0 0 16 16">
                <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z" />
                <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z" />
            </svg>
        `,
        "color": "red"
    },
    "J": {
        "svg": `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-return-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z" />
            </svg>
        `,
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
    if (tokens.count("=") != 1) {
        console.error("parser error: number of = is not 1");
        return;
    }
    let half_parts = tokens.split("=");
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
            let random = Math.floor(Math.random() * equations.length);
            target_equation = equations[random];   
        }
    };
    r.open("GET", "data/equations.txt");
    r.send();
}

function extract_equation(row_no) {
    return $("#row_" + row_no).text().replace("→", "=");
}

function handle_backspace() {
    if (current_col > 0) {
        current_col--;
        let id = current_row + "_" + current_col;
        $("#" + id).text("");
        $("#" + id).attr("class", "empty grid");
    }
}

function handle_submit() {
    let submit_equation = extract_equation(current_row);
    if (!equation_checker(submit_equation)) {
        alert("invalid equation");
        return;
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
    for (; col_no < row_length; col_no++) {
        let id = current_row + "_" + col_no;
        let grid = $("#" + id);
        let button = $("[token='" + submit_equation_tokens[col_no] + "']");
        if (submit_equation_tokens[col_no] == target_equation_tokens[col_no]) {
            grid.attr("class", "hit grid");
            button.attr("class", "hit button");
        } else if (target_equation_tokens.includes(submit_equation_tokens[col_no])) {
            if (miss_count[submit_equation_tokens[col_no]]  > 0) {
                grid.attr("class", "partial-hit grid");
                miss_count[submit_equation_tokens[col_no]]--;
            } else {
                grid.attr("class", "missed grid");
            }
            if (button.attr("class") != "hit button") {
                button.attr("class", "partial-hit button")
            }
        } else {
            grid.attr("class", "missed grid");
            button.attr("class", "missed button");
        }
    }
    current_row++;
    current_col = 0;
    if (current_row >= row_number) {
        alert("the target equation is: " + target_equation);
    }
}

function handle_equation_token(token) {
    let id = current_row + "_" + current_col;
    $("#" + id).text(token);
    $("#" + id).attr("class", "staged grid");
    current_col++;
}

function handle_button(token) {
    if (token == "←") {
        handle_backspace();
    } else if (token == "J") {
        handle_submit();
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
            let button = $("<div></div>");
            button.attr("class", "button");
            let char = keyboard_chars[row_no][col_no];
            if (char in icons) {
                button.html(icons[char].svg);
                button.css("color", icons[char].color);
            } else {
                button.text(char);
            }
            button.attr("onclick", "handle_button('" + char + "');");
            button.attr("token", char);
            if (char == "→") {
                button.attr("token", "=")
            }
            row.append(button);
        }
    }
}

function init() {
    display_grids();
    display_keyborad();
    get_equations();
}