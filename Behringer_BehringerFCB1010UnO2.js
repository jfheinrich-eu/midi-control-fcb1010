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

const midiremote_api = require('midiremote_api_v1')

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT SELECTION  –  change to 'compact' for a narrower button layout
//                      ('wide' = default, larger buttons)
// ─────────────────────────────────────────────────────────────────────────────
const LAYOUT = 'wide'

const config = {
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
	const raw = activeDevice.getState(key)
	if (raw === '1' || raw === 'true') return true
	if (raw === '0' || raw === 'false') return false
	return fallback
}

/**
 * @param {MidiRemoteActiveDevice} activeDevice
 * @param {string} key
 * @param {boolean} value
 */
function setBooleanState(activeDevice, key, value) {
	activeDevice.setState(key, value ? '1' : '0')
}

/**
 * @param {MidiRemoteActiveDevice} activeDevice
 * @param {string} key
 * @param {number} fallback
 * @returns {number}
 */
function getIntegerState(activeDevice, key, fallback) {
	const raw = activeDevice.getState(key)
	const parsed = parseInt(raw, 10)
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
	const nowMs = Date.now()
	const stateConfig = localConfig.state
	const lastStopPulseMs = getIntegerState(activeDevice, stateConfig.lastStopPulseMsKey, 0)

	if (nowMs - lastStopPulseMs >= stateConfig.stopPulseDebounceMs) {
		stopPulse.setProcessValue(activeDevice, 1)
		stopPulse.setProcessValue(activeDevice, 0)
		setIntegerState(activeDevice, stateConfig.lastStopPulseMsKey, nowMs)
	}
}

const stateApi = {
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
	return [
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 0, y: surfaceConfig.footswitchRowBottomY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 1, y: surfaceConfig.footswitchRowBottomY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 2, y: surfaceConfig.footswitchRowBottomY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 3, y: surfaceConfig.footswitchRowBottomY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 4, y: surfaceConfig.footswitchRowBottomY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 0, y: surfaceConfig.footswitchRowTopY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 1, y: surfaceConfig.footswitchRowTopY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 2, y: surfaceConfig.footswitchRowTopY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 3, y: surfaceConfig.footswitchRowTopY },
		{ x: surfaceConfig.footswitchXStart + surfaceConfig.footswitchXStep * 4, y: surfaceConfig.footswitchRowTopY }
	]
}

/**
 * @param {SurfaceConfig} surfaceConfig
 * @returns {SurfaceConfig}
 */
function resolveSurfaceConfig(surfaceConfig) {
	const layoutMap = surfaceConfig.layouts || {}
	const presetName = surfaceConfig.layoutPreset
	const fallbackPresetName = 'wide'
	const preset = layoutMap[presetName] || layoutMap[fallbackPresetName] || {}
	const resolved = {}
	let key

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
	const normalized = typeof roleName === 'string' ? roleName.trim() : ''
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
	const roleList = localConfig.footswitch && localConfig.footswitch.roles
	const role = roleList && roleIndex < roleList.length ? roleList[roleIndex] : ''
	const maxLength = localConfig.footswitch && localConfig.footswitch.maxRoleLabelLength
	const safeRole = normalizeRoleLabel(role, maxLength)
	return 'FS' + String(roleIndex + 1) + ' ' + safeRole
}

/**
 * @param {MidiRemoteSurface} surface
 * @param {MappingPage} page
 * @param {MidiRemotePort} midiInput
 * @param {object} localConfig
 * @returns {SurfaceElements}
 */
