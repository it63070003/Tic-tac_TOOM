var ml4 = {};
ml4.opacityIn = [0,1];
ml4.scaleIn = [0.2, 0.5];
ml4.scaleOut = 0.5;
ml4.durationIn = 800;
ml4.durationOut = 600;
ml4.delay = 500;

anime.timeline({loop: false})
  .add({
    targets: '.ml4',
    opacity: ml4.opacityIn,
    scale: ml4.scaleIn,
    duration: ml4.durationIn
  }).add({
    targets: '.ml4',
    opacity: 0,
    scale: ml4.scaleOut,
    duration: ml4.durationOut,
    easing: "easeInExpo",
    delay: ml4.delay
  }).add({
    targets: '.ml4',
    opacity: 0,
    duration: 500,
    delay: 500
  });
  setTimeout(testt, 3000);

  function testt(){
    console.log('donnnnn')
  }
