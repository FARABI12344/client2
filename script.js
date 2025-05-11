//<![CDATA[
(function(){
  var countryFormats = {
    DE: { length:22, bban:[{type:'n', length:8},{type:'n', length:10}] },
    FR: { length:27, bban:[{type:'n',length:5},{type:'n',length:5},{type:'c',length:11},{type:'n',length:2}] },
    NL: { length:18, bban:[{type:'a',length:4},{type:'n',length:10}] },
    ES: { length:24, bban:[{type:'n',length:4},{type:'n',length:4},{type:'n',length:1},{type:'n',length:1},{type:'n',length:10}] },
    IT: { length:27, bban:[{type:'a',length:1},{type:'n',length:5},{type:'n',length:5},{type:'c',length:12}] },
    GB: { length:22, bban:[{type:'a',length:4},{type:'n',length:6},{type:'n',length:8}] },
    BE: { length:16, bban:[{type:'n',length:12}] },
    AT: { length:20, bban:[{type:'n',length:16}] },
    SE: { length:24, bban:[{type:'n',length:3},{type:'n',length:16},{type:'n',length:1}] },
    FI: { length:18, bban:[{type:'n',length:3},{type:'n',length:11}] },
    SD: { length:18, bban:[{type:'n',length:2},{type:'n',length:12}] },
    SK: { length:24, bban:[{type:'n',length:4},{type:'n',length:6},{type:'n',length:10}] },
    SM: { length:27, bban:[{type:'a',length:1},{type:'n',length:5},{type:'n',length:5},{type:'c',length:12}] },
    SO: { length:23, bban:[{type:'n',length:4},{type:'n',length:3},{type:'n',length:12}] },
    ST: { length:25, bban:[{type:'n',length:4},{type:'n',length:4},{type:'n',length:11},{type:'n',length:2}] },
    SV: { length:28, bban:[{type:'a',length:4},{type:'n',length:20}] },
    TL: { length:23, bban:[{type:'n',length:3},{type:'n',length:14},{type:'n',length:2}] },
    TN: { length:24, bban:[{type:'n',length:2},{type:'n',length:3},{type:'n',length:13},{type:'n',length:2}] },
    TR: { length:26, bban:[{type:'n',length:5},{type:'n',length:1},{type:'c',length:16}] },
    UA: { length:29, bban:[{type:'n',length:6},{type:'c',length:19}] },
    VA: { length:22, bban:[{type:'n',length:3},{type:'n',length:15}] },
    VG: { length:24, bban:[{type:'n',length:4},{type:'a',length:16}] },
    XK: { length:20, bban:[{type:'n',length:4},{type:'n',length:10},{type:'n',length:2}] },
    YE: { length:30, bban:[{type:'n',length:4},{type:'a',length:4},{type:'n',length:18}] },
    YY: { length:34, bban:[{type:'n',length:4},{type:'a',length:8},{type:'n',length:18},{type:'c',length:4}] },
    ZZ: { length:35, bban:[{type:'n',length:4},{type:'a',length:9},{type:'n',length:18},{type:'c',length:4}] }
  };

  function randomDigit() { return Math.floor(Math.random()*10).toString(); }
  function randomLetter() { var letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'; return letters.charAt(Math.floor(Math.random()*letters.length)); }
  function randomChar(type) {
    if(type==='n') return randomDigit();
    else if(type==='a') return randomLetter();
    else if(type==='c') return Math.random()<0.5 ? randomDigit() : randomLetter();
    return '0';
  }
  function generateBBAN(cc) {
    var f=countryFormats[cc]; if(!f) return '';
    return f.bban.map(function(block){
      var s=''; for(var i=0;i<block.length;i++) s+=randomChar(block.type);
      return s;
    }).join('');
  }
  function ibanToNumeric(iban) {
    return iban.toUpperCase().split('').map(function(ch){
      var c=ch.charCodeAt(0);
      if(c>=65&&c<=90) return (c-55).toString();
      else if(c>=48&&c<=57) return ch;
      else return '';
    }).join('');
  }
  function mod97(numericIban) {
    var remainder=0n;
    for(var i=0;i<numericIban.length;) {
      var block = remainder.toString() + numericIban.substr(i, 9 - remainder.toString().length);
      remainder=BigInt(block) % 97n;
      i+=9 - remainder.toString().length;
    }
    return remainder;
  }
  function calculateCheckDigits(cc,bban) {
    var tempIban=bban+cc+'00';
    var numeric=ibanToNumeric(tempIban);
    var checkDigit=98n - mod97(numeric);
    return checkDigit<10n ? '0'+checkDigit.toString() : checkDigit.toString();
  }
  function generateIBAN(cc) {
    var bban=generateBBAN(cc);
    if(!bban) return '';
    var cd=calculateCheckDigits(cc,bban);
    var iban=cc+cd+bban;
    if(iban.length!==countryFormats[cc].length) return iban.padEnd(countryFormats[cc].length,'0');
    return iban;
  }
  function formatIBAN(iban) {
    var matches=iban.match(/.{1,4}/g);
    return matches ? matches.join(' ') : iban;
  }
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text.replace(/\s/g,''));
  }

  document.getElementById('generate-btn').addEventListener('click',function(){
    var cc=document.getElementById('country-select').value;
    var count=parseInt(document.getElementById('iban-count').value,10);
    var listEl=document.getElementById('iban-list');
    listEl.innerHTML='';

    if(!cc) {
      alert('Please select a country');
      return;
    }
    if(isNaN(count) || count<1 || count>100) {
      alert('Please enter a valid count (1-100)');
      return;
    }

    for(var i=0;i<count;i++) {
      var iban=generateIBAN(cc);
      var formatted=formatIBAN(iban);
      var item=document.createElement('div');
      item.className='iban-item';

      var span=document.createElement('span');
      span.textContent=formatted;
      span.style.userSelect='all';

      var btn=document.createElement('button');
      btn.type='button';
      btn.className='copy-btn';
      btn.textContent='Copy';
      btn.addEventListener('click',(function(txt,btnRef){
        return function(){
          copyToClipboard(txt);
          btnRef.textContent='Copied!';
          setTimeout(function(){btnRef.textContent='Copy';},1500);
        }
      })(formatted,btn));

      item.appendChild(span);
      item.appendChild(btn);
      listEl.appendChild(item);
    }
  });
})();
//]]>
