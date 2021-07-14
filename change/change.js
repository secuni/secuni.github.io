import {check_strength, load_pw_name, do_query,
    parse, prove_new,return_failure, get_prover, 
    get_prid, prove_auth, do_change, do_create, PMPut, PMGet} from "../library.js";

let opener = null;
let url_app = null;


window.onload = function() {
    // window.onblur = function(){ window.close(); };
    load_pw_name();
    window.addEventListener("message", receive_message, false);
    window.opener.postMessage("", "*");
}


// window.onload = async function() {
//     var qr = new QRious({
//         element: document.getElementById('qr'),
//         value: 'asdfsaf'
//     });
//     await test()
// }
// async function test() {
//     const dom_app = "sflab.snu.ac.kr";
//     let id= "Newtest19";
//     let url_query = "https://sflab.snu.ac.kr:92";
//     document.getElementById("user_id").value = id;
//     document.getElementById("url_query").value = new URL(url_query).origin;
//     let result = await QueryChange(id, url_query);
//     let pt = result['pt']; let ds = result['ds']; let pt_n = result['pt_n']; let ds_n = result['ds_n'];  let kh = result['kh'];
//     let data = parse(pt)(ds)
//     let data_n = parse(pt_n)(ds_n);
//     let kd = kh +';' + dom_app;
//     let pw = 'asdf';
//     let pw_n = 'asdf1234!@#$';
//     try {
//         let pr = get_prover(pt)(data, pw);
//         let [r_n, prid_n, pr_n] = prove_new(pt_n)(data_n, pw_n, kd);
//         let ret = prove_auth(pt)(data, pr, r_n);
//         console.log(ret);
//     } catch(err) {
//         console.log(err)
//     }
// }

async function receive_message(event) {
    opener = event.source;
    url_app = event.origin;
    const dom_app = new URL(url_app).hostname;
    let parsed = event.data.split(';',2);
    let url_query = parsed[0];
    let id = parsed[1];
    if(id==""){
        return_failure("Insert your ID")
    }
    document.getElementById("user_id").value = id;
    document.getElementById("url_query").value = new URL(url_query).origin;
    window.removeEventListener("message", receive_message);
    let result = await QueryChange(id, url_query);
    let ty= result['ty']; let pt = result['pt']; let ds = result['ds']; let pt_n = result['pt_n']; let ds_n = result['ds_n'];  let aux = result['aux'];
    let etc = aux +';' + dom_app;
    let data = ds ? parse(pt)(ds) : null;
    let data_n = parse(pt_n)(ds_n);
    if(data === null) {
        document.getElementById("user_pw_old").remove();
        document.getElementById("user_pw_new").focus();
    }
    else {
        let [pwname] = aux.split(';',1)
        document.getElementById('user_pw').placeholder = "PWName: " +  pwname;
    }
    document.getElementById('compute').onclick = set_change_button(id, url_query, ty, pt, pt_n, data, data_n, etc);
}

async function QueryChange(id, url_query) {
    let url = url_query + '?query=change&id=' + id;
    return await do_query(url);
}

function set_change_button(id, url_query, ty, pt, pt_n, data, data_n, etc) {
    return (async () => {
        let pwname = document.getElementById('pw_name').value;
        pwname = (pwname ? pwname : "Default");
        etc = etc + ';' + pwname;
        let [pw, pw_n] = get_userpw();
        if((data && !(pw && pw_n)) || (!data && !pw_n)) 
            return;
        try {
            let ret =  null;
            if(data === null) ret = await do_create(ty, pt, pt_n, data_n, etc, pw_n)
            else [ret, {}, {}] = await do_change(ty, pt, data, pt_n, data_n, etc, pw, pw_n)
            // let pw_name = document.getElementById("pw_name").value;
            // PMChange(id, url_query, pw_name, null, null);
            opener.postMessage(ret, url_app);
            PMPut(url_query, id, pwname, true, "", "");
            window.close();
        } catch(err) {
            // this event shouldn't occur
            console.log(err)
            // return_failure("Error during encryption")
        }
    });
}

function get_userpw() {
    let pw = document.getElementById("user_pw") ? document.getElementById("user_pw").value : null;
    let pw_n = document.getElementById("user_pw_new").value;
    let pw_n_confirm = document.getElementById("user_pw_confirm").value;
    if(pw_n !== pw_n_confirm) { 
        alert("The password confirmation does not match"); return [null, null]; }
    let strength = check_strength(pw_n);
    if(strength !== null) {
        alert(strength); return [null, null];
    }
    return [pw, pw_n];
}