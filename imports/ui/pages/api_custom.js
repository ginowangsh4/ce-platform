import './api_custom.html';
import '../components/contributions.html';
import '../components/loading_overlay.html';
import '../components/loading_overlay.js';
import '../components/loading_overlay.scss';

import {ReactiveDict} from 'meteor/reactive-dict';

import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';

import {Experiences} from '../../api/experiences/experiences.js';
import {Incidents} from '../../api/incidents/incidents.js';
import {Users} from '../../api/users/users.js';
import {Locations} from '../../api/locations/locations.js';
import {Submissions} from '../../api/submissions/submissions.js';
import {Images} from '../../api/images/images.js';
import {TextEntries} from '../../api/text-entries/text-entries.js';

import {photoInput} from './photoUploadHelpers.js'
import {photoUpload} from './photoUploadHelpers.js'


// HELPER FUNCTIONS FOR LOADING CUSTOM EXPERIENCES
Template.api_custom.helpers({

  data() {
    console.log("api custom this", this);
    return {
      location: this.location,
      experience: this.experience,
      iid: Router.current().params.iid,
      needName: Router.current().params.needName
    }
  },
  intoText(){
    //TODO: get intro text from experience -> contributiontype -> find correct need
    return Router.current().params.needName;
  }


  // data2pass() {
  //   //TODO: clean up this hot mess of a function
  //   const instance = Template.instance();
  //   const incident = instance.state.get('incident');
  //   const subs = Submissions.find({ incidentId: incident._id }).fetch();
  //   const hasSubs = subs.length > 0;
  //
  //   // TODO: fix, dont want to get by experience
  //   const exp = instance.state.get('experience');
  //   incident.situationNeeds.forEach((sitNeed) => {
  //     if (sitNeed.notifiedUsers.includes(Meteor.userId())) {
  //       situationNeedName = sitNeed.name;
  //       contributionTemplateName = sitNeed.contributionTemplate;
  //       affordance = sitNeed.affordance
  //     }
  //   });
  //   let contributionTemplate;
  //   exp.contributionGroups.forEach((group) => {
  //     group.contributionTemplates.forEach((template) => {
  //       if (template.name === contributionTemplateName) {
  //         contributionTemplate = template
  //       }
  //     });
  //   });
  //
  //   instance.state.set('situationNeedName', situationNeedName);
  //   instance.state.set('contributionTemplate', contributionTemplate);
  //
  //   return {
  //     'incident': incident,
  //     'situationNeedName': situationNeedName,
  //     'contributionTemplate': contributionTemplate,
  //     'submissions': subs
  //   }
  // },
  // template_name() {
  //   const instance = Template.instance();
  //   return instance.state.get('experience').participateTemplate;
  // }
});

Template.api_custom.onCreated(() => {

});

Template.api_custom.events({
  'submit form'(event, instance) {
    event.preventDefault();

    //this makes the loading circle show up
    event.target.getElementsByClassName('overlay')[0].style.display = 'initial';


    const experience = this.experience;
    const location = this.location;
    const iid = Router.current().params.iid;
    const needName = Router.current().params.needName;
    const uid = Meteor.userId();
    const timestamp = Date.now()
    const submissions = {};
    const resultsUrl = '/apicustomresults/' + iid + '/' + experience._id;

    console.log('api_custom: ', this);

    // const dropDowns = event.target.getElementsByClassName('dropdown');
    // _.forEach(dropDowns, (dropDown) => {
    //   const index = dropDown.selectedIndex;
    //   submissions[dropDown.id] = TextEntries.insert({
    //     submitter: userId,
    //     text: dropDown[index].value,
    //     contribution: dropDowns[i].id,
    //     experienceId: experienceId,
    //     incidentId: incidentId,
    //   });
    // });

    // const textBoxes = event.target.getElementsByClassName('textEntry');
    // _.forEach((textBoxes), (textBox) => {
    //   submissions[form.id] = TextEntries.insert({
    //     submitter: userId,
    //     text: form.value,
    //     contribution: form.id,
    //     experienceId: experienceId,
    //     incidentId: incidentId,
    //   });
    // });

    const images = event.target.getElementsByClassName('fileinput');
    //no images being uploaded so we can just go right to the results page
    if (images.length === 0) {
      Router.go(resultsUrl);
    }

    //otherwise, we do have images to upload so need to hang around for that
    _.forEach(images, (image, index) => {
      console.log("the image is ", image, image._id);
      const picture = event.target.photo && event.target.photo.files[index];
      // save image and get id of new document
      const imageFile = Images.insert(picture, (err, imageFile) => {
        //this is a callback for after the image is inserted
        if (err) {
          alert(err);
        } else {
          //success branch of callback
          console.log("image uploaded now we need to update it", imageFile._id);
          //add more info about the photo
          Images.update({_id: imageFile._id}, {
            $set: {
              iid: iid,
              lat: location.lat,
              lng: location.lng,
              needName: needName,
            }
          }, (err, docs) => {
            if (err) {
              console.log('upload error,', err);
            } else {
              console.log('upload worked', docs, needName);

            }

          });
          // TODO: setTimeout for automatically moving on if upload takes too long

          //watch to see when the image db has been updated, then go to results
          const cursor = Images.find(imageFile._id).observe({
            changed(newImage) {
              if (newImage.isUploaded()) {
                cursor.stop();
                Router.go(resultsUrl);
              }
            }
          });
        }
      });

      // add the submitted image to the submissions content dictionary
      submissions[image.id] = imageFile._id;
    });

    console.log("content is ", submissions)
    const submissionObject = {
      uid: uid,
      eid: experience._id,
      iid: iid,
      needName: needName,
      content: submissions,
      timestamp: timestamp,
      lat: location.lat,
      lng: location.lng
    };

    //TODO: this should be updating an old submission object
    Meteor.call('updateSubmission', submissionObject);

  },
  'click #participate-btn'(event, instance) {
    event.preventDefault();
    //makes it disappear so you don't see it while image is submitting
    document.getElementById('participate-btn').style.display = 'none';
  },
  'click .fileinput, touchstart .glyphicon-camera'(event, target) {
    photoInput(event);
  },
  'click .glyphicon-remove'(event, target) {
    // NOTE: 5/22/16: simpler methods don't seem to work here
    // e.g. $fileInput.val('');
    event.stopImmediatePropagation();
    event.stopPropagation();
    const $fileInput = $('input[name=photo]');
    $fileInput.replaceWith($fileInput.val('').clone(true));

    $('.fileinput-preview').attr('src', '#');
    $('.fileinput-exists').hide();
    $('.fileinput-new').show();
  },
  'change input[name=photo]'(event, target) {
    photoUpload(event);
  }
});
