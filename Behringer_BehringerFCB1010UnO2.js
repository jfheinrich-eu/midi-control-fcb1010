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

var DECIMAL_RADIX = 10
var MIDI_CHANNEL_DRUMS_ZERO_BASED = 9
var TAP_TEMPO_MS_PER_MINUTE = 60000

var STATE_BOOLEAN_STRINGS = {
	trueValue: '1',
	falseValue: '0'
}

var VALUE_STATE = {
	off: 0,
	on: 1,
	pressThreshold: 0.5,
	max: 1
}

var FOOTSWITCH_GRID = {
	columnCount: 5,
	rowYPropertyOrder: ['footswitchRowBottomY', 'footswitchRowTopY']
}

var FOOTSWITCH_INDEX = {
	record: 0,
	play: 1,
	stop: 2,
	cycle: 3,
	tap: 4,
	rewind: 5,
	forward: 6,
	undo: 7,
	metronome: 8
}

var FOOTSWITCH_NOTES_BY_ROW = {
	bottom: [36, 38, 40, 41, 50],
	top: [45, 47, 48, 43, 52]
}

var SURFACE_TEXT_LAYOUT = {
	lampYOffset: 0.5,
	tapLabelXOffset: 0.55,
	tapLabelYOffset: 0.9,
	tapLabelWidthReduction: 1.1,
	tapLabelHeight: 0.7,
	pedalLabelXOffset: 2.6,
	pedalLabelYOffset: 0.15,
	pedalLabelWidth: 5,
	pedalLabelHeight: 1
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS  –  JSDoc stubs for Steinberg MIDI Remote API v1 objects
//                      and project-specific composite types.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Active device instance provided by the Steinberg MIDI Remote API v1.
 * Exposes `getState(key)` / `setState(key, value)` for per-device persistence.
 * @typedef {object} MidiRemoteActiveDevice
 */

/**
 * Surface object returned by `midiremote_api.makeDeviceDriver().mSurface`.
 * Used to create buttons, lamps, label fields, and custom value variables.
 * @typedef {object} MidiRemoteSurface
 */

/**
 * Mapping page returned by `driver.mMapping.makePage(name)`.
 * Binds surface values to host parameters and manages label fields.
 * @typedef {object} MappingPage
 */

/**
 * MIDI port object used for note-binding surface elements.
 * @typedef {object} MidiRemotePort
 */

/**
 * Resolved surface layout config, derived from `config.surface` with the
 * active layout preset merged in. Plain key/value object.
 * @typedef {object} SurfaceConfig
 */

/**
 * All interactive surface elements created by `createSurface`.
 * @typedef {object} SurfaceElements
 * @property {Array<object>} fsButtons            - All ten footswitch button surface values.
 * @property {Array<object>} fsLamps              - All ten footswitch lamp surface values.
 * @property {object}        recordButton         - FS1 button surface value.
 * @property {object}        playButton           - FS2 button surface value.
 * @property {object}        stopButton           - FS3 button surface value.
 * @property {object}        recordLamp           - FS1 lamp surface value.
 * @property {object}        playLamp             - FS2 lamp surface value.
 * @property {object}        stopLamp             - FS3 lamp surface value.
 * @property {object}        cycleLamp            - FS4 lamp surface value.
 * @property {object}        metronomeLamp        - FS9 lamp surface value.
 * @property {object}        stopPulse            - Custom variable: momentary stop pulse trigger.
 * @property {object}        recordStopGate       - Custom variable: record-stop gate signal.
 * @property {object}        playStatus           - Custom variable: mirrored play host value.
 * @property {object}        stopStatus           - Custom variable: mirrored stop host value.
 * @property {object}        cycleStatus          - Custom variable: mirrored cycle host value.
 * @property {object}        metronomeStatus      - Custom variable: mirrored metronome host value.
 */

/**
 * Runtime state helper API used by binding callbacks.
 * @typedef {object} StateApi
 * @property {function(MidiRemoteActiveDevice, string, boolean): boolean} getBooleanState
 * @property {function(MidiRemoteActiveDevice, string, boolean): void} setBooleanState
 * @property {function(MidiRemoteActiveDevice, string, number): number} getIntegerState
 * @property {function(MidiRemoteActiveDevice, string, number): void} setIntegerState
 * @property {function(MidiRemoteActiveDevice, object, DriverConfig): void} emitStopPulse
 */

/**
 * Driver configuration object used by surface and binding construction.
 * @typedef {object} DriverConfig
 * @property {{
 *   minTapIntervalMs: number,
 *   maxTapIntervalMs: number,
 *   defaultBpm: number,
 *   historyWeight: number
 * }} tapTempo
 * @property {{
 *   wasRecordingKey: string,
 *   lastStopPulseMsKey: string,
 *   lastTapMsKey: string,
 *   tapTempoBpmKey: string,
 *   stopPulseDebounceMs: number
 * }} state
 */

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT SELECTION  –  change to 'compact' for a narrower button layout
//                      ('wide' = default, larger buttons)
// ─────────────────────────────────────────────────────────────────────────────
var LAYOUT = 'wide'

var config = {
	driver: {
		vendorName: 'Behringer',
		deviceName: 'BehringerFCB1010UnO2',
		createdBy: 'JFHeinrich'
	},
	page: {
		recording: 'Recording'
	},
	detection: {
		portNames: [
			'BehringerFCB1010UnO2',
			'Behringer FCB1010 UnO2',
			'FCB1010 UnO2'
		]
	},
	surface: {
		width: 27,
		height: 16.6,
		pedalY: 0.2,
		pedalWidth: 10,
		pedalHeight: 4.2,
		leftPedalX: 1.2,
		rightPedalX: 15.8,
		footswitchRowTopY: 6.3,
		footswitchRowBottomY: 12.0,
		footswitchXStart: 1.4,
		footswitchLedSize: 0.55,
		layouts: {
			wide: {
				footswitchWidth: 3.6,
				footswitchHeight: 2.6,
				footswitchXStep: 5.0,
				footswitchLabelWidth: 4.8,
				footswitchLabelHeight: 0.9,
				footswitchLabelYOffset: 0.1
			},
			compact: {
				footswitchWidth: 3.2,
				footswitchHeight: 2.6,
				footswitchXStep: 4.7,
				footswitchLabelWidth: 4.2,
				footswitchLabelHeight: 0.9,
				footswitchLabelYOffset: 0.1
			}
		}
	},
	midi: {
		channelZeroBased: MIDI_CHANNEL_DRUMS_ZERO_BASED,
		// Keep note order stable: indices 0..4 map to bottom row, 5..9 map to top row.
		footswitchNotes: FOOTSWITCH_NOTES_BY_ROW.bottom.concat(FOOTSWITCH_NOTES_BY_ROW.top)
	},
	footswitch: {
		maxRoleLabelLength: 6,
		roles: [
			'Rec',
			'Play',
			'Stop',
			'Cycle',
			'Tap',
			'RW',
			'FF',
			'Undo',
			'Click',
			'Res2'
		]
	},
	tapTempo: {
		minTapIntervalMs: 250,
		maxTapIntervalMs: 2000,
		defaultBpm: 120,
		// Weight applied to the previous BPM value.
		// Lower = more reactive (new tap dominates), higher = more stable (history dominates).
		historyWeight: 0.35
	},
	state: {
		wasRecordingKey: 'wasRecording',
		lastStopPulseMsKey: 'lastStopPulseMs',
		lastTapMsKey: 'lastTapMs',
		tapTempoBpmKey: 'tapTempoBpm',
		stopPulseDebounceMs: 120
	}
}

/**
 * @param {MidiRemoteActiveDevice} activeDevice
 * @param {string} key
 * @param {boolean} fallback
 * @returns {boolean}
 */
function getBooleanState(activeDevice, key, fallback) {
	var raw = activeDevice.getState(key)
	if (raw === STATE_BOOLEAN_STRINGS.trueValue || raw === 'true') return true
	if (raw === STATE_BOOLEAN_STRINGS.falseValue || raw === 'false') return false
	return fallback
}

/**
 * @param {MidiRemoteActiveDevice} activeDevice
 * @param {string} key
 * @param {boolean} value
 */
function setBooleanState(activeDevice, key, value) {
	activeDevice.setState(key, value ? STATE_BOOLEAN_STRINGS.trueValue : STATE_BOOLEAN_STRINGS.falseValue)
}

/**
 * @param {MidiRemoteActiveDevice} activeDevice
 * @param {string} key
 * @param {number} fallback
 * @returns {number}
 */
function getIntegerState(activeDevice, key, fallback) {
	var raw = activeDevice.getState(key)
	var parsed = parseInt(raw, DECIMAL_RADIX)
	return isNaN(parsed) ? fallback : parsed
}

/**
 * @param {MidiRemoteActiveDevice} activeDevice
 * @param {string} key
 * @param {number} value
 */
function setIntegerState(activeDevice, key, value) {
	activeDevice.setState(key, String(value))
}

/**
 * @param {MidiRemoteActiveDevice} activeDevice
 * @param {SurfaceCustomValueVariable} stopPulse
 * @param {object} localConfig
 */
function emitStopPulse(activeDevice, stopPulse, localConfig) {
	var nowMs = Date.now()
	var stateConfig = localConfig.state
	var lastStopPulseMs = getIntegerState(activeDevice, stateConfig.lastStopPulseMsKey, VALUE_STATE.off)

	if (nowMs - lastStopPulseMs >= stateConfig.stopPulseDebounceMs) {
		stopPulse.setProcessValue(activeDevice, VALUE_STATE.on)
		stopPulse.setProcessValue(activeDevice, VALUE_STATE.off)
		setIntegerState(activeDevice, stateConfig.lastStopPulseMsKey, nowMs)
	}
}

var stateApi = {
	getBooleanState: getBooleanState,
	setBooleanState: setBooleanState,
	getIntegerState: getIntegerState,
	setIntegerState: setIntegerState,
	emitStopPulse: emitStopPulse
}

/**
 * @param {SurfaceConfig} surfaceConfig
 * @returns {Array<{x: number, y: number}>}
 */
function makeFootswitchPositions(surfaceConfig) {
	var positions = []

	for (var rowIndex = 0; rowIndex < FOOTSWITCH_GRID.rowYPropertyOrder.length; ++rowIndex) {
		var rowYProperty = FOOTSWITCH_GRID.rowYPropertyOrder[rowIndex]
		var rowY = surfaceConfig[rowYProperty]

		for (var columnIndex = 0; columnIndex < FOOTSWITCH_GRID.columnCount; ++columnIndex) {
			// Column index defines horizontal slot. Multiplying by X step places switches on the 2x5 hardware grid.
			positions.push({
				x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * columnIndex,
				y: rowY
			})
		}
	}

	return positions
}

/**
 * @param {SurfaceConfig} surfaceConfig
 * @returns {SurfaceConfig}
 */
function resolveSurfaceConfig(surfaceConfig) {
	var layoutMap = surfaceConfig.layouts || {}
	var fallbackPresetName = 'wide'
	var presetName = surfaceConfig.layoutPreset || fallbackPresetName
	var preset = layoutMap[presetName] || layoutMap[fallbackPresetName] || {}
	var resolved = {}
	var key

	for (key in surfaceConfig) {
		if (Object.prototype.hasOwnProperty.call(surfaceConfig, key) && key !== 'layouts') {
			resolved[key] = surfaceConfig[key]
		}
	}

	for (key in preset) {
		if (Object.prototype.hasOwnProperty.call(preset, key)) {
			resolved[key] = preset[key]
		}
	}

	resolved.layoutPreset = layoutMap[presetName] ? presetName : fallbackPresetName
	return resolved
}

/**
 * @param {string} roleName
 * @param {number} maxLength
 * @returns {string}
 */
function normalizeRoleLabel(roleName, maxLength) {
	var normalized = typeof roleName === 'string' ? roleName.trim() : ''
	if (!normalized) return 'N/A'
	if (!maxLength || maxLength < 1) return normalized
	if (normalized.length <= maxLength) return normalized
	if (maxLength === 1) return normalized.slice(0, 1)
	return normalized.slice(0, maxLength - 1) + '~'
}

/**
 * @param {object} localConfig
 * @param {number} roleIndex
 * @returns {string}
 */
function makeFootswitchLabel(localConfig, roleIndex) {
	var roleList = localConfig.footswitch && localConfig.footswitch.roles
	var role = roleList && roleIndex < roleList.length ? roleList[roleIndex] : ''
	var maxLength = localConfig.footswitch && localConfig.footswitch.maxRoleLabelLength
	var safeRole = normalizeRoleLabel(role, maxLength)
	return 'FS' + String(roleIndex + 1) + ' ' + safeRole
}

/**
 * @param {MidiRemoteSurface} surface
 * @param {MappingPage} page
 * @param {Object} surfaceConfig
 */
function createPedalLabels(surface, page, surfaceConfig) {
	var pedal1Label = surface.makeLabelField(
		surfaceConfig.leftPedalX + SURFACE_TEXT_LAYOUT.pedalLabelXOffset,
		surfaceConfig.pedalY + surfaceConfig.pedalHeight + SURFACE_TEXT_LAYOUT.pedalLabelYOffset,
		SURFACE_TEXT_LAYOUT.pedalLabelWidth,
		SURFACE_TEXT_LAYOUT.pedalLabelHeight
	)
	var pedal2Label = surface.makeLabelField(
		surfaceConfig.rightPedalX + SURFACE_TEXT_LAYOUT.pedalLabelXOffset,
		surfaceConfig.pedalY + surfaceConfig.pedalHeight + SURFACE_TEXT_LAYOUT.pedalLabelYOffset,
		SURFACE_TEXT_LAYOUT.pedalLabelWidth,
		SURFACE_TEXT_LAYOUT.pedalLabelHeight
	)
	page.setLabelFieldText(pedal1Label, 'Pedal 1')
	page.setLabelFieldText(pedal2Label, 'Pedal 2')
}

/**
 * @param {MidiRemoteSurface} surface
 * @param {MappingPage} page
 * @param {Object} surfaceConfig
 * @param {Object[]} footswitchPositions
 * @param {object} localConfig
 */
function createFootswitchOuterLabels(surface, page, surfaceConfig, footswitchPositions, localConfig) {
	for (var labelIndex = 0; labelIndex < footswitchPositions.length; ++labelIndex) {
		var labelPos = footswitchPositions[labelIndex]
		var labelWidth = surfaceConfig.footswitchLabelWidth
		var labelHeight = surfaceConfig.footswitchLabelHeight
		var labelX = labelPos.x - (labelWidth - surfaceConfig.footswitchHeight) / 2
		var fsLabelY = labelPos.y + surfaceConfig.footswitchHeight + surfaceConfig.footswitchLabelYOffset
		var fsLabel = surface.makeLabelField(labelX, fsLabelY, labelWidth, labelHeight)
		page.setLabelFieldText(fsLabel, makeFootswitchLabel(localConfig, labelIndex))
	}
}

/**
 * @param {MidiRemoteSurface} surface
 * @param {MappingPage} page
 * @param {MidiRemotePort} midiInput
 * @param {object} localConfig
 * @returns {SurfaceElements}
 */
function createSurface(surface, page, midiInput, localConfig) {
	var surfaceConfig = resolveSurfaceConfig(localConfig.surface)
	var midiConfig = localConfig.midi

	surface.makeBlindPanel(0, 0, surfaceConfig.width, surfaceConfig.height)
	surface.makeBlindPanel(surfaceConfig.leftPedalX, surfaceConfig.pedalY, surfaceConfig.pedalWidth, surfaceConfig.pedalHeight)
	surface.makeBlindPanel(surfaceConfig.rightPedalX, surfaceConfig.pedalY, surfaceConfig.pedalWidth, surfaceConfig.pedalHeight)

	var footswitchPositions = makeFootswitchPositions(surfaceConfig)
	var footswitchButtons = []
	var footswitchLamps = []

	for (var footswitchIndex = 0; footswitchIndex < footswitchPositions.length; ++footswitchIndex) {
		var pos = footswitchPositions[footswitchIndex]
		var buttonX = pos.x - (surfaceConfig.footswitchWidth - surfaceConfig.footswitchHeight) / 2
		var button = surface.makeButton(buttonX, pos.y, surfaceConfig.footswitchWidth, surfaceConfig.footswitchHeight)
		var lamp = surface.makeLamp(
			buttonX + (surfaceConfig.footswitchWidth - surfaceConfig.footswitchLedSize) / 2,
			pos.y - SURFACE_TEXT_LAYOUT.lampYOffset,
			surfaceConfig.footswitchLedSize,
			surfaceConfig.footswitchLedSize
		).setShapeCircle()

		button.mSurfaceValue.mMidiBinding
			.setInputPort(midiInput)
			.bindToNote(midiConfig.channelZeroBased, midiConfig.footswitchNotes[footswitchIndex])

		if (footswitchIndex === FOOTSWITCH_INDEX.tap) {
			var innerLabel = surface.makeLabelField(
				buttonX + SURFACE_TEXT_LAYOUT.tapLabelXOffset,
				pos.y + SURFACE_TEXT_LAYOUT.tapLabelYOffset,
				surfaceConfig.footswitchWidth - SURFACE_TEXT_LAYOUT.tapLabelWidthReduction,
				SURFACE_TEXT_LAYOUT.tapLabelHeight
			)
			innerLabel.relateTo(button)
			page.setLabelFieldText(innerLabel, 'TAP')
		}

		footswitchButtons.push(button)
		footswitchLamps.push(lamp)
	}

	createPedalLabels(surface, page, surfaceConfig)
	createFootswitchOuterLabels(surface, page, surfaceConfig, footswitchPositions, localConfig)

	return {
		fsButtons: footswitchButtons,
		fsLamps: footswitchLamps,
		recordButton: footswitchButtons[FOOTSWITCH_INDEX.record],
		playButton: footswitchButtons[FOOTSWITCH_INDEX.play],
		stopButton: footswitchButtons[FOOTSWITCH_INDEX.stop],
		recordLamp: footswitchLamps[FOOTSWITCH_INDEX.record],
		playLamp: footswitchLamps[FOOTSWITCH_INDEX.play],
		stopLamp: footswitchLamps[FOOTSWITCH_INDEX.stop],
		cycleLamp: footswitchLamps[FOOTSWITCH_INDEX.cycle],
		metronomeLamp: footswitchLamps[FOOTSWITCH_INDEX.metronome],
		stopPulse: surface.makeCustomValueVariable('StopPulse'),
		recordStopGate: surface.makeCustomValueVariable('RecordStopGate'),
		playStatus: surface.makeCustomValueVariable('PlayStatus'),
		stopStatus: surface.makeCustomValueVariable('StopStatus'),
		cycleStatus: surface.makeCustomValueVariable('CycleStatus'),
		metronomeStatus: surface.makeCustomValueVariable('MetronomeStatus')
	}
}

/**
 * @param {MappingPage} page
 * @param {SurfaceElements} ui
 * @param {StateApi} localStateApi
 * @param {DriverConfig} localConfig
 */
function createBindings(page, ui, localStateApi, localConfig) {
	var recordBinding = page.makeValueBinding(ui.recordButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRecord)
		.setTypeDefault()

	page.makeValueBinding(ui.playButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStart)
		.setTypeDefault()
		.filterByValueRange(VALUE_STATE.pressThreshold, VALUE_STATE.max)

	page.makeValueBinding(ui.stopButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStop)
		.setTypeDefault()
		.filterByValueRange(VALUE_STATE.pressThreshold, VALUE_STATE.max)

	page.makeValueBinding(ui.stopPulse, page.mHostAccess.mTransport.mValue.mStop).setTypeDefault()
	page.makeValueBinding(ui.recordStopGate, page.mHostAccess.mTransport.mValue.mRecord).setTypeDefault()
	page.makeValueBinding(ui.fsButtons[FOOTSWITCH_INDEX.cycle].mSurfaceValue, page.mHostAccess.mTransport.mValue.mCycleActive).setTypeToggle()
	page.makeValueBinding(ui.fsButtons[FOOTSWITCH_INDEX.metronome].mSurfaceValue, page.mHostAccess.mTransport.mValue.mMetronomeActive).setTypeToggle()
	page.makeValueBinding(ui.fsButtons[FOOTSWITCH_INDEX.rewind].mSurfaceValue, page.mHostAccess.mTransport.mValue.mRewind).setTypeDefault().filterByValueRange(VALUE_STATE.pressThreshold, VALUE_STATE.max)
	page.makeValueBinding(ui.fsButtons[FOOTSWITCH_INDEX.forward].mSurfaceValue, page.mHostAccess.mTransport.mValue.mForward).setTypeDefault().filterByValueRange(VALUE_STATE.pressThreshold, VALUE_STATE.max)
	page.makeCommandBinding(ui.fsButtons[FOOTSWITCH_INDEX.undo].mSurfaceValue, 'Edit', 'Undo')

	var playStatusBinding = page.makeValueBinding(ui.playStatus, page.mHostAccess.mTransport.mValue.mStart).setTypeDefault()
	var stopStatusBinding = page.makeValueBinding(ui.stopStatus, page.mHostAccess.mTransport.mValue.mStop).setTypeDefault()
	var cycleStatusBinding = page.makeValueBinding(ui.cycleStatus, page.mHostAccess.mTransport.mValue.mCycleActive).setTypeDefault()
	var metronomeStatusBinding = page.makeValueBinding(ui.metronomeStatus, page.mHostAccess.mTransport.mValue.mMetronomeActive).setTypeDefault()
	var activeMappingRef = null

	page.mOnActivate = function (_context, mapping) {
		activeMappingRef = mapping
	}

	page.mOnDeactivate = function () {
		activeMappingRef = null
	}

	playStatusBinding.mOnValueChange = function (activeDevice, _mapping, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.playLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
		ui.stopLamp.mSurfaceValue.setProcessValue(
			activeDevice,
			currValue >= VALUE_STATE.pressThreshold ? VALUE_STATE.off : VALUE_STATE.on
		)
	}

	// C1: Stop lamp is driven exclusively by the play-state inversion above.
	// Driving it directly from mStop would cause the lamp to go dark when stop is pressed
	// while already stopped (mStop fires 1→0 but mStart stays 0, so no playStatus callback fires).
	stopStatusBinding.mOnValueChange = function (_activeDevice, _mapping, _currValue) {
		// intentionally left blank — stop lamp state is managed by playStatusBinding.mOnValueChange
	}

	cycleStatusBinding.mOnValueChange = function (activeDevice, _mapping, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.cycleLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
	}

	metronomeStatusBinding.mOnValueChange = function (activeDevice, _mapping, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.metronomeLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
	}

	recordBinding.mOnValueChange = function (activeDevice, _mapping, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return

		ui.recordLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
		var isRecordingNow = currValue >= VALUE_STATE.pressThreshold
		var wasRecording = localStateApi.getBooleanState(activeDevice, localConfig.state.wasRecordingKey, false)

		if (wasRecording && !isRecordingNow) {
			localStateApi.emitStopPulse(activeDevice, ui.stopPulse, localConfig)
		}

		localStateApi.setBooleanState(activeDevice, localConfig.state.wasRecordingKey, isRecordingNow)
	}

	ui.playButton.mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		if (currValue < VALUE_STATE.pressThreshold) {
			localStateApi.emitStopPulse(activeDevice, ui.stopPulse, localConfig)
		}
	}

	ui.stopButton.mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		if (currValue >= VALUE_STATE.pressThreshold) {
			// FS3 intentionally reinforces stop by emitting a debounced stop pulse in addition to the stop binding.
			localStateApi.emitStopPulse(activeDevice, ui.stopPulse, localConfig)
			ui.recordStopGate.setProcessValue(activeDevice, VALUE_STATE.off)
			ui.playButton.mSurfaceValue.setProcessValue(activeDevice, VALUE_STATE.off)
			ui.stopButton.mSurfaceValue.setProcessValue(activeDevice, VALUE_STATE.off)
		}
	}

	ui.fsButtons[FOOTSWITCH_INDEX.rewind].mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[FOOTSWITCH_INDEX.rewind].mSurfaceValue.setProcessValue(
			activeDevice,
			currValue >= VALUE_STATE.pressThreshold ? VALUE_STATE.on : VALUE_STATE.off
		)
	}

	ui.fsButtons[FOOTSWITCH_INDEX.forward].mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[FOOTSWITCH_INDEX.forward].mSurfaceValue.setProcessValue(
			activeDevice,
			currValue >= VALUE_STATE.pressThreshold ? VALUE_STATE.on : VALUE_STATE.off
		)
	}

	ui.fsButtons[FOOTSWITCH_INDEX.undo].mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[FOOTSWITCH_INDEX.undo].mSurfaceValue.setProcessValue(
			activeDevice,
			currValue >= VALUE_STATE.pressThreshold ? VALUE_STATE.on : VALUE_STATE.off
		)
	}

	ui.fsButtons[FOOTSWITCH_INDEX.tap].mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[FOOTSWITCH_INDEX.tap].mSurfaceValue.setProcessValue(
			activeDevice,
			currValue >= VALUE_STATE.pressThreshold ? VALUE_STATE.on : VALUE_STATE.off
		)
		if (currValue < VALUE_STATE.pressThreshold || !activeMappingRef) return

		var nowMs = Date.now()
		var tapConfig = localConfig.tapTempo
		var lastTapMs = localStateApi.getIntegerState(activeDevice, localConfig.state.lastTapMsKey, VALUE_STATE.off)
		var intervalMs = nowMs - lastTapMs

		if (intervalMs >= tapConfig.minTapIntervalMs && intervalMs <= tapConfig.maxTapIntervalMs) {
			var measuredBpm = TAP_TEMPO_MS_PER_MINUTE / intervalMs
			var previousBpm = localStateApi.getIntegerState(activeDevice, localConfig.state.tapTempoBpmKey, tapConfig.defaultBpm)
			// historyWeight blends previous BPM into the new tap measurement for smooth tempo changes
			var smoothedBpm = Math.round((previousBpm * tapConfig.historyWeight) + (measuredBpm * (1 - tapConfig.historyWeight)))
			page.mHostAccess.mTransport.mTimeDisplay.setTempoBPM(activeMappingRef, smoothedBpm)
			localStateApi.setIntegerState(activeDevice, localConfig.state.tapTempoBpmKey, smoothedBpm)
		}

		localStateApi.setIntegerState(activeDevice, localConfig.state.lastTapMsKey, nowMs)
	}
}

