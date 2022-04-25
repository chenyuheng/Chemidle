const modules = {
    "help": {
        "title": "<span i18n-key='help'></span>",
        "content": `
<p i18n-key="help-1"></p>
<p i18n-key="help-2"></p>
<p i18n-key="help-3"></p>
<p i18n-key="help-4"></p>
<div class="row" id="row_1"><div class="partial-hit grid" id="1_0">H</div><div class="missed grid" id="1_1">Cl</div><div class="partial-hit grid" id="1_2">+</div><div class="missed grid" id="1_3">Na</div><div class="partial-hit grid" id="1_4">O</div><div class="partial-hit grid" id="1_5">H</div><div class="partial-hit grid" id="1_6">→</div><div class="missed grid" id="1_7">Na</div><div class="missed grid" id="1_8">Cl</div><div class="missed grid" id="1_9">+</div><div class="missed grid" id="1_10">H</div><div class="partial-hit grid" id="1_11">2</div><div class="partial-hit grid" id="1_12">O</div><div class="hit grid" id="1_13"></div><div class="hit grid" id="1_14"></div></div>
<div class="row" id="row_2"><div class="hit grid" id="2_0">C</div><div class="partial-hit grid" id="2_1">+</div><div class="partial-hit grid" id="2_2">O</div><div class="partial-hit grid" id="2_3">2</div><div class="partial-hit grid" id="2_4">→</div><div class="partial-hit grid" id="2_5">C</div><div class="hit grid" id="2_6">O</div><div class="partial-hit grid" id="2_7">2</div><div class="missed grid" id="2_8"></div><div class="missed grid" id="2_9"></div><div class="missed grid" id="2_10"></div><div class="missed grid" id="2_11"></div><div class="missed grid" id="2_12"></div><div class="hit grid" id="2_13"></div><div class="hit grid" id="2_14"></div></div>
<div class="row" id="row_3"><div class="hit grid" id="3_0">C</div><div class="hit grid" id="3_1">O</div><div class="hit grid" id="3_2">2</div><div class="hit grid" id="3_3">+</div><div class="hit grid" id="3_4">H</div><div class="hit grid" id="3_5">2</div><div class="hit grid" id="3_6">O</div><div class="hit grid" id="3_7">→</div><div class="hit grid" id="3_8">H</div><div class="hit grid" id="3_9">2</div><div class="hit grid" id="3_10">C</div><div class="hit grid" id="3_11">O</div><div class="hit grid" id="3_12">3</div><div class="hit grid" id="3_13"></div><div class="hit grid" id="3_14"></div></div>
<p i18n-key="help-5"></p>
        `
    }
}

function display_module(module_name) {
    let module_data = modules[module_name];
    $("#modal-title").html(module_data["title"]);
    $("#modal-content").html(module_data["content"]);
    translate();
    open_modal();
}