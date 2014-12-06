var g_groundHight = 57;
var g_runnerStartX = 80;

var BattleLayer = cc.Layer.extend({
    space:null,
    ball:null,
    BallBody:null,
    BallShape:null,
    winSize:null,
    board:null,
    ballDistance:25,
    ballScale:0.5,
    ballAmount:20,
    bottomWallHeight:100,

    onEnter:function(){

        this.winSize = cc.director.getWinSize();
        this._super();
        this.initPhysics();
        this.initBall();
        this.initBoard();
        this.setupDebugNode();

        this.scheduleUpdate();
    },
    setupDebugNode : function (){
        this.debugNode = cc.PhysicsDebugNode.create( this.space );
        this.debugNode.visible = true ;
        this.addChild( this.debugNode );
    },

    initBall:function(){

        this.ball = cc.PhysicsSprite.create(res.PNG_PINGPONG);

        this.BallBody = new cp.Body(50,1);
        this.space.addBody(this.BallBody);

        this.BallShape = new cp.CircleShape(this.BallBody,14,cp.v(0,0))
        this.BallShape.setFriction(0.5)
        this.BallShape.setElasticity(0.5);
        this.BallShape.setCollisionType(1);
        this.space.addShape(this.BallShape);
        this.ball.setBody(this.BallBody);
        this.ball.setPosition(this.winSize.width/2,this.winSize.height/2);
        this.addChild(this.ball);

    },

    initBoard:function(){

        this.board = cc.PhysicsSprite.create(res.PNG_JOINT);
        this.board.setScaleX(5);
        var contentSize = this.board.getContentSize();
        var crutchBody = new cp.Body(1000,1);
        //crutchBody.v_limit = 0.5;
        this.space.addBody(crutchBody);

        var crutchShape = new cp.BoxShape(crutchBody,contentSize.width*5,contentSize.height);
        crutchShape.setFriction(1);
        crutchShape.setElasticity(0.2);
        crutchShape.setCollisionType(2);
        this.space.addShape(crutchShape);
        this.board.setBody(crutchBody);
        this.addChild(this.board);
        this.board.setPosition(cc.p(this.winSize.width/2,this.winSize.height/2));

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseMove:function(event) {
                if (this.board != null){
                    this.board.setPosition(event.getLocation());
                }
            }
        },this);
    },

    initPhysics:function() {
        this.space = new cp.Space();
        this.space.gravity = cp.v(0,-500);

        var wallBottom = new cp.SegmentShape(this.space.staticBody,cp.v(0,0), cp.v(this.winSize.width, 0),this.bottomWallHeight);
        wallBottom.setCollisionType(0);
        wallBottom.setElasticity(0.5);
        wallBottom.setFriction(1);

        var wallLeft = new cp.SegmentShape(this.space.staticBody,cp.v(0,0), cp.v(0, this.winSize.height),10);
        wallLeft.setCollisionType(0);
        wallLeft.setElasticity(0);
        wallLeft.setFriction(1);

        var wallRight = new cp.SegmentShape(this.space.staticBody,cp.v(this.winSize.width,0), cp.v(this.winSize.width, this.winSize.height),10);
        wallRight.setCollisionType(0);
        wallRight.setElasticity(0);
        wallRight.setFriction(1);

        this.space.addStaticShape(wallBottom);
        this.space.addStaticShape(wallLeft);
        this.space.addStaticShape(wallRight);
    },

    update:function(dt){

        this.space.step(dt);
    }
});

var BattleScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new BattleLayer();
        this.addChild(layer);
    }
});
