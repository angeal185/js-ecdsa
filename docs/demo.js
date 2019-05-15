
//demo
$('body').append('<div class="container-fluid"><h1 class="text-center mt-4 mb-4">ECDSA</h1><div class="row main"></div></div>')

$.each(['curve','hash'], function(i,e){
  $('.main').append('<div class="col-sm-6 text-center mb-4"><label>select '+ e +'</label><select id="'+ e +'Key" class="custom-select"></select></div>')
})

$.each(['256','384','521'], function(i,e){
  $('#curveKey').append('<option value="'+ e +'">P-'+ e +'</option>')
})

$.each(['256','384','512'], function(i,e){
  $('#hashKey').append('<option value="'+ e +'">SHA-'+ e +'</option>')
})



$.each(['public','private'], function(i,e){
  $('.main').append('<div class="col-sm-6 text-center"><label>'+ e +' key</label><textarea id="'+ e +'Key" class="form-control keyOut json"></textarea></div>')
})

$.each(['data','sign','verify'], function(i,e){
  $('.main').append('<div class="col-sm-4 text-center"><label>'+ e +'</label><input id="'+ e +'Key" class="form-control"></div>')
})


$('#hashKey').off().on('change', function(){
  $('#dataKey').keyup();
});

$(document).ready(function() {
  $.each(['public','private','sign','verify'], function(i,e){
    $('#'+ e +'Key').attr('readonly','true')
  })
  $('#signKey,#verifyKey').attr('readonly','true')
  $('#curveKey').on('change', function(){
    let crv = $(this).val()

    ecdsa.gen(crv, function(err, gen){
      if(err){return console.log(err)}
      $.each({'public': gen.public,'private': gen.private}, function(i,e){
        $('#'+i+ 'Key').text(JSON.stringify(e,0,2))
      })
      //console.log(gen)
      $('#dataKey').off().on('keyup', function(){

        let str = $(this).val(),
        hashVal = $('#hashKey').val();
        ecdsa.sign(gen.private, str, hashVal, function(err, res){
          if(err){return console.log(err)}
          $('#signKey').val(res);
          ecdsa.verify(gen.public, res, str, hashVal, function(err, res){
            if(err){return console.log(err)}
            if(res){
              $('#verifyKey').val('ecdsa test pass');
              return
            }
            $('#verifyKey').val('ecdsa test fail');
            return
          })
        })
      })
    })
   });

  $('#curveKey').change();
});
