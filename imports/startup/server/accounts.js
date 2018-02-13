import { Accounts } from 'meteor/accounts-base';
import { Schema } from '../../api/schema.js'

Accounts.onCreateUser(function (options, user) {
  user.profile = user.profile || {};
  user.profile.experiences = [];
  user.profile.subscriptions = [];
  user.profile.lastParticipated = null;
  user.profile.lastNotified = null;
  user.profile.activeExperiences = [];
  user.profile.pastIncidents = [];

  return user;
});
