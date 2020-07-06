# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]


### Added
 - `parse.tree` and `topological.tree` schemas
 - `experiment` workflow

### Changed
 - Update workflows to return strings instead of directly printing them


## [0.0.4] - 2020-06-11


### Added
 - Capability to render to a `d3.hierarchy`

### Changed
 - Made parsing substantially more efficient


## [0.0.3] - 2020-06-10


### Added
 - A `render` workflow that allows for rendering a graph
 - A temporal tree interchange format
 - Piping capabilities to allow for CLI commands to be piped together
 - CLI completions

### Changed
 - A more streamlined temporal parsing algorithm


## [0.0.2] - 2020-06-09


### Added
 - Main project structure
 - Library tools for parsing a graph
 - A CLI
 - A standard graph definition file, called a `scaffold.json` file
 - A parse workflow to parse `scaffold.json` files
 - A generate workflow to create interesting `scaffold.json` files


## [0.0.1] - 2020-05-18


### Added
 - Began project
