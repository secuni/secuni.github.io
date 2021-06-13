import {rsa_encrypt} from './encryption.js';
import {PBKDF2_SHA256} from './pbkdf2.js';

class HANData{
  constructor(salt, hint, na, pk) {
      this.salt = salt;
      this.hint = hint;
      this.na = na;
      this.pk = pk;
  }
}

function split_ncut(delim, s, ncut) {
  let lst = s.split(delim)
  let fst = lst.slice(0,ncut)
  let rest = lst.slice(ncut)
  return (rest.length > 0 ? fst.concat([rest.join(delim)]) : fst)
}

function to_str(data, s) {
  return data.salt + ';' + data.hint + ';' + data.na + ';' + data.pk + ';' + s;
}

function from_str(ds, ncut) {
  const [salt, hint, na, pk, s] = split_ncut(';', ds, 4);
  return [new HANData(salt, hint, na, pk), split_ncut(';', s, ncut)];
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
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return iv.toString(CryptoJS.enc.Base64) + ',' + encdata.toString()
}

function encrypt_s(key, data) {
  const iv = CryptoJS.lib.WordArray.random(128/8);
  const encdata = CryptoJS.AES.encrypt(data, key, { 
    iv: iv, 
    padding: CryptoJS.pad.Pkcs7,
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
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  })
  decrypted.sigBytes = 32;
  const seedbyte = CryptoJS.lib.WordArray.create(decrypted.words.slice(0,8))
  return seedbyte
}

function hash(data) {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Base64);
}

function hash_bin(data) {
  return CryptoJS.SHA256(data);
}

function hash_many_bin(data) {
  return PBKDF2_SHA256(data, "", 10000, 32)
}

function sign(sk_str, data) {
  const sig = new KJUR.crypto.Signature({'alg':'SHA256withECDSA'});
  sig.init(sk_str)
  return hexToBase64(sig.signString(data))
}

function random_bin() {
  return CryptoJS.lib.WordArray.random(32);
}

function random() {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
}

function generate_key(seed){
  const ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
  constructKeyPairHex(ec, seed.toString());
  const privkey = KEYUTIL.getPEM(ec, "PKCS8PRV");
  const pubkey = KEYUTIL.getPEM(ec);
  return [privkey, pubkey]
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
      encrypt_s_text,hash, hash_many_bin, generate_key, 
      random, random_bin, decrypt_s, sign, hash_bin}