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

		this._controlStick = {};
		this._cameraStick = {};
		this._posture;
		this._moveDebounce;
		this._panDebounce;
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
				display: flex;
				flex-flow: column; 
				width: 100%;
				flex: 1 0;
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
				height: 100%;
			}

			.control {
				height: 100%;
				opacity: 1;
			}

			.camera {
				height: 100%;
				opacity: 1;
			}

			[disabled] {
				opacity: 0.5;
			}

			.guide {
				display: inline-block;
				box-sizing: border-box;
				border: 1px solid #222;
				background: #444;
				opacity: 0.3;
				width: 200px;
				height: 200px;
				border-radius: 25px;
			}

			.stick {
				display: inline-block;
				box-sizing: border-box;
				border: 1px solid #111;
				background: #222;
				opacity: 1;
				width: 50px;
				height: 50px;
				border-radius: 50px;
				-webkit-user-select: none;
				-khtml-user-select: none;
				-moz-user-select: none;
				-o-user-select: none;
				user-select: none;
				-webkit-box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
				-moz-box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
				box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
			}

			[disabled] .stick { background: red; }

			.control .stick {
				position: fixed;
				left: 100px;
				bottom: 100px;
			}

			.control .guide {
				position: fixed;
				left: 25px;
				bottom: 25px;
			}

			.camera .stick {
				position: fixed;
				right: 100px;
				bottom: 100px;
			}

			.camera .guide {
				position: fixed;
				right: 25px;
				bottom: 25px;
			}
				
		</style>

		<div class="frame row">
			<div class="col">
				<div
					class="control"
					@mouseup="${this._stopControlMove.bind(this)}"
					@touchend="${this._stopControlMove.bind(this)}"
					@mousemove="${this._doControlMove.bind(this)}"
					@touchmove="${this._doControlMove.bind(this)}"
					?disabled="${this.isNotMovable()}"
				>
					<span class="guide"></span>
					<span class="stick" @mousedown="${this._startControlMove.bind(this)}" @touchstart="${this._startControlMove.bind(this)}"></span>
				</div>
			</div>
			<div class="col">
				<div
					class="camera"
					@mouseup="${this._stopCameraMove.bind(this)}"
					@touchend="${this._stopCameraMove.bind(this)}"
					@mousemove="${this._doCameraMove.bind(this)}"
					@touchmove="${this._doCameraMove.bind(this)}"
					?disabled="${this.isNotMovable()}"
				>
					<span class="guide"></span>
					<span class="stick" @mousedown="${this._startCameraMove.bind(this)}" @touchstart="${this._startCameraMove.bind(this)}"></span>
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

	posture(posture) {
		this._posture = posture;
		this.updateTemplate();
	}

	isNotMovable() {
		return ['crab', 'walk', 'run'].indexOf(this._posture) < 0;
	}

	/**
	* @public _startControlMove()
	* @param {Event} ev The event that started this
	* Start control stick movement
	*/
	_startControlMove(ev) {
		if (this.isNotMovable()) return;
		this._controlStick = {};
		this._controlStick.element = ev.type == 'mousemove' ? ev.target : ev.path[0];
	}

	/**
	* @public _startCameraMove()
	* @param {Event} ev The event that started this
	* Start control stick movement
	*/
	_startCameraMove(ev) {
		if (!this.isNotMovable()) return;
		this._cameraStick = {};
		this._cameraStick.element = ev.type == 'mousemove' ? ev.target : ev.path[0];
	}

	/**
	* @public _stopControlMove()
	* @param {Event} ev The event that stoped this
	* Stop control stick movement
	*/
	_stopControlMove(ev) {
		if (!this._controlStick.element) return;

		this.dispatchEvent(new CustomEvent('action', { detail: { action: 'stop' } }));

		this._controlStick.element.style.removeProperty('top');
		this._controlStick.element.style.removeProperty('left');
		this._controlStick = {};
	}

	/**
	* @public _stopCameraMove()
	* @param {Event} ev The event that stoped this
	* Stop control stick movement
	*/
	_stopCameraMove(ev) {
		if (!this._cameraStick.element) return;
		this._cameraStick.element.style.top = this._cameraStick.bound.y + 'px';
		this._cameraStick.element.style.left = this._cameraStick.bound.x + 'px';
		this._cameraStick = {};
	}

	/**
	* @public _doControlMove()
	* @param {Event} ev The event that doed this
	* do control stick movement
	*/
	_doControlMove(ev) {
		// TODO: Need to make this work with touch too
		if (!this._controlStick.element) return;

		// grab movement
		let x = ev.x || ev.touches[0].clientX;
		let y = ev.y || ev.touches[0].clientY;

		// bound and offset
		if (!this._controlStick.bound) {
			this._controlStick.bound = this._controlStick.element.getBoundingClientRect();
			this._controlStick.offset = { x: x - this._controlStick.bound.x, y: y - this._controlStick.bound.y };
		}

		// track amount moved for bot
		this._controlStick.move = { x: x - this._controlStick.bound.x - this._controlStick.offset.x, y: this._controlStick.bound.y - y + this._controlStick.offset.y};

		// cap the movement to guide
		// TODO: Need to use hypot to bind to circle form x and y
		this._controlStick.move.x = (this._controlStick.move.x > 75 ? 75 : (this._controlStick.move.x < -75 ? -75 : this._controlStick.move.x));
		this._controlStick.move.y = (this._controlStick.move.y > 75 ? 75 : (this._controlStick.move.y < -75 ? -75 : this._controlStick.move.y));

		// move stick for feedback
		this._controlStick.element.style.left = (this._controlStick.bound.x + this._controlStick.move.x) + 'px';
		this._controlStick.element.style.top = (this._controlStick.bound.y - this._controlStick.move.y) + 'px';

		// change to direction as a speed integer, if no change, do not fire
		let sx = Math.round(this._controlStick.move.x / 25);
		let sy = Math.round(this._controlStick.move.y / 25);
		if (this._controlStick.speed && this._controlStick.speed.x === sx && this._controlStick.speed.y === sy ) return;
		this._controlStick.speed = { x: sx, y: sy};
		
		this.dispatchEvent(new CustomEvent('action', { detail: { action: 'move', posture: this._posture, x: sx, y: sy } }));
	}
	
	/**
	 * @public _doCameraMove()
	 * @param {Event} ev The event that doed this
	 * do control stick movement
	 */
	_doCameraMove(ev) {
		// TODO: Need to make this work with touch too
		if (!this._cameraStick.element) return;

		// grab movement
		let x = ev.x || ev.touches[0].clientX;
		let y = ev.y || ev.touches[0].clientY;

		// bound and offset
		if (!this._cameraStick.bound) {
			this._cameraStick.bound = this._cameraStick.element.getBoundingClientRect();
			this._cameraStick.offset = { x: x - this._cameraStick.bound.x, y: y - this._cameraStick.bound.y };
		}

		// track amount moved for bot
		this._cameraStick.move = { x: x - this._cameraStick.bound.x - this._cameraStick.offset.x, y: this._cameraStick.bound.y - y + this._cameraStick.offset.y };

		// cap the movement to guide
		// TODO: Need to use hypot to bind to circle form x and y
		this._cameraStick.move.x = (this._cameraStick.move.x > 75 ? 75 : (this._cameraStick.move.x < -75 ? -75 : this._cameraStick.move.x));
		this._cameraStick.move.y = (this._cameraStick.move.y > 75 ? 75 : (this._cameraStick.move.y < -75 ? -75 : this._cameraStick.move.y));

		// move stick for feedback
		this._cameraStick.element.style.left = (this._cameraStick.bound.x + this._cameraStick.move.x) + 'px';
		this._cameraStick.element.style.top = (this._cameraStick.bound.y - this._cameraStick.move.y) + 'px';

		// fire event
		let mx = this._cameraStick.move.x;
		let my = this._cameraStick.move.y;
		clearTimeout(this._moveDebounce);
		this._moveDebounce = setTimeout(() => {
			this.dispatchEvent(new CustomEvent('action', { detail: { action: 'pan', direction: 'left' } }));
		}, 10);
	}
}

customElements.define('roamer-control', RoamerControl);