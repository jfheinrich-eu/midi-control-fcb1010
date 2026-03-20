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
		layoutPreset: 'wide',
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
		channelZeroBased: 9,
		footswitchNotes: [36, 38, 40, 41, 43, 45, 47, 48, 50, 52]
	},
	footswitch: {
		maxRoleLabelLength: 6,
		roles: [
			'Rec',
			'Play',
			'Stop',
			'Cycle',
			'Click',
			'RW',
			'FF',
			'Undo',
			'Res1',
			'Res2'
		]
	},
	state: {
		wasRecordingKey: 'wasRecording',
		lastStopPulseMsKey: 'lastStopPulseMs',
		stopPulseDebounceMs: 120
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

/**
 * @param {*} activeDevice
 * @param {*} stopPulse
 * @param {*} localConfig
 */
function emitStopPulse(activeDevice, stopPulse, localConfig) {
	var nowMs = Date.now()
	var stateConfig = localConfig.state
	var lastStopPulseMs = getIntegerState(activeDevice, stateConfig.lastStopPulseMsKey, 0)

	if (nowMs - lastStopPulseMs >= stateConfig.stopPulseDebounceMs) {
		stopPulse.setProcessValue(activeDevice, 1)
		stopPulse.setProcessValue(activeDevice, 0)
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
 * @param {*} surfaceConfig
 */
function makeFootswitchPositions(surfaceConfig) {
	return [
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 0, y: surfaceConfig.footswitchRowTopY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 1, y: surfaceConfig.footswitchRowTopY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 2, y: surfaceConfig.footswitchRowTopY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 3, y: surfaceConfig.footswitchRowTopY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 4, y: surfaceConfig.footswitchRowTopY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 0, y: surfaceConfig.footswitchRowBottomY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 1, y: surfaceConfig.footswitchRowBottomY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 2, y: surfaceConfig.footswitchRowBottomY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 3, y: surfaceConfig.footswitchRowBottomY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 4, y: surfaceConfig.footswitchRowBottomY }
	]
}

/**
 * @param {*} surfaceConfig
 * @returns {*}
 */
function resolveSurfaceConfig(surfaceConfig) {
	var layoutMap = surfaceConfig.layouts || {}
	var presetName = surfaceConfig.layoutPreset
	var fallbackPresetName = 'wide'
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
 * @param {*} localConfig
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
 * @param {*} surface
 * @param {*} page
 * @param {*} midiInput
 * @param {*} localConfig
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
			pos.y - 0.5,
			surfaceConfig.footswitchLedSize,
			surfaceConfig.footswitchLedSize
		).setShapeCircle()

		button.mSurfaceValue.mMidiBinding
			.setInputPort(midiInput)
			.bindToNote(midiConfig.channelZeroBased, midiConfig.footswitchNotes[footswitchIndex])

		footswitchButtons.push(button)
		footswitchLamps.push(lamp)
	}

	var pedal1Label = surface.makeLabelField(surfaceConfig.leftPedalX + 2.6, surfaceConfig.pedalY + surfaceConfig.pedalHeight + 0.15, 5, 1)
	var pedal2Label = surface.makeLabelField(surfaceConfig.rightPedalX + 2.6, surfaceConfig.pedalY + surfaceConfig.pedalHeight + 0.15, 5, 1)
	page.setLabelFieldText(pedal1Label, 'Pedal 1')
	page.setLabelFieldText(pedal2Label, 'Pedal 2')

	for (var labelIndex = 0; labelIndex < footswitchPositions.length; ++labelIndex) {
		var labelPos = footswitchPositions[labelIndex]
		var labelWidth = surfaceConfig.footswitchLabelWidth
		var labelHeight = surfaceConfig.footswitchLabelHeight
		var labelX = labelPos.x - (labelWidth - surfaceConfig.footswitchHeight) / 2
		var fsLabelY = labelPos.y + surfaceConfig.footswitchHeight + surfaceConfig.footswitchLabelYOffset
		var fsLabel = surface.makeLabelField(labelX, fsLabelY, labelWidth, labelHeight)
		page.setLabelFieldText(fsLabel, makeFootswitchLabel(localConfig, labelIndex))
	}

	return {
		fsButtons: footswitchButtons,
		fsLamps: footswitchLamps,
		recordButton: footswitchButtons[0],
		playButton: footswitchButtons[1],
		stopButton: footswitchButtons[2],
		recordLamp: footswitchLamps[0],
		playLamp: footswitchLamps[1],
		stopLamp: footswitchLamps[2],
		cycleLamp: footswitchLamps[3],
		metronomeLamp: footswitchLamps[4],
		stopPulse: surface.makeCustomValueVariable('StopPulse'),
		recordStopGate: surface.makeCustomValueVariable('RecordStopGate'),
		playStatus: surface.makeCustomValueVariable('PlayStatus'),
		stopStatus: surface.makeCustomValueVariable('StopStatus'),
		cycleStatus: surface.makeCustomValueVariable('CycleStatus'),
		metronomeStatus: surface.makeCustomValueVariable('MetronomeStatus')
	}
}

/**
 * @param {*} page
 * @param {*} ui
 * @param {*} localStateApi
 * @param {*} localConfig
 */
