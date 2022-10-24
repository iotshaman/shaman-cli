# Shaman CLI Recipes

When using the [generate command](../README.md#generate-command), a recipe can be used as a model for the created solution file. The default recipe is as follows:

```json
    "recipe": {
        "projects": [{
                "name": "sample-website",
                "environment": "node",
                "type": "client",
                "path": "client",
                "runtimeDependencies": [
                    "sample-server"
                ]
            },
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
        ],
        "transform": [{
            "targetProject": "sample-server",
            "transformation": "compose:datacontext",
            "sourceProject": "sample-database"
        }]
    }
```