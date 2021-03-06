/**
 * @public @name RoamerCom
 * @description Library class giving static crypto resources
 * @author Paul Smith <p@ulsmith.net>
 * @copyright 2020 and up Custom Web Component <custom-web-component.net> <ulsmith.net> <p@ulsmith.net>
 * @license MIT
 */
export default class RoamerCom {
	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(notification, request, response) {
		this.connection;
		
		this.socket = io('http://localhost:3000', { forceNew: false });

		this.socket.on('notification', this._notification.bind(this, notification));
		this.socket.on('roamer-request', this._roamerRequest.bind(this, request));
		this.socket.on('roamer-response', this._roamerResponse.bind(this, response));
	}

	connect() {
		this.connection = true;
		this.socket.emit('/connect');
	}

	disconnect() {
		this.socket.emit('/disconnect');
		this.connection = undefined;
	}

	action(data) {
		let method = `_action${data.action.charAt(0).toUpperCase() + data.action.substring(1, data.action.length)}`;
		if (!this[method]) throw Error('INVALID ACTION: ' + data.action);
		this[method](data);
	}

	_notification(notification, message) {
		if (!notification) return;
		
		notification(message);
	}

	_roamerRequest(request, message) {
		if (!request) return;
		
		request(message);
	}

	_roamerResponse(response, message) {
		if (!response) return;
		
		response(message);
	}

	// BASIC COMMANDS

	_actionHelp(data) { this.socket.emit('/action', '?') }
	_actionStop(data) { this.socket.emit('/action', '!') }
	
	// POSTURE

	_actionPosture(data) { this.socket.emit('/action', `p ${data.posture.charAt(0)}`) }
	
	// MOVING (in posture set) - moving without changing axis

	_actionMove(data) { this.socket.emit('/action', `m ${data.posture.charAt(0)} ${data.x} ${data.y}`) }

	// DRIVING (in posture set) - moving with axis turn, like a car drives

	_actionDrive(data) { this.socket.emit('/action', `d ${data.posture.charAt(0)} ${data.x} ${data.y}`) }

	// TURNING (in posture set) - no moving, just turning on the spot

	_actionTurn(data) { this.socket.emit('/action', `t ${data.posture.charAt(0)} ${data.direction.charAt(0)}`) }
}
