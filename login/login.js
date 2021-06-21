import {check_strength, load_pw_name, do_query,
        parse, prove_new,return_failure, get_prover, 
        get_prid, prove_auth, do_login} from "../library.js";
let opener = null;
let url_app = null;
let qr=null;

window.onload = function() {
    // window.onblur = function(){ window.close(); };
    // load_pw_name();
    qr = new QRious({
        element: document.getElementById('qr_method'),
        size: 180
    });
    window.opener.postMessage("", "*");
    window.addEventListener("message", receive_message, false);
}


// window.onload = async function() {
//     await test()
// }


// async function test() {
//     const dom_app = "sflab.snu.ac.kr";
//     let id= "Newtesting3";
//     let url_query = "https://sflab.snu.ac.kr:92";
//     document.getElementById("user_id").value = id;
//     document.getElementById("url_query").value = new URL(url_query).origin;
//     let result = await QueryLogin(id, url_query);
//     // console.log("http://localhost:7999/qrcode?" + get_query_string(url_query, id, dom_app, result))
//     let ty= result['ty']; let pt = result['pt']; let ds = result['ds']; let pt_n = result['pt_n']; let ds_n = result['ds_n'];  let aux = result['aux'];
//     let etc = aux +';' + dom_app;
//     let data = parse(pt)(ds)
//     let data_n = ds_n !=="" ? parse(pt_n)(ds_n) : null
//     let pw = 'asdf1234!@#$';
//     try {
//         let pr = get_prover(pt)(data, pw);
//         let ret = do_login(ty, pt, data, pt_n, data_n, etc, pw);
//         console.log(ret);
//     } catch(err) {
//         console.log(err)
//     }
// }
    
function get_query_string(url_query, id, dom_app,otp) {
    let str='&';
    str += 'url=' + encodeURIComponent(url_query) + '&';
    str += 'id=' + encodeURIComponent(id) + '&';
    str += 'otp=' + encodeURIComponent(otp) + '&';
    str += 'dom=' + encodeURIComponent(dom_app) + '&';
    return toBase64URL(str);
}

function toBase64URL(str) {
    return btoa(str.replace(/\+/g,'-').replace(/\//g,'_')).replace(/\=+$/m,'');
}

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
    let result = await QueryLogin(id, url_query);
    let ty= result['ty']; let pt = result['pt']; let ds = result['ds']; let pt_n = result['pt_n']; let ds_n = result['ds_n'];  let aux = result['aux'];
    let [otp] = aux.split(';',1)
    let otp_url = "https://secuni.github.io/otp#" + get_query_string(url_query, id, dom_app, otp);
    qr.value= otp_url;
    document.getElementById('otp_link').href = otp_url;
    document.getElementById('otp_view').style.display= "";

    // console.log("http://localhost:7999/otp#" + get_query_string(url_query, id, dom_app, otp))
    let etc = aux +';' + dom_app;
    let data = parse(pt)(ds)
    let data_n = ds_n ? parse(pt_n)(ds_n) : null
    let otp_str = 'otp;'+ty+';'+pt+';'+pt_n+';'+aux+';'+dom_app+';'+ds+ds_n;
    document.getElementById('otp_link').onclick = () => opener.postMessage(otp_str, url_app);
    document.getElementById('compute').onclick = set_login_button(id, url_query, ty, pt, pt_n, data, data_n, etc, otp_str);
    // document.getElementById('otp_button').onclick = set_otp_button(ty, pt, pt_n, aux, dom_app, ds, ds_n);
}

async function QueryLogin(id, url_query) {
    let url = url_query + '?query=login&id=' + id;
    return await do_query(url);
}


// function set_otp_button(ty, pt, pt_n, aux, dom_app, ds, ds_n) {
//     return (()=> {
//         let ret = 'otp;'+ty+';'+pt+';'+pt_n+';'+aux+';'+dom_app+';'+ds+ds_n;
//         opener.postMessage(ret, url_app);
//         window.close();
//     })
// }

function set_login_button(id, url_query, ty, pt, pt_n, data, data_n, etc, otp_str) {
    // let pr = PMGet(id, url_query, get_prid(data));
    // if(pr !== null && data_n === null) {
    //     let res = confirm("Use Auto Login");
    //     if(res) {
    //         const dom_app = new URL(url_app).hostname;
    //         const [ret, salt_n, pr_n] = await prove_auth(data, pr, dom_app, "")
    //         return_result(ret);
    //     }
    //     else {
    //         PMPut(id, url_query, null, null);
    //         pr = null;
    //     }
    // }
    return(() => {
        try {
            let [pw, usepm] = get_userpw();
            let ret = null;
            if(!pw) {
                ret = otp_str;
            }
            else {
                ret = do_login(ty, pt, data, pt_n, data_n, etc, pw);
            }
            // if(usepm === true) {
            //     PMPut(id, url_query, prid_n, pr_n);
            // }
            // else {
            //     PMPut(id, url_query, null, null);
            // }
            opener.postMessage(ret, url_app);
            window.close();
        } catch(err) {
            // this event shouldn't occur
            // console.log(err)
            return_failure(err)
        }
    });
}

function get_userpw() {
    let pw = document.getElementById("user_pw").value;
    let usepm = document.getElementById("remember").checked;
    return [pw, usepm];
}

let popupwindow = function (url, title, w, h) {
    let left = (screen.width/2)-(w/2);
    let top = (screen.height/4)-(h/4);
    let win = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    return win;
};
