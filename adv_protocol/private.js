import {to_str, from_str, encrypt_a, encrypt_s, 
        encrypt_s_text,hash, hash_many_bin, generate_key, 
        random, random_bin, decrypt_s, sign, hash_bin} from './library.js';

function get_hpw(pw, salt) {
    const hpw = hash_many_bin(salt+pw);
    return hpw;
}


function gen_prvr(data, hpw) {
    const seed = hash_bin(data.na + random())
    const [sk,pk] = generate_key(seed)
    const hint = encrypt_s(hpw, seed)
    return [sk, pk, hint]
}
  

function get_pr(data, hpw){
    const seed = decrypt_s(hpw, data.hint)
    const [sk,{}] = generate_key(seed)
    return sk
}

function get_salt(data, cl) {
    return hash(data.pk + data.na + cl);
}

export {get_hpw, gen_prvr, get_pr, get_salt};