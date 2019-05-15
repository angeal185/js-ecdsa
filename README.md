# js-ecdsa
ecdsa for the browser using the webcrypto api


ecdsa.gen(curve, cb)

ecdsa.sign(key, data, hash, digest, cb)

ecdsa.verify(key, sig, data, hash, digest, cb)



#### API

```js

//generate p-521 ecdsa keypair
ecdsa.gen('521', function(err, gen){
  if(err){return console.log(err)}
  console.log(gen)

  //sign some data
  ecdsa.sign(gen.private, 'test', '512', 'hex', function(err, res){
    if(err){return console.log(err)}
    console.log(res)

    //verify data
    ecdsa.verify(gen.public, res, 'test', '512', 'hex', function(err, res){
      if(err){return console.log(err)}
      if(res){
        return console.log('ecdsa test pass')
      }
      return console.log('ecdsa test fail')
    })
  })
})

```
