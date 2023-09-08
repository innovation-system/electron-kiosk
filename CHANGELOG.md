

## [0.5.1](https://github.com/innovation-system/electron-kiosk/compare/v0.5.0...v0.5.1) (2023-09-08)


### Bug Fixes

* cors error on checkUrl ([15ce416](https://github.com/innovation-system/electron-kiosk/commit/15ce4163141b825918bc3730226d1e14b58d5df7))

# [0.5.0](https://github.com/innovation-system/electron-kiosk/compare/v0.4.0...v0.5.0) (2023-03-21)


### Bug Fixes

* handle `CORS` errors in `checkUrl` ([#6](https://github.com/innovation-system/electron-kiosk/issues/6)) ([deeb9cf](https://github.com/innovation-system/electron-kiosk/commit/deeb9cfc04b8d932521ce50272db4c799798e1ea))
* possible fix to strange crash ([9d8dc33](https://github.com/innovation-system/electron-kiosk/commit/9d8dc333f3f49343848088938e53211eb0ff6aba))
* remove `setTimeout` in `loadMain` function ([bf5ae01](https://github.com/innovation-system/electron-kiosk/commit/bf5ae01d956d913aafdd9ba7de47e2fc1c8e9207))


### Features

* add 'reload every' setting ([#8](https://github.com/innovation-system/electron-kiosk/issues/8)) ([7a418b0](https://github.com/innovation-system/electron-kiosk/commit/7a418b07365a821f4c079973405e5333b62e5158))

# [0.4.0](https://github.com/innovation-system/electron-kiosk/compare/v0.3.2...v0.4.0) (2023-02-24)

## [0.3.2](https://github.com/innovation-system/electron-kiosk/compare/v0.3.1...v0.3.2) (2023-02-23)


### Bug Fixes

* catch load url rejections ([fc6c780](https://github.com/innovation-system/electron-kiosk/commit/fc6c780d59931aef04f2c9b1ee8999bd61314ea6))
* prevent errors on window load ([dc9f607](https://github.com/innovation-system/electron-kiosk/commit/dc9f60766e2b321340b5b525d02c091e54a7a9c0))

## [0.3.1](https://github.com/innovation-system/electron-kiosk/compare/v0.3.0...v0.3.1) (2023-02-22)


### Bug Fixes

* white screen crash ([d0554ff](https://github.com/innovation-system/electron-kiosk/commit/d0554ffac9f71c1211aa686b0fae0f308fc881db)), closes [#3](https://github.com/innovation-system/electron-kiosk/issues/3)

# [0.3.0](https://github.com/innovation-system/electron-kiosk/compare/v0.2.1...v0.3.0) (2022-10-10)


### Bug Fixes

* cannot read `scheduleReload` of undefined ([3d769e2](https://github.com/innovation-system/electron-kiosk/commit/3d769e2ac48c0af955dd391d4ba0a134ee7bbf12))


### Features

* single instance and more shortcuts ([6fe5f87](https://github.com/innovation-system/electron-kiosk/commit/6fe5f87e769fb5646f86e58e174efbcd03270aec))

## [0.2.1](https://github.com/innovation-system/electron-kiosk/compare/v0.2.0...v0.2.1) (2022-10-07)


### Bug Fixes

* upload to release assets ([afb3720](https://github.com/innovation-system/electron-kiosk/commit/afb3720b9eb903d3c8e210df247a4fbdbdac4987))

# 0.2.0 (2022-10-07)


### Bug Fixes

* add defaults to store ([7637041](https://github.com/innovation-system/electron-kiosk/commit/76370414e0d44ea80e877fd066b06b4431fb1c7c))
* allow self signed certificates and run on port 8000 ([c5f0c2c](https://github.com/innovation-system/electron-kiosk/commit/c5f0c2c540939cd36ddeb161329eadbbaffc065e))
* app icons ([d7af165](https://github.com/innovation-system/electron-kiosk/commit/d7af16586fa7a1323f0fe3aee1f05b91a79a32c9))
* directory structure ([e2d3b3e](https://github.com/innovation-system/electron-kiosk/commit/e2d3b3ed92a0a31baf6a797ac0ee897ceab09af9))
* disable certificates check ([fab32bb](https://github.com/innovation-system/electron-kiosk/commit/fab32bb1c58e181611a4d14d48d496ff79f21609))
* readme and icons ([386abe7](https://github.com/innovation-system/electron-kiosk/commit/386abe7708e8dc8b0f4bb84e0dcf2ae76de1330a))
* scrollbars style ([4ca4239](https://github.com/innovation-system/electron-kiosk/commit/4ca423907b130cf4212412dcb61a0ab5e8df4a0d))
* style and logic ([6afd815](https://github.com/innovation-system/electron-kiosk/commit/6afd81530c08f7d27140f371bba51eaea3224628))
* use node 16 ([fc0c25a](https://github.com/innovation-system/electron-kiosk/commit/fc0c25acf43dc449726b6d77b0dd714ab6321b22))


### Features

* atom loader and dark mode ([e9fd95a](https://github.com/innovation-system/electron-kiosk/commit/e9fd95a951161ab35ecf547ea2e581bcee4b3302))
* autoReload and cacheLimit settings ([f52cd6f](https://github.com/innovation-system/electron-kiosk/commit/f52cd6f231b6eb68dc8e175babae76cf899805a4))
* clear storage ([206bfc1](https://github.com/innovation-system/electron-kiosk/commit/206bfc130cefc8072b07f6939c61948b696f9f55))
* very basic functionalities ([576a434](https://github.com/innovation-system/electron-kiosk/commit/576a434542e771c39204ce8f749cacffb9b87771))