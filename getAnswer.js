var _ = require('lodash');
var Promise = require('bluebird');
var Spooky = require('spooky');

module.exports = function getAnswer(question) {
    return new Promise(function(resolve, reject) {

        var env = _.clone(process.env),
            path = __dirname + '/node_modules/.bin';

        env.PATH += ':' + path;

        var spooky = new Spooky({
            child: {
                transport: 'stdio', //this is important
                spawnOptions: {
                    env: env
                }
            },
            casper: {
                viewportSize : { width: 1200, height: 1200 }, //this is important
                logLevel: 'error',
                verbose: false,
                pageSettings: {
                    loadImages:  true,
                    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/601.5.67 (KHTML, like Gecko) Version/9.1 Safari/601.2.34"
                }
            }
        }, function askVladimirVladimirovich(err) {
            if (err) {
                e = new Error('Failed to initialize SpookyJS');
                e.details = err;
                reject(e);
            }
            spooky.start('http://sprosi-putina.ru/');

            spooky.then([{question: question}, function() {
                this.fill('form[name="askmore"]', { questionask: question}, false);
            }]);

            spooky.then(function clickSend() {
                this.mouse.click("#send");
            });

            spooky.waitForSelector('.answer', function readAnswer() {
                this.emit('answerisready', this.evaluate(function () {
                    return document.querySelector('.answer').textContent;
                }));
            });

            spooky.run();
        });

        spooky.on('error', function (e) {
            reject(e);
        });

        spooky.on('answerisready', function (answer) {
            resolve(answer);
        });
    });
};

