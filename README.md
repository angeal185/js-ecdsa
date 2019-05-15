# js-ecdsa
ecdsa for the browser using the webcrypto api


#### API

```js

ecdsa.gen('P-521', function(err, gen){
  if(err){return console.log(err)}
  //console.log(gen)
  ecdsa.sign(gen.private, 'test', '512', function(err, res){
    if(err){return console.log(err)}
    //console.log(res)
    ecdsa.verify(gen.public, res, 'test', '512', function(err, res){
      if(err){return console.log(err)}
      if(res){
        return console.log('ecdsa test pass')
      }
      return console.log('ecdsa test fail')
    })
  })
})

```