function createBindings(page, ui, localStateApi, localConfig) {
	var recordBinding = page.makeValueBinding(ui.recordButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRecord)
		.setTypeDefault()

	page.makeValueBinding(ui.playButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStart)
		.setTypeDefault()
		.filterByValueRange(0.5, 1)

	page.makeValueBinding(ui.stopButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStop)
		.setTypeDefault()
		.filterByValueRange(0.5, 1)

	page.makeValueBinding(ui.stopPulse, page.mHostAccess.mTransport.mValue.mStop).setTypeDefault()
	page.makeValueBinding(ui.recordStopGate, page.mHostAccess.mTransport.mValue.mRecord).setTypeDefault()
	page.makeValueBinding(ui.fsButtons[3].mSurfaceValue, page.mHostAccess.mTransport.mValue.mCycleActive).setTypeToggle()
	page.makeValueBinding(ui.fsButtons[4].mSurfaceValue, page.mHostAccess.mTransport.mValue.mMetronomeActive).setTypeToggle()
	page.makeValueBinding(ui.fsButtons[5].mSurfaceValue, page.mHostAccess.mTransport.mValue.mRewind).setTypeDefault().filterByValueRange(0.5, 1)
	page.makeValueBinding(ui.fsButtons[6].mSurfaceValue, page.mHostAccess.mTransport.mValue.mForward).setTypeDefault().filterByValueRange(0.5, 1)
	page.makeCommandBinding(ui.fsButtons[7].mSurfaceValue, 'Edit', 'Undo')

	var playStatusBinding = page.makeValueBinding(ui.playStatus, page.mHostAccess.mTransport.mValue.mStart).setTypeDefault()
	var stopStatusBinding = page.makeValueBinding(ui.stopStatus, page.mHostAccess.mTransport.mValue.mStop).setTypeDefault()
	var cycleStatusBinding = page.makeValueBinding(ui.cycleStatus, page.mHostAccess.mTransport.mValue.mCycleActive).setTypeDefault()
	var metronomeStatusBinding = page.makeValueBinding(ui.metronomeStatus, page.mHostAccess.mTransport.mValue.mMetronomeActive).setTypeDefault()

	playStatusBinding.mOnValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[2])
		if (!activeDevice || isNaN(currValue)) return
		ui.playLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
		ui.stopLamp.mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 0 : 1)
	}

	stopStatusBinding.mOnValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[2])
		if (!activeDevice || isNaN(currValue)) return
		ui.stopLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
	}

	cycleStatusBinding.mOnValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[2])
		if (!activeDevice || isNaN(currValue)) return
		ui.cycleLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
	}

	metronomeStatusBinding.mOnValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[2])
		if (!activeDevice || isNaN(currValue)) return
		ui.metronomeLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
	}

	recordBinding.mOnValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[2])
		if (!activeDevice || isNaN(currValue)) return

		ui.recordLamp.mSurfaceValue.setProcessValue(activeDevice, currValue)
		var isRecordingNow = currValue >= 0.5
		var wasRecording = localStateApi.getBooleanState(activeDevice, localConfig.state.wasRecordingKey, false)

		if (wasRecording && !isRecordingNow) {
			localStateApi.emitStopPulse(activeDevice, ui.stopPulse, localConfig)
		}

		localStateApi.setBooleanState(activeDevice, localConfig.state.wasRecordingKey, isRecordingNow)
	}

	ui.playButton.mSurfaceValue.mOnProcessValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[1])
		if (!activeDevice || isNaN(currValue)) return
		if (currValue < 0.5) {
			localStateApi.emitStopPulse(activeDevice, ui.stopPulse, localConfig)
		}
	}

	ui.stopButton.mSurfaceValue.mOnProcessValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[1])
		if (!activeDevice || isNaN(currValue)) return
		if (currValue >= 0.5) {
			localStateApi.emitStopPulse(activeDevice, ui.stopPulse, localConfig)
			ui.recordStopGate.setProcessValue(activeDevice, 0)
			ui.playButton.mSurfaceValue.setProcessValue(activeDevice, 0)
			ui.stopButton.mSurfaceValue.setProcessValue(activeDevice, 0)
		}
	}

	ui.fsButtons[5].mSurfaceValue.mOnProcessValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[1])
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[5].mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 1 : 0)
	}

	ui.fsButtons[6].mSurfaceValue.mOnProcessValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[1])
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[6].mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 1 : 0)
	}

	ui.fsButtons[7].mSurfaceValue.mOnProcessValueChange = function () {
		var activeDevice = arguments[0]
		var currValue = Number(arguments[1])
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[7].mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 1 : 0)
	}
}

// 1) Driver setup
var deviceDriver = midiremote_api.makeDeviceDriver(
	config.driver.vendorName,
	config.driver.deviceName,
	config.driver.createdBy
)

var midiInput = deviceDriver.mPorts.makeMidiInput()
var midiOutput = deviceDriver.mPorts.makeMidiOutput()

for (var i = 0; i < config.detection.portNames.length; ++i) {
	var portName = config.detection.portNames[i]
	deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
		.expectInputNameEquals(portName)
		.expectOutputNameEquals(portName)
}

// 2) Surface + mapping wiring
var surface = deviceDriver.mSurface
var page = deviceDriver.mMapping.makePage(config.page.recording)
var ui = createSurface(surface, page, midiInput, config)

// 3) Host bindings
createBindings(page, ui, stateApi, config)
