const {emit, players, util, chunks} = require('./bullet');

const DOUBLE_STEP_MULTIPLIER = 2;

/**
 * @param {object} packet 
 * @param {players.player} userData 
 */
module.exports.setDir = function(packet, userData) {
	if(userData.public.state !== 'travel')return;
	let allowedDirs = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', ''];
	if(typeof packet.autowalk === 'boolean' && typeof packet.dir === 'string' && allowedDirs.indexOf(packet.dir) !== -1)
	{
		const dir = packet.dir;
		userData.cache.travelData = {dir:dir, autowalk:packet.autowalk};
	}
}

/**
 * @param {object} packet 
 * @param {players.player} player 
 */
module.exports.doubleStep = function(packet, player) {
	if(player.public.state === 'travel')
	{
		if(packet.option)
		{
			if(packet.option === 'remove')
			{
				player.cache.doubleStep = false;
			}
			else if(packet.option === 'add' && player.public.skills.sp >= 10)
			{
				player.cache.doubleStep = true;
			}
		}
	}
}

/**
 * @param {players.player} player 
 */
 module.exports.join = function(player) {
	player.cache.doubleStep = false;
}

/**
 * @param {players.player} player 
 */
module.exports.tick = function(player) {
	if(player.cache.travelData)
	{
		emit('travelers', 'movePlayer', player);
		if(player.cache.travelData && !player.cache.travelData.autowalk)
		{
			emit('travelers', 'stopPlayerMovement', player);
		}
	}
}

/**
 * @param {players.player} player 
 */
module.exports.move = function(player) {
	if(player.cache.travelData)
	{
		const {x, y} = util.compassChange(player.public.x, player.public.y, player.cache.travelData.dir, player.cache.doubleStep ? DOUBLE_STEP_MULTIPLIER: 1);
		player.cache.doubleStep = false;
        
        const tile = generateTileAt(x, y);
        const onWater = tile === "w";
        const onBorder = tile === "░";
        if (!onWater && !onBorder)
        {
            player.public.x = x;
            player.public.y = y;
            player.addPropToQueue('x', 'y');
        }
	}
	else return false;
}

/**
 * @param {players.player} player 
 */
module.exports.stopPlayerMovement = function(player) {
	player.cache.travelData = null;
}