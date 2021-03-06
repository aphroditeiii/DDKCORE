

let Router = require('../../helpers/router');
let Accounts = require('../../modules/accounts');
let tokenValidator = require('../../tokenValidator');
let config = process.env.NODE_ENV === 'development' ? require('../../config/default') : process.env.NODE_ENV === 'testnet' ? require('../../config/testnet') : require('../../config/mainnet');
let jwt = require('jsonwebtoken');
let jwtSecret = process.env.JWT_SECRET;
let cache = require('../../modules/cache');
/**
 * Renders main page wallet from public folder.
 * - Public API:
 * 	- get	/
 *  - get /user/status
 * @memberof module:server                $rootScope.enableReferOption = resp.data.account.referStatus;

 * @requires helpers/Router
 * @requires helpers/httpApi
 * @constructor
 * @param {Object} serverModule - Module server instance.
 * @param {scope} app - Main app.
 */
// Constructor
function ServerHttpApi (serverModule, app) {

	let router = new Router();

	router.use(function (req, res, next) {
		if (serverModule.areModulesReady()) { return next(); }
		res.status(500).send({success: false, error: 'Blockchain is loading'});
	});

	router.get('/', function (req, res) {
		if (serverModule.isLoaded()) {
			res.status(200).send({success: true, error: 'Blockchain is loaded'});
		} else {
			res.status(200).send({success: false, error: 'Blockchain is loading'});
		}
	});

	router.get('/user/status', tokenValidator, function (req, res) {

		if (req.decoded.address) {
			Accounts.prototype.getAccount({ address: req.decoded.address }, function (err, account) {
				if (!err) {
					let payload = {
						secret: req.decoded.secret,
						address: req.decoded.address
					};
					let refreshToken = jwt.sign(payload, jwtSecret, {
						expiresIn: config.jwt.tokenLife,
						mutatePayload: false
					});

					cache.prototype.getJsonForKey("referStatus", function (error, resp) {
						let enableRefer = (resp == null) ? true : resp;

						return res.status(200).json({
							status: true,
							data: {
								success: true,
								account: account,
								refreshToken: refreshToken || '',
								referStatus: enableRefer
							}
						});
					});
				}
			});
		} else {
			return res.status(200).json({
				status: false
			});
		}
	});  

	// Referral API's
	require('../../helpers/referal').api(app);

	router.use(function (req, res, next) {
		if (req.url.indexOf('/api/') === -1 && req.url.indexOf('/peer/') === -1) {
			return res.redirect('/');
		}
		next();
	});

	app.use('/', router);
}

module.exports = ServerHttpApi;
