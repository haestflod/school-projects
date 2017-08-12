/**
 * robots/register.js
 */

///<reference path="js/references.js" />

// Initialize namespace.

if ( !window.irinori ) {
    window.irinori = {};	
} 

/**
 * Register
 */
irinori.Register = function(a_card) {
	this.m_locked = false;
	this.m_card = a_card || undefined;
};

/**
 * AssignCard
 * @param Card card The card to assign to the register.
 */
irinori.Register.prototype.AssignCard = function (a_card) {
    this.m_card = a_card;
};

/**
 * Lock
 * Locks the register.
 */
irinori.Register.prototype.Lock = function () {
    this.m_locked = true;
};

/**
 * Unlock
 * Unlocks the register.
 */
irinori.Register.prototype.Unlock = function () {
    this.m_locked = false;
};
