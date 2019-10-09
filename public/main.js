const socket = io('https://webrtc-socket-server.herokuapp.com/');

$('#div-chat').hide();

// let customConfig;

// $.ajax({
//   url: "https://service.xirsys.com/ice",
//   data: {
//     ident: "vanpho",
//     secret: "2b1c2dfe-4374-11e7-bd72-5a790223a9ce",
//     domain: "vanpho93.github.io",
//     application: "default",
//     room: "default",
//     secure: 1
//   },
//   success: function (data, status) {
//     // data.d is where the iceServers object lives
//     customConfig = data.d;
//     console.log(customConfig);
//   },
//   async: false
// });
customConfig = {'iceServers': [{   urls: [ "stun:ss-turn2.xirsys.com" ]}, {   username: "rL2EnrOEkSNVt_uEYABZ_Zd8Ys4V5kQZBs-VC5uGdGiA55wgAEr5RjfbDS_h-NesAAAAAF2csMVsY2xpbmg=",   credential: "a6980e7c-e9e3-11e9-8a52-322c48b34491",   urls: [       "turn:ss-turn2.xirsys.com:80?transport=udp",       "turn:ss-turn2.xirsys.com:3478?transport=udp",       "turn:ss-turn2.xirsys.com:80?transport=tcp",       "turn:ss-turn2.xirsys.com:3478?transport=tcp",       "turns:ss-turn2.xirsys.com:443?transport=tcp",       "turns:ss-turn2.xirsys.com:5349?transport=tcp"   ]}]
}
socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#div-chat').show();
    $('#div-dang-ky').hide();

    arrUserInfo.forEach(user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });
});

socket.on('DANG_KY_THAT_BAT', () => alert('Vui long chon username khac!'));


function openStream() {
    const config = { audio: true, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream()
// .then(stream => playStream('localStream', stream));

const peer = new Peer({
    key: 'peerjs',
    host: 'peerjs-server-lclinh.herokuapp.com',
    secure: true,
    port: 443,
    config: customConfig
});

peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { ten: username, peerId: id });
    });
});

//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//Callee
peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    console.log(id);
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});
