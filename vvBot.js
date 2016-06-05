var Bot = require('slackbots');
var util = require('util');
var getAnswer = require('./getAnswer');
var _ = require('lodash');

var vvBot = function PutinConstructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'vladimirvladimirovich';
    this.fullName = settings.fullName || 'Владимир Владимирович';
};

util.inherits(vvBot, Bot);

vvBot.prototype.run = function () {
    vvBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

vvBot.prototype._onStart = function () {
    this._loadBotUser();
};

vvBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        this._isMentioningMe(message) &&
        !this._isFromMyself(message)) {

        this._reply(message);
    }
};

vvBot.prototype._reply = function (originalMessage) {
    var channel = this._getChannelById(originalMessage.channel),
        reply, self = this;

    if (this._isEmptyMessage(originalMessage.text)) {
        reply = 'Вы что-то хотели?';
    } else if (!~originalMessage.text.indexOf('?')) {
        reply = 'Это вопрос или утверждение?';
    } else {
        getAnswer(originalMessage.text)
            .then(function(answer) {
                reply = answer;
            })
            .catch(function() {
                reply = 'Я даже не стану на это отвечать. Следующий, пожалуйста.'; //don't give away the fact that we've broken :)
            })
            .finally(function() {
                self.postMessageToChannel(channel.name, reply, {as_user: true});
            });
    }
    if (reply) {
        self.postMessageToChannel(channel.name, reply, {as_user: true});
    }
};

vvBot.prototype._loadBotUser = function () {
    var self = this;

    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

vvBot.prototype._isEmptyMessage = function(text) {
    var clean =
        text.replace(new RegExp(this.fullName, 'gi'), '')
            .replace(/[.,!?;:]/g, '')
            .replace(new RegExp('<@' + this.user.id + '>', 'g'), '')
            .replace(/\s/g, '');
    return clean === '';
};

vvBot.prototype._isChatMessage = function (messageObj) {
    return messageObj.type === 'message' && Boolean(messageObj.text);
};

vvBot.prototype._isFromMyself = function (message) {
    return message.user === this.user.id;
};

vvBot.prototype._isChannelConversation = function (messageObj) {
    return typeof messageObj.channel === 'string' &&
        messageObj.channel[0] === 'C' || messageObj.channel[0] === 'G';
};

vvBot.prototype._isMentioningMe = function (messageObj) {
    return messageObj.text.toLowerCase().indexOf(this.fullName.toLowerCase()) >= 0 ||
        messageObj.text.indexOf(this.user.id) >= 0;
};

vvBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

module.exports = vvBot;