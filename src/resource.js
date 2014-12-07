var res = {
    PNG_PINGPONG:"res/pingpong.png",
    PNG_JOINT:"res/Joint.png",
    PNG_BG:"res/background.png",
    PNG_BASKET:"res/basket.png",
    PNG_CRUTCH:"res/board.png",
    PNG_LOGO:"res/Logo.png",
    PNG_JUMP:"res/jumplayer.png",
    PNG_FACE1:"res/foreFace1.png",
    PNG_FACE2:"res/foreFace2.png",
    PNG_FACE3:"res/foreFace3.png",

    PARTICLE:"res/particle.plist",

    WAV_EFFECT1:"res/Hit_Hurt.wav",
    WAV_EFFECT2:"res/Randomize.wav"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}