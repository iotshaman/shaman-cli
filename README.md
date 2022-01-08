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

## Solution File

Some commands require the existence of a "solution" file, which indicates what projects (servers, libraries, database libraries, etc) are available as part of the solution. This file should be called "shaman.json", and has the following interface:

```ts
interface Solution {
  projects: SolutionProject[];
}

interface SolutionProject {
  name: string;
  environment: string;
  type: string;
  path: string;
  include?: string[];
}
```

For example, if you have a node js solution that includes a library, a database library, and a server, it could look like this:

```json
{
  "projects": [
    {
      "name": "sample-database",
      "environment": "node",
      "type": "database",
      "path": "database"
    },
    {
      "name": "sample-library",
      "environment": "node",
      "type": "library",
      "path": "library",
      "include": [
        "sample-database"
      ]
    },
    {
      "name": "sample-server",
      "environment": "node",
      "type": "server",
      "path": "server",
      "include": [
        "sample-database",
        "sample-library"
      ]
    }
  ]
}
```

*Note: All paths should be relative to the solution file*

## CLI Reference

Once you have installed Shaman CLI, you can access it by invoking "shaman" in a command line interface (CMD, bash, etc). The format for executing commands looks like this:

```sh
shaman [command] [...arguments]
```

**[command]:** Available values: *echo, scaffold-solution, scaffold, install, build*  
**[...arguments]:** A list of arguments that vary, depending on the command provided.]  

### Echo Command

The echo command can be used to ensure that Shaman CLI has been installed properly. The syntax for the echo command is as follows:

```sh
shaman echo [echoString]
```

**[echoString]:** (Optional) a string value which will be "echoed" back to the terminal. 

### Scaffold Solution Command

The scaffold-solution command requires the existence of a solution file, and will iterate over the available projects and scaffold them all. Under the hood, the cli will use the project variables to invoke the ["scaffold" command](#scaffold-command). The syntax for the scaffold-solution command is as follows:

```sh
shaman scaffold-solution
```

**[solutionFilePath]:** (Optional) relative path to the shaman.json file (including file name). If no value is provided, the default value is the current working directory.

### Scaffold Command

The scaffold command generates application scaffolding automatically, based on the arguments provided, and installs all dependencies. The syntax for the scaffold command is as follows; please note that these arguments must be provided in-order:

```sh
shaman scaffold [environment] [type] [name] [output folder]
```

**[environment]:** Indicates the coding environment, which will help determine what type of code files will be generated. Available values are: *node*  
**[type]:** The application component type. Available values are: *library, server, database*  
**[name]:** The name of the component (can be anything).  
**[output folder]:** The folder in which application scaffolding will be generated.  

### Install Command

The install command requires the existence of a solution file, and will iterate over the available projects (that match the provided environment) and install them all. The syntax for the install command is as follows; please note that these arguments must be provided in-order.

```sh
shaman install [environment] [solutionFilePath]
```

**[environment]:** Indicates the coding environment, which will help determine how to install the projects. Available values are: *node*  
**[solutionFilePath]:** (Optional) relative path to the shaman.json file (including file name). If no value is provided, the default value is the current working directory.

### Build Command

The build command requires the existence of a solution file, and will iterate over the available projects (that match the provided environment) and build them all. The syntax for the build command is as follows; please note that these arguments must be provided in-order.

```sh
shaman build [environment] [solutionFilePath]
```

**[environment]:** Indicates the coding environment, which will help determine how to build the projects. Available values are: *node*  
**[solutionFilePath]:** (Optional) relative path to the shaman.json file (including file name). If no value is provided, the default value is the current working directory.

*Note: In order for the build command to work, each project needs to have a script (in package.json) called "build". If you used Shaman CLI to scaffold your code, this is already available.*

## Project Dependencies

Sometimes, one project in a solution will be dependent on another project; when this happens, you may need to instruct the Shaman CLI about these dependencies. If you know these project dependencies when scaffolding a solution (using Shaman CLI), you can simply define these dependencies in your [solution file](#solution-file) by adding the name of the *dependent* project to the "include" property of the *parent* project; then, when you run the "scaffold-solution" command it will automatically install these dependencies, and future builds will know the correct order. If you **do not** know the project dependencies when scaffolding, or you do not use the Shaman CLI to scaffold your code, you will need to manually install your dependencies in any *parent* project's package.json file, then update your solution file to reflect the relationship.