function createSurface(surface, page, midiInput, localConfig) {
	const surfaceConfig = resolveSurfaceConfig(localConfig.surface)
	const midiConfig = localConfig.midi

	surface.makeBlindPanel(0, 0, surfaceConfig.width, surfaceConfig.height)
	surface.makeBlindPanel(surfaceConfig.leftPedalX, surfaceConfig.pedalY, surfaceConfig.pedalWidth, surfaceConfig.pedalHeight)
	surface.makeBlindPanel(surfaceConfig.rightPedalX, surfaceConfig.pedalY, surfaceConfig.pedalWidth, surfaceConfig.pedalHeight)

	const footswitchPositions = makeFootswitchPositions(surfaceConfig)
	const footswitchButtons = []
	const footswitchLamps = []
	const footswitchInnerLabels = []

	for (let footswitchIndex = 0; footswitchIndex < footswitchPositions.length; ++footswitchIndex) {
		const pos = footswitchPositions[footswitchIndex]
		const buttonX = pos.x - (surfaceConfig.footswitchWidth - surfaceConfig.footswitchHeight) / 2
		const button = surface.makeButton(buttonX, pos.y, surfaceConfig.footswitchWidth, surfaceConfig.footswitchHeight)
		const lamp = surface.makeLamp(
			buttonX + (surfaceConfig.footswitchWidth - surfaceConfig.footswitchLedSize) / 2,
			pos.y - 0.5,
			surfaceConfig.footswitchLedSize,
			surfaceConfig.footswitchLedSize
		).setShapeCircle()

		button.mSurfaceValue.mMidiBinding
			.setInputPort(midiInput)
			.bindToNote(midiConfig.channelZeroBased, midiConfig.footswitchNotes[footswitchIndex])

		if (footswitchIndex === 4) {
			const innerLabel = surface.makeLabelField(buttonX + 0.55, pos.y + 0.9, surfaceConfig.footswitchWidth - 1.1, 0.7)
			innerLabel.relateTo(button)
			page.setLabelFieldText(innerLabel, 'TAP')
			footswitchInnerLabels.push(innerLabel)
		} else {
			footswitchInnerLabels.push(null)
		}

		footswitchButtons.push(button)
		footswitchLamps.push(lamp)
	}

	const pedal1Label = surface.makeLabelField(surfaceConfig.leftPedalX + 2.6, surfaceConfig.pedalY + surfaceConfig.pedalHeight + 0.15, 5, 1)
	const pedal2Label = surface.makeLabelField(surfaceConfig.rightPedalX + 2.6, surfaceConfig.pedalY + surfaceConfig.pedalHeight + 0.15, 5, 1)
	page.setLabelFieldText(pedal1Label, 'Pedal 1')
	page.setLabelFieldText(pedal2Label, 'Pedal 2')

	for (let labelIndex = 0; labelIndex < footswitchPositions.length; ++labelIndex) {
		const labelPos = footswitchPositions[labelIndex]
		const labelWidth = surfaceConfig.footswitchLabelWidth
		const labelHeight = surfaceConfig.footswitchLabelHeight
		const labelX = labelPos.x - (labelWidth - surfaceConfig.footswitchHeight) / 2
		const fsLabelY = labelPos.y + surfaceConfig.footswitchHeight + surfaceConfig.footswitchLabelYOffset
		const fsLabel = surface.makeLabelField(labelX, fsLabelY, labelWidth, labelHeight)
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
		metronomeLamp: footswitchLamps[8],
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
	const recordBinding = page.makeValueBinding(ui.recordButton.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRecord)
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
	page.makeValueBinding(ui.fsButtons[8].mSurfaceValue, page.mHostAccess.mTransport.mValue.mMetronomeActive).setTypeToggle()
	page.makeValueBinding(ui.fsButtons[5].mSurfaceValue, page.mHostAccess.mTransport.mValue.mRewind).setTypeDefault().filterByValueRange(0.5, 1)
	page.makeValueBinding(ui.fsButtons[6].mSurfaceValue, page.mHostAccess.mTransport.mValue.mForward).setTypeDefault().filterByValueRange(0.5, 1)
	page.makeCommandBinding(ui.fsButtons[7].mSurfaceValue, 'Edit', 'Undo')

	const playStatusBinding = page.makeValueBinding(ui.playStatus, page.mHostAccess.mTransport.mValue.mStart).setTypeDefault()
	const stopStatusBinding = page.makeValueBinding(ui.stopStatus, page.mHostAccess.mTransport.mValue.mStop).setTypeDefault()
	const cycleStatusBinding = page.makeValueBinding(ui.cycleStatus, page.mHostAccess.mTransport.mValue.mCycleActive).setTypeDefault()
	const metronomeStatusBinding = page.makeValueBinding(ui.metronomeStatus, page.mHostAccess.mTransport.mValue.mMetronomeActive).setTypeDefault()
	let activeMappingRef = null

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
		ui.stopLamp.mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 0 : 1)
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
		const isRecordingNow = currValue >= 0.5
		const wasRecording = localStateApi.getBooleanState(activeDevice, localConfig.state.wasRecordingKey, false)

		if (wasRecording && !isRecordingNow) {
			localStateApi.emitStopPulse(activeDevice, ui.stopPulse, localConfig)
		}

		localStateApi.setBooleanState(activeDevice, localConfig.state.wasRecordingKey, isRecordingNow)
	}

	ui.playButton.mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		if (currValue < 0.5) {
			localStateApi.emitStopPulse(activeDevice, ui.stopPulse, localConfig)
		}
	}

	ui.stopButton.mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		if (currValue >= 0.5) {
			localStateApi.emitStopPulse(activeDevice, ui.stopPulse, localConfig)
			ui.recordStopGate.setProcessValue(activeDevice, 0)
			ui.playButton.mSurfaceValue.setProcessValue(activeDevice, 0)
			ui.stopButton.mSurfaceValue.setProcessValue(activeDevice, 0)
		}
	}

	ui.fsButtons[5].mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[5].mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 1 : 0)
	}

	ui.fsButtons[6].mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[6].mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 1 : 0)
	}

	ui.fsButtons[7].mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[7].mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 1 : 0)
	}

	ui.fsButtons[4].mSurfaceValue.mOnProcessValueChange = function (activeDevice, currValue) {
		currValue = Number(currValue)
		if (!activeDevice || isNaN(currValue)) return
		ui.fsLamps[4].mSurfaceValue.setProcessValue(activeDevice, currValue >= 0.5 ? 1 : 0)
		if (currValue < 0.5 || !activeMappingRef) return

		const nowMs = Date.now()
		const tapConfig = localConfig.tapTempo
		const lastTapMs = localStateApi.getIntegerState(activeDevice, localConfig.state.lastTapMsKey, 0)
		const intervalMs = nowMs - lastTapMs

		if (intervalMs >= tapConfig.minTapIntervalMs && intervalMs <= tapConfig.maxTapIntervalMs) {
			const measuredBpm = 60000 / intervalMs
			const previousBpm = localStateApi.getIntegerState(activeDevice, localConfig.state.tapTempoBpmKey, tapConfig.defaultBpm)
			// historyWeight blends previous BPM into the new tap measurement for smooth tempo changes
			const smoothedBpm = Math.round((previousBpm * tapConfig.historyWeight) + (measuredBpm * (1 - tapConfig.historyWeight)))
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
	const variantConfig = cloneConfig(baseConfig)
	variantConfig.driver.deviceName = deviceName
	variantConfig.surface.layoutPreset = layoutPreset
	return variantConfig
}

/**
 * @param {object} localConfig
 */
function registerDevice(localConfig) {
	const deviceDriver = midiremote_api.makeDeviceDriver(
		localConfig.driver.vendorName,
		localConfig.driver.deviceName,
		localConfig.driver.createdBy
	)

	const midiInput = deviceDriver.mPorts.makeMidiInput()
	const midiOutput = deviceDriver.mPorts.makeMidiOutput()

	for (let i = 0; i < localConfig.detection.portNames.length; ++i) {
		const portName = localConfig.detection.portNames[i]
		deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
			.expectInputNameEquals(portName)
			.expectOutputNameEquals(portName)
	}

	const surface = deviceDriver.mSurface
	const page = deviceDriver.mMapping.makePage(localConfig.page.recording)
	const surfaceElements = createSurface(surface, page, midiInput, localConfig)
	createBindings(page, surfaceElements, stateApi, localConfig)
}

// Register the selected layout variant (change LAYOUT at the top of this file to switch).
registerDevice(makeVariantConfig(config, config.driver.deviceName, LAYOUT))
