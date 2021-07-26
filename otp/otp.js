import {check_strength, load_pw_name, do_query,
    parse, prove_new,return_failure, get_prover, 
    get_prid, prove_test, do_login, PMPut, PMGet} from "../library.js";

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
    const id = getByName('id'); const url_query = getByName('url');
    const dom_app_n = getByName('dom'); const otp_n = getByName('otp');    

    document.getElementById("user_info1").value = id
    document.getElementById("user_info_view").value = id
    document.getElementById("url_query").value = url_query
    document.getElementById("otp").value = otp_n
    document.getElementById("dom_app").value = dom_app_n
    let result = await QueryLogin(id, url_query);
    let ty= result['ty']; let pt = result['pt']; let ds = result['ds']; let pt_n = result['pt_n']; let ds_n = result['ds_n'];  let aux = result['aux'];
    let etc = aux +';' + dom_app;
    let data = parse(pt)(ds)
    let data_n = ds_n ? parse(pt_n)(ds_n) : null
    let [pwname, pr, ma, al] = PMGet(url_query, id, get_prid(pt)(data), false);
    document.getElementById('remember_sva').checked = ma;
    document.getElementById('remember_svp').checked = al;
    document.getElementById('secuni_form').action = url_query+'?query=submit_otp';
    document.getElementById('user_info2').placeholder = "PW Name: " +  pwname;
    // document.getElementById('dummy_id').setAttribute('value', pwname)
    document.getElementById('dummy_id').value = pwname
    if(pr !== "" && data_n === null && al) {
        let res = confirm("Use Auto Login");
        if(res) {
            let ret = ty + ';' + pt + ';' + pt_n + ';' + await prove_test(pt)(data, pr, etc);
            document.getElementById("result").value = ret
            document.getElementById("user_info2").value = '';
            document.getElementById('secuni_form').submit();
        }
    }
    document.getElementById('compute').onclick = set_submit_button(id, url_query, ty, pt, pt_n, data, data_n, etc, pwname);
}

async function QueryLogin(id, url_query) {
    let url = url_query + '?query=login&id=' + id;
    return await do_query(url);
}

function set_submit_button(id, url_query, ty, pt, pt_n, data, data_n, etc, pwname) {
    return(async () => {
        try {
            let [pw, ma, al] = get_userpw();
            let [res, prid, pr] = await do_login(ty, pt, data, pt_n, data_n, etc, pw);
            document.getElementById("result").value = res
            document.getElementById("user_info2").value = '';
            PMPut(url_query, id, pwname, prid, pr, ma, al, false);
            document.getElementById('secuni_form').submit();
        } catch(err) {
            // this event shouldn't occur
            document.getElementById("user_info2").value = '';
            console.log(err)
            alert(err)
            document.getElementById('secuni_form').submit();
        }
    });
}

function get_userpw() {
    let pw = document.getElementById("user_info2").value;
    let sva = document.getElementById("remember_sva").checked;
    let svp = document.getElementById("remember_svp").checked;
    return [pw, sva, svp];
}

function fromBase64URL(input) {
    // Replace non-url compatible chars with base64 standard chars
    input = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // Pad out with standard base64 required padding characters
    var pad = input.length % 4;
    if(pad) {
      if(pad === 1) {
        throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
      }
      input += new Array(5-pad).join('=');
    }

    return atob(input);
}

function getByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    let anchor = url.split('#');
    anchor = anchor[1];
    let data = fromBase64URL(anchor)
    var regex = new RegExp('[&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(data);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}