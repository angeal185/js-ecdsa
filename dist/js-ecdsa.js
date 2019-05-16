const ecdsa = {
  u82str: function(STR) {
    let str = ''
    for (var i=0; i <  STR.byteLength; i++) {
        str += String.fromCharCode(STR[i])
    }
    return str;
  },
  str2u8: function(string) {
    let arrayBuffer = new ArrayBuffer(string.length * 1);
    let newUint = new Uint8Array(arrayBuffer);
    newUint.forEach((_, i) => {
      newUint[i] = string.charCodeAt(i);
    });
    return newUint;
  },
  a2h: function(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  },
  a2b64: function(byteArray) {
    return btoa(ecdsa.u82str(byteArray))
  },
  h2a: function(hexString) {
    let result = [];
    for (var i = 0; i < hexString.length; i += 2) {
      result.push(parseInt(hexString.substr(i, 2), 16));
    }
    return result;
  },
  b642a: function(byteArray) {
    return ecdsa.str2u8(atob(byteArray))
  },
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
            cb(err,null);
          });
      })
      .catch(function(err){
        cb(err,null);
      });

    })
    .catch(function(err){
        cb(err,null);
    });
  },
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
          cb(err,null);
      });
    })
    .catch(function(err){
        cb(err,null);
    });

  },
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
          cb(err,null);
      });
    })
    .catch(function(err){
        cb(err,null);
    });
  },
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



const config = {
  curve: '521', // P-521
  hash: '512', // SHA-512
  digest: 'hex', // hexadecimal
  data: 'test'
}

//generate p-521 ecdsa keypair
ecdsa.gen(config.curve, function(err, gen){
  if(err){return console.log(err)}
  console.log(gen)

  //sign some data
  ecdsa.sign(gen.private, config.data, config.hash, config.digest, function(err, sig){
    if(err){return console.log(err)}
    console.log(sig)

    //verify signature
    ecdsa.verify(gen.public, sig, config.data, config.hash, config.digest, function(err, res){
      if(err){return console.log(err)}
      if(res){
        return console.log('ecdsa test pass')
      }
      return console.log('ecdsa test fail')
    })
  })
})
