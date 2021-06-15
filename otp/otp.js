import {check_strength, load_pw_name, do_query,
    parse, prove_upd,return_failure, get_prover, 
    get_prid, prove_auth, do_login} from "../library.js";

window.onload = async function() {   
    await receive_message();
    // window.addEventListener("message", receive_message, false);
    // window.opener.postMessage("", "*");
}

async function receive_message() {
    // todo
    // const dom_app = new URL(event.origin).hostname
    // alert("dom_app:" + dom_app);
    const dom_app = '';
    const id = getParameterByName('id'); const url_query = getParameterByName('url');
    const dom_app_n = getParameterByName('dom'); const otp_n = getParameterByName('otp');    

    document.getElementById("user_id").value = id
    document.getElementById("user_id_view").value = id
    document.getElementById("url_query").value = url_query
    document.getElementById("otp").value = otp_n
    document.getElementById("dom_app").value = dom_app_n
    let result = await QueryLogin(id, url_query);
    let ty= result['ty']; let pt = result['pt']; let ds = result['ds']; let pt_n = result['pt_n']; let ds_n = result['ds_n'];  let aux = result['aux'];
    let etc = aux +';' + dom_app;
    let data = parse(pt)(ds)
    let data_n = ds_n ? parse(pt_n)(ds_n) : null
    
    let form = document.getElementById('secuni_form');
    form.onsubmit = set_submit_button(id, url_query, ty, pt, pt_n, data, data_n, etc);
    form.action = url_query+'?query=submit_otp';
}

async function QueryLogin(id, url_query) {
    let url = url_query + '?query=login&id=' + id;
    return await do_query(url);
}

function set_submit_button(id, url_query, ty, pt, pt_n, data, data_n, etc) {
    return(async () => {
        try {
            let pw = document.getElementById("user_pw").value;
            document.getElementById("user_pw").value = '';
            document.getElementById("result").value = do_login(ty, pt, data, pt_n, data_n, etc, pw);
            return true;
        } catch(err) {
            // this event shouldn't occur
            console.log(err)
            alert('error')
            return false;
        }
    });
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}