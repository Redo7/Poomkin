// Copyright 2023 Redo Graphics. All rights reserved.
//
// Do not redistribute without obtaining explicit permission

let totalMessages = 0, messagesLimit = 0,chatDirection, removeSelector, provider, hideAfter, animationOut, displayPreview, fieldData, channelName, autoDelete, autoDeleteDistance,checkForUpdatesOnWidgetLoad;
let ignoredUsers = [];
const replyIcon = '<svg width="0.75em" height="0.625em" viewbox="0 0 12 10"><path fill-rule="evenodd"  fill="rgba(0, 0, 0, .5)" d="M0.7,6.910 L0.7,8.965 C0.7,9.246 0.104,9.499 0.284,9.691 C0.471,9.890 0.710,9.992 0.974,9.992 C1.239,9.992 1.477,9.890 1.664,9.691 C1.845,9.499 1.942,9.246 1.942,8.965 L1.942,6.910 C1.942,6.424 2.96,6.26 2.412,5.690 C2.728,5.355 3.103,5.198 3.554,5.198 L8.694,5.198 L7.372,6.595 C7.185,6.800 7.88,7.54 7.94,7.328 C7.101,7.602 7.197,7.841 7.397,8.47 C7.584,8.232 7.810,8.328 8.88,8.335 C8.339,8.335 8.565,8.232 8.745,8.40 L11.712,4.889 C11.905,4.690 12.2,4.437 12.2,4.170 C12.2,3.896 11.905,3.643 11.712,3.444 L8.745,0.293 C8.571,0.108 8.339,0.5 8.75,0.5 C7.823,0.5 7.584,0.101 7.391,0.293 C7.197,0.492 7.101,0.745 7.101,1.26 C7.101,1.300 7.197,1.553 7.391,1.752 L8.694,3.143 L3.554,3.143 C2.580,3.143 1.735,3.512 1.45,4.239 C0.355,4.971 0.7,5.869 0.7,6.910 Z"/></svg>';

window.addEventListener('onWidgetLoad', function (obj) {
    fieldData = obj.detail.fieldData;
    messagesLimit = fieldData.msgLimit;
  	chatDirection = fieldData.chatDirection;
    animationIn = 'animate__' + fieldData.animationIn;
    animationOut = 'animate__' + fieldData.animationOut;
    hideAfter = fieldData.hideAfter;
  	displayPreview = fieldData.displayPreview;
  	channelName = obj.detail.channel.username;
  	autoDelete = fieldData.autoDelete;
  	autoDeleteDistance = fieldData.autoDeleteDistance;
  	checkForUpdatesOnWidgetLoad = fieldData.checkForUpdatesOnWidgetLoad;
    fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
        provider = profile.provider;
    });
  
    removeSelector = ".chat-message:nth-last-child(n+" + (messagesLimit + 1) + ")";
  
    ignoredUsers = fieldData.ignoredUsers.toLowerCase().replaceAll(" ", "").split(",");
  
  	var updateStatus, updateClass;
    if (checkForUpdatesOnWidgetLoad === true) {
        fetch('https://raw.githubusercontent.com/Redo7/Poomkin/main/data.json')
            .then(response => response.json()).then((output) => {
                if (output.widgetVersion > '{{widgetVersion}}') {
                    updateStatus = 'Widget update available. Download it from https://github.com/Redo7/Poomkin/releases';
                  	updateClass = 'warning';
                } else {
                    updateStatus = 'Widget is up to date';
                  	updateClass = 'success';
                }
                const updateNotif = $.parseHTML(`<p class="update-notif ${updateClass} animate__{{animationIn}} animate__animated">${updateStatus}</p>`);
                $(updateNotif).appendTo('.main-container')
                $('.update-notif').delay(5000).queue(function () { $('.update-notif').addClass(animationOut).dequeue() }).delay(1000).queue(function () {
                    $(this).remove().dequeue()
                });
                $('.update-notif').animate({
                    height: 0,
                    opacity: 0
                }, 'slow', function () {
                    $('.update-notif').remove();
                });
            })
    }
});

