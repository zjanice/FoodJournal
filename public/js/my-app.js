/* globals Framework7 */
/* globals Dom7 */
(function(fj) {
'use strict';

// Initialize your app
var myApp = new Framework7({
  material: true
});

// Export selectors engine
var $$ = Dom7;

let currPost;
let db = new fj.DataBase();

myApp.onPageInit('index', function() {

});

// Add view
myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

let groupTable = {
    breakfast: {type: 'meal', group:'environment'},
    lunch: {type: 'meal', group:'environment'},
    dinner: {type: 'meal', group:'environment'},
    snack: {type: 'meal', group:'environment'},

    home: {type: 'location', group:'environment'},
    restaurant: {type: 'location', group:'environment'},
    eatAtWork: {type: 'location', group:'environment'},
    snack: {type: 'location', group:'environment'},



}

myApp.onPageInit('videoinfo', function() {
  // tags section goes from here
  $$('.tagContainer').on('click',function(){
    $$(this).toggleClass('newtagSelected');
    let content = $$(this).find('.tagName').text();
    let subCat =  $$(this).parent().parent().text();
    // let subCat = $$(this).parent().parent().attr('class');
    console.log(subCat);
    console.log(content);
  });

});

myApp.onPageInit('textfeed', function() {
  currPost = fj.newPost();

  $("input[data-role=materialtags]").materialtags();

  $$('.chip').on('click', function(){
    let content = $$(this).find('.chip-label').text();
    let minorClass = $$(this).parent().attr('class');
    let majorClass = "";

    // Get the major class of the chip
    let majorClassDomClass = $$(this).parent().parent().attr('class');
    let majorClassDomSplittedClasses = majorClassDomClass.split(' ');
    for (let i = 0; i < majorClassDomSplittedClasses.length; i++) {
      if (majorClassDomSplittedClasses[i].startsWith('chip-')) {
        majorClass = majorClassDomSplittedClasses[i];
      }
    }

    if (!currPost.chips[content]) {
      let deleteBtn = $$('<a href="#" class="chip-delete"></a>')
        .on('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var chip = $$(this).parents('.chip');
          // chip.remove();
          chip.removeClass('tagSelected');
          $$(this).remove();
          delete currPost.chips[content];
        });

      $$(this).addClass('tagSelected')
        .append(deleteBtn);

     currPost.chips[content] = {
        chip: content,
        majorClass: majorClass,
        minorClass: minorClass
      };
    }
  });

  $$('.form-to-data').on('click', function(){
    let formData = myApp.formToData('#my-form');
    currPost.location = formData.location;
    currPost.withWhom = formData.withWhom;
  });
});

myApp.onPageInit('addvideo', function() {
  currPost = fj.newPost();
  let video = new fj.Video();
  video.initialize().then(function() {

    $$('button#flip').click(function(){
      video.flipCamera();
    });

    // Recodring
    $$('button#record')[0].disabled = false;
    $$('button#record').click(function() {
      if (video.recording) {
        video.stopRecording();
        $$(this).html("Start Recording");
        $$('.saveBtn').css('opacity',1);
        // $$('button#flip').show();
      } else {
        video.startRecording(true);
        $$(this).html("Stop Recording");
        $$('button#flip').hide();
      }
    });

    $$('a.back').click(function(){
      video.stopStream();
    });

    $$('.saveBtn').click(function() {
      currPost.video = video.getVideo();
      currPost.hasVideo = true;
      currPost.videoMirrored = video.isMirrored();
    });

  });

});

myApp.onPageInit('timeline', function() {
  db.db.allDocs({
    include_docs: true,
    attachments: true,
    binary: true,
    descending: true
  }).then(function(doc) {
      console.log(doc);
      fj.renderPersonalTimeline($$(".timeline"), doc.rows);
    }).catch(function(err) {
      console.log(err);
    });
});

})(window.fj = window.fj || {});
