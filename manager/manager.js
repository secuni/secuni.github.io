import {check_strength, load_pw_name, do_query,
    parse, prove_new,return_failure, get_prover, 
    get_prid, prove_auth, do_change, do_create, PMPut, PMGet} from "../library.js";


// function PMChange(id, url_query, pw_name, salt, pr) {
//     const url = new URL(url_query)
//     const path = url.origin + url.pathname;
//     let key = [id, path].join(";");
//     let [date_p, pw_name_p, salt_p, pr_p] = localStorage.getItem(key).split(";")
//     if(pw_name === "")
//         pw_name = pw_name_p;
//     let time = new Date();
//     let date = time.getFullYear() + "-" + (time.getMonth()+1) + "-" + time.getDate()
//     let val = [date, pw_name, salt, pr].join(";");
//     localStorage.setItem(key, val);
//     return date;
// }

// function PMCreate(id, url_query, pw_name) {
//     const url = new URL(url_query)
//     const path = url.origin + url.pathname;
//     let key = [id, path].join(";");
//     let time = new Date();
//     let date = time.getFullYear() + "-" + (time.getMonth()+1) + "-" + time.getDate()
//     let val = [date, pw_name, null, null].join(";");
//     localStorage.setItem(key, val);
//     return date;
// }


document.getElementById('select_global').onchange = select_global;
document.getElementById('compute').onclick = do_update_all;
document.getElementById('export_data').onclick = export_data;
document.getElementById('import_data').onclick = import_data;
document.getElementById('clear_all').onclick = clear_all;
window.parse_file = parse_file

let entries = {};

window.onload = function() {
    load_pw_name();
    let dom_entries = document.getElementById("entries");
    let keys = Object.keys(localStorage);
    for(var i=0; i<keys.length; i++) {
        let key = keys[i];
        let [tr, entry] = key_to_entry(key, localStorage.getItem(key));
        if( tr!== null && entry !== null) {
            dom_entries.appendChild(tr);
            entries[key] = entry;
        }
    }
}

async function do_update_all() {
    let keys = Object.keys(entries);
    let all_unchecked = true;

    if(get_userpw().every(e=>e === null))
        return;

    for(var i=0; i<keys.length; i++) {
        let key = keys[i];
        if (entries[key].checked.checked === true) {
            all_unchecked = false;
            break;
        }
    }
    if(all_unchecked) {
        alert("Select a website to change");
        return;
    }
    
    let pw_name = document.getElementById('pw_name').value;
    if(pw_name.includes(";")) {
        alert("semicolon not allowed for PW Name")
        return;
    }
    
    document.getElementById("compute").disabled = true;

    pw_name = pw_name ? pw_name : "Default";
    let remember = document.getElementById("remember").checked;

    if(document.getElementById('status') === null) {
        let th = document.createElement('th');
        th.id = "status"
        th.style.width = "90px";
        th.innerHTML = "Status"
        document.getElementById("entry_title").appendChild(th)
    }
    
    await Promise.all(keys.map( async (key) => {
        let entry = entries[key];
        if(entry.status === null)
            add_status(key);
        if (entry.checked.checked === true) {
            entry.status.nodeValue = "querying..."
            if(await entry_query(key, pw_name))
                await entry_change(key, pw_name, remember);
        }
    }));
    document.getElementById("compute").disabled = false;
    document.getElementById('pw_name_list').innerHTML = '<option value="Default">Default</option><option value="Special">Special</option>';
    load_pw_name()
}

function export_data() {
    let arr = [];
    let keys = Object.keys(entries);
    for(var i=0; i<keys.length; i++) {
        let key = keys[i];
        if(entries[key].checked.checked == false) continue;
        let [userid, url_query] = key.split(";");
        let [date, pw_name, {}, {}] = localStorage.getItem(key).split(";");
        let object = {
            'id' : userid,
            'url_query' : url_query,
            'date' : date,
            'pw_name' : pw_name,
        }
        arr.push(JSON.stringify(object));
    }
    if(arr.length !== 0){
        document.getElementById("input_file").innerHTML = "";
        let blob = new Blob([JSON.stringify(arr)], {type: "application/json"});
        let url = URL.createObjectURL(blob);
        let a = document.getElementById("export_result");
        a.innerHTML = "Download file"
        a.href = url;
        a.download = "export.json"
    }
    else{
        alert("Select a website to export");
    }
}

