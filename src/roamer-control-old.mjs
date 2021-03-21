import { CustomHTMLElement, html } from "../node_modules/custom-web-component/index.js";

/**
 * RoamerControl
 * A sample Custom HTML Element, to be used in any system that is capable of outputting HTML
 * Build on Web Standards and polyfilled for legacy browsers, using a simple clean lite HTML template rendering called lit-html
 */
class RoamerControl extends CustomHTMLElement {

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
		this.input = {};
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
			:host { display: block; }

			.row {
				display: flex;
				flex-flow: row;
			}

			.col {
				display: flex;
				flex-flow: column;
				flex: 1 1;
			}

			.cell {
				padding: 10px;
			}

			.controls {
				margin: 10px;
				padding: 10px;
				background: #f4f4f4;
				border: 1px solid grey;
			}
	
			button {
				border: none;
				background: #444;
				color: white;
				padding: 10px;
			}

			[disabled] {
				opacity: 0.6;
			}

			.sticks {
				flex: 0 1;
			}
			
			.stick {
				width: 50px;
				height: 50px;
			}

			.stop { background-color: red; }
		</style>

		<div>
			<h1>Control</h1>
			<div class="row">
				<div class="col">
					<div class="cell controls">
						<button @click="${this._connection.bind(this)}">Connect</button>
						<button @click="${this._disconnection.bind(this)}">Disconnect</button>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col sticks">
					<div class="cell controls">
						<div class="row">
							<div class="col sticks">
								<div class="cell">
									<button class="stick" @mousedown="${this._walkFL.bind(this)}" @mouseup="${this._stop.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" @mousedown="${this._walkL.bind(this)}" @mouseup="${this._stop.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" @mousedown="${this._walkBL.bind(this)}" @mouseup="${this._stop.bind(this)}"></button>
								</div>
							</div>
							<div class="col sticks">
								<div class="cell">
									<button class="stick" @mousedown="${this._walkF.bind(this)}" @mouseup="${this._stop.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" disabled>WALK</button>
								</div>
								<div class="cell">
									<button class="stick" @mousedown="${this._walkB.bind(this)}" @mouseup="${this._stop.bind(this)}"></button>
								</div>
							</div>
							<div class="col sticks">
								<div class="cell">
									<button class="stick" @mousedown="${this._walkFR.bind(this)}" @mouseup="${this._stop.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" @mousedown="${this._walkR.bind(this)}" @mouseup="${this._stop.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" @mousedown="${this._walkBR.bind(this)}" @mouseup="${this._stop.bind(this)}"></button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="col">
					<div class="cell controls">
						<div class="row">
							<input id="command" class="input" @keyup="${this._input.bind(this, 'action')}">
							<button @click="${this._action.bind(this)}">Send</button>
						</div>
					</div>
				</div>
				<div class="col">
					<div class="cell controls">
						<div class="row">
							<div class="col sticks">
								<div class="cell">
									<button class="stick" @click="${this._stepFL.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" @click="${this._stepL.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" @click="${this._stepBL.bind(this)}"></button>
								</div>
							</div>
							<div class="col sticks">
								<div class="cell">
									<button class="stick" @click="${this._stepF.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" disabled>STEP</button>
								</div>
								<div class="cell">
									<button class="stick" @click="${this._stepB.bind(this)}"></button>
								</div>
							</div>
							<div class="col sticks">
								<div class="cell">
									<button class="stick" @click="${this._stepFR.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" @click="${this._stepR.bind(this)}"></button>
								</div>
								<div class="cell">
									<button class="stick" @click="${this._stepBR.bind(this)}"></button>
								</div>
							</div>
						</div>
					</div>
				</div>
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

	/**
	* @public update() [parent class]
	* Update the view, pushing only changes for update in shadow DOM
	*/
	templateUpdated() {
		
	}

	// _input(name, ev) {
	// 	if (ev.key.toLowerCase() === 'enter') this._action();
	// 	this.input[name] = ev.target.value;
	// }

	// _connection(msg) {
	// 	this.socket.emit('/connect');
	// }

	// _disconnection(msg) {
	// 	this.socket.emit('/disconnect');
	// }

	// _action() {
		
	// 	this.socket.emit('/action', this.input.action);
	// }

	// _stop = (msg) => this.socket.emit('/action', '!');

	// _walkFL = (msg) => this.socket.emit('/action', 'w -40 40');
	// _walkL = (msg) => this.socket.emit('/action', 'w -40 0');
	// _walkBL = (msg) => this.socket.emit('/action', 'w -40 -40');
	// _walkF = (msg) => this.socket.emit('/action', 'w 0 40');
	// _walkB = (msg) => this.socket.emit('/action', 'w 0 40');
	// _walkFR = (msg) => this.socket.emit('/action', 'w 40 40');
	// _walkR = (msg) => this.socket.emit('/action', 'w 0 40');
	// _walkBR = (msg) => this.socket.emit('/action', 'w -40 40');

	// _stepFL = (msg) => this.socket.emit('/action', 's -40 40');
	// _stepL = (msg) => this.socket.emit('/action', 's -40 0');
	// _stepBL = (msg) => this.socket.emit('/action', 's -40 -40');
	// _stepF = (msg) => this.socket.emit('/action', 's 0 40');
	// _stepB = (msg) => this.socket.emit('/action', 's 0 40');
	// _stepFR = (msg) => this.socket.emit('/action', 's 40 40');
	// _stepR = (msg) => this.socket.emit('/action', 's 0 40');
	// _stepBR = (msg) => this.socket.emit('/action', 's -40 40');
}

customElements.define('roamer-control', RoamerControl);