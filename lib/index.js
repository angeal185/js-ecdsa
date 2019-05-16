const ecdsa = {
  // Uint8 to bytes
  u82str: function(STR) {
    let str = ''
    for (var i=0; i <  STR.byteLength; i++) {
        str += String.fromCharCode(STR[i])
    }
    return str;
  },
  // bytes to Uint8
  str2u8: function(string) {
    let arrayBuffer = new ArrayBuffer(string.length * 1);
    let newUint = new Uint8Array(arrayBuffer);
    newUint.forEach((_, i) => {
      newUint[i] = string.charCodeAt(i);
    });
    return newUint;
  },
  // Uint8 to hex
  a2h: function(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  },
  // Uint8 to base64
  a2b64: function(byteArray) {
    return Buffer.from(ecdsa.u82str(byteArray)).toString('base64')
  },
  // hex to Uint8
  h2a: function(hexString) {
    let result = [];
    for (var i = 0; i < hexString.length; i += 2) {
      result.push(parseInt(hexString.substr(i, 2), 16));
    }
    return result;
  },
  // base64 to Uint8
  b642a: function(byteArray) {
    return ecdsa.str2u8(Buffer.from(byteArray).toString('binary'))
  },
  // generate keypair
  gen: function(curve, cb){
    window.crypto.subtle.generateKey({name: "ECDSA", namedCurve: 'P-' + curve}, true, ["sign", "verify"])
    .then(function(key){
      let obj = {};
      //public
      window.crypto.subtle.exportKey("jwk", key.publicKey)
      .then(function(kd){
        obj.public = kd

        //private
        window.crypto.subtle.exportKey("jwk", key.privateKey)
          .then(function(kd){
            obj.private = kd;
              cb(false,obj)
          })
          .catch(function(err){
            cb(err);
          });
      })
      .catch(function(err){
        cb(err);
      });

    })
    .catch(function(err){
        cb(err);
    });
  },
  // sign data
  sign: function(key, data, hash, digest, cb){
    window.crypto.subtle.importKey("jwk",
      key,{
        name: "ECDSA",
        namedCurve: key.crv
      }, true, ["sign"]
    )
    .then(function(i){
      window.crypto.subtle.sign({name: "ECDSA", hash: {name: "SHA-" + hash}}, i, ecdsa.str2u8(data))
      .then(function(signature){
        //console.log(signature)
        let sig = ecdsa.hash(digest, new Uint8Array(signature));
        cb(false,sig);
      })
      .catch(function(err){
          cb(err);
      });
    })
    .catch(function(err){
        cb(err);
    });

  },
  // verify data
  verify: function(key, sig, data, hash, digest, cb){
    window.crypto.subtle.importKey("jwk",
      key,{
        name: "ECDSA",
        namedCurve: key.crv
      }, true, ["verify"]
    ).then(function(i){
      window.crypto.subtle.verify({name: "ECDSA", hash: {name: "SHA-"+ hash}},
          i,
          new Uint8Array(ecdsa.unhash(digest, sig)),
          ecdsa.str2u8(data)
      )
      .then(function(isvalid){
          cb(false, isvalid)
      })
      .catch(function(err){
          cb(err);
      });
    })
    .catch(function(err){
        cb(err);
    });
  },
  // hash data
  hash: function(i,data){
    if(!i){
      return null
    }
    if(typeof i === 'function' || i.toLowerCase() === 'hex'){
      return ecdsa.a2h(data)
    } else if(i.toLowerCase() === 'base64'){
      return ecdsa.a2b64(data)
    } else {
      return data;
    }
  },
  //unhash data
  unhash: function(i,data){
    if(!i){
      return null
    }
    if(typeof i === 'function' || i.toLowerCase() === 'hex'){
      return ecdsa.h2a(data)
    } else if(i.toLowerCase() === 'base64'){
      return ecdsa.b642a(data)
    } else {
      return data;
    }
  }
}

module.exports = ecdsa;
