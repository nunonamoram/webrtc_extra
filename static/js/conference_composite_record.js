let $1 = $(function() {
    'use strict';

    apiRTC.setLogLevel(10);
    var connectedConversation = null;
    var localStream;
    var conferenceName;
    var recordedVideoBuffer = null;

    function joinConference(name) {
        var cloudUrl = 'https://cloud.apizee.com';
        var connectedSession = null;


        //==============================
        // 1/ CREATE USER AGENT
        //==============================

        var ua = new apiRTC.UserAgent({
            uri: 'apzkey:myDemoApiKey'
        });

        //==============================
        // 2/ REGISTER
        //==============================
        ua.register({
            cloudUrl: cloudUrl
        }).then(function(session) {
            // Save session
            connectedSession = session;

            connectedSession
                .on("contactListUpdate", function (updatedContacts) { //display a list of connected users
                    console.log("MAIN - contactListUpdate", updatedContacts);
                    if (connectedConversation !== null) {
                        let contactList = connectedConversation.getContacts();
                        console.info("contactList  connectedConversation.getContacts() :", contactList);
                    }
                });

            //==============================
            // 3/ CREATE CONVERSATION
            //==============================

            connectedConversation = connectedSession.getConversation(name);

            //==========================================================
            // 4/ ADD EVENT LISTENER : WHEN NEW STREAM IS AVAILABLE IN CONVERSATION
            //==========================================================

            connectedConversation.on('streamListChanged', function(streamInfo) {

                console.log("streamListChanged :", streamInfo);

                if (streamInfo.listEventType === 'added') {
                    if (streamInfo.isRemote === true) {

                        connectedConversation.subscribeToMedia(streamInfo.streamId)
                            .then(function (stream) {
                                console.log('subscribeToMedia success');
                            }).catch(function (err) {
                            console.error('subscribeToMedia error', err);
                        });
                    }
                }
            });

            //=====================================================
            // 4 BIS/ ADD EVENT LISTENER : WHEN STREAM WAS REMOVED FROM THE CONVERSATION
            //=====================================================

            connectedConversation.on('streamAdded', function(stream) {
                stream.addInDiv('remote-container', 'remote-media-' + stream.streamId, {}, false);
            }).on('streamRemoved', function(stream) {
                stream.removeFromDiv('remote-container', 'remote-media-' + stream.streamId);

            }).on('recordingAvailable', function(recordingInfo) {
                console.log('recordingInfo :', recordingInfo);
                console.log('recordingInfo.mediaURL :', recordingInfo.mediaURL);
                $("#"+ recordingInfo.mediaId).replaceWith('<li id=' + recordingInfo.mediaId + '>Your recording is available <a target="_blank" href=' + recordingInfo.mediaURL + '> here </a></li>');  //CLICKABLE RECORDING LINK//
            });

            //==============================
            // 5/ CREATE LOCAL STREAM
            //==============================

            var createStreamOptions = {};
            createStreamOptions.constraints = {
                audio: true,
                video: true
            };

            ua.createStream(createStreamOptions)
                .then(function (stream) {

                    console.log('createStream :', stream);

                    // Save local stream
                    localStream = stream;
                    console.log('createStream2 :', localStream)
                    stream.removeFromDiv('local-container', 'local-media');
                    stream.addInDiv('local-container', 'local-media', {}, true);

                    //==============================
                    // 6/ JOIN CONVERSATION
                    //==============================

                    connectedConversation.join()
                        .then(function(response) {
                            //==============================
                            // 7/ PUBLISH OWN STREAM
                            //==============================
                            connectedConversation.publish(localStream, null);
                           
                        }).catch(function (err) {
                        console.error('Conversation join error', err);
                    });

                }).catch(function (err) {
                console.error('create stream error', err);
            });

           
        });
    }

    //==============================
    // CREATE CONFERENCE
    //==============================

    $('#create').on('submit', function(e) {
        e.preventDefault();

        // Get conference name
        conferenceName = document.getElementById('conference-name').value;

        document.getElementById('create').style.display = 'none';
        document.getElementById('conference').style.display = 'inline-block';
        document.getElementById('title').innerHTML = conferenceName;
        // Join conference
        joinConference(conferenceName);
        //document.getElementById('recordStart').style.display = 'inline-block';
        
    });


     // Click on startRecording button
     $('#startRecording').on('click', function () {
        console.log("startRecording");
        localStream.startRecord().then(function () {
                console.log("Recording started");
            }).catch(function (error) {
                // error
                console.error('startRecord failed :', error);
            });
    });

    // Click on stopRecording button
    $('#stopRecording').on('click', function () {
        console.log("stopRecording");
        localStream.stopRecord().then(function (recordedVideoBuff) {
            console.log("Recording stopped");
            recordedVideoBuffer = recordedVideoBuff
            console.log("recordedVideoBuffer :", recordedVideoBuffer);
        }).catch(function (error) {
            // error
            console.error('stopRecording failed :', error);
        });
    });
    /*
    $('#startConference').on('click', function () {
        
        console.log("startRecording");
        connectedConversation.startRecording().then(function () {
                console.log("Recording started");
            }).catch(function (error) {
                // error
                console.error('startRecord failed :', error);
            });
    });

    $('#stopConference').on('click', function () {
        console.log("stopRecording");
        connectedConversation.stopRecording().then(function (recordedVideoBuff) {
            console.log("Recording stopped");
            recordedVideoBuffer = recordedVideoBuff
            console.log("recordedVideoBuffer :", recordedVideoBuffer);
        }).catch(function (error) {
            // error
            console.error('stopRecording failed :', error);
        });
    });

    */

     // Click on leaveConference button
     $('#leaveConference').on('click', function () {
        console.log("leaveConference");
        console.log("Conference name: ", conferenceName)
        document.getElementById('create').style.display = 'inline-block';
        document.getElementById('conference').style.display = 'none';
        document.getElementById('recordStart').style.display = 'none';
        document.getElementById('recordStop').style.display = 'none';
        
        
        console.log("stopRecording");
        localStream.stopRecord().then(function (recordedVideoBuff) {
            console.log("Recording stopped");
            recordedVideoBuffer = recordedVideoBuff
            console.log("recordedVideoBuffer :", recordedVideoBuffer);
            console.log("download");
            if (recordedVideoBuffer !== null) {
                console.log("ola");
                savefile()
            }
        }).catch(function (error) {
            // error
            console.error('stopRecording failed :', error);
        });
        
        /*
        console.log("stopCompositeRecording");

        connectedConversation.stopRecording()
            .then(function (recordingInfo) {
                    console.info('stopRecording', recordingInfo);
                    $("#recordingInfo").append('<li id=' + recordingInfo.mediaId + '>When ready, your recording will be available <a target="_blank" href=' + recordingInfo.mediaURL + '> here </a></li>');  //CLICKABLE RECORDING LINK//
                    document.getElementById('recordStart').style.display = 'none';
                    document.getElementById('recordStop').style.display = 'none';
                })
                .catch(function (err) {
                    console.error('stopRecording', err);
                });
        */

        //Leave Conversation
        if (connectedConversation !== null) {
            //Leaving actual conversation

            connectedConversation.destroy();
            connectedConversation.leave()
                .then(function() {
                    console.debug('Conversation leave OK');
                }).catch(function (err) {
                    console.error('Conversation leave error', err);
                });
            connectedConversation = null;
            $('#remote-container').empty();
        }

        //Release localStream
        if (localStream !== null) {
            //Releasing LocalStream
            localStream.release();
        }
    });


    /*
    $('#download').on('click', function () {
        console.log("download");
        if (recordedVideoBuffer !== null) {
            savefile(recordedVideoBuffer)

            
            var url = window.URL.createObjectURL(recordedVideoBuffer);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'record_ApiRTC.mp4';
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            }, 100);
            
        } else {
            console.log("no recorded video ready");
        }
    });
    */


    //====================================
    // 8/ ADD COMPOSITE RECORDING BUTTONS
    //====================================

    // START COMPOSITE RECORDING //

    /*
    $('#startCompositeRecording').on('click', function(e) {

        console.log("startCompositeRecording");
        console.log('AQUI :', localStream)

        connectedConversation.startRecording()
            .then(function (recordingInfo) {
                console.info('startRecording', recordingInfo);
                console.info('startRecording mediaURL', recordingInfo.mediaURL);
                $("#recordingInfo").append('<li id=' + recordingInfo.mediaId + '>When ready, your recording will be available <a target="_blank" href=' + recordingInfo.mediaURL + '> here </a></li>');  //CLICKABLE RECORDING LINK//
                document.getElementById('recordStart').style.display = 'none';
                document.getElementById('recordStop').style.display = 'inline-block';
            })
            .catch(function (err) {
                console.error('startRecording', err);
            });
    });

    // STOP COMPOSITE RECORDING //
    $('#stopCompositeRecording').on('click', function(e) {

        console.log("stopCompositeRecording");

        connectedConversation.stopRecording()
            .then(function (recordingInfo) {
                    console.info('stopRecording', recordingInfo);
                    document.getElementById('recordStart').style.display = 'inline-block';
                    document.getElementById('recordStop').style.display = 'none';
                })
                .catch(function (err) {
                    console.error('stopRecording', err);
                });
    });
    */
     // Click on download button

    async function savefile(){
        var nomeficheiro = conferenceName + ".mp4"
        var passaudio = new File([recordedVideoBuffer], nomeficheiro);
        let formData = new FormData();
        formData.append("file", passaudio)
        console.log('SAVEFILE')
        /*
        $.ajax({
            type: 'POST',
            url: '/uploadLabel',
            data: formData,
            contentType: false,
            cache: false,
            processData: false,
            success: function(data) {
                console.log('Success!');
            },
        });
        */
        await fetch('/uploadLabel', {method: "POST", body: formData});
        alert('Sucess23')
    }
     
     
});
