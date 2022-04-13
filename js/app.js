const token_set = [
    "He", "Li", "Be", "Na", "Mg", "Al", "Si",  "Cl", "Ca",
    "H", "B", "C", "N", "O", "F", "P", "S", "K",
    "1", "2", "3", "4", "5", 
    "=", "+", "(", ")"];
const number_tokens = ["1", "2", "3", "4", "5"];

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

function equation_tokenizer(equation_str) {
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
    console.log(tokens);
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
function equation_checker(equation) {
    let left_count = atoms_counter(equation.left);
    let right_count = atoms_counter(equation.right);
    console.log(left_count);
    console.log(right_count);
    if (left_count.size != right_count.size) {
        return false;
    }
    for (k in left_count) {
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
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line == "" || line.startsWith("#")) {
                    continue;
                }
                console.log(equation_checker(equation_parser(line)));
            }
        }
    };
    r.open("GET", "data/equations.txt");
    r.send();
}
