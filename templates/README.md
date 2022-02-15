# Shaman CLI Templates
Shaman CLI templates are the building blocks of the scaffold commands. Every template is specific to an environment (node, dotnet, deno, etc.); at the time of writing this README, the only two environments that are supported in Shaman CLI are "node" (NodeJS + Typescript) and "dotnet" (.NET Core + c#), but future versions will include support for other environments / languages. Please note that while each template is based on an environment, you can have a solution that supports projects of multiple environment types (a "polyglot" solution). 

Most templates include README documentation that describes how to fully leverage the scaffolding. After scaffolding a new solution, take a quick look at the individual project's README files to see how to properly modify / maintain. 

## Template Transformations
Each template will have zero-to-many available "transformations" that allow you to perform additional scaffolding operations (like composing a data context, adding a pre-built CRUD controller / service, etc.). When scaffolding a solution / project, please refer to this document to learn about the different transformations available.

## Multi-Language Support
Certain environments support multiple languages; for example, the "dotnet" environment might support c#, f#, VB.net, etc. When scaffolding a solution, please reference the template documentation to determine what languages are available, if you need to specify a language, what the default language is (if any), etc.

## Template Catalog
Below is a catalog of the different templates that are available, per-environment.

### Node JS Templates
* [Server Template](https://github.com/iotshaman/shaman-cli/tree/main/templates/node#server-template)
* [Database Library Template](https://github.com/iotshaman/shaman-cli/tree/main/templates/node#database-library-template)
* [Library Template](https://github.com/iotshaman/shaman-cli/tree/main/templates/node#library-template)
* [HTML Client Template](https://github.com/iotshaman/shaman-cli/tree/main/templates/node#html-client-template)

### .NET Templates
* [Server Template](https://github.com/iotshaman/shaman-cli/tree/main/templates/dotnet#server-template)
* [Database Library Template](https://github.com/iotshaman/shaman-cli/tree/main/templates/dotnet#database-library-template)
* [Library Template](https://github.com/iotshaman/shaman-cli/tree/main/templates/dotnet#library-template)