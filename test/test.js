const ss = {
  get: function(){
    return JSON.parse(sessionStorage.getItem('time'));
  },
  set: function(i){
    sessionStorage.setItem('time', JSON.stringify(i));
    return
  }
}

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

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function test(crv,hash,digest, msg){
  let time = Date.now();
  ecdsa.gen(crv, function(err, gen){
    if(err){return console.log(err)}
    //console.log(gen)
    ecdsa.sign(gen.private, 'test', hash, digest, function(err, res){
      if(err){return console.log(err)}
      //console.log(res)
      ecdsa.verify(gen.public, res, 'test', hash, digest, function(err, res){
        if(err){return console.log(err)}
        if(res){
          document.body.innerHTML += 'ecdsa '+ msg +' pass <br>';
          console.log('ecdsa '+ msg +' pass')
          ss.set(ss.get()+1)
          if(ss.get() === 15){
            document.body.innerHTML += 'Test finished in '+ (Date.now() - time) +'ms';
          }
          return;
        }
        console.log('ecdsa '+ msg +' fail')
        document.body.innerHTML += 'ecdsa '+ msg +' fail <br>'
        return ss.set(ss.get()+1)
      })
    })
  })
}


ss.set(0)
let CRV = shuffle(['256','384','521']),
HASH = shuffle(['256','384','512']),
DIGEST = shuffle(['hex','base64','Uint8Array']);

try {
  for (let x = 0; x < 5; x++) {
    for (let i = 0; i < CRV.length; i++) {
      let arr = ['curve ' + CRV[i], 'hash ' + HASH[i], 'digest ' + DIGEST[i]],
      msg = arr.join(', ');
      test(CRV[i], HASH[i], DIGEST[i], msg + ' test ' + (x + 1) +' round ' + (i + 1))
    }
  }
} catch (err) {
  if(err){
    console.log(err)
  }
}
