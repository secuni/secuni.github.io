function maximize() {
    window.moveTo(0, 0);
    window.resizeTo(screen.availWidth, screen.availHeight);   
}

function enter_pwd() {
    let k = window.event.keyCode;
    if(k === 13){
        document.getElementById("compute").click();
    }
}

function changeAuth() {
    if(document.getElementById('auth_method').checked) {
        document.getElementById('pw_method').style.display = 'none';
        document.getElementById('otp_view').style.display = 'block';
    }
    else {
        document.getElementById('pw_method').style.display = '';
        document.getElementById('otp_view').style.display = 'none';
    }
}

function copy() {
    let val = document.getElementById('hanpass_result').value;
    navigator.clipboard.writeText(val).then(function() {
        document.getElementById('hanpass_clip').innerHTML = '&#x2705;'
        window.close();
    }, function(err) {});
}

function paste() {
    navigator.clipboard.readText().then((text) => {
        document.getElementById('hanpass_account_data').value = text
        open_field();
    });
}

function open_field() {
    arr = document.getElementById('hanpass_account_data').value.split(';')
    if(arr[1] && arr[1] === 'change') {
        document.getElementById('change_input').innerHTML = '\
        <td>\
            New PW\
        </td>\
        <td>\
            <input type="password" id="user_pw_new" autocomplete="new-password" onkeypress="enter_pwd()" autofocus>\
            <span>&nbsp;&nbsp;&nbsp;</span>\
        </td>'
    }
    else {
        document.getElementById('change_input').innerHTML = ''
    }
}
