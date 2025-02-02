'use strict';

const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('@koa/router');
const body = require('koa-body');
const serve = require('koa-static');
const User = require('./user');
const packageJson = require('./package.json');

// Create express instance
const app = new Koa();
const router = new Router();

const handler = async (ctx, next) => {
  try {
    await next();
    if (ctx.body?.data.message) {
      ctx.body.message = ctx.body.data.message;
      ctx.body.data.message = undefined;
    }
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      code: err.status || err.statusCode || 500,
      message: err.message,
    };
  }
};

app.use(serve('static'));
app.use(cors());
app.use(handler);
app.use(router.routes()).use(router.allowedMethods());

router.get('/api/status', (ctx) => {
  ctx.body = {
    code: 200,
    data: {
      version: packageJson.version,
    },
    message: 'Ninja is already.',
  };
});

router.get('/api/info', async (ctx) => {
  const data = await User.getPoolInfo();
  ctx.body = { data };
});

router.get('/api/qrcode', async (ctx) => {
  const user = new User({});
  await user.getQRConfig();
  ctx.body = {
    data: {
      token: user.token,
      okl_token: user.okl_token,
      cookies: user.cookies,
      QRCode: user.QRCode,
      ua: user.ua,
    },
  };
});

router.post('/api/check', body(), async (ctx) => {
  const body = ctx.request.body;
  const user = new User(body);
  const data = await user.checkQRLogin();
  ctx.body = { data };
});

router.post('/api/cklogin', body(), async (ctx) => {
  try {
    const body = ctx.request.body;
    const user = new User(body);
    const data = await user.CKLogin();
    ctx.body = { data };
  }
  catch (e) {
    throw new Error(e);
  }
});

router.get('/api/userinfo', async (ctx) => {
  try {
    const query = ctx.query;
    const eid = query.eid;
    const user = new User({ eid });
    const data = await user.getUserInfoByEid();
    ctx.body = { data };
  }
  catch (e) {
    throw new Error(e);
  }
});

router.post('/api/delaccount', body(), async (ctx) => {
  const body = ctx.request.body;
  const eid = body.eid;
  const user = new User({ eid });
  const data = await user.delUserByEid();
  ctx.body = { data };
});

router.post('/api/update/remark', body(), async (ctx) => {
  const body = ctx.request.body;
  const eid = body.eid;
  const remark = body.remark;
  const user = new User({ eid, remark });
  const data = await user.updateRemark();
  ctx.body = { data };
});

router.get('/api/users', async (ctx) => {
  const data = await User.getUsers();
  ctx.body = { data };
});

///////////////////////////////////////////////

router.post('/api/WSCKLogin', body(), async (ctx) => {
  const body = ctx.request.body;
  const user = new User(body);
  const data = await user.WSCKLogin();
  ctx.body = { data };
});

router.get('/api/WSCKUserinfo', async (ctx) => {
  const query = ctx.query;
  const wseid = query.wseid;
  const user = new User({ wseid });
  const data = await user.getWSCKUserInfoByEid();
  ctx.body = { data };
});

router.post('/api/WSCKDelaccount', body(), async (ctx) => {
  const body = ctx.request.body;
  const wseid = body.wseid;
  const user = new User({ wseid });
  const data = await user.delWSCKUserByEid();
  ctx.body = { data };
});

router.post('/api/updateWSCK/remark', body(), async (ctx) => {
  const body = ctx.request.body;
  const wseid = body.wseid;
  const remark = body.remark;
  const user = new User({ wseid, remark });
  const data = await user.updateWSCKRemark();
  ctx.body = { data };
});

///////////////////////////////////////////////

//执行定时任务
router.get('/api/wskeyConvert', async (ctx) => {
  const user = new User({});
  const data = await user.wskeyConvert();
  ctx.body = { data };
});



const port = process.env.NINJA_PORT || 5701;
console.log('Start Ninja success! listening port: ' + port);
app.listen(port);
