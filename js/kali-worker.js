self.window = self;
importScripts('kali.js');

self.addEventListener('message', function({data}) {
  var kali = new Kali(1);
  kali.setup(44100, 0.5, true);
  var inputData = data;
  var completed = new Float32Array(inputData.length + 1);
  kali.input(inputData);
  kali.process();
  kali.output(completed);
  kali.flush();
  self.postMessage(completed);
}, false);
