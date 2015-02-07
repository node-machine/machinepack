<h1>
  <a href="http://node-machine.org" title="Node-Machine public registry"><img alt="node-machine logo" title="Node-Machine Project" src="http://node-machine.org/images/machine-anthropomorph-for-white-bg.png" width="50" /></a>
  machinepack (CLI)
</h1>

### [Docs](http://node-machine.org/implementing) &nbsp; [Browse other machines](http://node-machine.org/machinepacks) &nbsp;  [FAQ](http://node-machine.org/implementing/FAQ)  &nbsp;  [Newsgroup](https://groups.google.com/forum/?hl=en#!forum/node-machine)

Command-line tool for working with machinepacks and machines.

## Installation &nbsp; [![NPM version](https://badge.fury.io/js/machinepack-fs.svg)](http://badge.fury.io/js/machinepack-fs) [![Build Status](https://travis-ci.org/mikermcneil/machinepack-fs.png?branch=master)](https://travis-ci.org/mikermcneil/machinepack-fs)

```sh
$ npm install -g machinepack
```

## Usage

> Note that you'll also want to grab the [Yeoman generator](http://github.com/node-machine/generator-machinepack)

You should check out [http://node-machine.org/implementing](http://node-machine.org/implementing) for an in-depth tutorial, but here are a few highlights:

```bash
# open generated manpage on node-machine.org in your browser of choice
mp browse

# run a machine
# (theres an interactive prompt- you'll get to choose from a list, then be prompted to provide values for required inputs)
# (supports json entry and validation, re-running using command-line flags, and protects inputs marked as "protected" so they don't show up in your bash history)
mp exec

# clean everything up: (re)scaffold JSON test files, (re)generate readme using latest metadata, make sure repo url is in package.json, etc.
mp scrub

# list machines (useful for remembering wtf you're doing)
mp ls

# add new machine w/ identity="do-some-stuff" and start interactive prompt to get the rest of the necessary info
mp add do-some-stuff

# copy machine (useful for quickly creating similar machines)
mp cp foo bar

# rename machine (useful for fixing misspellings)
mp mv initiate-denk-party initiate-dance-party
```


## About  &nbsp; [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/node-machine/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This CLI tool is just sugar on top of the machine specification.  That said, it helps _a lot_, and if you're building a pack, I highly recommend checking it out.

## License

MIT &copy; 2015 Mike McNeil
