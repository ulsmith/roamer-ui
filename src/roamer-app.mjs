
import { CustomHTMLElement, html } from "../node_modules/custom-web-component/index.js";
import '../node_modules/socket.io/client-dist/socket.io.js';

import './roamer-menu.mjs'; // your application entry point
import './roamer-control.mjs'; // your application entry point
import RoamerCom from "./RoamerCom.js";

/**
 * RoamerApp
 * A sample Custom HTML Element, to be used in any system that is capable of outputting HTML
 * Build on Web Standards and polyfilled for legacy browsers, using a simple clean lite HTML template rendering called lit-html
 */
class RoamerApp extends CustomHTMLElement {

	/**
	* @public constructor()
	* Invoked when instantiation of class happens
	*/
	constructor() {
		super();

		this.com = new RoamerCom(this._notification.bind(this), this._request.bind(this), this._response.bind(this));
	}

	/**
	* template()
	* Return html TemplateResolver a list of observed properties, that will call propertyChanged() when mutated
	* @return {TemplateResult} Returns a HTML TemplateResult to be used for the basis of the elements DOM structure
	*/
	static template() {
		return html`
			<style>
				/* Style auto encapsulates in shadowDOM or shims for IE */
				:host { 
					display: block;
					width: 100%;
					height: 100%;
				}

				.row {
					display: flex;
					flex-flow: row;
				}

				.col {
					display: flex;
					flex-flow: column;
					flex: 1 1;
				}
				
				.frame {
					display: flex;
					flex-flow: column;
					width: 100%;
					height: 100%;
				}
			</style>

			<div class="frame">
				<roamer-menu @action="${this._action.bind(this)}"></roamer-menu>
				<roamer-control @action="${this._action.bind(this)}"></roamer-control>
			</div>
		`;
	}

	_action(ev) {
		if (ev.detail.action === 'posture') this.shadowRoot.querySelector('roamer-control').posture(ev.detail.posture);

		switch (ev.detail.action) {
			case 'connect': this.com.connect(); break;
			case 'disconnect': this.com.disconnect(); break;
			default: this.com.action(ev.detail); break;
		}
	}

	_notification(data) {
		// user notifications from roamer!
		console.log('NOTIFICATION:', data);

	}

	_request(data) {
		// requests that made it to the roamer!
		console.log('REQUEST:', data);
	}

	_response(data) {
		// responses from the roamer!
		console.log('RESPONSE:', data);
		if (data === 'connected') this.shadowRoot.querySelector('roamer-menu').connect();
		else if (data === 'listening') this.shadowRoot.querySelector('roamer-menu').listen();
		else if (data === 'disconnected') this.shadowRoot.querySelector('roamer-menu').disconnect();
	}
}

customElements.define('roamer-app', RoamerApp);