function import_data() {
    document.getElementById("export_result").innerHTML = "";
    document.getElementById("input_file").innerHTML = '<input type="file" onchange="parse_file(this.files[0])">'
    }

async function parse_file(file) {
    let arrstr = await file.text();
    let arr = JSON.parse(arrstr)
    arr.forEach(function (element) {
        let object = JSON.parse(element)
        let key = object.id + ';' + object.url_query;
        let prev_val = localStorage.getItem(key);
        if(prev_val === null) {
            let val = object.date + ';' + object.pw_name + ';;'
            localStorage.setItem(key, val);
        }
        else {
            let [prev_date, {}, {}, {}] = prev_val.split(';');
            if(prev_date === "UNKNOWN") {
                let val = object.date + ';' + object.pw_name + ';;'
                localStorage.setItem(key, val);
            }
            else if(object.date !== "UNKNOWN") {
                let date_parts = object.date.split('-')
                let json_date = new Date(date_parts[0], date_parts[1]-1, date_parts[2]);
                let date_parts2 = prev_date.split('-')
                let prev_val_date = new Date(date_parts2[0], date_parts2[1]-1, date_parts2[2]);
                if(json_date > prev_val_date) {
                    let val = object.date + ';' + object.pw_name + ';;'
                    localStorage.setItem(key, val);
                }
            }
        }
    })
    document.getElementById("input_file").innerHTML = "";
    refresh_view();
}

function select_global() {
    let keys = Object.keys(entries);
    if(document.getElementById('select_global').checked) {
        for(var i=0; i<keys.length; i++) {
            let key = keys[i];
            let entry = entries[key];
            entry.checked.checked = true;
        }
    } else {
        for(var i=0; i<keys.length; i++) {
            let key = keys[i];
            let entry = entries[key];
            entry.checked.checked = false;
        }
    }
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

function key_to_entry(key, val) {
    let [userid, path] = key.split(";");
    let [date, pw_name, salt, pr] = val.split(";");
    let host = null;
    try{
        host = new URL(path).host;
    } catch(err) {
        return [null,null];
    }
    let tr = document.createElement("tr");
    
    let td_checked = document.createElement("td");
    td_checked.style.textAlign = "center";
    td_checked.onchange = select_entry;
    let td_checked_val = document.createElement("input");
    td_checked_val.type = "checkbox";
    td_checked_val.checked = false;
    td_checked.appendChild(td_checked_val);
    tr.appendChild(td_checked);

    let td_host = document.createElement("td");
    td_host.title = path;
    let td_host_val = document.createTextNode(host);
    td_host.appendChild(td_host_val);
    tr.appendChild(td_host);

    let td_userid = document.createElement("td");
    let td_userid_val = document.createTextNode(userid);
    td_userid.appendChild(td_userid_val);
    tr.appendChild(td_userid);


    let td_date = document.createElement("td");
    let td_date_val = document.createTextNode(date);
    td_date.appendChild(td_date_val);
    tr.appendChild(td_date);

    let td_pw_name = document.createElement("td");
    let td_pw_name_val = document.createTextNode(pw_name);
    td_pw_name.appendChild(td_pw_name_val);
    tr.appendChild(td_pw_name);

    let td_saved = document.createElement("td");
    td_saved.style.textAlign = "center";
    let td_saved_val = document.createElement("input");
    td_saved_val.type = "checkbox";
    td_saved_val.disabled = true;
    td_saved_val.checked = (salt !== "" && pr !== null)
    td_saved.appendChild(td_saved_val);
    tr.appendChild(td_saved);

    let entry = {
        node: tr,
        userid: td_userid_val,
        host: td_host_val,
        date: td_date_val,
        pw_name: td_pw_name_val,
        saved: td_saved_val,
        checked: td_checked_val,
        status: null,
    }
    return [tr, entry];
}

function add_status(key) {
    let entry = entries[key];
    let tr = entry.node;
    let td_status = document.createElement("td");
    let td_status_val = document.createTextNode("");
    td_status.appendChild(td_status_val);
    tr.appendChild(td_status);
    entry.status = td_status_val
}

async function entry_query(key, pw_name) {
    let [userid, url_query] = key.split(";");
    let entry = entries[key];
    let result = await QueryManager(userid, url_query, entry);
    if (result === null)
        return false;
    let ty= result['ty']; let pt = result['pt']; let ds = result['ds']; let pt_n = result['pt_n']; let ds_n = result['ds_n'];  let aux = result['aux'];
    let etc = aux +';' + "" + ';' + pw_name;
    let data = ds ? parse(pt)(ds) : null;
    let data_n = parse(pt_n)(ds_n)
    entries[key] = {...entry, ty, pt, data, pt_n, data_n, etc}
    return true;
}

async function QueryManager(id, url_query, entry) {
    let url = url_query + '?query=change&id=' + id;
    return await do_query_manager(url);
}

async function do_query_manager(url) {
    let res = null;
    try{
        res = await fetch(url);
    } catch(err) {
        entry.status.nodeValue = "query failed";
        return null;
    }
    if (!res.ok ) {
        //TODO exception when no user
        if(res.status === 405 ) {
            // delete entry?
            entry.status.nodeValue = "query failed";
            return null;
        }
        else {
            entry.status.nodeValue = "query failed";
            return null;
        }
    }
    let body = await res.json();
    return body;
}

async function entry_change(key, pw_name, remember) {
    let [userid, path] = key.split(";");
    const qurl = path + "?query=change_all&id=" + userid;
    let entry = entries[key];
    try {
        let [pw, pw_n] = get_userpw(); // always non-null value
        let [ret, prid_n, pr_n] = await do_change(entry.ty, entry.pt, entry.data, entry.pt_n, entry.data_n, entry.etc, pw, pw_n)
        let res = await fetch(qurl, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {},
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify({ id : userid, r: ret }),
        })
        if (res.ok) {
            entry.status.nodeValue = "success";
            entry.pw_name.nodeValue = pw_name;
            let time = new Date();
            let date = time.getFullYear() + "-" + (time.getMonth()+1) + "-" + time.getDate()
            if(remember) {
                PMPut(qurl, userid, pw_name, true, prid_n, pr_n);
                // date = PMChange(userid, qurl, pw_name, salt_n, pr_n)
                entry.saved.checked = true;
            }
            else {
                PMPut(qurl, userid, pw_name, true, "", "");
                // date = PMChange(userid, qurl, pw_name, null, null)
                entry.saved.checked = false;
            }
            entry.date.nodeValue = date;
        }
        else {
            entry.status.nodeValue = "update fail";
        }
    }
    catch (err) {
        console.log(err)
        entry.status.nodeValue = "update fail";
    }
}

