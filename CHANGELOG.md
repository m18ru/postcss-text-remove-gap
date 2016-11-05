# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added

- …

## [1.1.1] - 2016-11-05

### Fixed

- Margin collapsing problem with two adjacent siblings elements with space 
  removing. Using `display: table` instead of `display: block` on 
  pseudo-elements fix this problem.

## [1.1.0] - 2016-11-04

### Added

- 66 fonts (with cyrillic) from fonts.google.com: Roboto,
  Roboto Condensed, PT Sans, Roboto Slab, Open Sans Condensed,
  Merriweather, Lora, Ubuntu, Arimo, Noto Sans, Playfair Display,
  PT Sans Narrow, Rubik, Cormorant Garamond, PT Serif, Noto Serif,
  Lobster, Ubuntu Condensed, Exo 2, Roboto Mono, Fira Sans, Cuprum, Play,
  PT Sans Caption, EB Garamond, Poiret One, Russo One, Comfortaa, Istok Web,
  Tinos, Playfair Display SC, Philosopher, Didact Gothic, Ubuntu Mono, Neucha,
  Scada, Marck Script, Jura, PT Mono, PT Serif Caption, Rubik One, Marmelad,
  Oranienbaum, Ruslan Display, Cousine, Fira Mono, Anonymous Pro,
  Press Start 2P, Cormorant, Cormorant Infant, Cormorant SC, Cormorant Unicase,
  Forum, Kelly Slab, Tenor Sans, Prosto One, Kurale, Pattaya, Andika,
  El Messiri, Yeseva One, Ledger, Rubik Mono One, Underdog, Seymour One,
  Stalinist One.

### Fixed

- Open Sans font metrics.

## [1.0.0] - 2016-11-02

### Added

- File package.json.
- Files index.js and test.js.
- Dependency with `postcss-selector-parser`.
- Initial version of plugin code.
- Additional tests in `test.js`.
- README.md with plugin description and images.
- “Open Sans” font in `fonts.json`.
- CHANGELOG.md.
- HTML code for measure example.
- Web Core Fonts in `fonts.json`.
