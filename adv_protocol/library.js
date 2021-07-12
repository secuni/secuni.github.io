import {rsa_encrypt} from './encryption.js';

class HANData{
  constructor(hint) {
      this.hint = hint;
  }
}

function split_ncut(delim, s, ncut) {
  let lst = s.split(delim)
  let fst = lst.slice(0,ncut)
  let rest = lst.slice(ncut)
  return (rest.length > 0 ? fst.concat([rest.join(delim)]) : fst)
}

function to_str(data, s) {
  return (data ? data.hint : '') + ';' + s;
}

function from_str(ds, ncut) {
  const [hint, s] = split_ncut(';', ds, 1);
  return [hint === '' ? null : new HANData(hint), split_ncut(';', s, ncut)];
}

function encrypt_a(pubkey, txt) {
  let sym_key = random()
  let enc_s = encrypt_s_text(sym_key,txt)
  let sym_key_enc = rsa_encrypt(pubkey, sym_key)
  let enc = sym_key_enc + ';' + enc_s
  return enc
}

function encrypt_s_text(key, data) {
  const iv = CryptoJS.lib.WordArray.random(128/8);
  const encdata = CryptoJS.AES.encrypt(data,  CryptoJS.enc.Base64.parse(key), { 
    iv: iv, 
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.CBC
  });
  return iv.toString(CryptoJS.enc.Base64) + ',' + encdata.toString()
}

function encrypt_s(key, data) {
  const iv = CryptoJS.lib.WordArray.random(128/8);
  const encdata = CryptoJS.AES.encrypt(data, key, { 
    iv: iv, 
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.CBC
  });
  return iv.toString(CryptoJS.enc.Base64) + ',' + encdata.toString()
}

function decrypt_s(key, data) {
  const [ivstr, encdatastr] = data.split(',');
  const iv = CryptoJS.enc.Base64.parse(ivstr);
  const encdata = CryptoJS.enc.Base64.parse(encdatastr);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: encdata }, key, {
    iv: iv, 
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.CBC
  })
  // decrypted.sigBytes = 32;
  // const seedbyte = CryptoJS.lib.WordArray.create(decrypted.words.slice(0,8))
  // return seedbyte
  decrypted.sigBytes = 32;
  return decrypted
}

function hash(data) {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Base64)
}

function hash_many(data, salt, n) {
  return PBKDF2_SHA256(data, salt, n, 64).toString(CryptoJS.enc.Base64)
}

function hash_bin(data) {
  return CryptoJS.SHA256(data)
}

function hash_many_bin(data, salt, n) {
  return PBKDF2_SHA256(data, salt, n, 64)
}

function sign(pr, s, n) {
  const [salt, sk_str] = split_ncut(',',pr,1);
  let sk = "-----BEGIN PRIVATE KEY-----\n" + sk_str.substr(0,64) + "\n" + sk_str.substr(64,64) + "\n" + sk_str.substr(128) + "\n-----END PRIVATE KEY-----"
  const sig = new KJUR.crypto.Signature({'alg':'SHA256withECDSA'});
  sig.init(sk)
  if(n==0)
    return hexToBase64(sig.signString(salt+s));
  else
    return hexToBase64(sig.signString(hash_many(s, salt, n)));
}

function random_bin(bytes=32) {
  return CryptoJS.lib.WordArray.random(bytes);
}

function random(bytes=32) {
  return CryptoJS.lib.WordArray.random(bytes).toString(CryptoJS.enc.Base64);
}

function hexToBase64(hexstring) {
  return btoa(hexstring.match(/\w{2}/g).map(function(a) {
    return String.fromCharCode(parseInt(a, 16));
  }).join(""));
}

function constructKeyPairHex(ec, seed) {
  var biN = ec.ecparams['n'];
  var biPrv = new BigInteger(seed,16);
  var epPub = ec.ecparams['G'].multiply(biPrv);
  var biX = epPub.getX().toBigInteger();
  var biY = epPub.getY().toBigInteger();

  var charlen = ec.ecparams['keylen'] / 4;
  var hPrv = ("0000000000" + biPrv.toString(16)).slice(- charlen);
  var hX   = ("0000000000" + biX.toString(16)).slice(- charlen);
  var hY   = ("0000000000" + biY.toString(16)).slice(- charlen);

  var hPub = "04" + hX + hY;

  ec.setPrivateKeyHex(hPrv);
  ec.setPublicKeyHex(hPub);
  return {'ecprvhex': hPrv, 'ecpubhex': hPub};
}

export {to_str, from_str, encrypt_a, encrypt_s, 
      encrypt_s_text, hash, random, random_bin, 
      decrypt_s, sign, hash_bin, hash_many, hash_many_bin, constructKeyPairHex}