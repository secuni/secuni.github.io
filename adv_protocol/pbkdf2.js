/* copied from http://www.webtoolkit.info/javascript_sha256.html#.X0IY6mMvM5n */
function binb_sha256(x, len){
  function safe_add (x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
  }

  function core_sha256 (m, l) {
      function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
      function R (X, n) { return ( X >>> n ); }
      function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
      function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
      function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
      function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
      function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
      function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

      var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
      var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
      var W = new Array(64);
      var a, b, c, d, e, f, g, h, i, j;
      var T1, T2;

      m[l >> 5] |= 0x80 << (24 - l % 32);
      m[((l + 64 >> 9) << 4) + 15] = l;

      for ( var i = 0; i<m.length; i+=16 ) {
          a = HASH[0];
          b = HASH[1];
          c = HASH[2];
          d = HASH[3];
          e = HASH[4];
          f = HASH[5];
          g = HASH[6];
          h = HASH[7];

          for ( var j = 0; j<64; j++) {
              if (j < 16) W[j] = m[j + i];
              else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
              T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
              T2 = safe_add(Sigma0256(a), Maj(a, b, c));
              h = g;
              g = f;
              f = e;
              e = safe_add(d, T1);
              d = c;
              c = b;
              b = a;
              a = safe_add(T1, T2);
          }
          HASH[0] = safe_add(a, HASH[0]);
          HASH[1] = safe_add(b, HASH[1]);
          HASH[2] = safe_add(c, HASH[2]);
          HASH[3] = safe_add(d, HASH[3]);
          HASH[4] = safe_add(e, HASH[4]);
          HASH[5] = safe_add(f, HASH[5]);
          HASH[6] = safe_add(g, HASH[6]);
          HASH[7] = safe_add(h, HASH[7]);
      }
      return HASH;
  }
  return core_sha256(x, len);
}


/* copied from http://anandam.name/pbkdf2/ */
function rstr2binb(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
      output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
      output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
  return output;
}

function binb2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
      output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
  return output;
}

function rstr2hex(input)
{
  var hex_tab = "0123456789abcdef";
  var output = "";
  var x;
  for(var i = 0; i < input.length; i++)
  {
      x = input.charCodeAt(i);
      output += hex_tab.charAt((x >>> 4) & 0x0F)
             +  hex_tab.charAt( x        & 0x0F);
  }
  return output;
}


function hexToBase64(str) {
  return btoa(String.fromCharCode.apply(null,
                                        str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
       );
}


export function PBKDF2_SHA256(password, salt, num_iterations, num_bytes)
{
  // Remember the password and salt
  var m_bpassword = rstr2binb(password);
  var m_salt = salt;

  // Total number of iterations
  var m_total_iterations = num_iterations;

  // Run iterations in chunks instead of all at once, so as to not block.
  // Define size of chunk here; adjust for slower or faster machines if necessary.
  var m_iterations_in_chunk = 10;

  // Iteration counter
  var m_iterations_done = 0;

  // Key length, as number of bytes
  var m_key_length = num_bytes;

  // The hash cache
  var m_hash = null;

  // The length (number of bytes) of the output of the pseudo-random function.
  // Since HMAC-SHA256 is the standard, and what is used here, it's 20 bytes.
  var m_hash_length = 32;

  // Number of hash-sized blocks in the derived key (called 'l' in RFC2898)
  var m_total_blocks = Math.ceil(m_key_length/m_hash_length);

  // Start computation with the first block
  var m_current_block = 1;

  // Used in the HMAC-SHA1 computations
  var m_ipad = new Array(16);
  var m_opad = new Array(16);


  // Set up the HMAC-SHA1 computations
  if (m_bpassword.length > 16) {
      m_bpassword = binb_sha256(m_bpassword, password.length * 8);
  }

  for(var i = 0; i < 16; ++i)
  {
      m_ipad[i] = m_bpassword[i] ^ 0x36363636;
      m_opad[i] = m_bpassword[i] ^ 0x5C5C5C5C;
  }

  // This is where the result of the iterations gets sotred
  var m_buffer = new Array(0x0,0x0,0x0,0x0,0x0);

  // The result
  var m_key = "";

  // The workhorse
  function do_PBKDF2_iterations() {
      var iterations = m_iterations_in_chunk;
      if (m_total_iterations - m_iterations_done < m_iterations_in_chunk)
          iterations = m_total_iterations - m_iterations_done;

      for(var i=0; i<iterations; ++i)
      {
          // compute HMAC-SHA1
          if (m_iterations_done == 0)
          {
              var salt_block = m_salt +
                               String.fromCharCode(m_current_block >> 24 & 0xF) +
                               String.fromCharCode(m_current_block >> 16 & 0xF) +
                               String.fromCharCode(m_current_block >>  8 & 0xF) +
                               String.fromCharCode(m_current_block       & 0xF);

              m_hash = binb_sha256(m_ipad.concat(rstr2binb(salt_block)),
                                512 + salt_block.length * 8);
              m_hash = binb_sha256(m_opad.concat(m_hash), 512 + 256);
          }
          else
          {
              m_hash = binb_sha256(m_ipad.concat(m_hash),
                                   512 + m_hash.length * 32);
              m_hash = binb_sha256(m_opad.concat(m_hash), 512 + 256);
          }

          for(var j=0; j<m_hash.length; ++j)
              m_buffer[j] ^= m_hash[j];

          m_iterations_done++;
      }

      if (m_iterations_done < m_total_iterations)
      {
          do_PBKDF2_iterations();
      }
      else
      {
          if (m_current_block < m_total_blocks)
          {
              // Compute the next block (T_i in RFC 2898)

              m_key += rstr2hex(binb2rstr(m_buffer));

              m_current_block++;
              m_buffer = new Array(0x0,0x0,0x0,0x0,0x0);
              m_iterations_done = 0;

              do_PBKDF2_iterations();
          }
          else
          {
              // We've computed the final block T_l; we're done.

              var tmp = rstr2hex(binb2rstr(m_buffer));
              m_key += tmp.substr(0, (m_key_length - (m_total_blocks - 1) * m_hash_length) * 2 );
          }
      }
  }

  do_PBKDF2_iterations();
  return CryptoJS.enc.Hex.parse(m_key)
//   return hexToBase64(m_key);
}