window.addEventListener('onEventReceived', function (obj) {
	let event = obj['detail']['event'];
    let username = event['name'];
  	let amount = event['amount'];
  	let message = '';
  	if(event['message'] != undefined){
    	message = html_encode(event['message']);
    }
  	let alertContent, alertSubtext;
  	let sound = new Audio('{{alertSound}}');
  	let soundVolume = '{{alertSoundVolume}}';
  
  	//Version Check
  
  	if (obj.detail.event.listener === 'widget-button') {
      	
        if (obj.detail.event.field === 'checkForUpdates') {
            
            var updateStatus, updateClass;
            fetch('https://raw.githubusercontent.com/Redo7/Poomkin/main/data.json')
                .then(response => response.json()).then((output) => {
                    if (output.widgetVersion > '{{widgetVersion}}') {
                        updateStatus = 'Widget update available. Download it from https://github.com/Redo7/Poomkin/releases';
                        updateClass = 'warning';
                    } else {
                        updateStatus = 'Widget is up to date';
                        updateClass = 'success';
                    }
                    const updateNotif = $.parseHTML(`<p class="update-notif ${updateClass} animate__{{animationIn}} animate__animated">${updateStatus}</p>`);
                    $(updateNotif).appendTo('.main-container');
                    $('.update-notif').delay(5000).queue(function () { $('.update-notif').addClass(animationOut).dequeue() }).delay(1000).queue(function () {
                        $(this).remove().dequeue()
                    });
                    $('.update-notif').animate({
                        height: 0,
                        opacity: 0
                    }, 'slow', function () {
                        $('.update-notif').remove();
                    });
                })

        }
    }
  
  	//Follower Alert
  
  	if (obj.detail.listener === 'follower-latest'){
      
      	alertContent = `<p class="username">${username}</p> just followed!`;
      
        if ({{displayFollows}}) {
          addAlert(alertContent, sound, soundVolume);
        }
        return;
    }

    //Sub Alert

    if (obj.detail.listener === 'subscriber-latest') {
        let bulkGifted = event['bulkGifted'];
        let isCommunityGift = false;
        let gifted = false;
        isCommunityGift = event['isCommunityGift'];
        gifted = event['gifted'];
      
        if (isCommunityGift) { return };
        if (bulkGifted && {{displayBulkGifted}}) {
         	alertContent = `<p class="username">${username}</p> just gifted <p class="alert-highlight">${amount}</p> subs!`;
          	addAlert(alertContent, sound, soundVolume);
        } else if (gifted && {{displayGifted}}) {
          	alertContent = `<p class="username">${event['sender']}</p> gifted a sub to <p class="alert-highlight">${username}</p>!`;
            addAlert(alertContent, sound, soundVolume);
        } else if (event['amount'] > 1 && {{displayResubs}}) {
          	alertContent = `<p class="username">${username}</p> just subscribed for <p class="alert-highlight">${amount}</p> months!`;
            addAlert(alertContent, sound, soundVolume);
        } else if ({{displaySubs}}) {
          	alertContent = `<p class="username">${username}</p> just subscribed!`;
            addAlert(alertContent, sound, soundVolume);
        }
        return;
    }

    //Donation Alert

    if (obj.detail.listener === 'tip-latest') {
      	let tipAmount;
        if('{{userCurrencyPosition}}' === 'left'){
           	tipAmount = '{{userCurrency}}' + event['amount'];
        } else {
           	tipAmount = event['amount'] + '{{userCurrency}}';
        }
      	
      	alertContent = `<p class="username">${username}</p> donated <p class="alert-highlight">${tipAmount}</p>!`;
      
        if ({{displayDonations}} && event['amount'] >= '{{minDonationAmount}}') {
            addAlert(alertContent, sound, soundVolume);
        }
        return;
    }
  
  	//Cheer Alert

    if (obj.detail.listener === 'cheer-latest') { 

      	alertContent = `<p class="username">${username}</p> cheered <p class="alert-highlight">X${amount}</p>!`;
      
        if ({{displayCheers}} && event['amount'] >= '{{minCheerAmount}}') {
            addAlert(alertContent, sound, soundVolume);
        }
        return;
    }

    //Raid Alert

    if (obj.detail.listener === 'raid-latest'){
      
      	alertContent = `<p class="username">${username}</p> is raiding with <p class="alert-highlight">${amount}</p> viewers!`;
      
        if ({{displayRaids}}) {
          addAlert(alertContent, sound, soundVolume);
        }
        return;
    }
  
  	//Deleting Messages

    if (obj.detail.listener === "delete-message") {
        const msgId = obj.detail.event.msgId;
        $(`.chat-message[data-msgid=${msgId}]`).remove();
        return;
    } else if (obj.detail.listener === "delete-messages") {
        const uId = obj.detail.event.userId;
        $(`.chat-message[data-sender=${uId}]`).remove();
        return;
    }

    //Message

    if (obj.detail.listener === "message") {
        let event = obj['detail']['event'];
        let data = event['data'];
        if (ignoredUsers.indexOf(data.nick) !== -1) return;
        let message = attachEmotes(data);
        let username = data['displayName'];
      	let emoteOnly = isEmote(data)
        let replyTo = null;
        let replyBody = null;
        let replyStyle = 'none';
        if (data.tags['reply-parent-display-name']) {
          replyTo = data.tags['reply-parent-display-name'];
          if (data.tags['reply-parent-msg-body'].length > 32) {
            replyBody = html_encode(data.tags['reply-parent-msg-body'].replaceAll("\\s", " ").substring(0, 30).concat('...'));
          } else {
            replyBody = html_encode(data.tags['reply-parent-msg-body'].replaceAll("\\s", " "));
          }
          replyStyle = 'flex';
        }
		
        //General Badges
        if ('{{displayBadges}}' === 'true') {
            var badges = "", badge;
            for (let i = 0; i < data.badges.length; i++) {
                badge = data.badges[i];
                badges += `<img alt="" src="${badge.url}" class="badge ${badge.type}-icon"> `;
            }
        } else {
            var badges = '';
        }
      
      	//Special Badges
      	let role = checkRole(data);
      	let userRole = role[0];
      	let roleIcon = role[1];
      	let specialIcon = role[2];
      	
      	//Pronouns
        let pronoun = null;
        let pronounStyle = null;

        const pronoun_api = fetch('https://pronouns.alejo.io/api/users/' + data.displayName.toLowerCase())
            .then((response) => response.json())
            .then((user) => {
                if (!user.length) {
                    return null;
                } else return user[0].pronoun_id;
            });

        const printAddress = async () => {
            pronoun = await pronoun_api;
            switch (pronoun) {
                case "aeaer":
                    pronoun = "ae/aer";
                    break;
                case "eem":
                    pronoun = "e/em";
                    break;
                case "faefaer":
                    pronoun = "fae/faer";
                    break;
                case "hehim":
                    pronoun = "he/him";
                    break;
                case "heshe":
                    pronoun = "he/she";
                    break;
                case "hethem":
                    pronoun = "he/they";
                    break;
                case "itits":
                    pronoun = "it/its";
                    break;
                case "perper":
                    pronoun = "per/per";
                    break;
                case "sheher":
                    pronoun = "she/her";
                    break;
                case "shethem":
                    pronoun = "she/they";
                    break;
                case "theythem":
                    pronoun = "they/them";
                    break;
                case "vever":
                    pronoun = "ve/ver";
                    break;
                case "xexem":
                    pronoun = "xe/xem";
                    break;
                case "ziehir":
                    pronoun = "zie/hir";
                    break;
                default:
                    break;
            }
            return pronoun;
        }

        printAddress().then(pronoun => addMessage(replyTo, replyBody, replyStyle, badges, username, pronoun, pronounStyle, message, data.userId, data.msgId, emoteOnly, userRole, roleIcon, specialIcon));
    }
});

