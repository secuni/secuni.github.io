import {to_str, from_str, encrypt_a, encrypt_s, 
        encrypt_s_text,hash, random, random_bin,
        decrypt_s, sign, hash_bin, constructKeyPairHex} from './library.js';

function get_hpw(pw) {
    return hash_bin(pw);
}

function generate_prvr(data, hpw) {
    const rnum = random_bin(64)
    const [pr, vr] = compute_prvr(rnum)
    const hint = encrypt_s(hpw, rnum)
    return [pr, vr, hint]
}
  

function get_pr(data, hpw){
    const rnum = decrypt_s(hpw, data.hint)
    const [pr,{}] = compute_prvr(rnum)
    return pr
}

function compute_prvr(rnum){
    const seed = CryptoJS.lib.WordArray.create(rnum.words.slice(0,8))
    const salt = CryptoJS.lib.WordArray.create(rnum.words.slice(8,16)).toString(CryptoJS.enc.Base64)
    const ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
    constructKeyPairHex(ec, seed.toString());
    let privkey = KEYUTIL.getPEM(ec, "PKCS8PRV");
    privkey = privkey.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\n|\r/g, "")
    let pubkey = KEYUTIL.getPEM(ec);
    pubkey = pubkey.replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "").replace(/\n|\r/g, "")
    return [salt + ',' + privkey, salt + ',' +  pubkey]
}

export {get_hpw, generate_prvr, get_pr, compute_prvr};