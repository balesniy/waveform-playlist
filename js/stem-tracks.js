var playlist = WaveformPlaylist.init({
  samplesPerPixel: 1000,
  waveHeight: 100,
  container: document.getElementById('playlist'),
  timescale: true,
  state: 'cursor',
  colors: {
    waveOutlineColor: '#E0EFF1'
  },
  controls: {
    show: true, //whether or not to include the track controls
    width: 200 //width of controls in pixels
  },
  zoomLevels: [500, 1000, 3000, 5000]
});

playlist.load([
    {
      'src': 'media/audio/Vocals30.mp3',
      'name': 'Vocals',
      'gain': 0.75,
      'muted': false,
      'soloed': false
    },
    {
      'src': 'media/audio/Guitar30.mp3',
      'name': 'Guitar'
    },
    {
      'src': 'media/audio/PianoSynth30.mp3',
      'name': 'Pianos & Synth',
      'gain': 1
    },
    {
      'src': 'media/audio/BassDrums30.mp3',
      'name': 'Drums'
    }
  ])
  .then(function () {
    var context = playlist.ac;
    playlist.ee.emit('pitchCorrectionStart')
    return Promise.all(playlist.tracks.map(track => {
      const t0 = performance.now();
      var worker = new Worker('js/kali-worker.js');
      var inputData = track.buffer.getChannelData(0);
      worker.postMessage(inputData);
      return new Promise(resolve => {
        worker.addEventListener('message', function ({ data }) {
          var outputAudioBuffer = context.createBuffer(
            1,
            data.length,
            context.sampleRate,
          );
          outputAudioBuffer.getChannelData(0)
            .set(data);
          track.playout.buffer = outputAudioBuffer;
          track.setBuffer(outputAudioBuffer);
          track.calculatePeaks(playlist.samplesPerPixel, playlist.sampleRate);
          console.log(track.name, (performance.now() - t0) / 1000);
          resolve();
        }, false);
      });
    }));
  })
  .then(() => {
    playlist.draw(playlist.render());
    playlist.ee.emit('pitchCorrectionEnd')
  });
