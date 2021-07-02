import {prove_new_adv, get_prover_adv, prove_auth_adv, get_prid_adv, parse_adv} from './adv_protocol/public.js';

function check_strength(pw) {
    let denylist = ["password"];
    let regex_letter = new RegExp(/^.*[A-Za-z].*$/);
    let regex_number = new RegExp(/^.*[0-9].*$/);
    let regex_symbol = new RegExp(/^.*[!@#\$%\^\&*\)\(+=._-].*$/);


    if (pw.length < 10)
        return "Passwords must be at least 15 characters";
/*
    else if (denylist.includes(pw))
        return "The pasword is too common";
    else if (!regex_letter.test(pw))
        return "Passwords must contain a minimum of 1 letters";
    else if (!regex_number.test(pw))
        return "Passwords must contain a minimum of 1 numbers";
    else if (!regex_symbol.test(pw))
        return "Passwords must contain a minimum of 1 symbols";
*/
    else
        return null
}

function load_pw_name() {
    let listdom = document.getElementById("pw_name_list");
    if(listdom == null)
        return
    let options = listdom.innerHTML;
    let pw_name_list = []
    let keys = Object.keys(localStorage);
    for(var i=0; i<keys.length; i++) {
        let pw_name = get_pw_name(keys[i])
        if(pw_name)
            pw_name_list.push(pw_name)
    }
    pw_name_list = Array.from(new Set(pw_name_list))
    pw_name_list.forEach(function (pw_name) {
        options += '<option value="' + pw_name + '" />';
    });
    listdom.innerHTML = options;
}

  
async function do_query(url) {
    let res = null;
    try{
        res = await fetch(url);
    } catch(err) {
        return_failure("Server error")
    }
    if (!res.ok ) {
        if(res.status === 405 )
            return_failure("User is not using SecUni")
        else
            return_failure('Query Fails');
    }
    let body = await res.json();
    return body;
}

function return_failure(err_msg) {
    alert(err_msg)
    // opener.postMessage("", url_app);
    // window.close();
}

function prove_new(pt) {
    switch (pt) {
        case "adv": return prove_new_adv; break;
    }
}
  
function get_prover(pt) {
    switch (pt) {
        case "adv": return get_prover_adv; break;
    }
}

function prove_auth(pt) {
    switch (pt) {
        case "adv": return prove_auth_adv; break;
    }
}

function get_prid(pt) {
    switch (pt) {
        case "adv": return get_prid_adv; break;
    }
}

function parse(pt) {
    switch (pt) {
        case "adv": return parse_adv; break;
    }
}

function do_login(ty, pt, data, pt_n, data_n, etc, pw) {
    let prid = get_prid(pt)(data);
    let pr = get_prover(pt)(data, pw);
    let [r_n, prid_n, pr_n] = (data_n===null) ? [etc, prid, pr] : prove_new(pt_n)(data_n, pw, etc);
    let ret = ty + ';' + pt + ';' + pt_n + ';' + prove_auth(pt)(data, pr, r_n);
    return ret;
}

function do_create(ty, pt, pt_n, data_n, etc, pw) {
    let [ret, salt, pr] = prove_new(pt_n)(data_n, pw, etc);
    return ty + ';' + pt + ';' + pt_n + ';' + ret;
}

function do_change(ty, pt, data, pt_n, data_n, etc, pw, pw_n) {
    let pr = get_prover(pt)(data, pw);
    let [r_n, {}, {}] = prove_new(pt_n)(data_n, pw_n, etc);
    let ret = ty + ';' + pt + ';' + pt_n + ';' + prove_auth(pt)(data, pr, r_n)
    return ret;
}

  

export {check_strength, load_pw_name, do_query,
         prove_new, get_prover, prove_auth, get_prid,
        parse, return_failure, do_login, do_create, do_change};
