/**
 * Behringer FCB1010 UnO2 - Cubase MIDI Remote script
 *
 * Idea:
 * Musician-friendly foot control for a small Cubase transport workflow.
 *
 * Behavior:
 * - Footswitch 1: Press starts recording, release stops recording, then sends one Stop Play pulse
 * - Footswitch 2: Press starts playback, release sends an additional Stop pulse
 * - Footswitch 3: Press stops playback, forces Record off, and auto-releases itself in the UI
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
var SURFACE_HEIGHT = 12.2

// Surface UI layout, intentionally shaped like the real FCB1010 to stay familiar
// for guitar players who expect a pedalboard-like view.
var PEDAL_Y = 0.5
var PEDAL_WIDTH = 10
var PEDAL_HEIGHT = 4.2
var LEFT_PEDAL_X = 1.2
var RIGHT_PEDAL_X = 15.8
var FOOTSWITCH_SIZE = 2.6
var FOOTSWITCH_ROW_TOP_Y = 5.3
var FOOTSWITCH_ROW_BOTTOM_Y = 8.8
var FOOTSWITCH_X_START = 1.4
var FOOTSWITCH_X_STEP = 5.0
var FOOTSWITCH_LED_SIZE = 0.55

// MIDI mapping
var MIDI_CHANNEL_ZERO_BASED = 9 // MIDI channel 10
var NOTE_RECORD = 36
var NOTE_PLAY = 38
var NOTE_STOP = 40

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

for (var footswitchIndex = 3; footswitchIndex < footswitchPositions.length; ++footswitchIndex) {
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

var playButton = surface.makeButton(
	footswitchPositions[1].x,
	footswitchPositions[1].y,
	FOOTSWITCH_SIZE,
	FOOTSWITCH_SIZE
)

var playLamp = surface.makeLamp(
	footswitchPositions[1].x + (FOOTSWITCH_SIZE - FOOTSWITCH_LED_SIZE) / 2,
	footswitchPositions[1].y - 0.5,
	FOOTSWITCH_LED_SIZE,
	FOOTSWITCH_LED_SIZE
).setShapeCircle()

var stopButton = surface.makeButton(
	footswitchPositions[2].x,
	footswitchPositions[2].y,
	FOOTSWITCH_SIZE,
	FOOTSWITCH_SIZE
)

var stopLamp = surface.makeLamp(
	footswitchPositions[2].x + (FOOTSWITCH_SIZE - FOOTSWITCH_LED_SIZE) / 2,
	footswitchPositions[2].y - 0.5,
	FOOTSWITCH_LED_SIZE,
	FOOTSWITCH_LED_SIZE
).setShapeCircle()

// MIDI messages: Note bindings on MIDI channel 10
recordButton.mSurfaceValue.mMidiBinding
	.setInputPort(midiInput)
	.bindToNote(MIDI_CHANNEL_ZERO_BASED, NOTE_RECORD)

playButton.mSurfaceValue.mMidiBinding
	.setInputPort(midiInput)
	.bindToNote(MIDI_CHANNEL_ZERO_BASED, NOTE_PLAY)

stopButton.mSurfaceValue.mMidiBinding
	.setInputPort(midiInput)
	.bindToNote(MIDI_CHANNEL_ZERO_BASED, NOTE_STOP)

// 3) Host mapping
var page = deviceDriver.mMapping.makePage('Recording')

// One-shot variable for sending a single stop command pulse.
var stopPulse = surface.makeCustomValueVariable('StopPulse')
var recordStopGate = surface.makeCustomValueVariable('RecordStopGate')

/**
 * @param {*} activeDevice
 */
function emitStopPulse(activeDevice) {
	var nowMs = Date.now()
	var lastStopPulseMs = getIntegerState(activeDevice, STATE_LAST_STOP_PULSE_MS, 0)

	if (nowMs - lastStopPulseMs >= STOP_PULSE_DEBOUNCE_MS) {
		stopPulse.setProcessValue(activeDevice, 1)
		stopPulse.setProcessValue(activeDevice, 0)
		setIntegerState(activeDevice, STATE_LAST_STOP_PULSE_MS, nowMs)
	}
}

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

