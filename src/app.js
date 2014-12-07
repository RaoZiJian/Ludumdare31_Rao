var currentLayer;

var BattleLayer = cc.Layer.extend({
    space:null,
    ball:null,
    BallBody:null,
    BallShape:null,
    winSize:null,
    board:null,
    boardShape:null,
    ballDistance:25,
    ballScale:0.5,
    ballAmount:20,
    bottomWallHeight:135,
    touchBeginPos:null,
    touchEndedPos:null,
    ifTouchFlag:false,
    basket:null,
    crutch:null,
    particle:null,
    score:0,
    scoreLabel:null,

    onEnter:function(){

        this.winSize = cc.director.getWinSize();
        this._super();
        this.initBackground();
        this.initPhysics();
        this.initBall();
        //this.setupDebugNode();
        this.createBoardBody();
        this.initTouchEvent();

        this.scheduleUpdate();
    },
    setupDebugNode : function (){
        this.debugNode = cc.PhysicsDebugNode.create( this.space );
        this.debugNode.visible = true ;
        this.addChild( this.debugNode );
    },

    initBall:function(){
        this.ball = cc.PhysicsSprite.create(res.PNG_FACE1);
        this.ball.setScale(0.5);

        this.BallBody = new cp.Body(50,1);
        this.space.addBody(this.BallBody);

        this.BallShape = new cp.CircleShape(this.BallBody,14,cp.v(0,0))
        this.BallShape.setFriction(0.5)
        this.BallShape.setElasticity(1.2);
        this.BallShape.setCollisionType(10);
        this.space.addShape(this.BallShape);
        this.ball.setBody(this.BallBody);
        this.ball.setPosition(this.winSize.width/2,this.winSize.height/2+400);
        this.addChild(this.ball);

        this.space.addCollisionHandler(10, 0, this.ballHitCallback.bind(this));
        this.space.addCollisionHandler(10, 2, this.ballHitCallback2.bind(this));
        this.space.addCollisionHandler(10, 100, this.ballHitCallback3.bind(this));

    },

    ballHitCallback:function(arbiter, space){

        cc.audioEngine.playEffect(res.WAV_EFFECT1);
        return true;
    },

    ballHitCallback2:function(arbiter, space){

        cc.audioEngine.playEffect(res.WAV_EFFECT2);
        return true;
    },

    ballHitCallback3:function(arbiter, space){

        currentLayer.score+=10;
        this.scoreLabel.setString("Score : " + currentLayer.score);
        return true;
    },

    createBoardBody:function(){

        currentLayer.board = cc.PhysicsSprite.create(res.PNG_JOINT);
        var contentSize = currentLayer.board.getContentSize();
        var boardBody = new cp.Body(Infinity,Infinity);
        boardBody.nodeIdleTime = Infinity;

        boardBody.v_limit = 0.5;
        currentLayer.board.setBody(boardBody);
        //currentLayer.addChild(this.board);
        //currentLayer.board.setAnchorPoint(cc.p(0,0));
        //currentLayer.space.addBody(boardBody);
    },

    createBoardShape:function(touch){

        var body = currentLayer.board.getBody();
        var bodyShape = currentLayer.boardShape;
        var startPos = currentLayer.touchBeginPos;
        var movePos = touch.getLocation();

        var yMinus = Math.abs(startPos.y-movePos.y);
        var xMinus = Math.abs(startPos.x-movePos.x);

        if(currentLayer.boardShape!=null) {
            body.removeShape(bodyShape);
            currentLayer.space.removeShape(bodyShape);
        }
        var width = Math.sqrt((xMinus*xMinus+yMinus*yMinus));

        var crutchShape = new cp.SegmentShape(body,startPos,movePos,10);
        crutchShape.setFriction(1);
        crutchShape.setElasticity(1);
        crutchShape.setCollisionType(2);
        currentLayer.boardShape=crutchShape;
        currentLayer.space.addShape(crutchShape);
        currentLayer.crutch.setScaleX(width/28);
        currentLayer.crutch.setScaleY(0.5);

        if(startPos.y>movePos.y&&startPos.x<movePos.x) {

            var atan = Math.atan(yMinus/xMinus);
            var rotation = atan/(Math.PI*2/360);
            currentLayer.crutch.setRotation(rotation);
        }else if(startPos.y>movePos.y&&startPos.x>movePos.x){

            var atan = Math.atan(yMinus/xMinus);
            var rotation = 180 - atan/(Math.PI*2/360);
            currentLayer.crutch.setRotation(rotation);
        }else if(startPos.y<movePos.y&&startPos.x>movePos.x){

            var atan = Math.atan(yMinus/xMinus);
            var rotation = atan/(Math.PI*2/360)-180;
            currentLayer.crutch.setRotation(rotation);
        }else if(startPos.y<movePos.y&&startPos.x<movePos.x){
            var atan = Math.atan(yMinus/xMinus);
            var rotation = -atan/(Math.PI*2/360);
            currentLayer.crutch.setRotation(rotation);
        }
        currentLayer.addChild(currentLayer.crutch);

    },

    initTouchEvent:function(){

        var touchListener = cc.EventListener.create({
            event:cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches:true,
            onTouchBegan: function (touch,event) {

                if(currentLayer.ifTouchFlag)
                    return;

                currentLayer.ifTouchFlag = true;
                currentLayer.touchBeginPos = touch.getLocation();
                if(currentLayer.crutch!=null) {
                    currentLayer.crutch.removeFromParent();
                }
                currentLayer.crutch = cc.Sprite.create(res.PNG_CRUTCH);
                currentLayer.crutch.setAnchorPoint(cc.p(0, 0.5));
                currentLayer.crutch.setPosition(touch.getLocation());
                currentLayer.particle = cc.ParticleSystem.create(res.PARTICLE);
                currentLayer.particle.setScale(0.7);
                currentLayer.particle.setPosition(touch.getLocation());
                currentLayer.addChild(currentLayer.particle);

                cc.log("the touchX begin is " + touch.getLocationX() + "the touchY begin is " + touch.getLocationY());

                return true;
            },

            onTouchMoved: function (touch, event) {
                currentLayer.particle.setPosition(touch.getLocation());
            },

            onTouchEnded:function(touch,event){
                if(currentLayer.ifTouchFlag) {
                    currentLayer.createBoardShape(touch);
                }
                currentLayer.particle.setPosition(touch.getLocation());
                currentLayer.particle.removeFromParent();
                currentLayer.particle=null;
                currentLayer.ifTouchFlag = false;
                cc.log("the touchX begin is " + touch.getLocationX() + "the touchY begin is " + touch.getLocationY());
            }
        });
        cc.eventManager.addListener(touchListener, this);
    },

    initPhysics:function() {
        this.space = new cp.Space();
        this.space.gravity = cp.v(0,-500);

        var wallBottom = new cp.SegmentShape(this.space.staticBody,cp.v(0,0), cp.v(this.winSize.width, 0),this.bottomWallHeight);
        wallBottom.setCollisionType(0);
        wallBottom.setElasticity(0.7);
        wallBottom.setFriction(1);

        var wallLeft = new cp.SegmentShape(this.space.staticBody,cp.v(0,0), cp.v(0, 100000000),10);
        wallLeft.setCollisionType(0);
        wallLeft.setElasticity(0.5);
        wallLeft.setFriction(1);

        var wallRight = new cp.SegmentShape(this.space.staticBody,cp.v(this.winSize.width,0), cp.v(this.winSize.width, 100000000),10);
        wallRight.setCollisionType(0);
        wallRight.setElasticity(0.5);
        wallRight.setFriction(1);

        var bridge = new cp.SegmentShape(this.space.staticBody,cp.v(10.6,369), cp.v(281, 132),10);
        bridge.setCollisionType(0);
        bridge.setElasticity(0.5);
        bridge.setFriction(1);

        var basket = new cp.SegmentShape(this.space.staticBody,cp.v(920,560), cp.v(920, 404),30);
        basket.setCollisionType(0);
        basket.setElasticity(0.5);
        basket.setFriction(1);

        var basket2 = new cp.SegmentShape(this.space.staticBody,cp.v(869.6,458.3), cp.v(893, 458.3),5);
        basket2.setCollisionType(100);
        basket2.setElasticity(0.5);
        basket2.setFriction(1);

        var basketCrutch = new cp.SegmentShape(this.space.staticBody,cp.v(1007,575), cp.v(1009, 141),10);
        basketCrutch.setCollisionType(0);
        basketCrutch.setElasticity(0.5);
        basketCrutch.setFriction(1);

        var jumpLayer = new cp.SegmentShape(this.space.staticBody,cp.v(470,143), cp.v(470-115, 143),8);
        jumpLayer.setCollisionType(0);
        jumpLayer.setElasticity(1);
        jumpLayer.setFriction(1);

        this.space.addStaticShape(wallBottom);
        this.space.addStaticShape(wallLeft);
        this.space.addStaticShape(wallRight);
        this.space.addStaticShape(bridge);
        this.space.addStaticShape(basket);
        this.space.addStaticShape(basketCrutch);
        this.space.addStaticShape(basket2);
        this.space.addStaticShape(jumpLayer);
    },

    initBackground:function(){

        var bg = cc.Sprite.create(res.PNG_BG);
        bg.setPosition(cc.p(0,0));
        bg.setAnchorPoint(cc.p(0,0));
        this.addChild(bg,0);

        this.basket = cc.Sprite.create(res.PNG_BASKET);
        this.basket.setPosition(cc.p(900,470));
        this.basket.setAnchorPoint(cc.p(1,1));
        this.addChild(this.basket,100);

        var logo = cc.Sprite.create(res.PNG_LOGO);
        logo.setAnchorPoint(cc.p(0,1));
        logo.setPosition(0,this.winSize.height-100);
        this.addChild(logo);

        var jumpLayer = cc.Sprite.create(res.PNG_JUMP);
        jumpLayer.setAnchorPoint(1,0.5);
        jumpLayer.setPosition(470,143);
        this.addChild(jumpLayer);

        this.scoreLabel = new cc.LabelTTF("Score : " + currentLayer.score);
        this.scoreLabel.setFontSize(50);
        this.scoreLabel.setAnchorPoint(0,0.5);
        this.scoreLabel.setColor(cc.color(255,0,0,0));
        this.scoreLabel.setPosition(cc.p(0,this.winSize.height-200));
        this.addChild(this.scoreLabel);
    },

    update:function(dt){

        this.space.step(dt);
    }
});

var BattleScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new BattleLayer();
        currentLayer = layer;
        this.addChild(layer);
    }
});
