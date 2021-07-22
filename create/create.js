import {check_strength, load_pw_name, do_query, parse, prove_new, do_create, return_failure, PMGet, PMPut} from "../library.js";
let opener = null;
let url_app = null;


window.onload = function() {
    // window.onblur = function(){ window.close(); };
    load_pw_name();
    window.addEventListener("message", receive_message, false);
    window.opener.postMessage("", "*");
}


// window.onload = async function() {
//     await test()
// }

// async function test() {
//     const dom_app = "sflab.snu.ac.kr"
//     let id= "newtesting1234";
//     let url_query = "https://sflab.snu.ac.kr:92?query=create&id=asdfasd";
//     document.getElementById("user_id").value = id;
//     document.getElementById("url_query").value = new URL(url_query).origin;
//     let result = await QueryCreate(id, url_query);
//     let ty= result['ty']; let pt = result['pt']; let pt_n = result['pt_n']; let ds = result['ds_n']; let aux = result['aux'];
//     let data = parse(pt_n)(ds)
//     let etc = aux +';' + dom_app
//     // set_button(pt, id, url_query, data, kh);
//     let pw = 'asdf1234!@#$';
//     try {
//         console.log(do_create(ty, pt, pt_n, data, etc, pw))
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
    document.getElementById("user_info1").value = id;
    document.getElementById("url_query").value = new URL(url_query).origin;
    window.removeEventListener("message", receive_message);
    let result = await QueryCreate(id, url_query);
    let ty= result['ty']; let pt = result['pt']; let pt_n = result['pt_n']; let ds_n = result['ds_n']; let aux = result['aux'];
    let data_n = parse(pt_n)(ds_n)
    let etc = aux +';' + dom_app
    let [_0, _1, ma, al] = PMGet(null, null, null);
    document.getElementById('remember_sva').checked = ma;
    document.getElementById('remember_svp').checked = al;
    document.getElementById('compute').onclick = await set_create_button(id, url_query, ty, pt, pt_n, data_n, etc);
}

async function QueryCreate(id, url_query) {
    let url = url_query + '?query=create&id=' + id;
    return await do_query(url);
}

function set_create_button(id, url_query, ty, pt, pt_n, data_n, etc) {
    return (async () => {
        let pwname = document.getElementById('pw_name').value;
        if(pwname.includes(";")) {
            alert("semicolon not allowed for PW Name")
            return;
        }
        pwname = (pwname ? pwname : "Default");
        let [pw,ma,al] = get_userpw();
        if(pw === null) return;
        try {
            // let pw_name = document.getElementById("pw_name").value;
            // PMCreate(id, url_query, pw_name);
            let [ret, prid, pr] = await do_create(ty, pt, pt_n, data_n, etc, pw)
            opener.postMessage(ret, url_app);
            PMPut(url_query, id, pwname, prid, pr, ma, al, true);
            window.close();
        } catch(err) {
            // this event shouldn't occur
            console.log(err)
            return_failure(err);

        }
    });
}

function get_userpw() {
    let pw = get_info3();
    let pw_confirm = get_info4();
    if(pw !== pw_confirm) { alert("The password confirmation does not match"); return [null,null]; }
    let strength = check_strength(pw);
    if(strength !== null) {
        alert(strength); return [null,null];
    }
    let sva = document.getElementById("remember_sva").checked
    let svp = document.getElementById("remember_svp").checked
    return [pw,sva, svp];
}

