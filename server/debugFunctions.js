import { Experiences } from '../imports/api/experiences/experiences.js';
import { Incidents } from '../imports/api/incidents/incidents.js';
import { Locations } from '../imports/api/locations/locations.js';
import { Detectors } from '../imports/api/detectors/detectors.js';
import { Images } from '../imports/api/images/images.js';
import { TextEntries } from '../imports/api/text-entries/text-entries.js';
import { NotificationLog } from '../imports/api/cerebro/cerebro-core.js';

export const cleardb = new ValidatedMethod({
  name: 'cleardb',
  validate: new SimpleSchema({
  }).validator(),
  run() {
    console.log("clearing the db");
    Meteor.users.remove({});
    Experiences.remove({});
    Locations.remove({});
    Images.remove({});
    TextEntries.remove({});
    Incidents.remove({});
    NotificationLog.remove({});

  }
});

export const clearParticipation = new ValidatedMethod({
  name: 'clearParticipation',
  validate: new SimpleSchema({
  }).validator(),
  run() {
    Meteor.users.update({}, {$set: {'profile.lastParticipated': null}}, { multi: true })
    Locations.update({}, {$set: {'lastNotification': null}}, { multi: true })

  }
});


export const createUsers = Meteor.methods({
  'addUsers' ({user}){
      console.log("adding users to the db");
      Accounts.createUser(user);
  }
});

export const addLocations = Meteor.methods({
  'addLocations' ({}){
      console.log("adding locatins to the users");
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('a@gmail.com')._id,
        lat: 42.048513, //beach
        lng:  -87.672043
      });
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('b@gmail.com')._id,
        lat: 42.054902,  //lakefill
        lng: -87.670197
      });
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('c@gmail.com')._id,
        lat: 42.056975, //ford
        lng:  -87.676575
      });
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('d@gmail.com')._id,
        lat: 42.059273, //garage
        lng: -87.673794
      });
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('e@gmail.com')._id,
        lat: 42.044314,  //nevins
        lng: -87.682157
      });
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('f@gmail.com')._id,
        lat: 42.046131,  //edzos
        lng: -87.681559
      });
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('g@gmail.com')._id,
        lat: 42.044314,  //nevins
        lng: -87.682157
      });
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('h@gmail.com')._id,
        lat: 42.045398,  //pubs
        lng: -87.682431
      });
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('i@gmail.com')._id,
        lat: 42.047621, //grocery, whole foods
        lng: -87.679488
      });
      Meteor.call("locations.updateUserLocationAndAffordances", {
        uid: Accounts.findUserByEmail('j@gmail.com')._id,
        lat: 42.042617, //beach
        lng: -87.671474
      });
  }
});

export const addExperience = Meteor.methods({
  'addExperience' ({experience}){
      console.log("adding experience to the db");
      Experiences.insert(experience)
  }
});

// new ValidatedMethod({
//   name: 'addUsers',
//   validate({ user }){
//
//   },
//   run() {
//     console.log("adding users to the db");
//     console.log(this);
//     Accounts.createUser(user);
//
//   }
// });
