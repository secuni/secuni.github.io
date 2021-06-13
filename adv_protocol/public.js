import {get_hpw, gen_prvr, get_pr, get_salt} from './private.js';
import {to_str, from_str, encrypt_a, encrypt_s, 
        encrypt_s_text,hash, hash_many_bin, generate_key, 
        random, random_bin, decrypt_s, sign, hash_bin} from './library.js';

function prove_upd_adv(data, pw, s) {
    const cl = random();
    const cl_sec = "secure" + random();
    const salt = get_salt(data, cl);
    const salt_sec = get_salt(data, cl_sec);
    const [pr, vr, hint] = gen_prvr(data, get_hpw(pw, salt));
    const [pr_sec, vr_sec, hint_sec] = gen_prvr(data, get_hpw(pw, salt_sec));
    let s_n = to_str(data, cl_sec+';'+salt_sec+';'+hint_sec+';'+vr_sec + ';' + cl+';'+salt+';'+hint+';'+vr +';' + s )
    let enc_a = encrypt_a(data.pk, s_n)
    return [enc_a, hash(salt), pr]
}

function get_prover_adv(data,pw) {
    return get_pr(data, get_hpw(pw, data.salt))
}


function prove_auth_adv(data, pr, s) {
    let s_n = to_str(data, s)
    return (sign(pr, s_n))+';'+ s_n
}

function get_prid_adv(data) {
    return hash(data.salt);
}

function parse_adv(ds) {
    const [data,{}] = from_str(ds, 1);
    return data;
}
  
export {prove_upd_adv, get_prover_adv, prove_auth_adv, get_prid_adv, parse_adv};