/**
 * @param {object} localConfig
 * @returns {object}
 */
function cloneConfig(localConfig) {
	return JSON.parse(JSON.stringify(localConfig))
}

/**
 * @param {object} baseConfig
 * @param {string} deviceName
 * @param {string} layoutPreset
 * @returns {object}
 */
function makeVariantConfig(baseConfig, deviceName, layoutPreset) {
	var variantConfig = cloneConfig(baseConfig)
	variantConfig.driver.deviceName = deviceName
	variantConfig.surface.layoutPreset = layoutPreset
	return variantConfig
}

/**
 * @param {object} localConfig
 */
function registerDevice(localConfig) {
	var deviceDriver = midiremote_api.makeDeviceDriver(
		localConfig.driver.vendorName,
		localConfig.driver.deviceName,
		localConfig.driver.createdBy
	)

	var midiInput = deviceDriver.mPorts.makeMidiInput()
	var midiOutput = deviceDriver.mPorts.makeMidiOutput()

	for (var i = 0; i < localConfig.detection.portNames.length; ++i) {
		var portName = localConfig.detection.portNames[i]
		deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
			.expectInputNameEquals(portName)
			.expectOutputNameEquals(portName)
	}

	var surface = deviceDriver.mSurface
	var page = deviceDriver.mMapping.makePage(localConfig.page.recording)
	var surfaceElements = createSurface(surface, page, midiInput, localConfig)
	createBindings(page, surfaceElements, stateApi, localConfig)
}

// Register the selected layout variant (change LAYOUT at the top of this file to switch).
registerDevice(makeVariantConfig(config, config.driver.deviceName, LAYOUT))
