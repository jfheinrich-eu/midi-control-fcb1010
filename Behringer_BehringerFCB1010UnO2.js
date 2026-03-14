/**
 * Behringer FCB1010 UnO2 - Cubase MIDI Remote script
 *
 * Idea:
 * Single-button recording workflow with deterministic release behavior.
 *
 * Behavior:
 * - Press (Note On / value 127): Start Recording
 * - Release (Note Off / value 0): Stop Recording, then send one Stop Play pulse
 *
 * Robustness features:
 * - Per-device state handling (no shared global runtime state)
 * - Stop pulse debounce to avoid duplicate transport stop triggers
 * - Defensive value checks before processing
 *
 * Copyright (c) JFHeinrich <contact@jfheinrich.eu>
 */

var midiremote_api = require('midiremote_api_v1')

// Driver identity
var VENDOR_NAME = 'Behringer'
var DEVICE_NAME = 'BehringerFCB1010UnO2'
var CREATED_BY = 'JFHeinrich'

// Surface layout
var SURFACE_WIDTH = 27
var SURFACE_HEIGHT = 11

// Surface UI layout, intentionally shaped like the real FCB1010 to stay familiar
// for guitar players who expect a pedalboard-like view.
var PEDAL_Y = 0.5
var PEDAL_WIDTH = 10
var PEDAL_HEIGHT = 4.2
var LEFT_PEDAL_X = 1.2
var RIGHT_PEDAL_X = 15.8
var FOOTSWITCH_SIZE = 2.6
var FOOTSWITCH_ROW_TOP_Y = 5.3
var FOOTSWITCH_ROW_BOTTOM_Y = 8.0
var FOOTSWITCH_X_START = 1.4
var FOOTSWITCH_X_STEP = 5.0
var FOOTSWITCH_LED_SIZE = 0.55

// MIDI mapping
var MIDI_CHANNEL_ZERO_BASED = 9 // MIDI channel 10
var NOTE_NUMBER = 36

// Runtime state keys
var STATE_WAS_RECORDING = 'wasRecording'
var STATE_LAST_STOP_PULSE_MS = 'lastStopPulseMs'
var STOP_PULSE_DEBOUNCE_MS = 120

// 1) Driver setup
var deviceDriver = midiremote_api.makeDeviceDriver(
	VENDOR_NAME,
	DEVICE_NAME,
	CREATED_BY
)

var midiInput = deviceDriver.mPorts.makeMidiInput()
var midiOutput = deviceDriver.mPorts.makeMidiOutput()

// Add both compact and spaced names to improve auto-detection chances.
deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
	.expectInputNameEquals('BehringerFCB1010UnO2')
	.expectOutputNameEquals('BehringerFCB1010UnO2')

deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
	.expectInputNameEquals('Behringer FCB1010 UnO2')
	.expectOutputNameEquals('Behringer FCB1010 UnO2')

deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
	.expectInputNameEquals('FCB1010 UnO2')
	.expectOutputNameEquals('FCB1010 UnO2')

// 2) Surface definition (Width x Height: 27 x 6)
var surface = deviceDriver.mSurface
surface.makeBlindPanel(0, 0, SURFACE_WIDTH, SURFACE_HEIGHT)

// Expression pedal areas
surface.makeBlindPanel(LEFT_PEDAL_X, PEDAL_Y, PEDAL_WIDTH, PEDAL_HEIGHT)
surface.makeBlindPanel(RIGHT_PEDAL_X, PEDAL_Y, PEDAL_WIDTH, PEDAL_HEIGHT)

var footswitchPositions = [
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 0, y: FOOTSWITCH_ROW_TOP_Y },
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 1, y: FOOTSWITCH_ROW_TOP_Y },
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 2, y: FOOTSWITCH_ROW_TOP_Y },
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 3, y: FOOTSWITCH_ROW_TOP_Y },
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 4, y: FOOTSWITCH_ROW_TOP_Y },
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 0, y: FOOTSWITCH_ROW_BOTTOM_Y },
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 1, y: FOOTSWITCH_ROW_BOTTOM_Y },
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 2, y: FOOTSWITCH_ROW_BOTTOM_Y },
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 3, y: FOOTSWITCH_ROW_BOTTOM_Y },
	{ x: FOOTSWITCH_X_START + FOOTSWITCH_X_STEP * 4, y: FOOTSWITCH_ROW_BOTTOM_Y }
]