function addMessage(replyTo, replyBody, replyStyle, badges, username, pronoun, pronounStyle, message, uId, msgId, isEmote, userRole, roleIcon, specialIcon) {
  	//Command Check
    if (message.startsWith("!") && '{{showCommands}}' === 'false') { return }
    else if (message.startsWith("@") && replyBody) {
        let messageNoTag = message.split(' ');
        messageNoTag.shift()
        message = messageNoTag.join(' ');
    }
  	//Emote Only Check
  	let emoteOnly;
  	if (isEmote) {
        emoteOnly = "emote-only"
    } else {
        emoteOnly = ""
    }
  	//Mentions Check
  	const mentions = message.match(/@\S+/g)
    if (mentions) {
        for (var i = 0; i < mentions.length; i++) {
            message = message.replace(mentions[i], `<p class="mention">${mentions[i]}</p>`)
        }
    }
  	//Badges
  	let badgeStyle;
  	if(badges === ''){
    	badgeStyle = 'hide';
    }
  	//Pronouns
  	if ('{{displayPronouns}}' === 'false' || pronoun == null) {
        pronounStyle = 'hide';
    } else {
        pronounStyle = '';
    }
    totalMessages += 1;
  
    const regular = $.parseHTML(`
		        <div data-sender="${uId}" data-msgId="${msgId}" id="msg-${totalMessages}" class="chat-message animate__animated animate__{{animationIn}}">
            <div class="message-box">
                <div class="pumpkin absolute">
                    <svg width="2.125em" height="2.0625em" viewBox="0 0 34 33" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.0801 6.4C15.5801 5.44 15.5501 4.8 15.0801 4.24C15.7401 2.78 17.3001 0 19.7901 0C22.2801 0 22.0201 0.88 21.7301 2.12C21.5401 2.73 21.7601 3.28 20.2901 3.52C19.6301 3.75 19.2701 4.48 18.1101 6.83C16.8901 9.3 15.6701 7.3 15.0901 6.4H15.0801Z" fill="#42AE30"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M26.92 31.1902C26.5 31.1902 26.97 31.1202 25.71 31.0002C24.42 32.0802 22.75 32.7402 20.93 32.7402C19.46 32.7402 18.11 32.2602 17 31.4702C15.89 32.2602 14.54 32.7402 13.73 32.7402C11.26 32.7402 9.59 32.0802 8.3 31.0002C7.91 31.1102 7.5 31.1902 7.83 31.1902C3.17 31.1902 0 25.9002 0 19.3702C0 13.6602 3.17 7.54023 7.83 7.54023C7.14 7.54023 7.2 7.55023 7.25 7.55023C8.61 5.84023 10.71 4.74023 13.73 4.74023C14.54 4.74023 15.89 5.22023 17 6.01023C18.11 5.22023 19.46 4.74023 20.93 4.74023C23.29 4.74023 25.39 5.85023 26.75 7.55023C26.81 7.55023 26.86 7.54023 26.92 7.54023C30.83 7.54023 34 13.6602 34 19.3602C34 25.8902 30.83 31.1802 26.92 31.1802V31.1902Z" fill="#F98B49"/>
                    </svg>
                    <div class="pumpkin-face  absolute">
                        <svg class="pumpkin-eyes  absolute" width="1em" height="0.4375em" viewBox="0 0 16 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M14 6.18C12.9 6.18 12 4.8 12 3.91C12 1.38 12.9 0 14 0C15.1 0 16 1.38 16 3.91C16 4.8 15.11 6.18 14 6.18ZM2 6.18C0.9 6.18 0 4.8 0 3.91C0 1.38 0.89 0 2 0C3.11 0 4 1.38 4 3.91C4 4.8 3.11 6.18 2 6.18Z" fill="#8B371A"/>
                        </svg>
                        <svg class="pumpkin-mouth absolute" width="0.4375em" height="0.25em" viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.60002 3.10995C1.81002 3.10995 1.29002 2.09995 0.0200176 0.529945C-0.0499824 0.319945 0.0700176 0.0899451 0.280018 0.0199451C0.700018 -5.49126e-05 0.720018 0.0699451 0.780018 0.289945C1.14002 1.49995 2.17002 2.27995 3.59002 2.27995C4.62002 2.27995 5.65002 1.49995 6.01002 0.289945C6.08002 0.0699451 6.30002 -0.0500549 6.51002 0.0199451C6.72002 0.0899451 6.84002 0.319945 6.78002 0.539945C6.31002 2.09995 4.99002 3.10995 3.60002 3.10995Z" fill="#8B371A"/>
                        </svg>
                    </div>
                </div>
                <div class="user-container">
                    <p class="username">${username}</p>
                    <div class="separator ${pronounStyle}"></div>
                    <p class="pronouns ${pronounStyle}">${pronoun}</p>
                    <div class="badges ${badgeStyle}">${badges}</div>
				</div>
                <div class="message ${emoteOnly}">${message}</div>
                <div class="message-details">
                    <div class="side"></div>
                    <svg class="web" width="6.6875em" height="6.1875em" viewbox-="0 0 107 99">
                        <path fill-rule="evenodd" fill="rgb(255, 182, 123)"
                            d="M106.965,70.495 C106.834,71.69 106.359,71.420 105.798,71.430 C105.615,71.433 105.424,71.401 105.233,71.327 C103.207,70.553 101.205,69.786 99.217,69.22 C97.668,68.428 96.136,67.838 94.605,67.249 C94.431,67.182 94.254,67.114 94.80,67.47 C85.982,73.159 78.891,79.855 73.33,87.159 C73.142,87.367 73.250,87.574 73.358,87.781 C73.920,88.856 74.473,89.921 75.44,91.6 C76.155,93.116 77.283,95.246 78.431,97.397 C78.814,98.114 78.503,98.823 77.731,98.971 C77.542,99.7 77.343,99.7 77.145,98.974 C76.534,98.876 75.932,98.479 75.647,97.941 C73.823,94.495 72.59,91.116 70.330,87.775 C58.918,84.366 47.746,82.625 36.573,81.794 C34.954,84.126 33.307,86.405 31.615,88.591 C31.350,88.934 30.771,89.27 30.179,88.867 C29.986,88.815 29.792,88.736 29.607,88.631 C28.851,88.201 28.530,87.496 28.885,87.52 C29.756,85.959 30.611,84.834 31.464,83.704 C32.283,82.607 33.95,81.493 33.899,80.365 C27.953,72.220 20.824,65.355 12.673,59.750 C11.9,59.895 9.341,60.24 7.666,60.119 C5.805,60.234 3.938,60.319 2.62,60.365 C1.881,60.370 1.698,60.348 1.521,60.307 C0.979,60.179 0.505,59.861 0.352,59.482 C0.149,58.981 0.583,58.565 1.319,58.540 C3.134,58.483 4.940,58.378 6.743,58.264 C8.477,58.145 10.205,58.0 11.928,57.835 C14.935,51.297 15.834,44.36 15.32,37.78 C12.62,36.23 9.102,34.976 6.202,33.982 C5.599,33.774 5.398,33.268 5.749,32.844 C6.101,32.420 6.868,32.233 7.468,32.430 C10.354,33.383 13.280,34.374 16.230,35.386 C24.789,31.603 31.876,25.763 37.257,18.246 C36.206,15.810 35.182,13.417 34.205,11.99 C34.2,10.617 34.320,9.956 34.911,9.613 C35.502,9.270 36.145,9.378 36.352,9.867 C36.852,11.44 37.368,12.248 37.886,13.455 C38.403,14.656 38.929,15.871 39.462,17.98 C48.144,17.255 57.110,15.754 65.579,11.842 C66.58,10.169 66.529,8.483 66.988,6.782 C67.461,5.8 67.930,3.229 68.378,1.421 C68.560,0.689 69.171,0.167 69.749,0.260 C70.326,0.353 70.656,1.34 70.480,1.775 C70.32,3.655 69.568,5.513 69.90,7.351 C68.662,9.14 68.222,10.658 67.770,12.287 C73.239,19.230 80.371,25.237 89.8,29.926 C89.311,29.713 89.617,29.503 89.920,29.290 C90.745,28.712 91.578,28.148 92.393,27.554 C94.78,26.323 95.745,25.62 97.387,23.763 C97.949,23.316 98.714,23.513 99.97,24.208 C99.481,24.904 99.336,25.834 98.766,26.275 C97.367,27.361 95.948,28.414 94.514,29.443 C93.139,30.440 91.746,31.404 90.344,32.355 C90.7,43.292 91.289,53.822 94.802,64.427 C98.440,65.799 102.117,67.184 105.870,68.591 C106.645,68.881 107.138,69.735 106.965,70.495 ZM71.483,84.186 C77.16,77.603 83.521,71.479 90.830,65.795 C86.663,64.188 82.558,62.599 78.516,61.34 C73.896,64.815 69.596,68.799 65.727,72.938 C65.840,73.161 65.954,73.384 66.66,73.605 C66.907,75.268 67.753,76.937 68.619,78.628 C68.920,79.217 69.233,79.819 69.537,80.411 C70.181,81.664 70.828,82.920 71.483,84.186 ZM29.884,55.136 C33.666,54.350 37.412,53.450 41.109,52.410 C41.269,50.523 41.329,48.617 41.290,46.722 C37.741,45.381 34.255,44.78 30.801,42.798 C30.995,46.914 30.711,51.89 29.884,55.136 ZM53.17,52.952 C53.17,52.952 53.17,52.952 53.17,52.952 C52.694,53.641 52.378,54.343 52.50,55.24 C51.589,55.987 51.114,56.926 50.644,57.873 C52.262,57.929 53.880,58.16 55.500,58.134 C55.493,58.120 55.487,58.107 55.481,58.94 C54.645,56.361 53.824,54.648 53.17,52.952 ZM55.160,41.716 C54.406,41.765 53.656,41.834 52.901,41.858 C52.140,41.883 51.383,41.863 50.623,41.863 C51.384,43.494 52.159,45.142 52.948,46.810 C52.948,46.810 52.948,46.810 52.948,46.810 C53.699,45.135 54.436,43.436 55.160,41.716 ZM57.985,57.311 C59.55,56.318 60.145,55.335 61.258,54.358 C59.320,53.610 57.395,52.869 55.486,52.135 C55.486,52.135 55.486,52.135 55.486,52.135 C56.305,53.843 57.140,55.571 57.985,57.311 ZM60.898,45.459 C59.742,44.500 58.628,43.524 57.556,42.529 C56.845,44.274 56.123,46.0 55.383,47.699 C57.236,46.987 59.74,46.239 60.898,45.459 ZM56.398,49.919 C58.320,50.640 60.257,51.368 62.208,52.103 C62.99,50.633 62.37,49.164 62.20,47.693 C60.161,48.470 58.287,49.212 56.398,49.919 ZM59.203,59.810 C59.403,60.221 59.598,60.624 59.800,61.37 C59.812,61.60 59.823,61.83 59.835,61.106 C60.752,62.975 61.685,64.865 62.636,66.775 C62.703,66.910 62.774,67.49 62.841,67.184 C63.341,68.188 63.856,69.209 64.364,70.223 C67.808,66.660 71.552,63.203 75.533,59.880 C71.648,58.375 67.804,56.887 64.34,55.430 C62.376,56.867 60.759,58.333 59.203,59.810 ZM56.697,60.610 C54.303,60.383 51.898,60.228 49.510,60.140 C47.944,63.198 46.322,66.160 44.657,69.44 C50.342,69.348 56.58,69.956 61.787,70.957 C60.37,67.442 58.337,63.989 56.697,60.610 ZM49.486,49.836 C47.615,49.121 45.759,48.414 43.915,47.714 C43.931,49.27 43.902,50.336 43.829,51.645 C45.727,51.75 47.614,50.474 49.486,49.836 ZM44.779,53.779 C45.922,54.759 47.43,55.777 48.144,56.834 C48.958,55.240 49.759,53.624 50.547,51.984 C49.768,52.239 48.997,52.513 48.214,52.756 C47.75,53.114 45.927,53.447 44.779,53.779 ZM45.127,45.723 C46.921,46.386 48.729,47.56 50.549,47.734 C50.549,47.734 50.549,47.734 50.549,47.734 C50.222,47.37 49.888,46.330 49.566,45.639 C49.116,44.676 48.680,43.732 48.240,42.782 C47.181,43.789 46.81,44.745 44.937,45.653 C45.0,45.676 45.64,45.700 45.127,45.723 ZM46.973,59.53 C45.380,57.470 43.727,55.959 42.34,54.543 C41.126,54.789 40.220,55.41 39.307,55.272 C39.247,55.287 39.187,55.301 39.127,55.316 C36.333,56.21 33.507,56.625 30.666,57.184 C34.723,60.323 38.538,63.880 42.60,67.825 C43.744,64.984 45.386,62.67 46.973,59.53 ZM42.337,44.694 C44.43,43.409 45.666,42.4 47.184,40.502 C45.764,37.418 44.400,34.412 43.78,31.468 C39.831,35.143 36.86,38.317 31.917,40.903 C35.344,42.136 38.814,43.398 42.337,44.694 ZM49.554,39.558 C51.753,39.565 53.966,39.466 56.161,39.256 C57.529,35.900 58.838,32.451 60.99,28.929 C57.674,29.467 55.224,29.858 52.769,30.105 C50.303,30.354 47.834,30.459 45.379,30.442 C46.724,33.415 48.111,36.448 49.554,39.558 ZM58.552,40.28 C60.91,41.494 61.735,42.928 63.460,44.309 C64.442,43.869 65.431,43.443 66.405,42.983 C66.500,42.938 66.595,42.891 66.690,42.846 C68.391,42.38 70.78,41.201 71.750,40.333 C71.962,40.223 72.171,40.108 72.383,39.997 C72.853,39.750 73.315,39.486 73.783,39.235 C69.536,36.252 65.728,32.983 62.412,29.506 C61.173,33.87 59.900,36.615 58.552,40.28 ZM64.621,46.595 C64.632,48.774 64.743,50.964 64.959,53.140 C68.696,54.550 72.506,55.992 76.357,57.450 C75.364,52.181 74.932,46.900 74.980,41.584 C71.585,43.374 68.134,45.53 64.621,46.595 ZM68.801,84.820 C66.848,81.24 64.958,77.299 63.126,73.645 C56.522,72.337 49.930,71.581 43.388,71.222 C41.651,74.143 39.858,76.962 38.19,79.696 C48.216,80.452 58.415,81.973 68.801,84.820 ZM35.353,78.311 C37.209,75.623 39.20,72.847 40.777,69.971 C36.823,65.370 32.450,61.268 27.749,57.724 C26.981,57.861 26.220,58.24 25.449,58.151 C25.83,58.210 24.718,58.271 24.351,58.329 C21.521,58.773 18.671,59.147 15.803,59.452 C23.179,64.663 29.733,70.943 35.353,78.311 ZM15.33,57.524 C19.41,57.63 23.16,56.471 26.946,55.729 C28.58,51.193 28.428,46.462 28.148,41.821 C24.615,40.519 21.133,39.253 17.688,38.18 C18.313,44.556 17.531,51.309 15.33,57.524 ZM38.202,20.432 C33.111,27.239 26.608,32.618 18.867,36.290 C22.295,37.477 25.769,38.701 29.290,39.959 C34.145,37.122 38.443,33.497 42.70,29.219 C40.729,26.212 39.443,23.287 38.202,20.432 ZM52.637,18.360 C48.561,19.78 44.469,19.355 40.424,19.308 C41.685,22.189 42.992,25.141 44.355,28.174 C49.911,28.237 55.566,27.631 61.67,26.196 C62.344,22.504 63.555,18.715 64.710,14.845 C60.755,16.473 56.709,17.642 52.637,18.360 ZM66.902,15.314 C65.774,19.216 64.589,23.38 63.343,26.769 C67.45,30.789 71.412,34.522 76.349,37.838 C76.569,37.714 76.794,37.600 77.13,37.476 C77.382,37.266 77.746,37.46 78.114,36.833 C79.487,36.40 80.855,35.235 82.205,34.400 C82.780,34.44 83.345,33.670 83.915,33.307 C84.772,32.762 85.623,32.209 86.473,31.652 C78.640,27.138 72.80,21.598 66.902,15.314 ZM87.781,34.86 C84.450,36.256 81.45,38.296 77.574,40.208 C77.478,46.372 78.23,52.486 79.333,58.577 C83.353,60.100 87.436,61.646 91.581,63.212 C88.667,53.568 87.551,43.982 87.781,34.86 Z" />
                    </svg>
                </div>
            </div>

`);
  
  	let element = regular;
    if (hideAfter !== 999) {
        $(element).appendTo('.main-container').delay(hideAfter * 1000).queue(function () {
            $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove()
            }).dequeue();
        });
    } else {
        $(element).appendTo('.main-container');
    }
  
    if (totalMessages > messagesLimit) {
        removeRow(removeSelector);
    }
  
  	if(autoDelete === true){
    	checkOutOfBounds();
    }
}