function select_entry() {
    const select_global = document.getElementById('select_global');
    let keys = Object.keys(entries);
    let all_checked = true;
    let all_unchecked = true;
    for(var i=0; i<keys.length; i++) {
        let key = keys[i];
        let entry = entries[key];
        if(entry.checked.checked) {
            all_unchecked = false;
        } else {
            all_checked = false;
        }
        if(!all_checked && !all_unchecked) break;
    }
    if(all_checked) select_global.checked = true;
    if(all_unchecked) select_global.checked = false;
}

function clear_all() {
    let keys = Object.keys(entries);
    for(var i=0; i<keys.length; i++) {
        let key = keys[i];
        let entry = entries[key];
        if (entry.checked.checked === true) {
            localStorage.removeItem(key);
            entry.node.remove();
            delete(entries[key])
            document.getElementById('pw_name_list').innerHTML = '';
            load_pw_name()
        }
    }
    document.getElementById("select_global").checked = false;
}

function refresh_view() {
    let dom_entries = document.getElementById("entries")
    dom_entries.innerHTML = 
    '<tr id="entry_title">\
        <th>User ID</th>\
        <th>Server Address</th>\
        <th>Login Date</th>\
        <th>PW Name</th>\
        <th>PRStored</th>\
        <th>\
        Select\
        <input type="checkbox" id="select_global" onchange="select_global()"/>\
        </th>\
    </tr>';
    let keys = Object.keys(localStorage);
    for(var i=0; i<keys.length; i++) {
        let key = keys[i];
        let [tr, entry] = key_to_entry(key, localStorage.getItem(key));
        if( tr!== null && entry !== null) {
            dom_entries.appendChild(tr);
            entries[key] = entry;
        }
    }
    document.getElementById('pw_name_list').innerHTML = '';
    load_pw_name()
}