for (var footswitchIndex = 1; footswitchIndex < footswitchPositions.length; ++footswitchIndex) {
	var placeholder = footswitchPositions[footswitchIndex]
	surface.makeBlindPanel(placeholder.x, placeholder.y, FOOTSWITCH_SIZE, FOOTSWITCH_SIZE).setShapeCircle()
	surface.makeBlindPanel(
		placeholder.x + (FOOTSWITCH_SIZE - FOOTSWITCH_LED_SIZE) / 2,
		placeholder.y - 0.5,
		FOOTSWITCH_LED_SIZE,
		FOOTSWITCH_LED_SIZE
	).setShapeCircle()
}

// The active button is placed where players would expect footswitch 1.
var recordButton = surface.makeButton(
	footswitchPositions[0].x,
	footswitchPositions[0].y,
	FOOTSWITCH_SIZE,
	FOOTSWITCH_SIZE
)

var recordLamp = surface.makeLamp(
	footswitchPositions[0].x + (FOOTSWITCH_SIZE - FOOTSWITCH_LED_SIZE) / 2,
	footswitchPositions[0].y - 0.5,
	FOOTSWITCH_LED_SIZE,
	FOOTSWITCH_LED_SIZE
).setShapeCircle()

// MIDI message: NoteOn, Channel 10 (zero-based: 9), Note# 36
recordButton.mSurfaceValue.mMidiBinding
	.setInputPort(midiInput)
	.bindToNote(MIDI_CHANNEL_ZERO_BASED, NOTE_NUMBER)

// 3) Host mapping
var page = deviceDriver.mMapping.makePage('Recording')

// One-shot variable for sending a single stop command pulse.
var stopPulse = surface.makeCustomValueVariable('StopPulse')

/**
 * @param {*} activeDevice
 * @param {string} key
 * @param {boolean} fallback
 * @returns {boolean}
 */
function getBooleanState(activeDevice, key, fallback) {
	var raw = activeDevice.getState(key)
	if (raw === '1' || raw === 'true') return true
	if (raw === '0' || raw === 'false') return false
	return fallback
}

/**
 * @param {*} activeDevice
 * @param {string} key
 * @param {boolean} value
 */
function setBooleanState(activeDevice, key, value) {
	activeDevice.setState(key, value ? '1' : '0')
}

/**
 * @param {*} activeDevice
 * @param {string} key
 * @param {number} fallback
 * @returns {number}
 */
function getIntegerState(activeDevice, key, fallback) {
	var raw = activeDevice.getState(key)
	var parsed = parseInt(raw, 10)
	return isNaN(parsed) ? fallback : parsed
}

/**
 * @param {*} activeDevice
 * @param {string} key
 * @param {number} value
 */
function setIntegerState(activeDevice, key, value) {
	activeDevice.setState(key, String(value))
}

// Active value 127 -> Start Recording
// Deactivated value 0 -> Stop Recording
var recordBinding = page.makeValueBinding(recordButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRecord)
	.setTypeDefault()

page.makeValueBinding(stopPulse, page.mHostAccess.mTransport.mValue.mStop)
	.setTypeDefault()

recordBinding.mOnValueChange = function () {
	var activeDevice = arguments[0]
	var currValue = Number(arguments[2])

	if (!activeDevice || isNaN(currValue)) {
		return
	}

	recordLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)

	var isRecordingNow = currValue >= 0.5
	var wasRecording = getBooleanState(activeDevice, STATE_WAS_RECORDING, false)

	// Trigger "Stop Play" once right after recording switched from on to off.
	if (wasRecording && !isRecordingNow) {
		var nowMs = Date.now()
		var lastStopPulseMs = getIntegerState(activeDevice, STATE_LAST_STOP_PULSE_MS, 0)

		if (nowMs - lastStopPulseMs >= STOP_PULSE_DEBOUNCE_MS) {
			stopPulse.setProcessValue(activeDevice, 1)
			stopPulse.setProcessValue(activeDevice, 0)
			setIntegerState(activeDevice, STATE_LAST_STOP_PULSE_MS, nowMs)
		}
	}

	setBooleanState(activeDevice, STATE_WAS_RECORDING, isRecordingNow)
}
