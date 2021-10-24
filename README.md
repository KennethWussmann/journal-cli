# journal-cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)[![Version](https://img.shields.io/npm/v/journal-cli.svg)](https://npmjs.org/package/journal-cli)[![Downloads/week](https://img.shields.io/npm/dw/journal-cli.svg)](https://npmjs.org/package/journal-cli)[![License](https://img.shields.io/npm/l/journal-cli.svg)](https://github.com/KennethWussmann/journal-cli/blob/master/package.json)

A CLI tool for journaling your life as markdown files.

# Features

- [x] Manage journal entries as markdown files with a simple command line interface
- [ ] Encrypt journal with a password^

<!-- toc -->

- [journal-cli](#journal-cli)
- [Features](#features)
- [Usage](#usage)
- [Commands](#commands)
- [Motivation](#motivation)
<!-- tocstop -->

# Usage

Install `journal` using [npm](https://npmjs.org/):

```sh
npx -g journal
```

# Commands

<!-- commands -->

- [`journal attach [FILE]`](#journal-attach-file)
- [`journal entry`](#journal-entry)
- [`journal help [COMMAND]`](#journal-help-command)

## `journal attach [FILE]`

Attach a file to an entry

```
USAGE
  $ journal attach [FILE]

ARGUMENTS
  FILE  Attachment file path

OPTIONS
  -c, --[no-]copy      Copy file into the entries attachments directory
  -d, --date=date      [default: 2021-10-24] Date of the entry to attach to
  -e, --[no-]embed     Embed the file in the entry markdown
  -h, --help           show CLI help
  -m, --[no-]metadata  Link file in the entries markdown metadata
  -n, --number=number  [default: 1] Number of the entry to add attach to in case multiple entries per date exists

EXAMPLE
  $ journal attach "/Users/someone/images/vacation.png"
```

_See code: [src/commands/attach.ts](https://github.com/KennethWussmann/journal-cli/blob/v0.1.0/src/commands/attach.ts)_

## `journal entry`

Create a new journal entry for today or custom date

```
USAGE
  $ journal entry

OPTIONS
  -d, --date=date  [default: 2021-10-24] Date of the entry in format YYYY-MM-DD
  -h, --help       show CLI help

EXAMPLE
  $ journal entry -d 2020-12-31
```

_See code: [src/commands/entry.ts](https://github.com/KennethWussmann/journal-cli/blob/v0.1.0/src/commands/entry.ts)_

## `journal help [COMMAND]`

display help for journal

```
USAGE
  $ journal help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

<!-- commandsstop -->

# Motivation

Create a Journal app that is not actually bound to any app.
I feared that I would lose all my journal entries when choosing an app that may contain bugs that could currupt my files.
Often these journaling apps allow exporting all entries in an arbitrary unstandardized format, which also means once that app is no longer maintained I have to convert them into the new format of the next journaling app I would use.
As journaling may be something you do for your entire life the journaling app should also last that long.

Hence, I created a CLI tool that can fulfil this requirement by using semi-standardized markdown files as a file storage of the journal entries.
That way no matter what happens with the CLI journaling app, all entries can be read and won't lose formatting. On top, they are easy to use else were. They could be rendered as a Jekyll website or combined to PDFs. The files can be easily back-ed up, encrypted and version controlled.
