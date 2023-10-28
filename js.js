// Copyright 2023 Redo Graphics. All rights reserved.
//
// Do not redistribute without obtaining explicit permission

let totalMessages = 0, messagesLimit = 0,chatDirection, removeSelector, provider, hideAfter, animationOut, displayPreview, fieldData, channelName, autoDelete, autoDeleteDistance, smoothScrollDuration, checkForUpdatesOnWidgetLoad;
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
  	smoothScrollDuration = fieldData.smoothScrollDuration;
  	checkForUpdatesOnWidgetLoad = fieldData.checkForUpdatesOnWidgetLoad;
    fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
        provider = profile.provider;
    });
  
    removeSelector = ".chat-message:nth-last-child(n+" + (messagesLimit + 1) + ")";
  
    ignoredUsers = fieldData.ignoredUsers.toLowerCase().replaceAll(" ", "").split(",");
  
  	if(chatDirection === 'column'){
      $('.main-container').css({'bottom':0});
    }
  
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
                    <svg class="web" width="6.6875em" height="6.1875em" viewBox="0 0 107 99" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M105.868 68.5134C102.109 67.1045 98.4038 65.712 94.7501 64.3336C91.2321 53.7197 89.9503 43.181 90.2871 32.2314C93.1642 30.28 95.9828 28.2324 98.743 26.0908C99.3137 25.6494 99.4587 24.7172 99.0751 24.0197C98.6891 23.3223 97.9219 23.1251 97.3582 23.5736C94.6214 25.7386 91.8262 27.8074 88.9725 29.7752C80.3061 25.0788 73.1508 19.0556 67.6656 12.0956C68.6176 8.64139 69.5229 5.11675 70.3766 1.52871C70.5521 0.786675 70.2222 0.103349 69.6421 0.00942149C69.0644 -0.0821582 68.4492 0.44149 68.2668 1.17413C67.3873 4.72695 66.4586 8.21402 65.4809 11.6306C56.9853 15.5592 47.9797 17.062 39.2689 16.9024C38.1929 14.4227 37.1543 12.004 36.1508 9.64173C35.9427 9.15095 35.2994 9.04294 34.7053 9.38577C34.1135 9.73096 33.793 10.3932 33.9965 10.8769C34.9813 13.2133 36.0035 15.6085 37.0631 18.0624C31.6738 25.5907 24.5723 31.44 16.0018 35.23C13.0288 34.2109 10.0932 33.2223 7.18572 32.2619C6.58457 32.0647 5.815 32.2525 5.4618 32.6775C5.10859 33.1026 5.30975 33.6098 5.91558 33.8164C8.83946 34.8191 11.7938 35.85 14.7831 36.909C15.5901 43.8996 14.6872 51.2025 11.6604 57.768C8.13773 58.1015 4.59165 58.3246 1.01984 58.4373C0.28068 58.4631 -0.154394 58.8787 0.0491084 59.3812C0.20115 59.7617 0.678328 60.081 1.221 60.2102C1.39877 60.2501 1.58122 60.2712 1.76367 60.2665C5.35186 60.1773 8.91665 59.98 12.4557 59.6724C20.6192 65.2917 27.7605 72.1695 33.7135 80.3295C32.0668 82.6331 30.3826 84.8639 28.6634 87.0219C28.3078 87.4657 28.6283 88.1725 29.3862 88.6046C29.5733 88.7102 29.7674 88.7877 29.9592 88.8417C30.5534 89.0014 31.1358 88.9075 31.4001 88.5646C33.103 86.3644 34.7731 84.0913 36.4011 81.7455C47.5937 82.5791 58.7817 84.3191 70.2129 87.731C71.9462 91.0796 73.7262 94.4821 75.5577 97.9386C75.8431 98.4764 76.4466 98.8756 77.0594 98.9742C77.2583 99.0071 77.4571 99.0071 77.6466 98.9695C78.4208 98.8216 78.7342 98.1124 78.3506 97.3915C76.4957 93.9162 74.6876 90.4949 72.9309 87.1252C78.8021 79.8012 85.913 73.09 94.0343 66.9636C97.7114 68.3795 101.442 69.8119 105.227 71.2561C105.419 71.3312 105.611 71.3617 105.793 71.3594C106.357 71.35 106.834 70.9978 106.965 70.4225C107.138 69.6616 106.644 68.8046 105.868 68.5134ZM66.8048 15.16C71.9953 21.4461 78.5705 26.9926 86.4159 31.5081C83.106 33.7061 79.7237 35.7748 76.2735 37.7121C71.331 34.3988 66.9569 30.6604 63.2517 26.6427C64.4985 22.9043 65.682 19.0768 66.8048 15.16ZM30.5885 42.6503C34.0527 43.9325 37.5613 45.2474 41.1214 46.593C41.1589 48.5067 41.1004 50.4393 40.9367 52.346C37.2198 53.391 33.4585 54.3044 29.6528 55.084C30.4949 51.0076 30.7826 46.7996 30.5885 42.6503ZM63.3687 44.2189C61.6331 42.8335 59.9793 41.3894 58.4308 39.9147C59.7805 36.4981 61.074 32.9969 62.3114 29.4112C65.6329 32.8818 69.4457 36.1529 73.6935 39.1304C70.3135 40.9526 66.8703 42.648 63.3687 44.2189ZM52.8708 52.8626C53.6778 54.558 54.5011 56.2746 55.3385 58.0076C53.7339 57.8925 52.1246 57.8056 50.52 57.7492C51.3176 56.1431 52.1012 54.5158 52.8708 52.8626ZM50.4708 41.751C51.2287 41.751 51.9866 41.7392 52.7468 41.7134C53.5047 41.6899 54.2625 41.6547 55.0181 41.603C54.2953 43.329 53.5561 45.0314 52.8006 46.7104C52.0123 45.0385 51.2357 43.3853 50.4708 41.751ZM55.3292 52.0103C57.2426 52.7452 59.1723 53.4873 61.1161 54.2387C60.0027 55.2155 58.9057 56.2041 57.8343 57.1951C56.9853 55.448 56.1502 53.7197 55.3292 52.0103ZM55.2426 47.6003C55.9841 45.9002 56.7116 44.1767 57.4227 42.4296C58.494 43.4229 59.6121 44.4021 60.7676 45.3578C58.9407 46.1398 57.0999 46.8865 55.2426 47.6003ZM56.3046 49.81C58.1712 49.1126 60.0237 48.3776 61.8623 47.6074C61.8787 49.0609 61.9418 50.5192 62.0494 51.9703C60.1197 51.2424 58.2039 50.5238 56.3046 49.81ZM56.0449 39.1233C53.8368 39.3347 51.603 39.4333 49.3902 39.4239C47.9399 36.3032 46.5435 33.2529 45.1962 30.273C47.6592 30.2894 50.1387 30.1814 52.6135 29.9302C55.0882 29.6812 57.5607 29.2914 60.0027 28.749C58.7396 32.2924 57.4203 35.7513 56.0449 39.1233ZM43.7646 47.5933C45.6195 48.2978 47.4861 49.0093 49.3691 49.7278C47.4861 50.3712 45.5891 50.977 43.6781 51.55C43.7529 50.235 43.781 48.9106 43.7646 47.5933ZM44.8079 45.5339C45.9423 44.6346 47.0394 43.6812 48.0873 42.6809C48.8382 44.3011 49.603 45.9402 50.382 47.6003C48.5107 46.9029 46.6511 46.2149 44.8079 45.5339ZM50.3937 51.8975C49.6101 53.5272 48.8148 55.1334 48.0031 56.716C46.9107 55.664 45.7926 54.6496 44.6582 53.6775C46.5833 53.121 48.4966 52.5269 50.3937 51.8975ZM47.023 40.3773C45.5073 41.8778 43.8839 43.2844 42.1811 44.5665C38.6443 43.2656 35.1567 41.9952 31.7159 40.7577C35.8912 38.1676 39.6455 34.9858 42.8992 31.3038C44.2254 34.2579 45.5985 37.2824 47.0253 40.3773H47.023ZM41.9004 54.4547C43.5915 55.8683 45.2453 57.3806 46.8359 58.9633C45.2476 61.9784 43.6079 64.9042 41.9191 67.7432C38.4057 63.8052 34.5977 60.2501 30.551 57.1152C34.3778 56.3615 38.1625 55.4738 41.9004 54.4547ZM49.3668 60.0293C51.7503 60.1186 54.1549 60.2736 56.5455 60.499C58.1852 63.8827 59.8834 67.3346 61.6377 70.8545C55.9116 69.8519 50.1948 69.2531 44.5131 68.9501C46.1833 66.0642 47.8019 63.0914 49.3668 60.0293ZM59.06 59.7076C60.6179 58.2259 62.2459 56.7536 63.9067 55.3142C67.689 56.7771 71.5275 58.2635 75.4268 59.7734C71.4362 63.1008 67.6796 66.5644 64.2271 70.1336C62.4494 66.5902 60.7278 63.1149 59.06 59.7076ZM64.8213 53.0129C64.6037 50.8432 64.4961 48.657 64.4844 46.4849C68.0095 44.9422 71.476 43.2703 74.8817 41.4739C74.8373 46.7902 75.27 52.069 76.2618 57.3383C72.3883 55.873 68.5779 54.4312 64.8213 53.0129ZM52.4825 18.1563C56.5666 17.4354 60.6319 16.2942 64.599 14.6598C63.4459 18.5344 62.2342 22.3196 60.9617 26.0157C55.4368 27.4575 49.7551 28.0657 44.174 28.0023C42.8103 24.9661 41.498 22.0073 40.2396 19.1261C44.2933 19.1754 48.3984 18.8772 52.4825 18.1563ZM38.0175 20.2673C39.2572 23.1204 40.5484 26.0486 41.8887 29.0566C38.2537 33.3397 33.9498 36.9724 29.0868 39.8161C25.5641 38.5551 22.0905 37.3317 18.6614 36.1458C26.4085 32.4686 32.9229 27.0794 38.0198 20.2673H38.0175ZM17.4544 37.86C20.9046 39.0952 24.3992 40.3655 27.9429 41.6735C28.2236 46.337 27.854 51.1015 26.7289 55.6594C22.7899 56.3967 18.8087 56.9931 14.7901 57.444C17.3023 51.2095 18.0836 44.4209 17.4544 37.86ZM35.1731 78.2561C29.5499 70.8804 22.9887 64.5895 15.6065 59.3695C19.6461 58.9468 23.6507 58.3786 27.6108 57.6671C32.3054 61.2105 36.6701 65.3081 40.6162 69.9035C38.8525 72.7824 37.0374 75.5674 35.1731 78.2561ZM37.8444 79.6368C39.6899 76.8988 41.4863 74.0669 43.2266 71.141C49.7761 71.5003 56.3771 72.2541 62.9921 73.5644C64.8259 77.2252 66.7206 80.9565 68.6784 84.7606C58.2741 81.9098 48.0569 80.3953 37.8444 79.6368ZM71.3731 84.1336C69.3872 80.306 67.4644 76.5489 65.6025 72.8646C69.4784 68.7153 73.7917 64.721 78.4255 60.9334C82.4745 62.502 86.589 64.0941 90.7713 65.7049C83.4429 71.4017 76.9191 77.5375 71.3731 84.1336ZM79.2465 58.4678C77.9319 52.3672 77.3869 46.2454 77.4828 40.072C80.9611 38.1606 84.3692 36.1177 87.7047 33.9456C87.4731 43.855 88.5866 53.4497 91.5058 63.1078C87.3515 61.5392 83.2674 59.9918 79.2465 58.4678Z" fill="var(--color-bg-alt)"/></svg>
                </div>
            </div>