function addAlert(alertContent, sound, soundVolume){
    totalMessages += 1;
  
    const regular = $.parseHTML(`
		<div class="chat-message animate__animated animate__fadeIn" id="msg-${totalMessages}">
            <div class="alert-box">
                <div class="alert-content">
                    <div class="alert-pumpkin absolute">
                        <svg width="34" height="33" viewBox="0 0 34 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.9199 6.4C18.4199 5.44 18.4499 4.8 18.9199 4.24C18.2599 2.78 16.6999 0 14.2099 0C11.7199 0 11.9799 0.88 12.2699 2.12C12.4599 2.73 12.2399 3.28 13.7099 3.52C14.3699 3.75 14.7299 4.48 15.8899 6.83C17.1099 9.3 18.3299 7.3 18.9099 6.4H18.9199Z" fill="#42AE30"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.08 31.1902C7.5 31.1902 7.03 31.1202 8.29 31.0002C9.58 32.0802 11.25 32.7402 13.07 32.7402C14.54 32.7402 15.89 32.2602 17 31.4702C18.11 32.2602 19.46 32.7402 20.27 32.7402C22.74 32.7402 24.41 32.0802 25.7 31.0002C26.09 31.1102 26.5 31.1902 26.17 31.1902C30.83 31.1902 34 25.9002 34 19.3702C34 13.6602 30.83 7.54023 26.17 7.54023C26.86 7.54023 26.8 7.55023 26.75 7.55023C25.39 5.84023 23.29 4.74023 20.27 4.74023C19.46 4.74023 18.11 5.22023 17 6.01023C15.89 5.22023 14.54 4.74023 13.07 4.74023C10.71 4.74023 8.61 5.85023 7.25 7.55023C7.19 7.55023 7.14 7.54023 7.08 7.54023C3.17 7.54023 0 13.6602 0 19.3602C0 25.8902 3.17 31.1802 7.08 31.1802V31.1902Z" fill="#F98B49"/>
                        </svg>
                        <div class="alert-pumpkin-face absolute">
                            <svg class="alert-pumpkin-eye-1 absolute" width="0.625em" height="0.625em" viewbox="0 0 10 10">
                                <path fill-rule="evenodd"  fill="rgb(255, 205, 108)"
                                d="M5.472,1.192 C5.824,0.684 6.619,0.916 6.642,1.532 L6.738,4.44 L8.805,5.475 C9.312,5.826 9.81,6.621 8.464,6.645 L5.952,6.740 L4.522,8.807 C4.170,9.315 3.375,9.83 3.352,8.466 L3.256,5.955 L1.189,4.524 C0.682,4.173 0.913,3.378 1.530,3.354 L4.42,3.259 L5.472,1.192 Z"/>
                            </svg>
                            <svg class="alert-pumpkin-eye-2 absolute" width="0.625em" height="0.625em" viewbox="0 0 10 10">
                                <path fill-rule="evenodd"  fill="rgb(255, 205, 108)"
                                d="M5.472,1.192 C5.824,0.684 6.619,0.916 6.642,1.532 L6.738,4.44 L8.805,5.475 C9.312,5.826 9.81,6.621 8.464,6.645 L5.952,6.740 L4.522,8.807 C4.170,9.315 3.375,9.83 3.352,8.466 L3.256,5.955 L1.189,4.524 C0.682,4.173 0.913,3.378 1.530,3.354 L4.42,3.259 L5.472,1.192 Z"/>
                            </svg>
                            <svg class="alert-pumpkin-mouth absolute" width="0.25em" height="0.375em" viewBox="0 0 4 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C3.11 0 4 1.34 4 3C4 4.66 3.11 6 2 6C0.89 6 0 4.66 0 3C0 1.34 0.89 0 2 0Z" fill="#8B371A"/>
                            </svg>
                        </div>
                    </div>
                    ${alertContent}
                </div>
                <div class="alert-details">
                    <svg width="162.5px" height="162.5px" viewbox="0 0 162.5 165.5">
                        <path fill-rule="evenodd" stroke="var(--color-bg-alt)" stroke-width="3px"
                            stroke-dasharray="12, 12" stroke-linecap="round" stroke-linejoin="miter"
                            fill="var(--color-alert)"
                            d="M80.244,3.441 C122.802,3.441 157.302,37.941 157.302,80.499 C157.302,123.58 122.802,157.558 80.244,157.558 C37.685,157.558 3.185,123.58 3.185,80.499 C3.185,37.941 37.685,3.441 80.244,3.441 Z" />
                    </svg>
                    <svg width="7.0625em" height="7.0625em" viewbox="0 0 113 113">
                        <path fill-rule="evenodd" stroke="var(--color-border)" stroke-width="2px" stroke-linecap="butt"
                            stroke-linejoin="miter" fill="var(--color-bg-alt)"
                            d="M55.999,2.999 C85.271,2.999 108.999,26.728 108.999,55.999 C108.999,85.271 85.271,108.999 55.999,108.999 C26.728,108.999 2.999,85.271 2.999,55.999 C2.999,26.728 26.728,2.999 55.999,2.999 Z" />
                    </svg>
                    <svg class="alert-side" width="78.5px" height="234.5px" viewvbox="0 0 78.5 234.5">
                    <path fill-rule="evenodd"  stroke="var(--color-bg-alt)" stroke-width="3px" stroke-dasharray="12, 12" stroke-linecap="round" stroke-linejoin="miter" fill="var(--color-alert)"
                    d="M3.0,3.772 L73.999,3.772 L73.999,229.174 L3.0,229.174 L3.0,3.772 Z"/>
                    </svg>
                </div>
            </div>
        </div>
`);

    playAlertSound(sound, soundVolume);
  
  	let element = regular;
    if (hideAfter !== 999) {
        $(element).appendTo('.main-container').delay(hideAfter * 1000).queue(function () {
            $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove()
            }).dequeue();
        });
    } else {
        $(element).appendTo('.main-container');
    }
    if (totalMessages > messagesLimit) {
        removeRow(removeSelector);
    }
  
  	if(autoDelete === true){
    	checkOutOfBounds();
    }
}

