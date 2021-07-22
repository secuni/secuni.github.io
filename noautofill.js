let user_info2_e = document.getElementById('user_info2');
let user_info3_e = document.getElementById('user_info3');
let user_info4_e = document.getElementById('user_info4');

let user_info2="";
let user_info3="";
let user_info4="";


function get_info2() {
    return user_info2
}

function get_info3() {
    return user_info3
}

function get_info4() {
    return user_info4
}

if(user_info2_e) {
    user_info2_e.addEventListener('blur', function(e){
        user_info2 = user_info2_e.value
        user_info2_e.value = "*".repeat(user_info2.length)
    })
    user_info2_e.addEventListener('focus', function(e){
        user_info2_e.value = user_info2 
    })
}

if(user_info3_e) {
    user_info3_e.addEventListener('blur', function(e){
        user_info3 = user_info3_e.value
        user_info3_e.value = "*".repeat(user_info3.length)
    })
    user_info3_e.addEventListener('focus', function(e){
        user_info3_e.value = user_info3 
    })
}

if(user_info4_e) {
    user_info4_e.addEventListener('blur', function(e){
        user_info4 = user_info4_e.value
        user_info4_e.value = "*".repeat(user_info4.length)
    })
    user_info4_e.addEventListener('focus', function(e){
        user_info4_e.value = user_info4 
    })
}