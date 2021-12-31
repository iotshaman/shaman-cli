## Shaman CLI - by IoT Shaman

![npm badge](https://img.shields.io/npm/v/shaman-cli.svg) [![Coverage Status](https://coveralls.io/repos/github/iotshaman/shaman-cli/badge.svg?branch=main)](https://coveralls.io/github/iotshaman/shaman-cli?branch=main)

## Generate application scaffolding in seconds with Shaman CLI.

Get started working on core business logic faster by streamlining your application scaffolding. The initial version of Shaman CLI only supports scaffolding typescript application components, but future iterations will add additional language support, as well as other CLI improvements. 

## Installation

To install Shaman CLI on your machine, first install Node JS then run the following command:

```sh
npm i -g shaman-cli
```

*NOTE: You may need elevated permissions to run this command*

## CLI Reference

Once you have installed Shaman CLI, you can access it by invoking "shaman" in a command line interface (CMD, bash, etc). The main format for executing commands looks like this:

```sh
shaman [command] [...arguments]
```

**[command]:** Available values: *echo, scaffold*
**[...arguments]:** A list of arguments that vary, depending on the command provided.]

### Echo Command

The echo command can be used to test that everything has been installed properly. Below is a list of arguments that need to be provided in-order.

1. **Echo string:** *(Optional)* a string value which will be "echoed" back to the terminal. 

### Scaffold Command

The scaffold command generated application scaffolding automatically, based on the arguments provided. The syntax for the scaffold command is as follows; please note that these arguments must be provided in-order:

```sh
shaman scaffold [environment] [type] [name] [output folder]
```

**[environment]:** Indicates the coding environment, which will help determine what type of code files will be generated. Available values are: *node*
**[type]:** The application component type. Available values are: *library, server, database*
**[name]:** The name of the component (can be anything).
**[output folder]:** The folder in which application scaffolding will be generated.