var VVBot = require('./vvBot');

var settings = {
    token: process.env.SLACK_TOKEN,
};

var vvBot = new VVBot(settings);

vvBot.run();
