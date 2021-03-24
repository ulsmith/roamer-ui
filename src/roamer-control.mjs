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

		this._moveStick = {};
		this._driveStick = {};
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

			.col-stick {
				flex: 0 0 250px;
			}

			.frame {
				height: 100%;
				position: relative;
			}

			.move {
				height: 100%;
				opacity: 1;
			}

			.drive {
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

			.move .stick {
				position: absolute;
				left: 85px;
				bottom: 85px;
			}

			.move .guide {
				position: absolute;
				left: 10px;
				bottom: 10px;
			}

			.drive .stick {
				position: absolute;
				right: 85px;
				bottom: 85px;
			}

			.drive .guide {
				position: absolute;
				right: 10px;
				bottom: 10px;
			}
				
		</style>

		<div class="frame row" @mouseup="${this._stopMove.bind(this)}" @touchend="${this._stopMove.bind(this)}">
			<div class="col col-stick">
				<div class="move" @mousemove="${this._doControlMove.bind(this)}" @touchmove="${this._doControlMove.bind(this)}" ?disabled="${this.isNotMovable(this._driveStick)}">
					<span class="guide"></span>
					<span class="stick" @mousedown="${this._startControlMove.bind(this)}" @touchstart="${this._startControlMove.bind(this)}"></span>
				</div>
			</div>
			<div class="col">

			</div>
			<div class="col col-stick">
				<div class="drive" @mousemove="${this._doControlDrive.bind(this)}" @touchmove="${this._doControlDrive.bind(this)}" ?disabled="${this.isNotMovable(this._moveStick)}">
					<span class="guide"></span>
					<span class="stick" @mousedown="${this._startControlDrive.bind(this)}" @touchstart="${this._startControlDrive.bind(this)}"></span>
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

	isNotMovable(control) {
		return ['crab', 'walk', 'run'].indexOf(this._posture) < 0 || (control && control.element);
	}

	/**
	* @public _startControlMove()
	* @param {Event} ev The event that started this
	* Start control stick movement
	*/
	_startControlMove(ev) {
		if (this.isNotMovable()) return;
		this._moveStick = {};
		this._moveStick.element = ev.type == 'mousemove' ? ev.target : ev.path[0];
		this.updateTemplate();
	}
	
	/**
	 * @public _startControlDrive()
	 * @param {Event} ev The event that started this
	 * Start control stick movement
	 */
	_startControlDrive(ev) {
		if (this.isNotMovable()) return;
		this._driveStick = {};
		this._driveStick.element = ev.type == 'mousemove' ? ev.target : ev.path[0];
		this.updateTemplate();
	}

	/**
	* @public _stopMove()
	* @param {Event} ev The event that stoped this
	* Stop control stick movement
	*/
	_stopMove(ev) {
		if (!this._moveStick.element && !this._driveStick.element) return;

		this.dispatchEvent(new CustomEvent('action', { detail: { action: 'stop' } }));

		if (this._moveStick.element) {
			this._moveStick.element.style.removeProperty('bottom');
			this._moveStick.element.style.removeProperty('left');
			this._moveStick = {};
		}

		if (this._driveStick.element) {
			this._driveStick.element.style.removeProperty('bottom');
			this._driveStick.element.style.removeProperty('right');
			this._driveStick = {};
		}

		this.updateTemplate();
	}

	/**
	* @public _doControlMove()
	* @param {Event} ev The event that doed this
	* do control stick movement
	*/
	_doControlMove(ev) {
		// TODO: Need to make this work with touch too
		if (!this._moveStick.element) return;

		// grab movement
		let x = ev.x || ev.touches[0].clientX;
		let y = ev.y || ev.touches[0].clientY;

		// bound and offset
		if (!this._moveStick.bound) {
			this._moveStick.bound = this._moveStick.element.getBoundingClientRect();
			this._moveStick.offset = { x: x - this._moveStick.bound.x, y: y - this._moveStick.bound.y };
		}

		// track amount moved for bot
		this._moveStick.move = { x: x - this._moveStick.bound.x - this._moveStick.offset.x, y: this._moveStick.bound.y - y + this._moveStick.offset.y};

		// cap the movement to guide
		this._moveStick.move.x = (this._moveStick.move.x > 75 ? 75 : (this._moveStick.move.x < -75 ? -75 : this._moveStick.move.x));
		this._moveStick.move.y = (this._moveStick.move.y > 75 ? 75 : (this._moveStick.move.y < -75 ? -75 : this._moveStick.move.y));

		// move stick for feedback
		this._moveStick.element.style.left = (85 + this._moveStick.move.x) + 'px';
		this._moveStick.element.style.bottom = (85 + this._moveStick.move.y) + 'px';

		// change to direction as a speed integer, if no change, do not fire
		let sx = Math.round(this._moveStick.move.x / 25);
		let sy = Math.round(this._moveStick.move.y / 25);
		if (this._moveStick.speed && this._moveStick.speed.x === sx && this._moveStick.speed.y === sy ) return;
		this._moveStick.speed = { x: sx, y: sy};
		
		this.dispatchEvent(new CustomEvent('action', { detail: { action: 'move', posture: this._posture, x: sx, y: sy } }));
	}
	
	/**
	 * @public _doControlDrive()
	 * @param {Event} ev The event that doed this
	 * do control stick movement
	 */
	_doControlDrive(ev) {
		// TODO: Need to make this work with touch too
		if (!this._driveStick.element) return;

		// grab movement
		let x = ev.x || ev.touches[0].clientX;
		let y = ev.y || ev.touches[0].clientY;

		// bound and offset
		if (!this._driveStick.bound) {
			this._driveStick.bound = this._driveStick.element.getBoundingClientRect();
			this._driveStick.offset = { x: x - this._driveStick.bound.x, y: y - this._driveStick.bound.y };
		}

		// track amount moved for bot
		this._driveStick.move = { x: x - this._driveStick.bound.x - this._driveStick.offset.x, y: this._driveStick.bound.y - y + this._driveStick.offset.y };

		// cap the movement to guide
		this._driveStick.move.x = (this._driveStick.move.x > 75 ? 75 : (this._driveStick.move.x < -75 ? -75 : this._driveStick.move.x));
		this._driveStick.move.y = (this._driveStick.move.y > 75 ? 75 : (this._driveStick.move.y < -75 ? -75 : this._driveStick.move.y));

		// move stick for feedback
		this._driveStick.element.style.right = (85 - this._driveStick.move.x) + 'px';
		this._driveStick.element.style.bottom = (85 + this._driveStick.move.y) + 'px';

		// change to direction as a speed integer, if no change, do not fire
		let sx = Math.round(this._driveStick.move.x / 25);
		let sy = Math.round(this._driveStick.move.y / 25);
		if (this._driveStick.speed && this._driveStick.speed.x === sx && this._driveStick.speed.y === sy) return;
		this._driveStick.speed = { x: sx, y: sy };

		this.dispatchEvent(new CustomEvent('action', { detail: { action: 'drive', posture: this._posture, x: sx, y: sy } }));
	}
}

customElements.define('roamer-control', RoamerControl);