`);
  
  	let element = regular;
    if (hideAfter !== 999) {
        $(element).appendTo('.main-container').hide().slideToggle(smoothScrollDuration).delay(hideAfter * 1000).queue(function () {
            $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove()
            }).dequeue();
        });
    } else {
        $(element).appendTo('.main-container').hide().slideToggle(smoothScrollDuration);
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
                        <svg width="2.125em" height="2.0625em" viewBox="0 0 34 33" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    <svg width="10.15625em" height="10.15625em" viewbox="0 0 162.5 165.5">
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
                    <svg class="alert-side" width="7.75em" height="15.5625em" viewBox="0 0 124 249" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 2H122V247H2V2Z" fill="var(--color-alert)" stroke="var(--color-bg-alt)" stroke-width="3" stroke-linecap="round" stroke-dasharray="12 12"/></svg>
                </div>
            </div>
        </div>
`);

    playAlertSound(sound, soundVolume);
  
  	let element = regular;
    if (hideAfter !== 999) {
        $(element).appendTo('.main-container').hide().slideToggle(smoothScrollDuration).delay(hideAfter * 1000).queue(function () {
            $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove()
            }).dequeue();
        });
    } else {
        $(element).appendTo('.main-container').hide().slideToggle(smoothScrollDuration);
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