var playBinding = page.makeValueBinding(playButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStart)
	.setTypeDefault()
	.filterByValueRange(0.5, 1)

var stopBinding = page.makeValueBinding(stopButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStop)
	.setTypeDefault()
	.filterByValueRange(0.5, 1)

page.makeValueBinding(stopPulse, page.mHostAccess.mTransport.mValue.mStop)
	.setTypeDefault()

page.makeValueBinding(recordStopGate, page.mHostAccess.mTransport.mValue.mRecord)
	.setTypeDefault()

var pedal1Label = surface.makeLabelField(LEFT_PEDAL_X + 2.6, PEDAL_Y + PEDAL_HEIGHT + 0.15, 5, 1)
var pedal2Label = surface.makeLabelField(RIGHT_PEDAL_X + 2.6, PEDAL_Y + PEDAL_HEIGHT + 0.15, 5, 1)

var footswitchLabels = []
for (var labelIndex = 0; labelIndex < footswitchPositions.length; ++labelIndex) {
	var labelPos = footswitchPositions[labelIndex]
	footswitchLabels.push(surface.makeLabelField(labelPos.x, labelPos.y + FOOTSWITCH_SIZE + 0.1, FOOTSWITCH_SIZE, 1))
}

page.setLabelFieldText(pedal1Label, 'Pedal 1')
page.setLabelFieldText(pedal2Label, 'Pedal 2')
for (var labelFs = 0; labelFs < footswitchLabels.length; ++labelFs) {
	page.setLabelFieldText(footswitchLabels[labelFs], 'FS' + String(labelFs + 1))
}

var playStatusBinding = page.makeValueBinding(surface.makeCustomValueVariable('PlayStatus'), page.mHostAccess.mTransport.mValue.mStart)
	.setTypeDefault()

var stopStatusBinding = page.makeValueBinding(surface.makeCustomValueVariable('StopStatus'), page.mHostAccess.mTransport.mValue.mStop)
	.setTypeDefault()

playStatusBinding.mOnValueChange = function () {
	var activeDevice = arguments[0]
	var currValue = Number(arguments[2])

	if (!activeDevice || isNaN(currValue)) {
		return
	}

	playLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
	stopLamp.mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 0 : 1)
}

stopStatusBinding.mOnValueChange = function () {
	var activeDevice = arguments[0]
	var currValue = Number(arguments[2])

	if (!activeDevice || isNaN(currValue)) {
		return
	}

	stopLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
}

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
		emitStopPulse(activeDevice)
	}

	setBooleanState(activeDevice, STATE_WAS_RECORDING, isRecordingNow)
}

playButton.mSurfaceValue.mOnProcessValueChange = function () {
	var activeDevice = arguments[0]
	var currValue = Number(arguments[1])

	if (!activeDevice || isNaN(currValue)) {
		return
	}

	// On release of FS2, send an additional stop pulse as requested.
	if (Number(currValue) < 0.5) {
		emitStopPulse(activeDevice)
	}
}

stopButton.mSurfaceValue.mOnProcessValueChange = function () {
	var activeDevice = arguments[0]
	var currValue = Number(arguments[1])

	if (!activeDevice || isNaN(currValue)) {
		return
	}

	if (Number(currValue) >= 0.5) {
		// Additional stop actions requested for FS3 press:
		// - ensure playback is stopped
		// - force record off
		// - visually/logic-wise auto-release FS3 and FS2
		emitStopPulse(activeDevice)
		recordStopGate.setProcessValue(activeDevice, 0)
		playButton.mSurfaceValue.setProcessValue(activeDevice, 0)
		stopButton.mSurfaceValue.setProcessValue(activeDevice, 0)
	}
}
