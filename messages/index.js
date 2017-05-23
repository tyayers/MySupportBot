/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/

.matches("PasswordReset", function(session, args) {
    
    session.send("How frustrating, your account is locked!  Should I reset your password now?  Then you can create a new password the next time you logon.");

    builder.Prompts.confirm(session, 'pw prompt', {                                    
        speak: "How frustrating, your account is locked!  Should I reset your password now?  Then you can create a new password the next time you logon.",                                               
        retrySpeak: 'Say yes to reset your password.',  
        inputHint: builder.InputHint.expectingInput                                              
    });    
})

.onDefault((session) => {
    session.send('Sorry, I really, totally did NOT understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

// Add a help dialog with a trigger action that is bound to the 'Help' intent
// bot.dialog('PasswordReset', function (session) {
//     session.endDialog("This bot will echo back anything you say. Say 'goodbye' to quit.");
// }).triggerAction({ matches: 'PasswordReset' });


if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

