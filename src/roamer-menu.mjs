import { CustomHTMLElement, html } from "../node_modules/custom-web-component/index.js";
import "../node_modules/custom-web-components/src/icon/material/index.js";

/**
 * RoamerMenu
 * A sample Custom HTML Element, to be used in any system that is capable of outputting HTML
 * Build on Web Standards and polyfilled for legacy browsers, using a simple clean lite HTML template rendering called lit-html
 */
class RoamerMenu extends CustomHTMLElement {

	/**
	* @public constructor()
	* Invoked when instantiation of class happens
	* NOTE: Call super() first!
	* NOTE: Declare local properties here... [this.__private, this._protected, this.public]
	* NOTE: Declarations and kick starts only... no business logic here!
	*/
	constructor() {
		super();

		this.socket;
		this.connection;
		this.connecting;
		this.timeout;
		this.posture;
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
				height: 50px;
				flex: 0 0 50px;
			}

			[hidden] { display: none !important; }

			.row {
				display: flex;
				flex-flow: row;
			}

			.col {
				display: flex;
				flex-flow: column;
				flex: 1 1;
			}

			.button {
				margin: 5px;
				display: inline-block;
				background: #222;
				border-radius: 25px;
				height: 40px;
				min-width: 40px;
				opacity: 0.7;
				cursor: pointer;
			}

			.button:hover { opacity: 1; }
			.button.right { float: right; }
			.button[selected], .green { background: green; opacity: 1; }

			.button .text {
				padding-right: 15px;
				color: white;
			}

			.icon {
				fill: white;
				width: 40px;
				height: 40px;
			}
		</style>

		<div class="frame">
			<div class="button" ?hidden="${this.connection}" @click="${this._connect.bind(this)}">
				<cwc-icon-material-image class="icon" name="leakRemove"></cwc-icon-material-image>
				<span class="text" ?hidden="${this.connecting || this.listening}">Disconnected</span>
				<span class="text" ?hidden="${!this.connecting}">Connecting...</span>
				<span class="text" ?hidden="${!this.listening}">Listening...</span>
			</div>
			<div class="button green" ?hidden="${!this.connection}" @click="${this._disconnect.bind(this)}">
				<cwc-icon-material-image class="icon" name="leakAdd"></cwc-icon-material-image>
			</div>
			<div class="button right" ?hidden="${!this.connection}" ?selected="${this.posture === 'run'}" @click="${this._doPosture.bind(this, 'run')}">
				<cwc-icon-material-map class="icon" name="directionsRun"></cwc-icon-material-general>
			</div>
			<div class="button right" ?hidden="${!this.connection}" ?selected="${this.posture === 'walk'}" @click="${this._doPosture.bind(this, 'walk')}">
				<cwc-icon-material-map class="icon" name="directionsWalk"></cwc-icon-material-general>
			</div>
			<div class="button right" ?hidden="${!this.connection}" ?selected="${this.posture === 'crab'}" @click="${this._doPosture.bind(this, 'crab')}">
				<cwc-icon-material-general class="icon" name="accessibility"></cwc-icon-material-general>
			</div>
			<div class="button right" ?hidden="${!this.connection}" ?selected="${this.posture === 'sit'}" @click="${this._doPosture.bind(this, 'sit')}">
				<cwc-icon-material-notification class="icon" name="airlineSeatReclineNormal"></cwc-icon-material-general>
			</div>
		</div>
		`;
	}

	/**
	* @static @get observedProperties()
	* Return a list of observed properties, that will call propertyChanged() when mutated
	* @return {Array} List of properties that will promote the callback to be called on mutation
	*/
	static get observedProperties() { return ['socket']; }

	/**
	* @public propertyChanged()
	* Invoked when an observed instantiated property has changed
	* @param {String} property The name of the property that changed
	* @param {*} oldValue The old value before the change
	* @param {*} newValue The new value after the change
	*/
	propertyChanged(property, oldValue, newValue) {
		if (property === 'socket') this.socket = newValue;
		this.updateTemplate();
	}

	/**
	* @static @get observedAttributes()
	* Return a list of observed attributes, that will call attributeChanged() when mutated
	* @return {Array} List of attributes that will promote the callback to be called on mutation
	*/
	static get observedAttributes() { return []; }

	/**
	* @public attributeChanged()
	* Invoked when an observed node attribute has changed
	* @param {String} attribute The name of the attribute that changed
	* @param {*} oldValue The old value before the change
	* @param {*} newValue The new value after the change
	*/
	attributeChanged(attribute, oldValue, newValue) {
		
	}

	/**
	* @public connected()
	* Invoked when node is connected/added to the DOM
	*/
	connected() {
		
	}

	/**
	* @public disconnected()
	* Invoked when node is disconnected/removed from the DOM
	*/
	disconnected() {
		
	}

	connect() {
		clearTimeout(this.timeout);
		this.updateTemplate();
	}

	listen() {
		setTimeout(() => {
			this.connecting = false;
			this.listening = true;
			this.updateTemplate();

			setTimeout(() => {
				this.listening = false 
				this.connection = true;
				this.updateTemplate();
			}, 2000);
		}, 2000);
	}

	disconnect() {
		this.connecting = false;
		this.connection = false;
		this.updateTemplate();
	}

	_connect() {
		this.connecting = true;
		this.updateTemplate();
		this.dispatchEvent(new CustomEvent('action', { detail: { action: 'connect' }}));
		this.timeout = setTimeout(() => this.disconnect(), 5000);
	}

	_disconnect() {
		this.dispatchEvent(new CustomEvent('action', { detail: { action: 'disconnect' }}));
	}

	_doPosture(type) {
		this.posture = type;
		this.updateTemplate();
		this.dispatchEvent(new CustomEvent('action', { detail: { action: 'posture', posture: type }}));
	}
}

customElements.define('roamer-menu', RoamerMenu);