function checkOutOfBounds() {
    let boundingObj, el, elPrev, boundingDir;
    for (j = 0; j < $('.main-container')[0].children.length; j++) {
        el = $('.main-container')[0].children[j];
        boundingObj = el.getBoundingClientRect()
      	
      	if (chatDirection === 'column' && boundingObj.top <= autoDeleteDistance) {
          $(el).queue(function(){removeRow(el);}).dequeue();
        } else if(chatDirection === 'column-reverse' && boundingObj.bottom >= ($('body').height() - autoDeleteDistance)){
          $(el).queue(function(){removeRow(el);}).dequeue();
        }
    }
}

function checkRole(data){
  	let badge = data.tags.badges;
  	let badgeArr = badge.split(',');
  	let role, roleIcon, specialIcon;
   	if(data.badges.length > 0){
    	roleIcon = data.badges[0].url;
    } else {
    	roleIcon = null;
    }
  
  	if(badge.includes('broadcaster')){
       	role = 'broadcaster';
      	roleIcon = '<svg class="role-icon" width="0.6875em" height="0.4375em" viewbox="0 0 11 7"><path fill-rule="evenodd"  fill="var(--color-msg)"d="M0.13,1.172 C0.13,0.531 0.560,0.9 1.232,0.9 L6.109,0.9 C6.782,0.9 7.328,0.531 7.328,1.172 L7.328,5.827 C7.328,6.469 6.782,6.991 6.109,6.991 L1.232,6.991 C0.560,6.991 0.13,6.469 0.13,5.827 L0.13,1.172 ZM10.664,0.660 C10.862,0.761 10.986,0.958 10.986,1.172 L10.986,5.827 C10.986,6.42 10.862,6.238 10.664,6.340 C10.466,6.442 10.226,6.431 10.37,6.311 L8.208,5.147 L7.938,4.975 L7.938,4.664 L7.938,2.336 L7.938,2.25 L8.208,1.852 L10.37,0.689 C10.224,0.571 10.464,0.558 10.664,0.660 L10.664,0.660 Z"/></svg>';
      	specialIcon = '<svg width="2.6875em" height="3.8125em" viewbox="0 0 43 61"><path fill-rule="evenodd" fill="var(--color-msg-alt)"d="M42.50,29.480 L40.284,33.748 C39.439,35.789 37.99,36.759 35.58,35.914 L24.763,31.653 L13.746,58.271 C12.901,60.312 10.561,61.282 8.520,60.437 L4.253,58.671 C2.212,57.826 1.242,55.486 2.87,53.445 L13.104,26.827 L2.809,22.566 C0.768,21.721 0.201,19.381 0.643,17.340 L2.409,13.73 C3.254,11.32 5.593,10.62 7.635,10.907 L17.930,15.168 L23.156,2.541 C24.1,0.500 26.340,0.469 28.382,0.375 L32.649,2.141 C34.690,2.986 35.660,5.325 34.815,7.367 L29.589,19.994 L39.884,24.255 C41.925,25.100 42.895,27.439 42.50,29.480 Z" /></svg>';
    } else if(badge.includes('moderator')){
    	role = 'moderator';
      	roleIcon = '<svg class="role-icon" width="0.6875em" height="0.6875em" viewbox="0 0 11 11"><path fill-rule="evenodd"  fill="var(--color-msg)"d="M6.56,9.825 L5.352,10.246 C5.195,10.340 4.995,10.315 4.865,10.186 L3.756,9.80 C3.686,9.11 3.576,9.3 3.497,9.61 L0.996,10.904 C0.837,11.21 0.617,11.5 0.477,10.866 L0.117,10.507 C0.21,10.368 0.37,10.148 0.79,9.990 L1.928,7.496 C1.986,7.417 1.978,7.307 1.908,7.238 L0.799,6.131 C0.670,6.3 0.645,5.803 0.739,5.646 L1.161,4.944 C1.295,4.723 1.601,4.685 1.785,4.868 L2.973,6.53 C3.51,6.130 3.177,6.130 3.255,6.53 L9.28,0.295 L11.0,0.14 L10.718,1.980 L4.944,7.738 C4.867,7.815 4.867,7.941 4.944,8.19 L6.133,9.203 C6.316,9.386 6.278,9.692 6.56,9.825 Z"/></svg>';
      	specialIcon = '<svg width="7.375em" height="2.5625em" viewbox="0 0 118 41"><path fill-rule="evenodd"  fill="var(--color-msg-alt)" d="M117.332,18.165 C115.711,17.568 114.7,17.249 112.249,17.249 C104.876,17.249 98.450,22.850 95.91,31.136 C94.992,31.380 94.724,31.503 94.476,31.418 C90.965,30.216 87.242,29.569 83.388,29.569 C78.135,29.569 73.128,30.769 68.564,32.944 C68.282,33.78 67.984,32.910 67.902,32.639 L60.499,40.347 C59.669,41.210 58.321,41.210 57.491,40.347 L50.100,32.651 C50.27,32.933 49.723,33.113 49.435,32.975 C44.871,30.798 39.864,29.597 34.611,29.597 C30.757,29.597 27.34,30.245 23.522,31.448 C23.275,31.533 23.7,31.409 22.908,31.166 C19.549,22.871 13.123,17.265 5.749,17.265 C3.992,17.265 2.288,17.584 0.667,18.182 C0.205,18.352 0.191,17.813 0.106,17.420 C12.496,1.100 30.305,0.2 34.711,0.14 C35.113,0.15 35.348,0.447 35.106,0.769 C33.611,2.764 32.769,5.17 32.769,7.400 C32.769,12.372 36.434,16.768 42.51,19.451 C42.263,17.62 43.339,14.740 45.302,13.50 C48.940,9.924 54.358,10.486 57.691,13.961 L58.999,15.320 L60.307,13.961 C63.646,10.486 69.57,9.924 72.696,13.50 L72.696,13.50 C74.654,14.736 75.729,17.51 75.944,19.434 C81.563,16.754 85.230,12.361 85.230,7.393 C85.230,5.12 84.388,2.761 82.892,0.769 C82.650,0.446 82.886,0.15 83.288,0.14 C87.694,0.2 105.503,1.99 117.893,17.403 C118.191,17.796 117.794,18.335 117.332,18.165 Z"/></svg>';
    } else if(badge.includes('vip')){
    	role = 'vip';
      	roleIcon = '<svg class="role-icon" width="0.8125em" height="0.625em" viewbox="0 0 13 10"><path fill-rule="evenodd"  fill="var(--color-msg)"d="M12.613,3.984 L7.628,9.511 C7.339,9.825 6.928,10.9 6.498,10.9 C6.70,10.9 5.663,9.825 5.377,9.511 L0.383,3.984 C0.96,3.454 0.132,2.648 0.297,2.75 L1.415,0.589 C1.700,0.212 2.150,0.13 2.624,0.13 L10.375,0.13 C10.848,0.13 11.298,0.212 11.584,0.586 L12.698,2.72 C13.132,2.645 13.96,3.451 12.613,3.984 Z"/></svg>';
      	specialIcon = '<svg width="3.375em" height="3.4375em" viewbox="0 0 54 55"><path fill-rule="evenodd"  fill="var(--color-msg-alt)" d="M39.497,13.774 C44.0,9.182 44.0,4.591 39.497,0.0 C44.45,4.545 48.593,4.545 53.141,0.0 C48.638,4.591 48.638,9.182 53.141,13.774 C48.593,9.228 44.45,9.228 39.497,13.774 ZM48.840,36.348 C51.329,33.836 53.48,30.843 54.7,27.665 C54.161,34.706 51.580,41.793 46.262,47.161 C35.913,57.610 19.118,57.595 8.749,47.127 C-1.618,36.660 -1.633,19.704 8.715,9.255 C14.33,3.887 21.52,1.281 28.27,1.436 C24.879,2.404 21.915,4.141 19.427,6.653 C11.319,14.838 11.331,28.121 19.453,36.321 C27.576,44.521 40.733,44.533 48.840,36.348 Z"/></svg>';
    } else if(badge.includes('subscriber')){
    	role = 'subscriber';
      	roleIcon = '<svg class="role-icon" width="0.6875em" height="0.6875em" viewbox="0 0 11 11"><path fill-rule="evenodd"  fill="var(--color-msg)"d="M4.909,0.396 L3.566,3.228 L0.561,3.684 C0.22,3.765 0.193,4.456 0.197,4.852 L2.371,7.55 L1.857,10.168 C1.764,10.731 2.334,11.152 2.811,10.889 L5.499,9.419 L8.188,10.889 C8.665,11.150 9.235,10.731 9.142,10.168 L8.628,7.55 L10.802,4.852 C11.193,4.456 10.977,3.765 10.438,3.684 L7.433,3.228 L6.90,0.396 C5.849,0.108 5.152,0.115 4.909,0.396 L4.909,0.396 Z"/></svg>';
      	specialIcon = '<svg width="2.375em" height="2.1875em" viewbox="0 0 38 35"><path fill-rule="evenodd"  fill="var(--color-msg-alt)" d="M37.420,22.781 C30.19,15.454 22.619,15.454 15.218,22.781 C22.545,15.380 22.545,7.980 15.218,0.579 C22.619,7.906 30.19,7.906 37.420,0.579 C30.93,7.980 30.93,15.380 37.420,22.781 ZM4.386,34.502 C5.768,30.513 4.471,27.808 0.497,26.386 C4.486,27.768 7.191,26.471 8.613,22.497 C7.231,26.486 8.528,29.191 12.502,30.613 C8.513,29.231 5.808,30.528 4.386,34.502 Z"/></svg>';
    } else {
    	role = 'regular';
      	roleIcon = '';
    	specialIcon = '';
    }
  	
  	return [role, roleIcon, specialIcon];
}

