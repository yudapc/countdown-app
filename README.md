# Tools

This project is a mobile-first React tools app that provides two core utilities: a persistent countdown timer and a persistent counter. The app uses URL-based navigation, theme switching (`device`, `light`, `dark`), responsive layouts for smartphone usage, and local storage persistence so timer and counter state remain available across page changes and reloads.


## Project Structure

This project now uses a feature-first structure to keep each domain isolated and easier to scale.

```text
src/
	App.jsx
	main.jsx
	features/
		index.js
		countdown/
			CountdownFeature.jsx
			components/
				CountDown.jsx
				SetTimer.jsx
		counter/
			CounterCountFeature.jsx
			hooks/
				usePersistentCount.js
	shared/
		index.js
		components/
			ActionRow.jsx
			CenteredColumn.jsx
		hooks/
			useLocalStorageState.js
```

### Why this structure

- Keep countdown and counter logic separated by feature.
- Avoid mixed responsibilities inside one file.
- Make onboarding easier because each feature has a clear home.
- Put reusable layouts and utilities in shared to reduce duplication.
