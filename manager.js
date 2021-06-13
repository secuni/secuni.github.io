function PMPut(id, url_query, salt, pr) {
    const url = new URL(url_query)
    const path = url.origin + url.pathname;
    let key = [id, path].join(";");
    if(localStorage.getItem(key) === null) {
        let time = new Date();
        let date = "UNKNOWN"
        let pw_name = "UNKNOWN"
        let val = [date, pw_name, salt, pr].join(";");
        localStorage.setItem(key, val);
    }
    else {
        let [date, pw_name, salt_p, pr_p] = localStorage.getItem(key).split(";");
        let val = [date, pw_name, salt, pr].join(";");
        localStorage.setItem(key, val)
    }
}

function PMChange(id, url_query, pw_name, salt, pr) {
    const url = new URL(url_query)
    const path = url.origin + url.pathname;
    let key = [id, path].join(";");
    let [date_p, pw_name_p, salt_p, pr_p] = localStorage.getItem(key).split(";")
    if(pw_name === "")
        pw_name = pw_name_p;
    let time = new Date();
    let date = time.getFullYear() + "-" + (time.getMonth()+1) + "-" + time.getDate()
    let val = [date, pw_name, salt, pr].join(";");
    localStorage.setItem(key, val);
    return date;
}

function PMCreate(id, url_query, pw_name) {
    const url = new URL(url_query)
    const path = url.origin + url.pathname;
    let key = [id, path].join(";");
    let time = new Date();
    let date = time.getFullYear() + "-" + (time.getMonth()+1) + "-" + time.getDate()
    let val = [date, pw_name, null, null].join(";");
    localStorage.setItem(key, val);
    return date;
}

function PMGet(id, url_query, salt) {
    const url = new URL(url_query)
    const path = url.origin + url.pathname;
    let key = [id, path].join(";");
    let val = localStorage.getItem(key)
    if(val === null)
        return null;
    val = val.split(";");
    if(val[2] === salt) 
        return val[3];
    else 
        return null
}