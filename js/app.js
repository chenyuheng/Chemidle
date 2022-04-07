const token_set = ["(OH)",
    "He", "Li", "Be", "Na", "Mg", "Al", "Si",  "Cl", "Ca",
    "H", "B", "C", "N", "O", "F", "P", "S", "K",
    "1", "2", "3", "4", "5", "=", "+"];
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
    let item = {"count": 1, "atoms": {}}
    if (number_tokens.includes(item_tokens[0])) {
        item["count"] = parseInt(item_tokens[0]);
        item_tokens.shift();
    }
    while (item_tokens.length != 0) {
        if (number_tokens.includes(item_tokens[1])) {
            if (item_tokens[0] == "(OH)") {
                if (item["atoms"]["O"] == undefined) {
                    item["atoms"]["O"] = 0;
                }
                if (item["atoms"]["H"] == undefined) {
                    item["atoms"]["H"] = 0;
                }
                item["atoms"]["O"] += parseInt(item_tokens[1]);
                item["atoms"]["H"] += parseInt(item_tokens[1]);
            } else {
                item["atoms"][item_tokens[0]] = parseInt(item_tokens[1]);
            }
            item_tokens.shift();
        } else {
            item["atoms"][item_tokens[0]] = 1;
        }
        item_tokens.shift();
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
        items.push(item);
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