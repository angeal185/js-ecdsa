# js-ecdsa
ecdsa for the browser using the webcrypto api

Demo: https://angeal185.github.io/jquery-ecdsa

### Installation

npm

```sh
$ npm install js-ecdsa --save
```

bower

```sh
$ bower install js-ecdsa
```

git
```sh
$ git clone git@github.com:angeal185/js-ecdsa.git
```

#### browser

```html
<script src="./dist/js-ecdsa.min.js"></script>
```

#### API

```javascript

/**
 *  generate ecdsa keypair
 *  @param {string} curve ~ '256'/'384'/'521'
 *  @param {function} cb ~ callback function(err,res)
 **/

ecdsa.gen(curve, cb)


/**
 *  create signature
 *  @param {string} key ~ valid jwk
 *  @param {string} data ~ data to be signed
 *  @param {string} hash ~ '128'/'256'/'512'
 *  @param {string} digest ~ 'hex'/'base64'/'Uint8'
 *  @param {function} cb ~ callback function(err,res)
 **/

ecdsa.sign(key, data, hash, digest, cb)


/**
 *  verify signature
 *  @param {string} key ~ valid jwk
 *  @param {string} sig ~ valid signature
 *  @param {string} data ~ data to verify
 *  @param {string} hash ~ '128'/'256'/'512'
 *  @param {string} digest ~ 'hex'/'base64'/'Uint8'
 *  @param {function} cb ~ callback function(err,res)
 **/

ecdsa.verify(key, sig, data, hash, digest, cb)



//demo

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

```