function playAlertSound(sound, soundVolume) {
    sound.volume = soundVolume;
    sound.play();
    if (sound.currentTime == sound.duration) {
        sound.pause();
        sound.currentTime = 0;
    }
}

function attachEmotes(message) {
    let text = html_encode(message.text);
    let data = message.emotes;
  	if (data[0]) {
        hasEmotes = "has-emotes"
    } else {
        hasEmotes = ""
    }
  	let isEmoteOnly = message.tags['emote-only']
    if (typeof message.attachment !== "undefined") {
        if (typeof message.attachment.media !== "undefined") {
            if (typeof message.attachment.media.image !== "undefined") {
                text = `${message.text}<img src="${message.attachment.media.image.src}">`;
            }
        }
    }
    return text.replace(/([^\s]*)/gi, function (m, key) {
        let result = data.filter(emote => {
            return html_encode(emote.name) === key
        });
        if (typeof result[0] !== "undefined") {
            let url;
            if (isEmoteOnly) {
              url = result[0]['urls'][4];
              //console.log('emote only')
            } else {
              url = result[0]['urls'][1];
              //console.log('not emote only')
            }
            if (provider === "twitch") {
                return `<img class="emote" src="${url}"/>`;
            } else {
                if (typeof result[0].coords === "undefined") {
                    result[0].coords = { x: 0, y: 0 };
                }
                let x = parseInt(result[0].coords.x);
                let y = parseInt(result[0].coords.y);

                let height = "{{emoteSize}}px";
                let width = "{{emoteSize}}px";
                if (provider === "mixer") {
                    if (result[0].coords.width) {
                        width = `${result[0].coords.width}px`;
                    }
                    if (result[0].coords.height) {
                        height = `${result[0].coords.height}px`;
                    }
                }
                return `<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url});"></div>`;
            }
        } else return key;
    }
    );
}

function html_encode(e) {
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

function isEmote(data) {
    let msg = data.text;
    msg = msg.replace(/\s\s+/g, ' ');
    let msg_split = msg.split(" ");
	//console.log(msg);

    let emotes = data.emotes;
    let emote_names = [];

    let emoteOnly = true;

    for (let j = 0; j < emotes.length; j++) {
        emote_names.push(emotes[j].name)
    }

    //console.log(emote_names)

    for (let i = 0; i < msg_split.length; i++) {
        //console.log(msg_split[i])

        if (!emote_names.includes(msg_split[i])) {
            emoteOnly = false
        }
    }
    return emoteOnly;
}

function removeRow(selector) {
    if (!$(selector).length) {
        return;
    }
    if (animationOut !== "none" || !$(selector).hasClass(animationOut)) {
        if (hideAfter !== 999) {
            $(selector).dequeue();
        } else {
            $(selector).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove().dequeue()
            });

        }
        return;
    }

    $(selector).animate({
        height: 0,
        opacity: 0
    }, 'slow', function () {
        $(selector).remove();
    });
}
