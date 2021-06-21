let pagetype=-1, // login=0, create=1, change=2, manual=3, pm=4
    opener, url_app,
    entries = {},
    onSubmit = (() => { alert("Please wait!!"); } );

function get_pw_name(key) {
    let [userid, path] = key.split(";");
    let origin = null;
    try{
        origin = new URL(path).origin;
    } catch(err) {
        return null;
    }
    let val = localStorage.getItem(key);
    let [date, pw_name, salt, pr] = val.split(";");
    return pw_name
}

window.onload = function() {
    load_pw_name();

    if(pagetype == 4) {
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
}

function key_to_entry(key, val) {
    let [userid, path] = key.split(";");
    let [date, pw_name, salt, pr] = val.split(";");
    let origin = null;
    try{
        origin = new URL(path).origin;
    } catch(err) {
        return [null,null];
    }
    let tr = document.createElement("tr");

    let td_userid = document.createElement("td");
    let td_userid_val = document.createTextNode(userid);
    td_userid.appendChild(td_userid_val);
    tr.appendChild(td_userid);

    let td_origin = document.createElement("td");
    td_origin.title = path;
    let td_origin_val = document.createTextNode(origin);
    td_origin.appendChild(td_origin_val);
    tr.appendChild(td_origin);

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

    let td_checked = document.createElement("td");
    td_checked.style.textAlign = "center";
    td_checked.onchange = select_entry;
    let td_checked_val = document.createElement("input");
    td_checked_val.type = "checkbox";
    td_checked_val.checked = false;
    td_checked.appendChild(td_checked_val);
    tr.appendChild(td_checked);

    let entry = {
        node: tr,
        origin: td_origin_val,
        userid: td_userid_val,
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
    tr = entry.node;
    let td_status = document.createElement("td");
    let td_status_val = document.createTextNode("");
    td_status.appendChild(td_status_val);
    tr.appendChild(td_status);
    entry.status = td_status_val
}

async function entry_query(key) {
    let [userid, path] = key.split(";");
    let res = null;
    let entry = entries[key];
    let qurl = path + "?query=change&id=" + userid
    try{
        res = await fetch(qurl);
    } catch(err) {
        entry.status.nodeValue = "query failed";
        return false;
    }
    if (res == null || !res.ok ) {
        entry.status.nodeValue = "query failed";
        return false;
    }
    else {
        let body = await res.json();
        let data = body['hpass_data']
        let D = data !== "" ? new HANDataServ(data) : null;
        let data_n = body['hpass_data_n']
        let Dn = data_n !== "" ? new HANDataServ(data_n) : null;
        let ch = body['hpass_ch']
        entries[key] = {...entry, D, Dn, ch}
        return true;
    }
}

async function entry_change(key, pw_name, remember) {
    let [userid, path] = key.split(";");
    const qurl = path + "?query=change_all&id=" + userid;
    let entry = entries[key];
    try {
        let [pw, pw_n] = PWChange(); // always non-null value
        let pr = await get_prover(entry['D'], pw);
        let [s_n, salt_n, {}] = await prove_new(entry['Dn'], pw_n, '');
        let [ret, {}, pr_n] = await prove_auth(entry['D'],  pr, '', s_n)
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
            let body = await res.json();
            let msg = body['msg']
            if(msg === "OK") {
                entry.status.nodeValue = "success";
                if(pw_name !== "")
                    entry.pw_name.nodeValue = pw_name;
                let date = null;
                if(remember) {
                    date = PMChange(userid, qurl, pw_name, salt_n, pr_n)
                    entry.saved.checked = true;
                }
                else {
                    date = PMChange(userid, qurl, pw_name, null, null)
                    entry.saved.checked = false;
                }
                entry.date.nodeValue = date;
            }
            else
                entry.status.nodeValue = "update fail";
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

async function do_update_all() {
    let keys = Object.keys(entries);
    let all_unchecked = true;

    if(PWChange().every(e=>e === null))
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

    document.getElementById("compute").disabled = true;
    
    let pw_name = document.getElementById("pw_name").value;
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
            if(await entry_query(key))
                await entry_change(key, pw_name, remember);
        }
    }));
    document.getElementById("compute").disabled = false;
    document.getElementById('pw_name_list').innerHTML = '';
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
    arr = JSON.parse(arrstr)
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

function refresh_view() {
    let dom_entries = document.getElementById("entries")
    dom_entries.innerHTML = 
    '<tr id="entry_title">\
        <th>User ID</th>\
        <th>Server Address</th>\
        <th>Login Date</th>\
        <th>pw_name</th>\
        <th>PWStored</th>\
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
