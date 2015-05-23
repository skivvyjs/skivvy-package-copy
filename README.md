# Skivvy package: `copy`
[![npm version](https://img.shields.io/npm/v/@skivvy/skivvy-package-copy.svg)](https://www.npmjs.com/package/@skivvy/skivvy-package-copy)
![Stability](https://img.shields.io/badge/stability-stable-brightgreen.svg)
[![Build Status](https://travis-ci.org/skivvyjs/skivvy-package-copy.svg?branch=master)](https://travis-ci.org/skivvyjs/skivvy-package-copy)

> Copy files and folders


## Installation

```bash
skivvy install copy
```


## Overview

This package allows you to copy files and folders from within the [Skivvy](https://www.npmjs.com/package/skivvy) task runner.


## Included tasks

### `copy`

Copy files and folders

#### Configuration settings:

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| `source` | `string`,`Array` | Yes | N/A | Files/folders to copy |
| `destination` | `string` | Yes | N/A | Destination path |
| `options` | `object` | No | `{}` | Copy options |
| `options.overwrite` | `boolean` | No | `false` | Whether to overwrite destination files |
| `options.dot` | `boolean` | No | `false` | Whether to copy files beginning with a `.` |
| `options.junk` | `boolean` | No | `false` | Whether to copy OS junk files (e.g. `.DS_Store`, `Thumbs.db`) |
| `options.filter` | `function`, `RegExp`, `string`, `array` | No | `null` | Filter function / regular expression / glob that determines which files to copy |
| `options.rename` | `function` | No | `null` | Function that maps source paths to destination paths |
| `options.transform` | `function` | No | `null` | Function that returns a transform stream used to modify file contents |
