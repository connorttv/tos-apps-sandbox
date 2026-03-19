import {
  SettingsContainer,
  SettingsDivider,
  SettingsField,
  SettingsInputFrame,
  SettingsLabel,
  SettingsSliderFrame,
} from '@telemetryos/sdk/react'
import { RssFeedManager, FeedSelectionConfig } from '../components/settings'
import { useUiScaleStoreState } from '../hooks/store'

export function Settings() {
  const [isLoadingUiScale, uiScale, setUiScale] = useUiScaleStoreState(5)

  return (
    <SettingsContainer>
      <RssFeedManager />
      <FeedSelectionConfig />
      <SettingsDivider />

      {/* Legacy demo fields - can be removed later */}
      <SettingsField>
        <SettingsLabel>UI Scale</SettingsLabel>
        <SettingsSliderFrame>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            disabled={isLoadingUiScale}
            value={uiScale}
            onChange={(e) => setUiScale(parseFloat(e.target.value))}
          />
          <span>{uiScale}x</span>
        </SettingsSliderFrame>
      </SettingsField>

      <SettingsDivider />
    </SettingsContainer>
  )
}
