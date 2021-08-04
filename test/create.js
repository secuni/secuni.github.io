import {check_strength, load_pw_name, do_query, parse, prove_new, do_create, return_failure, PMGet, PMPut} from "../library.js";
let opener = null;
let url_app = null;
let step = 1;
let pw_n = null;
let pw_confirm = null;
let eml = null;


window.onload = function() {
alert("onload");
}
